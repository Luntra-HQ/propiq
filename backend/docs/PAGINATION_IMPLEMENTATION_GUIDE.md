# Pagination Implementation Guide

**Version:** 3.1.1
**Date:** 2025-11-07
**Purpose:** Step-by-step guide for adding pagination to PropIQ list endpoints

---

## Overview

This guide shows how to implement pagination in PropIQ API endpoints using the `utils/pagination.py` module. Pagination is essential for:

- **Performance:** Reduces response size and database load
- **User Experience:** Faster page loads
- **Scalability:** Handles large datasets efficiently

---

## Prerequisites

- Pagination utilities already created in `utils/pagination.py`
- Supabase database with indexed tables
- FastAPI router endpoints

---

## Quick Start: Add Pagination in 3 Steps

### Step 1: Import Pagination Utilities

```python
from fastapi import Depends
from utils.pagination import (
    get_pagination_params,
    PaginationParams,
    PaginatedResponse,
    create_paginated_response
)
```

### Step 2: Add Pagination Dependency

```python
@router.get("/api/v1/propiq/analyses", response_model=PaginatedResponse[AnalysisModel])
async def get_analyses(
    pagination: PaginationParams = Depends(get_pagination_params),  # Add this
    token_payload: dict = Depends(verify_token)
):
    # Your endpoint logic
    pass
```

### Step 3: Use Pagination in Query

```python
# Get paginated results
items = supabase.table('property_analyses')\
    .select('*')\
    .range(pagination.skip, pagination.skip + pagination.limit - 1)\
    .execute()

# Get total count
total = supabase.table('property_analyses')\
    .select('*', count='exact')\
    .execute().count

# Return paginated response
return create_paginated_response(items.data, total, pagination)
```

---

## Example 1: Property Analyses List

### Before (No Pagination):

```python
from fastapi import APIRouter, Depends
from routers.propiq import verify_token

@router.get("/api/v1/propiq/analyses")
async def get_user_analyses(token_payload: dict = Depends(verify_token)):
    """Get all user's property analyses"""
    user_id = token_payload["user_id"]

    # Returns ALL analyses (could be 1000+)
    result = supabase.table('property_analyses')\
        .select('*')\
        .eq('user_id', user_id)\
        .order('created_at', desc=True)\
        .execute()

    return {
        "success": True,
        "data": result.data
    }
```

**Problems:**
- Returns all analyses (could be 1000+ records)
- Slow response time for users with many analyses
- High memory usage
- Poor user experience

### After (With Pagination):

```python
from fastapi import APIRouter, Depends
from routers.propiq import verify_token
from utils.pagination import (
    get_pagination_params,
    PaginationParams,
    PaginatedResponse,
    create_paginated_response
)
from pydantic import BaseModel

# Define response model
class AnalysisModel(BaseModel):
    id: str
    user_id: str
    address: str
    score: int
    rating: str
    created_at: str

@router.get("/api/v1/propiq/analyses", response_model=PaginatedResponse[AnalysisModel])
async def get_user_analyses(
    pagination: PaginationParams = Depends(get_pagination_params),
    token_payload: dict = Depends(verify_token)
):
    """Get user's property analyses (paginated)"""
    user_id = token_payload["user_id"]

    # Get paginated results
    result = supabase.table('property_analyses')\
        .select('*')\
        .eq('user_id', user_id)\
        .order('created_at', desc=True)\
        .range(pagination.skip, pagination.skip + pagination.limit - 1)\
        .execute()

    # Get total count (for pagination metadata)
    count_result = supabase.table('property_analyses')\
        .select('*', count='exact')\
        .eq('user_id', user_id)\
        .execute()

    total = count_result.count

    # Return paginated response
    return create_paginated_response(result.data, total, pagination)
```

**Benefits:**
- Returns only 20 analyses per page (default)
- Fast response time (<100ms)
- Pagination metadata included
- Consistent API format

---

## Example API Responses

