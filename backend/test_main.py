from unittest.mock import patch

from fastapi.testclient import TestClient

import main

client = TestClient(main.app)
VALID = {"name": "Test Visitor", "email": "visitor@example.com", "message": "Hello, this is a test message."}


def setup_function():
    main.recent_sends.clear()
    main.MESSAGES.clear()


def test_skills_and_projects():
    assert [group["category"] for group in client.get("/api/skills").json()] == ["Languages", "Frameworks", "Tools"]
    assert client.get("/api/projects").json()[0]["title"] == "Viewpoint"


def test_projects_filter_by_category():
    assert [p["id"] for p in client.get("/api/projects", params={"category": "web apps"}).json()] == ["portfolio"]
    assert client.get("/api/projects", params={"category": "games"}).json() == []


def test_get_one_project():
    assert client.get("/api/projects/viewpoint").json()["title"] == "Viewpoint"
    assert client.get("/api/projects/nope").status_code == 404


def test_contact_rejects_bad_input():
    response = client.post("/api/contact", json={"name": "", "email": "not-an-email", "message": "short"})
    assert response.status_code == 422
    assert {error["loc"][-1] for error in response.json()["detail"]} == {"name", "email", "message"}


def test_contact_sends_email_and_saves():
    with patch.object(main, "RESEND_API_KEY", "test-key"), patch.object(main, "send_email") as send:
        response = client.post("/api/contact", json=VALID)
    assert response.status_code == 201 and response.json() == {"ok": True, "id": 1}
    assert send.call_args.args[0].email == "visitor@example.com"
    assert main.MESSAGES[0].name == "Test Visitor"


def test_contact_honeypot_skips_email():
    with patch.object(main, "RESEND_API_KEY", "test-key"), patch.object(main, "send_email") as send:
        assert client.post("/api/contact", json={**VALID, "website": "spam.example"}).status_code == 201
    send.assert_not_called()
    assert main.MESSAGES == []


def test_contact_rate_limit():
    with patch.object(main, "RESEND_API_KEY", "test-key"), patch.object(main, "send_email"):
        codes = [client.post("/api/contact", json=VALID).status_code for _ in range(main.RATE_LIMIT + 1)]
    assert codes[-1] == 429 and set(codes[:-1]) == {201}


def test_contact_without_key_says_so():
    with patch.object(main, "RESEND_API_KEY", None):
        assert client.post("/api/contact", json=VALID).status_code == 503
