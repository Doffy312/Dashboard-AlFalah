import requests

def test_public_prayer_times_and_schedule_api():
    base_url = "http://localhost:3000"
    url = f"{base_url}/api/jadwal"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate that data is a list or dict containing schedule entries
    assert isinstance(data, (list, dict)), "Response JSON should be a list or dict representing schedule data"

    # If list, optionally check if entries have expected keys (not mandatory as PRD lacks detail)
    if isinstance(data, list) and len(data) > 0:
        item = data[0]
        assert isinstance(item, dict), "Schedule list items should be objects"
        # Typical keys might be role, name, date
        typical_keys = ["role", "name", "date"]
        assert any(k in item for k in typical_keys), f"Schedule item should contain one of expected keys: {typical_keys}"


test_public_prayer_times_and_schedule_api()