### Request:
```http
GET /api/v1/propiq/analyses?page=2&page_size=20
Authorization: Bearer <token>
```

### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123",
      "address": "123 Main St, San Francisco, CA",
      "score": 85,
      "rating": "Excellent",
      "created_at": "2025-11-07T10:30:00Z"
    },
    // ... 19 more analyses
  ],
  "pagination": {
    "page": 2,
    "page_size": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": true,
    "next_page": 3,
    "previous_page": 1
  }
}
```

---

## Example 2: Support Conversations List

```python
from utils.pagination import get_pagination_params, create_paginated_response

@router.get("/api/v1/support/conversations", response_model=PaginatedResponse[ConversationModel])
async def get_user_conversations(
    pagination: PaginationParams = Depends(get_pagination_params),
    token_payload: dict = Depends(verify_token)
):
    """Get user's support conversations (paginated)"""
    user_id = token_payload["user_id"]

    # Get unique conversation IDs with latest message
    # (More complex query - group by conversation_id)
    conversations_query = f"""
        SELECT DISTINCT ON (conversation_id)
            conversation_id,
            message,
            created_at
        FROM support_chats
        WHERE user_id = '{user_id}'
        ORDER BY conversation_id, created_at DESC
    """

    # For Supabase, we'd need to:
    # 1. Get all conversation IDs
    # 2. For each, get the latest message
    # 3. Apply pagination

    # Simplified version:
    result = supabase.table('support_chats')\
        .select('conversation_id, message, created_at')\
        .eq('user_id', user_id)\
        .order('created_at', desc=True)\
        .range(pagination.skip, pagination.skip + pagination.limit - 1)\
        .execute()

    # Get total unique conversations
    all_conversations = supabase.table('support_chats')\
        .select('conversation_id')\
        .eq('user_id', user_id)\
        .execute()

    unique_conversations = len(set(c['conversation_id'] for c in all_conversations.data))

    return create_paginated_response(result.data, unique_conversations, pagination)
```

---

## Example 3: Filtered & Sorted Lists

```python
@router.get("/api/v1/propiq/analyses/search", response_model=PaginatedResponse[AnalysisModel])
async def search_analyses(
    pagination: PaginationParams = Depends(get_pagination_params),
    min_score: int = 0,
    max_score: int = 100,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    token_payload: dict = Depends(verify_token)
):
    """Search and filter property analyses with pagination"""
    user_id = token_payload["user_id"]

    # Build query with filters
    query = supabase.table('property_analyses')\
        .select('*')\
        .eq('user_id', user_id)\
        .gte('score', min_score)\
        .lte('score', max_score)

    # Apply sorting
    if sort_order == "desc":
        query = query.order(sort_by, desc=True)
    else:
        query = query.order(sort_by, desc=False)

    # Apply pagination
    result = query.range(
        pagination.skip,
        pagination.skip + pagination.limit - 1
    ).execute()

    # Get total count with same filters
    count_query = supabase.table('property_analyses')\
        .select('*', count='exact')\
        .eq('user_id', user_id)\
        .gte('score', min_score)\
        .lte('score', max_score)

    total = count_query.execute().count

    return create_paginated_response(result.data, total, pagination)
```

**Usage:**
```http
GET /api/v1/propiq/analyses/search?min_score=80&sort_by=score&sort_order=desc&page=1&page_size=10
```

---

## Example 4: Cursor-Based Pagination (Advanced)

For real-time data or large datasets, use cursor-based pagination:

```python
from utils.pagination import (
    CursorPaginationParams,
    create_cursor_paginated_response
)

