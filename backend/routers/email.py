# app/api/email.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from resend import send_email  # Replace with your actual Resend send function

router = APIRouter()

class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str

@router.post("/send-email/")
async def send_email_endpoint(data: EmailRequest):
    if not data.to:
        raise HTTPException(status_code=400, detail="Missing recipient email.")
    try:
        result = send_email(to=data.to, subject=data.subject, html_body=data.body)
        return {"status": "success", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
