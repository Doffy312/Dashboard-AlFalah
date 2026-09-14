import requests

BASE_URL = "http://localhost:3000"
LOGIN_ENDPOINT = "/api/auth/sign-in/email"
TIMEOUT = 30


def test_staff_authentication_login_api():
    url = BASE_URL + LOGIN_ENDPOINT
    headers = {
        "Content-Type": "application/json"
    }

    # Valid credentials payload
    valid_payload = {
        "email": "admin_alfalah@example.com",
        "password": "password123"
    }

    # Invalid credentials payload
    invalid_payload = {
        "email": "admin_alfalah@example.com",
        "password": "wrongpassword"
    }

    # Test valid staff login
    try:
        response_valid = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
        assert response_valid.status_code == 200, f"Expected 200 OK for valid login, got {response_valid.status_code}"

        data_valid = response_valid.json()
        # Assuming token/session is returned in keys like 'token' or 'session'
        assert ("token" in data_valid and data_valid["token"]) or ("session" in data_valid and data_valid["session"]), \
            "Valid login did not return a token or session"
    except requests.RequestException as e:
        assert False, f"Request failed during valid login test: {e}"

    # Test invalid staff login
    try:
        response_invalid = requests.post(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        assert response_invalid.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {response_invalid.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed during invalid login test: {e}"


test_staff_authentication_login_api()
