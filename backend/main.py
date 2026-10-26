import json
import os
import time
import urllib.error
import urllib.request

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

load_dotenv()  # reads backend/.env so secrets stay out of the code

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
CONTACT_TO = os.getenv("CONTACT_TO", "ayushj8@terpmail.umd.edu")
CONTACT_FROM = os.getenv("CONTACT_FROM", "Portfolio <onboarding@resend.dev>")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(title="Ayush Jain Portfolio API")

# Browsers block requests from one site to another unless the server allows it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

SKILLS = [
    {"category": "Languages", "description": "What I write in", "items": ["Java", "Python", "HTML", "CSS", "TypeScript", "JavaScript"]},
    {"category": "Frameworks", "description": "What I build with", "items": ["React", "React Native", "Expo", "Node.js", "JUnit", "FastAPI"]},
    {"category": "Tools", "description": "What I work in", "items": ["Eclipse", "GitHub", "VS Code", "Microsoft Office Suite", "IntelliJ"]},
]

# Add a dictionary for each project. Optional fields the site understands:
# category, tags (list), image ('/projects/my-app.png' in the site's public/projects/),
# liveUrl, githubUrl, details. Leave description blank until you're ready.
PROJECTS = [
    {
        "id": "viewpoint",
        "title": "Viewpoint",
        "icon": "mountain",
        "description": "",
        "githubUrl": "https://github.com/ayushj15234/Viewpoint",
    },
]


class ContactMessage(BaseModel):
    # FastAPI rejects anything that breaks these rules with a 422 error before our code runs.
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=10, max_length=5000)
    website: str = ""  # hidden field that only bots fill in


# shortcut: per-process memory that resets on restart, fine for one small server; use Redis if it ever runs on several.
RATE_LIMIT = 5
RATE_WINDOW_SECONDS = 60 * 60
recent_sends: dict[str, list[float]] = {}


def too_many_requests(ip: str) -> bool:
    now = time.time()
    sends = [t for t in recent_sends.get(ip, []) if now - t < RATE_WINDOW_SECONDS]
    recent_sends[ip] = sends
    if len(sends) >= RATE_LIMIT:
        return True
    sends.append(now)
    return False


def send_email(contact: ContactMessage) -> None:
    # Plain text only, so nothing a visitor types can be rendered as HTML in your inbox.
    body = json.dumps({
        "from": CONTACT_FROM,
        "to": [CONTACT_TO],
        "reply_to": contact.email,
        "subject": f"Portfolio message from {contact.name.strip()}",
        "text": f"From: {contact.name.strip()} <{contact.email}>\n\n{contact.message.strip()}",
    }).encode()
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=body,
        headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json", "User-Agent": "portfolio-api"},
        method="POST",
    )
    urllib.request.urlopen(request, timeout=10)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/skills")
def get_skills():
    return SKILLS


@app.get("/api/projects")
def get_projects():
    return PROJECTS


@app.post("/api/contact")
def contact(contact: ContactMessage, request: Request):
    if contact.website:
        return {"ok": True}  # pretend it worked so bots don't retry
    if too_many_requests(request.client.host):
        raise HTTPException(429, "You've sent several messages already. Please try again in an hour or email me directly.")
    if not RESEND_API_KEY:
        raise HTTPException(503, "The contact form isn't set up yet. Please email me directly.")
    try:
        send_email(contact)
    except (urllib.error.URLError, TimeoutError) as error:
        print(f"Email failed: {error}")
        raise HTTPException(502, "Your message couldn't be sent right now. Please try again or email me directly.")
    return {"ok": True}
