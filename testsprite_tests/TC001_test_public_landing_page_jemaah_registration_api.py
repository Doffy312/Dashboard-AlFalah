import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}


def test_public_landing_page_jemaah_registration_api():
    url = f"{BASE_URL}/api/jemaah"

    # Valid payload with required fields (assuming typical required fields for jemaah registration)
    valid_payload = {
        "nama": "Ahmad Fauzan",
        "alamat": "Jl. Merdeka No. 45",
        "no_telepon": "081234567890",
        "email": "ahmad.fauzan@example.com",
        "kategori": "Umum"
    }

    # Missing required fields payload (empty payload simulates missing everything)
    invalid_payload = {}

    # Test successful registration
    try:
        response = requests.post(url, json=valid_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"
        data = response.json()
        # Validate response contains expected keys, e.g., id and echoed input
        assert "id" in data and isinstance(data["id"], int)
        assert data.get("nama") == valid_payload["nama"]
        assert data.get("email") == valid_payload["email"]
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Valid registration test failed: {e}")

    # Test validation error on missing required fields
    try:
        response = requests.post(url, json=invalid_payload, headers=HEADERS, timeout=TIMEOUT)
        # Expecting 400 Bad Request or 422 Unprocessable Entity for validation failure
        assert response.status_code in (400, 422), f"Expected 400 or 422, got {response.status_code}"
        error_data = response.json()
        # Optional: Assert error details presence
        assert "error" in error_data or "message" in error_data
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Invalid registration (missing fields) test failed: {e}")


test_public_landing_page_jemaah_registration_api()