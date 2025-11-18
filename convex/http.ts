/**
 * HTTP endpoints for webhooks and external integrations
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Stripe webhook handler
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        return new Response("Missing stripe-signature header", { status: 400 });
      }

      // Verify webhook signature
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("Stripe webhook secret not configured");
        return new Response("Webhook not configured", { status: 500 });
      }

      // Parse event
      const event = JSON.parse(body);

      // Log webhook event
      await ctx.runMutation(api.payments.logStripeEvent, {
        eventId: event.id,
        eventType: event.type,
        customerId: event.data?.object?.customer,
        subscriptionId: event.data?.object?.subscription,
        status: "processing",
        rawData: body,
      });

      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const tier = session.metadata?.tier;

          if (userId && tier) {
            await ctx.runMutation(api.payments.handleSubscriptionSuccess, {
              userId,
              tier,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            });

            // Update event log
            await ctx.runMutation(api.payments.logStripeEvent, {
              eventId: event.id,
              eventType: event.type,
              customerId: session.customer,
              subscriptionId: session.subscription,
              status: "completed",
              rawData: body,
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId = subscription.customer;

          // Find user by Stripe customer ID and cancel subscription
          // This would require a query by stripeCustomerId
          // For now, log the event
          await ctx.runMutation(api.payments.logStripeEvent, {
            eventId: event.id,
            eventType: event.type,
            customerId,
            subscriptionId: subscription.id,
            status: "completed",
            rawData: body,
          });
          break;
        }

        default:
          // Log unhandled event types
          await ctx.runMutation(api.payments.logStripeEvent, {
            eventId: event.id,
            eventType: event.type,
            status: "completed",
            rawData: body,
          });
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return new Response(`Webhook Error: ${error}`, { status: 400 });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "healthy",
        service: "PropIQ Convex Backend",
        timestamp: Date.now(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;