@router.get("/api/v1/propiq/analyses/feed")
async def get_analyses_feed(
    cursor: Optional[str] = None,
    limit: int = 20,
    token_payload: dict = Depends(verify_token)
):
    """Get analyses feed with cursor-based pagination"""
    user_id = token_payload["user_id"]

    # Build query
    query = supabase.table('property_analyses')\
        .select('*')\
        .eq('user_id', user_id)\
        .order('created_at', desc=True)\
        .limit(limit + 1)  # Fetch one extra to check if more exist

    # If cursor provided, start after that record
    if cursor:
        query = query.gt('created_at', cursor)

    result = query.execute()
    items = result.data

    # Check if more items exist
    has_more = len(items) > limit
    if has_more:
        items = items[:limit]  # Remove extra item

    # Next cursor is the created_at of last item
    next_cursor = items[-1]['created_at'] if items and has_more else None

    return create_cursor_paginated_response(items, next_cursor, has_more)
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "next_cursor": "2025-11-07T10:30:00Z",
  "has_more": true
}
```

**Next Request:**
```http
GET /api/v1/propiq/analyses/feed?cursor=2025-11-07T10:30:00Z&limit=20
```

---

## Pagination Parameters

### Query Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `page` | int | 1 | 1+ | Page number (starts at 1) |
| `page_size` | int | 20 | 1-100 | Items per page |

### Example Requests

```http
# Default (page 1, 20 items)
GET /api/v1/propiq/analyses

# Page 2, 20 items
GET /api/v1/propiq/analyses?page=2

# Page 1, 50 items
GET /api/v1/propiq/analyses?page_size=50

# Page 3, 10 items
GET /api/v1/propiq/analyses?page=3&page_size=10
```

---

## Frontend Integration

### React Example

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface PaginatedAnalyses {
  success: boolean;
  data: Analysis[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

function AnalysesList() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchAnalyses = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await axios.get<PaginatedAnalyses>(
        `/api/v1/propiq/analyses?page=${pageNum}&page_size=20`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAnalyses(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses(page);
  }, [page]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Analyses list */}
          <div className="analyses-grid">
            {analyses.map(analysis => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>

          {/* Pagination controls */}
          {pagination && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.has_previous}
              >
                Previous
              </button>

              <span>
                Page {pagination.page} of {pagination.total_pages}
                ({pagination.total_items} total)
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.has_next}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## Performance Optimization

### 1. Use Indexes

Ensure indexed columns for ORDER BY:

```sql
-- Already created in add_production_indexes.sql
CREATE INDEX idx_analyses_user_recent
ON property_analyses(user_id, created_at DESC);
```

### 2. Optimize COUNT Queries

For large tables, COUNT can be slow. Consider:

**Option A: Approximate count (fast)**
```python
# Use Postgres statistics for fast approximate count
count_query = "SELECT reltuples::bigint FROM pg_class WHERE relname = 'property_analyses'"
```

**Option B: Cache count**
```python
from utils.cache import cache, CACHE_TTL

# Cache total count for 5 minutes
cache_key = f"count:analyses:user:{user_id}"
total = cache.get(cache_key)

if total is None:
    total = count_query.execute().count
    cache.set(cache_key, total, ttl=300)
```

### 3. Limit Page Size

```python
from utils.pagination import get_pagination_params

# Already enforced in PaginationParams
# Maximum page_size is 100 (prevents abuse)
```

---

## Testing Pagination

### Unit Tests

```python
import pytest
from utils.pagination import create_paginated_response, PaginationParams

def test_pagination_first_page():
    """Test first page pagination"""
    items = [{"id": i} for i in range(20)]
    total = 100
    params = PaginationParams(page=1, page_size=20)

    response = create_paginated_response(items, total, params)

    assert response.success is True
    assert len(response.data) == 20
    assert response.pagination.page == 1
    assert response.pagination.total_pages == 5
    assert response.pagination.has_next is True
    assert response.pagination.has_previous is False
    assert response.pagination.next_page == 2

def test_pagination_middle_page():
    """Test middle page pagination"""
    items = [{"id": i} for i in range(20)]
    total = 100
    params = PaginationParams(page=3, page_size=20)

    response = create_paginated_response(items, total, params)

    assert response.pagination.has_next is True
    assert response.pagination.has_previous is True
    assert response.pagination.next_page == 4
    assert response.pagination.previous_page == 2

