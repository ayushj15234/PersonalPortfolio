from unittest.mock import patch

from fastapi.testclient import TestClient

import main

client = TestClient(main.app)
VALID = {"name": "Test Visitor", "email": "visitor@example.com", "message": "Hello, this is a test message."}


def setup_function():
    main.recent_sends.clear()


def test_skills_and_projects():
    assert [group["category"] for group in client.get("/api/skills").json()] == ["Languages", "Frameworks", "Tools"]
    assert client.get("/api/projects").json()[0]["title"] == "Viewpoint"


def test_contact_rejects_bad_input():
    response = client.post("/api/contact", json={"name": "", "email": "not-an-email", "message": "short"})
    assert response.status_code == 422
    assert {error["loc"][-1] for error in response.json()["detail"]} == {"name", "email", "message"}


def test_contact_sends_email():
    with patch.object(main, "RESEND_API_KEY", "test-key"), patch.object(main, "send_email") as send:
        assert client.post("/api/contact", json=VALID).json() == {"ok": True}
    assert send.call_args.args[0].email == "visitor@example.com"


def test_contact_honeypot_skips_email():
    with patch.object(main, "RESEND_API_KEY", "test-key"), patch.object(main, "send_email") as send:
        assert client.post("/api/contact", json={**VALID, "website": "spam.example"}).status_code == 200
    send.assert_not_called()


def test_contact_rate_limit():
    with patch.object(main, "RESEND_API_KEY", "test-key"), patch.object(main, "send_email"):
        codes = [client.post("/api/contact", json=VALID).status_code for _ in range(main.RATE_LIMIT + 1)]
    assert codes[-1] == 429 and set(codes[:-1]) == {200}


def test_contact_without_key_says_so():
    with patch.object(main, "RESEND_API_KEY", None):
        assert client.post("/api/contact", json=VALID).status_code == 503
