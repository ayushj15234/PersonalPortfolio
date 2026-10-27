import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

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


class SkillGroup(BaseModel):
    category: str
    description: str
    items: list[str]


class Project(BaseModel):
    id: str
    title: str
    description: str = ""
    category: str | None = None
    tags: list[str] = []
    githubUrl: str | None = None
    liveUrl: str | None = None


class ContactMessage(BaseModel):
    # FastAPI rejects anything that breaks these rules with a 422 error before our code runs.
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=10, max_length=5000)
    website: str = ""  # hidden field that only bots fill in


class SavedMessage(ContactMessage):
    id: int
    received_at: datetime


# In-memory "database": anything not hardcoded here is lost when the server restarts.
SKILLS = [
    SkillGroup(category="Languages", description="What I write in", items=["Java", "Python", "HTML", "CSS", "TypeScript", "JavaScript"]),
    SkillGroup(category="Frameworks", description="What I build with", items=["React", "React Native", "Expo", "Node.js", "JUnit", "FastAPI"]),
    SkillGroup(category="Tools", description="What I work in", items=["Eclipse", "GitHub", "VS Code", "Microsoft Office Suite", "IntelliJ"]),
]

PROJECTS = [
    Project(id="viewpoint", title="Viewpoint", category="Mobile apps", tags=["React Native", "Expo"], githubUrl="https://github.com/ayushj15234/Viewpoint"),
    Project(id="portfolio", title="Personal Portfolio", category="Web apps", tags=["React", "FastAPI"], githubUrl="https://github.com/ayushj15234/PersonalPortfolio"),
]

MESSAGES: list[SavedMessage] = []


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


@app.get("/api/skills", response_model=list[SkillGroup])
def get_skills():
    return SKILLS


# GET /api/projects?category=Web%20apps narrows the list; unknown categories return an empty list.
@app.get("/api/projects", response_model=list[Project])
def get_projects(category: str | None = None):
    if category is None:
        return PROJECTS
    return [project for project in PROJECTS if project.category and project.category.lower() == category.lower()]


@app.get("/api/projects/{project_id}", response_model=Project, responses={404: {"description": "No project with that id"}})
def get_project(project_id: str):
    for project in PROJECTS:
        if project.id == project_id:
            return project
    raise HTTPException(404, f"No project with id '{project_id}'.")


@app.post("/api/contact", status_code=201, responses={429: {}, 502: {}, 503: {}})
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
    saved = SavedMessage(**contact.model_dump(), id=len(MESSAGES) + 1, received_at=datetime.now(timezone.utc))
    MESSAGES.append(saved)
    return {"ok": True, "id": saved.id}
