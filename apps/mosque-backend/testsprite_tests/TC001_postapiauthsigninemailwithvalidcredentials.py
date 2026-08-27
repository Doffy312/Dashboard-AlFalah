import requests

def test_post_api_auth_signin_email_with_valid_credentials():
    base_url = "http://localhost:3000"
    endpoint = "/api/auth/sign-in/email"
    url = base_url + endpoint

    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "email": "admin_alfalah@example.com",
        "password": "password123"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

        json_response = response.json()
        # Validate presence of JWT or session token in response
        # The PRD does not specify exact response fields, so check common token keys
        token_keys = ["token", "jwt", "sessionToken", "accessToken"]
        assert any(key in json_response for key in token_keys), "Response does not contain a JWT or session token"

        # Optionally, validate token is non-empty string if found
        token_found = next((json_response[key] for key in token_keys if key in json_response), None)
        assert isinstance(token_found, str) and token_found.strip() != "", "Token found is empty or not a string"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_signin_email_with_valid_credentials()