from main import app


def test_homepage_renders_index_page():
    client = app.test_client()
    response = client.get("/")

    assert response.status_code == 200
    assert b"Sudoku Challenge" in response.data


def test_puzzle_endpoint_returns_json():
    client = app.test_client()
    response = client.get("/puzzle?difficulty=hard")
    payload = response.get_json()

    assert response.status_code == 200
    assert "puzzle" in payload
    assert "solution" in payload
    assert len(payload["puzzle"]) == 9
    assert len(payload["solution"]) == 9
