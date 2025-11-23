"""
Deal Sharing & Collaboration API
Pillar 2: Network Effects - Enables sharing analyses and team collaboration

Endpoints:
- POST /share/create - Create a share link for an analysis
- GET /share/{token} - Get shared analysis by token (public)
- GET /share/my-shares - List user's shared analyses
- DELETE /share/{share_id} - Revoke a share
- POST /share/{share_id}/comment - Add a comment
- GET /share/{share_id}/comments - Get comments
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import os
import secrets
import jwt
from config.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/share", tags=["Sharing & Collaboration"])

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

# Supabase setup
try:
    from database_supabase import get_supabase_client
    supabase = get_supabase_client()
    DATABASE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Database not available for sharing: {e}")
    DATABASE_AVAILABLE = False
    supabase = None


# ============================================================================
# Request/Response Models
# ============================================================================

class CreateShareRequest(BaseModel):
    """Request to create a share link"""
    analysis_id: str = Field(..., description="ID of the analysis to share")
    share_type: str = Field("public", description="Share type: public, private, team")
    title: Optional[str] = Field(None, max_length=200, description="Custom title")
    description: Optional[str] = Field(None, max_length=1000, description="Notes about the deal")
    allowed_emails: Optional[List[EmailStr]] = Field(None, description="Emails for private share")
    team_id: Optional[str] = Field(None, description="Team ID for team share")
    can_comment: bool = Field(True, description="Allow comments")
    can_export: bool = Field(True, description="Allow PDF export")
    expires_in_days: Optional[int] = Field(None, ge=1, le=365, description="Days until expiration")


class ShareResponse(BaseModel):
    """Response containing share details"""
    success: bool
    share_id: Optional[str] = None
    share_token: Optional[str] = None
    share_url: Optional[str] = None
    error: Optional[str] = None


class SharedAnalysis(BaseModel):
    """Shared analysis details"""
    share_id: str
    share_token: str
    analysis_id: str
    owner_id: str
    owner_email: Optional[str] = None
    share_type: str
    title: Optional[str] = None
    description: Optional[str] = None
    can_comment: bool
    can_export: bool
    view_count: int
    expires_at: Optional[str] = None
    created_at: str
    # Analysis data (when fetched)
    analysis: Optional[dict] = None


class Comment(BaseModel):
    """Comment on a shared analysis"""
    id: str
    author_id: str
    author_email: str
    author_name: Optional[str] = None
    content: str
    parent_id: Optional[str] = None
    is_edited: bool
    created_at: str
    updated_at: str
    replies: Optional[List["Comment"]] = None


class AddCommentRequest(BaseModel):
    """Request to add a comment"""
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[str] = Field(None, description="Parent comment ID for replies")


# ============================================================================
# Auth Helper
# ============================================================================

def verify_token(authorization: str = Header(None)) -> dict:
    """Verify JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT configuration error")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")


def optional_auth(authorization: str = Header(None)) -> Optional[dict]:
    """Optional JWT verification - returns None if no token"""
    if not authorization:
        return None
    try:
        return verify_token(authorization)
    except HTTPException:
        return None


# ============================================================================
# Sharing Endpoints
# ============================================================================

