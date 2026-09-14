import requests

base_url = "http://localhost:3000"

def test_public_contact_messages_submission_api():
    url = f"{base_url}/api/contact"
    headers = {
        "Content-Type": "application/json"
    }
    # Valid payload with all mandatory fields
    valid_payload = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "message": "This is a test inquiry message."
    }
    # Payloads for missing mandatory fields
    missing_name = {
        "email": "john.doe@example.com",
        "message": "Missing name field."
    }
    missing_email = {
        "name": "John Doe",
        "message": "Missing email field."
    }
    missing_message = {
        "name": "John Doe",
        "email": "john.doe@example.com"
    }

    try:
        # Test successful submission
        response = requests.post(url, json=valid_payload, headers=headers, timeout=30)
        assert response.status_code == 201 or response.status_code == 200, f"Expected 200 or 201, got {response.status_code}"
        json_response = response.json()
        assert "id" in json_response or "message" in json_response, "Response missing expected keys"

        # Test missing name field validation
        response_missing_name = requests.post(url, json=missing_name, headers=headers, timeout=30)
        assert response_missing_name.status_code == 400, f"Expected 400 for missing name, got {response_missing_name.status_code}"
        error_response = response_missing_name.json()
        assert any(msg.lower().find("name") != -1 for msg in error_response.get("errors", []) if isinstance(msg, str)) or "name" in error_response.get("message", "").lower(), "Missing name error message not found"

        # Test missing email field validation
        response_missing_email = requests.post(url, json=missing_email, headers=headers, timeout=30)
        assert response_missing_email.status_code == 400, f"Expected 400 for missing email, got {response_missing_email.status_code}"
        error_response = response_missing_email.json()
        assert any(msg.lower().find("email") != -1 for msg in error_response.get("errors", []) if isinstance(msg, str)) or "email" in error_response.get("message", "").lower(), "Missing email error message not found"

        # Test missing message field validation
        response_missing_message = requests.post(url, json=missing_message, headers=headers, timeout=30)
        assert response_missing_message.status_code == 400, f"Expected 400 for missing message, got {response_missing_message.status_code}"
        error_response = response_missing_message.json()
        assert any(msg.lower().find("message") != -1 for msg in error_response.get("errors", []) if isinstance(msg, str)) or "message" in error_response.get("message", "").lower(), "Missing message error message not found"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_public_contact_messages_submission_api()