def test_pagination_last_page():
    """Test last page pagination"""
    items = [{"id": i} for i in range(20)]
    total = 100
    params = PaginationParams(page=5, page_size=20)

    response = create_paginated_response(items, total, params)

    assert response.pagination.has_next is False
    assert response.pagination.has_previous is True
    assert response.pagination.next_page is None
```

### Integration Tests

```python
@pytest.mark.integration
def test_analyses_list_pagination(client, auth_headers):
    """Test analyses list endpoint with pagination"""
    # Get first page
    response = client.get(
        "/api/v1/propiq/analyses?page=1&page_size=10",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert len(data["data"]) <= 10
    assert "pagination" in data
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 10

    # Get second page
    if data["pagination"]["has_next"]:
        response2 = client.get(
            "/api/v1/propiq/analyses?page=2&page_size=10",
            headers=auth_headers
        )
        assert response2.status_code == 200
        data2 = response2.json()

        # Ensure different items
        page1_ids = {item["id"] for item in data["data"]}
        page2_ids = {item["id"] for item in data2["data"]}
        assert page1_ids.isdisjoint(page2_ids)
```

---

## Implementation Checklist

For each list endpoint:

- [ ] Import pagination utilities
- [ ] Add `pagination: PaginationParams = Depends(get_pagination_params)` parameter
- [ ] Update database query to use `.range(pagination.skip, pagination.skip + pagination.limit - 1)`
- [ ] Get total count with `count='exact'`
- [ ] Return `create_paginated_response(items, total, pagination)`
- [ ] Update response model to `PaginatedResponse[YourModel]`
- [ ] Add indexes for sorted columns
- [ ] Test with different page sizes
- [ ] Test with filters and sorting
- [ ] Update frontend to handle pagination

---

## Common Patterns

### Pattern 1: Simple List

```python
@router.get("/api/v1/items", response_model=PaginatedResponse[Item])
async def list_items(pagination: PaginationParams = Depends(get_pagination_params)):
    items = db.query().range(pagination.skip, pagination.skip + pagination.limit - 1).execute()
    total = db.query().count()
    return create_paginated_response(items.data, total, pagination)
```

### Pattern 2: Filtered List

```python
@router.get("/api/v1/items", response_model=PaginatedResponse[Item])
async def list_items(
    pagination: PaginationParams = Depends(get_pagination_params),
    status: str = "active"
):
    items = db.query().eq('status', status).range(...).execute()
    total = db.query().eq('status', status).count()
    return create_paginated_response(items.data, total, pagination)
```

### Pattern 3: User-Scoped List

```python
@router.get("/api/v1/items", response_model=PaginatedResponse[Item])
async def list_user_items(
    pagination: PaginationParams = Depends(get_pagination_params),
    token_payload: dict = Depends(verify_token)
):
    user_id = token_payload["user_id"]
    items = db.query().eq('user_id', user_id).range(...).execute()
    total = db.query().eq('user_id', user_id).count()
    return create_paginated_response(items.data, total, pagination)
```

---

## Summary

**Pagination is essential for:**
- ✅ Performance (fast response times)
- ✅ Scalability (handles large datasets)
- ✅ User experience (faster page loads)
- ✅ Resource efficiency (less memory, CPU, bandwidth)

**Best practices:**
- Always paginate list endpoints (no exceptions)
- Use sensible defaults (20 items per page)
- Limit maximum page size (100 items)
- Provide pagination metadata
- Use database indexes for sorted columns
- Cache total counts when appropriate

---

**See Also:**
- [utils/pagination.py](../utils/pagination.py) - Pagination utilities
- [DATABASE_OPTIMIZATION.md](../docs/DATABASE_OPTIMIZATION.md) - Query optimization
- [CACHING_LAYER_GUIDE.md](../docs/CACHING_LAYER_GUIDE.md) - Caching guide

---

**Version:** 1.0
**Last Updated:** 2025-11-07
**Status:** Ready for implementation
