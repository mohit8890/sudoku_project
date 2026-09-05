from fastapi.testclient import TestClient

from main import app, generate


client = TestClient(app)


def test_root_returns_welcome_message() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Welcome to the Copilot lab, Shivanshu Kumar!" in response.text


def test_generate_returns_token() -> None:
    response = client.get("/generate")
    body = response.json()

    assert response.status_code == 200
    assert "token" in body
    assert isinstance(body["token"], str)
    assert len(body["token"]) == 32


def test_checksum_returns_sha256() -> None:
    payload = {"text": "copilot"}
    response = client.post("/checksum", json=payload)

    assert response.status_code == 200
    assert response.json() == {
        "text": "copilot",
        "checksum": generate("copilot"),
    }


def test_checksum_rejects_empty_text() -> None:
    response = client.post("/checksum", json={"text": ""})
    assert response.status_code == 422
