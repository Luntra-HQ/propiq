from http.server import BaseHTTPRequestHandler
import json
import os
from tools import process_lead

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        email = data.get("email")
        name = data.get("first_name", "there")

        # Call your existing email generation + SendGrid logic
        process_lead(email, name)

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "sent", "to": email}).encode())
