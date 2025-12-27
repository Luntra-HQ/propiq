# Stripe Webhook Solutions - Perplexity Research

**Date:** December 19, 2025
**Source:** Perplexity AI
**Focus:** FastAPI implementations with code examples from 2024-2025

---

## Overview

The core pattern across all three problems is: store and gate on **Stripe's event id**, treat your subscription as a small state machine, and add a backup poll + grace window around webhooks.

---

## 1. Duplicate Events & Double Charges

Stripe might deliver the same event multiple times, so your handler must be idempotent, typically by storing a processed event id and short‑circuiting on repeats.

### FastAPI Idempotency Patterns

- Persist every processed `event.id` in a dedicated collection or table with a unique index.
- Wrap business logic in a "check‑then‑execute" that returns early if the event already exists.
- For outgoing Stripe API calls (like creating invoices), use Stripe's own **idempotency keys** on the request side as well.

### Example (FastAPI + async/2024‑style):

**models/event_log.py:**
```python
from datetime import datetime
from pydantic import BaseModel, Field

class EventLog(BaseModel):
    event_id: str = Field(..., description="Stripe event.id")
    type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: datetime | None = None
    status: str = "processing"   # processing|done|failed
```

**Database index setup:**
```python
# db/bootstrap_index.py (run on startup)
async def ensure_indexes():
    await db.event_logs.create_index("event_id", unique=True)
```

**stripe_webhook.py:**
```python
from fastapi import APIRouter, Header, HTTPException, Request
import stripe, json
from pymongo.errors import DuplicateKeyError
from datetime import datetime

router = APIRouter()
stripe.api_key = STRIPE_SECRET_KEY

WEBHOOK_SECRET = STRIPE_WEBHOOK_SECRET

@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="Stripe-Signature"),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload=payload.decode(),
            sig_header=stripe_signature,
            secret=WEBHOOK_SECRET,
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_id = event["id"]
    event_type = event["type"]

    # 1. fast insert with unique index to guard duplicates
    try:
        await db.event_logs.insert_one(
            {
                "event_id": event_id,
                "type": event_type,
                "status": "processing",
                "created_at": datetime.utcnow(),
            }
        )
    except DuplicateKeyError:
        # Duplicate: event already processed or in progress
        return {"received": True, "duplicate": True}

    try:
        await handle_event(event)  # your business logic
        await db.event_logs.update_one(
            {"event_id": event_id},
            {"$set": {"status": "done", "processed_at": datetime.utcnow()}},
        )
    except Exception as exc:
        # mark failed so you can inspect and maybe retry manually
        await db.event_logs.update_one(
            {"event_id": event_id},
            {"$set": {"status": "failed", "error": str(exc)}},
        )
        # still return 200 if you plan to reprocess yourself; otherwise return 500
        raise

    return {"received": True}
```

This pattern uses database unique index plus `DuplicateKeyError` to enforce idempotency on `event.id`, which Stripe documents as unique per event.

### Event‑ID Tracking Examples

Inside `handle_event`, avoid **re‑creating charges** directly off webhooks; instead, use webhooks to record the Stripe status against your own order/subscription id.

```python
async def handle_event(event: dict):
    if event["type"] == "invoice.paid":
        invoice = event["data"]["object"]
        subscription_id = invoice["subscription"]
        customer_id = invoice["customer"]

        # Update your own records; never create another Stripe charge here
        await db.subscriptions.update_one(
            {"stripe_subscription_id": subscription_id},
            {
                "$set": {
                    "status": "active",
                    "current_period_end": datetime.fromtimestamp(
                        invoice["lines"]["data"][0]["period"]["end"]
                    ),
                    "last_invoice_id": invoice["id"],
                    "updated_at": datetime.utcnow(),
                }
            },
            upsert=True,
        )
```

### DB Deduplication Best Practices

