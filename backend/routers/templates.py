from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        templates = [
            {"id": 1, "name": "Friendly Intro", "body": "Hi {name},\n\nI noticed you're a {job_title} at {company}..."},
            {"id": 2, "name": "Problem Solver", "body": "Hi {name},\n\nMany {industry} teams struggle with X. {product_name} can help..."},
            {"id": 3, "name": "Short & Direct", "body": "Hi {name},\n\nI think {product_name} could help {company} with {industry} workflows."},
        ]

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"templates": templates}).encode())