@router.post("/create", response_model=ShareResponse)
async def create_share(
    request: CreateShareRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Create a share link for an analysis

    Share types:
    - public: Anyone with link can view
    - private: Only specified emails can view
    - team: Only team members can view
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")
    user_email = token_payload.get("email")

    try:
        # Verify the user owns this analysis
        analysis_result = supabase.table("property_analyses").select("*").eq(
            "id", request.analysis_id
        ).eq("user_id", user_id).execute()

        if not analysis_result.data:
            raise HTTPException(
                status_code=404,
                detail="Analysis not found or you don't have permission to share it"
            )

        # Generate unique share token
        share_token = secrets.token_urlsafe(32)

        # Calculate expiration
        expires_at = None
        if request.expires_in_days:
            expires_at = (datetime.utcnow() + timedelta(days=request.expires_in_days)).isoformat()

        # Create share record
        share_data = {
            "analysis_id": request.analysis_id,
            "owner_id": user_id,
            "owner_email": user_email,
            "share_token": share_token,
            "share_type": request.share_type,
            "title": request.title,
            "description": request.description,
            "allowed_emails": request.allowed_emails,
            "team_id": request.team_id,
            "can_comment": request.can_comment,
            "can_export": request.can_export,
            "expires_at": expires_at,
            "view_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("shared_analyses").insert(share_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create share")

        share_id = result.data[0]["id"]

        # Build share URL
        frontend_url = os.getenv("FRONTEND_URL", "https://propiq.luntra.one")
        share_url = f"{frontend_url}/shared/{share_token}"

        logger.info(f"Share created: {share_id} by user {user_id}")

        return ShareResponse(
            success=True,
            share_id=str(share_id),
            share_token=share_token,
            share_url=share_url
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating share: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/view/{share_token}", response_model=SharedAnalysis)
async def get_shared_analysis(
    share_token: str,
    auth: Optional[dict] = Depends(optional_auth)
):
    """
    Get a shared analysis by its share token

    This is a public endpoint - no auth required for public shares.
    Private shares require the viewer's email to be in allowed_emails.
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Find the share by token
        share_result = supabase.table("shared_analyses").select("*").eq(
            "share_token", share_token
        ).execute()

        if not share_result.data:
            raise HTTPException(status_code=404, detail="Share not found or expired")

        share = share_result.data[0]

        # Check expiration
        if share.get("expires_at"):
            expires_at = datetime.fromisoformat(share["expires_at"].replace("Z", "+00:00"))
            if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
                raise HTTPException(status_code=410, detail="This share link has expired")

        # Check access for private shares
        if share["share_type"] == "private":
            if not auth:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication required to view this share"
                )
            viewer_email = auth.get("email", "").lower()
            allowed = [e.lower() for e in (share.get("allowed_emails") or [])]
            if viewer_email not in allowed and auth.get("sub") != share["owner_id"]:
                raise HTTPException(
                    status_code=403,
                    detail="You don't have access to this share"
                )

        # Fetch the actual analysis
        analysis_result = supabase.table("property_analyses").select("*").eq(
            "id", share["analysis_id"]
        ).execute()

        analysis_data = analysis_result.data[0] if analysis_result.data else None

        # Increment view count
        supabase.table("shared_analyses").update({
            "view_count": share["view_count"] + 1,
            "last_viewed_at": datetime.utcnow().isoformat()
        }).eq("id", share["id"]).execute()

        return SharedAnalysis(
            share_id=str(share["id"]),
            share_token=share["share_token"],
            analysis_id=share["analysis_id"],
            owner_id=share["owner_id"],
            owner_email=share.get("owner_email"),
            share_type=share["share_type"],
            title=share.get("title"),
            description=share.get("description"),
            can_comment=share["can_comment"],
            can_export=share["can_export"],
            view_count=share["view_count"] + 1,
            expires_at=share.get("expires_at"),
            created_at=share["created_at"],
            analysis=analysis_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching share: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-shares")
async def list_my_shares(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    token_payload: dict = Depends(verify_token)
):
    """List all shares created by the authenticated user"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Count total
        count_result = supabase.table("shared_analyses").select(
            "id", count="exact"
        ).eq("owner_id", user_id).execute()

        total = count_result.count or 0

        # Fetch paginated shares
        offset = (page - 1) * page_size
        shares_result = supabase.table("shared_analyses").select("*").eq(
            "owner_id", user_id
        ).order("created_at", desc=True).range(offset, offset + page_size - 1).execute()

        return {
            "success": True,
            "shares": shares_result.data,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size
            }
        }

    except Exception as e:
        logger.error(f"Error listing shares: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{share_id}")
async def revoke_share(
    share_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Revoke/delete a share link"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Verify ownership
        share_result = supabase.table("shared_analyses").select("*").eq(
            "id", share_id
        ).eq("owner_id", user_id).execute()

        if not share_result.data:
            raise HTTPException(status_code=404, detail="Share not found or not owned by you")

        # Delete the share
        supabase.table("shared_analyses").delete().eq("id", share_id).execute()

        logger.info(f"Share revoked: {share_id} by user {user_id}")

        return {"success": True, "message": "Share revoked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking share: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Comment Endpoints
# ============================================================================

@router.post("/{share_id}/comments")
async def add_comment(
    share_id: str,
    request: AddCommentRequest,
    token_payload: dict = Depends(verify_token)
):
    """Add a comment to a shared analysis"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")
    user_email = token_payload.get("email")

    try:
        # Verify share exists and allows comments
        share_result = supabase.table("shared_analyses").select("*").eq(
            "id", share_id
        ).execute()

        if not share_result.data:
            raise HTTPException(status_code=404, detail="Share not found")

        share = share_result.data[0]

        if not share["can_comment"]:
            raise HTTPException(status_code=403, detail="Comments are disabled for this share")

        # Check access for private shares
        if share["share_type"] == "private":
            viewer_email = user_email.lower() if user_email else ""
            allowed = [e.lower() for e in (share.get("allowed_emails") or [])]
            if viewer_email not in allowed and user_id != share["owner_id"]:
                raise HTTPException(status_code=403, detail="No access to comment")

        # Get user's name if available
        user_result = supabase.table("users").select("first_name, last_name").eq(
            "id", user_id
        ).execute()

        author_name = None
        if user_result.data:
            user = user_result.data[0]
            if user.get("first_name"):
                author_name = f"{user['first_name']} {user.get('last_name', '')}".strip()

        # Create comment
        comment_data = {
            "shared_analysis_id": share_id,
            "analysis_id": share["analysis_id"],
            "author_id": user_id,
            "author_email": user_email,
            "author_name": author_name,
            "content": request.content,
            "parent_id": request.parent_id,
            "is_edited": False,
            "is_deleted": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("analysis_comments").insert(comment_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create comment")

        logger.info(f"Comment added to share {share_id} by {user_id}")

        return {
            "success": True,
            "comment": result.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{share_id}/comments")
async def get_comments(
    share_id: str,
    auth: Optional[dict] = Depends(optional_auth)
):
    """Get all comments for a shared analysis"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Verify share exists
        share_result = supabase.table("shared_analyses").select("*").eq(
            "id", share_id
        ).execute()

        if not share_result.data:
            raise HTTPException(status_code=404, detail="Share not found")

        share = share_result.data[0]

        # Check access for private shares
        if share["share_type"] == "private" and auth:
            viewer_email = auth.get("email", "").lower()
            allowed = [e.lower() for e in (share.get("allowed_emails") or [])]
            if viewer_email not in allowed and auth.get("sub") != share["owner_id"]:
                raise HTTPException(status_code=403, detail="No access")

        # Fetch comments (excluding deleted)
        comments_result = supabase.table("analysis_comments").select("*").eq(
            "shared_analysis_id", share_id
        ).eq("is_deleted", False).order("created_at", desc=False).execute()

        return {
            "success": True,
            "comments": comments_result.data or []
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{share_id}/comments/{comment_id}")
async def delete_comment(
    share_id: str,
    comment_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Delete a comment (soft delete)"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Verify comment exists and user is author or share owner
        comment_result = supabase.table("analysis_comments").select("*").eq(
            "id", comment_id
        ).execute()

        if not comment_result.data:
            raise HTTPException(status_code=404, detail="Comment not found")

        comment = comment_result.data[0]

        # Check share ownership
        share_result = supabase.table("shared_analyses").select("owner_id").eq(
            "id", share_id
        ).execute()

        share_owner = share_result.data[0]["owner_id"] if share_result.data else None

        # Only comment author or share owner can delete
        if comment["author_id"] != user_id and share_owner != user_id:
            raise HTTPException(status_code=403, detail="Cannot delete this comment")

        # Soft delete
        supabase.table("analysis_comments").update({
            "is_deleted": True,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", comment_id).execute()

        return {"success": True, "message": "Comment deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health")
async def health_check():
    """Health check endpoint for Sharing API"""
    return {
        "status": "healthy" if DATABASE_AVAILABLE else "degraded",
        "database_available": DATABASE_AVAILABLE,
        "features": {
            "public_sharing": True,
            "private_sharing": True,
            "team_sharing": DATABASE_AVAILABLE,
            "comments": DATABASE_AVAILABLE
        }
    }