- Unique constraint on `event_id`.
- Optional: store `stripe_created_at` (the event's creation timestamp) for ordering and debugging.
- Optional: store a hash of the payload so you can validate if the payload ever changes for the same id (it should not).

### Testing Duplicate Handling

**1. Unit test: direct handler**

```python
import pytest
from pymongo.errors import DuplicateKeyError

@pytest.mark.asyncio
async def test_duplicate_event_is_ignored(mocker):
    event = {"id": "evt_test_123", "type": "invoice.paid", "data": {"object": {}}}

    insert_mock = mocker.AsyncMock()
    update_mock = mocker.AsyncMock()

    # first call: insert ok, second call: DuplicateKeyError
    insert_mock.side_effect = [None, DuplicateKeyError("dup")]

    mock_db = mocker.MagicMock()
    mock_db.event_logs.insert_one = insert_mock
    mock_db.event_logs.update_one = update_mock

    mocker.patch("yourmodule.db", mock_db)
    mocker.patch("yourmodule.handle_event", mocker.AsyncMock())

    # first process
    await yourmodule.process_event(event)
    # second process: should not call handle_event
    await yourmodule.process_event(event)

    assert yourmodule.handle_event.call_count == 1
```

**2. Integration: Stripe CLI**

- Use `stripe listen --forward-to` and `stripe trigger invoice.paid`.
- Re‑send the same event from the dashboard or CLI, then assert your DB row for that `event_id` still appears once and your subscription row did not change.

---

## 2. Out‑of‑Order Events & Subscription State

Stripe does not guarantee webhook ordering; events for the same subscription can arrive in any order. Your system should either (a) fetch the current state from Stripe on each critical event or (b) enforce a small state machine plus ordering rules.

### Handling `checkout.session.completed` After `invoice.paid`

**Pattern:**

- Use `checkout.session.completed` primarily to **link your user → Stripe customer + subscription ids**, not to set final status.
- Use `invoice.paid` / `customer.subscription.updated` as the source of truth for active access, and optionally verify by calling Stripe's API.

```python
async def handle_event(event: dict):
    t = event["type"]

    if t == "checkout.session.completed":
        session = event["data"]["object"]
        await db.subscriptions.update_one(
            {"client_reference_id": session.get("client_reference_id")},
            {
                "$set": {
                    "stripe_customer_id": session["customer"],
                    "stripe_subscription_id": session.get("subscription"),
                    "checkout_completed_at": datetime.utcnow(),
                }
            },
            upsert=True,
        )

    elif t == "invoice.paid":
        invoice = event["data"]["object"]
        sub_id = invoice["subscription"]

        await db.subscriptions.update_one(
            {"stripe_subscription_id": sub_id},
            {
                "$set": {
                    "status": "active",
                    "current_period_end": datetime.fromtimestamp(
                        invoice["lines"]["data"][0]["period"]["end"]
                    ),
                    "last_event_created": event["created"],  # Stripe event time
                    "updated_at": datetime.utcnow(),
                }
            },
            upsert=True,
        )
```

If `checkout.session.completed` arrives last, it just fills metadata; the active status is already set by `invoice.paid`, so state remains correct.

### State Machine Pattern

Define allowed transitions:

```python
VALID_TRANSITIONS = {
    "none": {"incomplete", "trialing", "active"},
    "incomplete": {"trialing", "active", "canceled"},
    "trialing": {"active", "past_due", "canceled"},
    "active": {"past_due", "canceled"},
    "past_due": {"active", "canceled"},
    "canceled": set(),
}
```

**Implementation (enforce monotonic state + event timestamp):**

```python
async def apply_subscription_update_from_event(event: dict):
    data = event["data"]["object"]
    sub_id = data["id"]
    new_status = data["status"]  # Stripe status
    event_created = event["created"]

    doc = await db.subscriptions.find_one({"stripe_subscription_id": sub_id})

    current_status = doc["status"] if doc else "none"
    last_event_created = doc.get("last_event_created") if doc else None

    # discard if event is older than last applied
    if last_event_created and event_created <= last_event_created:
        return

    # enforce allowed transitions
    if new_status not in VALID_TRANSITIONS.get(current_status, set()):
        # optionally log and ignore
        return

    await db.subscriptions.update_one(
        {"stripe_subscription_id": sub_id},
        {
            "$set": {
                "status": new_status,
                "last_event_created": event_created,
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )
```

### Timestamp‑Based Ordering Strategies

- Use `event["created"]` as your monotonic timestamp for a given subscription.
- Keep `last_event_created` per subscription; ignore events with older timestamps (or keep only for audit).
- For critical transitions, call `stripe.Subscription.retrieve(sub_id)` and overwrite with the authoritative status.

```python
import stripe

async def refresh_subscription_from_stripe(sub_id: str):
    sub = stripe.Subscription.retrieve(sub_id)
    await db.subscriptions.update_one(
        {"stripe_subscription_id": sub_id},
        {
            "$set": {
                "status": sub["status"],
                "current_period_end": datetime.fromtimestamp(sub["current_period_end"]),
                "last_event_created": sub["latest_invoice"]["created"]
                if sub.get("latest_invoice")
                else None,
                "synced_from_stripe": True,
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )
```

Use this "fetch‑before‑process" tactic particularly when you detect an impossible transition or missing context.

### DB Transaction / Race‑Condition Patterns

**With database atomic operations:**

- Use **single‑document updates** with atomic operators (`$set`, `$max`, `$currentDate`), which are atomic at the document level.
- For multi‑document flows (like user + subscription), keep all subscription state in one document per subscription to avoid cross‑document races.

**Example ensuring monotonic `last_event_created` in one atomic call:**

```python
await db.subscriptions.update_one(
    {"stripe_subscription_id": sub_id},
    {
        "$set": {"status": new_status},
        "$max": {"last_event_created": event_created},
        "$currentDate": {"updated_at": True},
    },
    upsert=True,
)
```

`$max` guarantees that if two events race, only the one with the highest `event_created` wins for `last_event_created`.

### Testing Out‑of‑Order Scenarios

**1. Unit tests: call handlers out of order**

```python
@pytest.mark.asyncio
async def test_out_of_order_events_preserve_final_state(mocker):
    sub_id = "sub_123"

    newer_event = {"id": "evt_new", "created": 200, "data": {"object": {"id": sub_id, "status": "active"}}}
    older_event = {"id": "evt_old", "created": 100, "data": {"object": {"id": sub_id, "status": "past_due"}}}

    await apply_subscription_update_from_event(newer_event)
    await apply_subscription_update_from_event(older_event)

    doc = await db.subscriptions.find_one({"stripe_subscription_id": sub_id})
    assert doc["status"] == "active"
```

**2. Integration with Stripe CLI**

- Trigger `checkout.session.completed` and `invoice.paid` and manually reorder by resending specific events from the dashboard; assert your subscription record's final state and timestamps remain sane.

---

## 3. Missing Events & Lockouts

Even with retries, webhooks can fail for hours or days if your endpoint is down; Stripe retries for up to 3 days. During that time, users may have paid but your system has not seen the event.

### Fallback Strategies When Webhooks Fail

**Layers to add:**

- **Stripe's retry**: ensure you return non‑2xx only when genuinely unable to handle; otherwise you'll lose automatic retries.
- **Dead‑letter / error queue**: on handler exceptions, record a "failed to process" job for later reprocessing.
- **Periodic reconciliation job** that polls Stripe to fill gaps.

### Polling Stripe API as Backup

**Pattern:** store minimal Stripe identifiers on the user, then periodically poll for recent invoices/subscriptions and reconcile.

```python
import stripe
from datetime import datetime, timedelta

stripe.api_key = STRIPE_SECRET_KEY

async def reconcile_recent_invoices(minutes: int = 30):
    since = int((datetime.utcnow() - timedelta(minutes=minutes)).timestamp())
    invoices = stripe.Invoice.list(created={"gte": since}, limit=100)

    for inv in invoices.auto_paging_iter():
        sub_id = inv.get("subscription")
        if not sub_id:
            continue
        # idempotent update: will use same dedup/state machine logic
        event_like = {
            "id": f"reconcile_{inv['id']}",
            "created": inv["created"],
            "type": "invoice.paid" if inv["paid"] else "invoice.payment_failed",
            "data": {"object": inv},
        }
        await process_event(event_like)
```

Run this via a FastAPI background task or an external worker every few minutes.

**You can also reconcile per user when they log in:**

```python
async def ensure_subscription_fresh(user):
    if not user.stripe_customer_id:
        return

    subs = stripe.Subscription.list(customer=user.stripe_customer_id, limit=10)
    for sub in subs.auto_paging_iter():
        await refresh_subscription_from_stripe(sub["id"])
```

### Grace Period Implementations

**Avoid immediate lockout:**

- When local state says "expired" but `last_sync_at` is older than some threshold (e.g., 10–30 minutes), treat user as **grace_active** until you poll Stripe.
- Store fields: `status`, `current_period_end`, `last_verified_from_stripe_at`.

```python
def has_active_access(sub_doc, now: datetime) -> bool:
    if sub_doc["status"] == "active" and sub_doc["current_period_end"] > now:
        return True

    # grace window if data might be stale
    max_staleness = timedelta(minutes=15)
    if sub_doc["status"] in {"past_due", "incomplete"} and \
       now - sub_doc.get("last_verified_from_stripe_at", datetime.min) < max_staleness:
        return True

    return False
```

Use this helper in your auth/permissions checks so occasional missing or delayed events do not immediately lock paying customers out.

### Customer Notification Systems

**If reconciliation detects inconsistencies:**

- When Stripe says "paid" but your system still has "past_due" or "none", auto‑correct and optionally send an email "Your access has been restored after a billing sync".
- When Stripe shows a failed payment and your system still shows "active", downgrade but notify, with a link to update payment details.

You can store `needs_manual_review: True` on suspicious records and surface them in an admin dashboard.

### Testing "Missing Events" Flows

**1. Simulate endpoint downtime**

- In a test or staging env, temporarily return `500` from the webhook and trigger payments via Stripe CLI; confirm Stripe shows undelivered events and retries over time.
- Restore endpoint, then run your reconciliation job and assert all "paid but missing" subscriptions become active.

**2. Unit tests for reconciliation**

```python
@pytest.mark.asyncio
async def test_reconciliation_backfills_missing_invoice(mocker):
    fake_invoice = {
        "id": "in_123",
        "created": 1000,
        "paid": True,
        "subscription": "sub_123",
        "lines": {"data": [{"period": {"end": 2000}}]},
    }
    stripe_invoice_list = mocker.MagicMock()
    stripe_invoice_list.auto_paging_iter.return_value = [fake_invoice]
    mocker.patch("yourmodule.stripe.Invoice.list", return_value=stripe_invoice_list)

    await reconcile_recent_invoices(minutes=60)

    sub = await db.subscriptions.find_one({"stripe_subscription_id": "sub_123"})
    assert sub["status"] == "active"
```

**3. Feature tests for grace period**

- Mock a subscription where `current_period_end` is in the past but `last_verified_from_stripe_at` is 5 minutes ago; assert `has_active_access` is True.
- Same with `last_verified_from_stripe_at` 1 day ago; assert False.

---

## Key Takeaways

1. **Always use `event.id` for idempotency** - unique index on your event log
2. **Implement state machine with timestamp ordering** - ignore old events
3. **Add reconciliation polling** - don't rely solely on webhooks
4. **Grace periods prevent lockouts** - verify before denying access
5. **Test all three scenarios** - duplicates, out-of-order, missing

---

## PropIQ Application Notes

- ✅ Convex already has `stripeEvents` table with `eventId` index (idempotency ✓)
- ⚠️ Need to verify state machine implementation
- ⚠️ Need to add reconciliation polling
- ⚠️ Need to implement grace period logic
- ⚠️ FastAPI endpoint (deprecated) has no idempotency protection

**Next:** Design chaos tests based on these patterns
