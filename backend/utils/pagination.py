"""
Pagination utilities for list endpoints

Provides consistent pagination across all API endpoints that return lists.
"""

from typing import TypeVar, Generic, List, Optional
from pydantic import BaseModel, Field
from fastapi import Query
import math

T = TypeVar('T')


class PaginationParams(BaseModel):
    """
    Standard pagination parameters

    Usage in endpoint:
        def get_items(
            page: int = Query(1, ge=1, description="Page number (starts at 1)"),
            page_size: int = Query(20, ge=1, le=100, description="Items per page")
        ):
            pagination = PaginationParams(page=page, page_size=page_size)
            ...
    """

    page: int = Field(1, ge=1, description="Page number (starts at 1)")
    page_size: int = Field(20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def skip(self) -> int:
        """Calculate number of records to skip for database query"""
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        """Get limit for database query"""
        return self.page_size


class PaginationMeta(BaseModel):
    """
    Pagination metadata included in response

    Provides information about current page, total pages, etc.
    """

    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_items: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_previous: bool = Field(..., description="Whether there is a previous page")
    next_page: Optional[int] = Field(None, description="Next page number (if available)")
    previous_page: Optional[int] = Field(None, description="Previous page number (if available)")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response wrapper

    Usage:
        from utils.pagination import PaginatedResponse
        from pydantic import BaseModel

        class Item(BaseModel):
            id: str
            name: str

        @app.get("/items", response_model=PaginatedResponse[Item])
        def get_items(pagination: PaginationParams):
            items = get_items_from_db(skip=pagination.skip, limit=pagination.limit)
            total = count_items_in_db()
            return create_paginated_response(items, total, pagination)
    """

    success: bool = Field(True, description="Request success status")
    data: List[T] = Field(..., description="List of items for current page")
    pagination: PaginationMeta = Field(..., description="Pagination metadata")


def create_pagination_meta(
    total_items: int,
    page: int,
    page_size: int
) -> PaginationMeta:
    """
    Create pagination metadata from total count and pagination params

    Args:
        total_items: Total number of items in database
        page: Current page number
        page_size: Items per page

    Returns:
        PaginationMeta with calculated fields

    Example:
        meta = create_pagination_meta(total_items=150, page=3, page_size=20)
        # Returns metadata for page 3 of 8 (150 items, 20 per page)
    """

    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 1
    has_next = page < total_pages
    has_previous = page > 1

    return PaginationMeta(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=has_next,
        has_previous=has_previous,
        next_page=page + 1 if has_next else None,
        previous_page=page - 1 if has_previous else None
    )


def create_paginated_response(
    items: List[T],
    total_items: int,
    pagination_params: PaginationParams
) -> PaginatedResponse[T]:
    """
    Create a paginated response from items and pagination params

    Args:
        items: List of items for current page
        total_items: Total number of items (from database count)
        pagination_params: Pagination parameters from request

    Returns:
        PaginatedResponse with items and metadata

    Example:
        items = db.query(Item).offset(pagination.skip).limit(pagination.limit).all()
        total = db.query(Item).count()
        return create_paginated_response(items, total, pagination)
    """

    meta = create_pagination_meta(
        total_items=total_items,
        page=pagination_params.page,
        page_size=pagination_params.page_size
    )

    return PaginatedResponse(
        success=True,
        data=items,
        pagination=meta
    )


# Common pagination presets
PAGINATION_PRESETS = {
    "small": 10,  # Small pages for mobile or limited data
    "default": 20,  # Default page size
    "medium": 50,  # Medium pages for desktop
    "large": 100,  # Maximum page size (hard limit)
}


def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)")
) -> PaginationParams:
    """
    FastAPI dependency for pagination parameters

    Usage:
        from fastapi import Depends
        from utils.pagination import get_pagination_params, PaginationParams

        @app.get("/items")
        def get_items(pagination: PaginationParams = Depends(get_pagination_params)):
            items = get_items_from_db(skip=pagination.skip, limit=pagination.limit)
            ...

    This makes pagination consistent across all endpoints.
    """

    return PaginationParams(page=page, page_size=page_size)


# Example usage in endpoint:
"""
from fastapi import APIRouter, Depends
from utils.pagination import (
    get_pagination_params,
    PaginationParams,
    PaginatedResponse,
    create_paginated_response
)
from pydantic import BaseModel

router = APIRouter()

class Item(BaseModel):
    id: str
    name: str

@router.get("/items", response_model=PaginatedResponse[Item])
def get_items(pagination: PaginationParams = Depends(get_pagination_params)):
    # Get items from database with pagination
    items = database.query(Item)\\
        .offset(pagination.skip)\\
        .limit(pagination.limit)\\
        .all()

    # Get total count
    total = database.query(Item).count()

    # Return paginated response
    return create_paginated_response(items, total, pagination)

# Response format:
{
    "success": true,
    "data": [
        {"id": "1", "name": "Item 1"},
        {"id": "2", "name": "Item 2"},
        ...
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
"""


class CursorPaginationParams(BaseModel):
    """
    Cursor-based pagination (alternative to offset-based)

    Better for large datasets and real-time data.

    Usage:
        def get_items(cursor: Optional[str] = None, limit: int = 20):
            params = CursorPaginationParams(cursor=cursor, limit=limit)
            ...
    """

    cursor: Optional[str] = Field(None, description="Cursor for next page")
    limit: int = Field(20, ge=1, le=100, description="Items to return")


class CursorPaginatedResponse(BaseModel, Generic[T]):
    """
    Cursor-based paginated response

    Includes next_cursor for fetching next page.
    """

    success: bool = Field(True)
    data: List[T]
    next_cursor: Optional[str] = Field(None, description="Cursor for next page")
    has_more: bool = Field(..., description="Whether more items exist")


def create_cursor_paginated_response(
    items: List[T],
    next_cursor: Optional[str],
    has_more: bool
) -> CursorPaginatedResponse[T]:
    """
    Create cursor-based paginated response

    Args:
        items: List of items
        next_cursor: Cursor for next page (usually ID of last item)
        has_more: Whether more items exist

    Returns:
        CursorPaginatedResponse

    Example:
        items = db.query(Item).filter(Item.id > cursor).limit(21).all()
        has_more = len(items) > 20
        items = items[:20]  # Return only 20
        next_cursor = items[-1].id if has_more else None
        return create_cursor_paginated_response(items, next_cursor, has_more)
    """

    return CursorPaginatedResponse(
        success=True,
        data=items,
        next_cursor=next_cursor,
        has_more=has_more
    )
