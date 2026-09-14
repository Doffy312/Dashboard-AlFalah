import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_public_mosque_settings_profile_api():
    url = f"{BASE_URL}/api/settings"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, dict), "Response JSON is not an object/dict"

    # Expect a key 'mosqueProfile' containing mosque details
    assert "mosqueProfile" in data, "Key 'mosqueProfile' missing in response"

    mosque_profile = data["mosqueProfile"]
    expected_keys = ["history", "vision", "mission", "organizationStructure", "facilities"]
    for key in expected_keys:
        assert key in mosque_profile, f"Key '{key}' missing in mosqueProfile"

    # Validate at least one descriptive field is non-empty
    presence_fields = ["history", "vision", "mission", "organizationStructure", "facilities"]
    assert any(mosque_profile.get(field) for field in presence_fields), \
        "Mosque profile missing descriptive fields (history, vision, mission, etc.)"

    # bank accounts info is expected at top level key 'bankAccountTransparency'
    # or possibly inside mosqueProfile
    bank_accounts = data.get("bankAccountTransparency") or mosque_profile.get("bankAccountTransparency")
    assert isinstance(bank_accounts, list), "'bankAccountTransparency' should be a list"
    if bank_accounts:
        first_account = bank_accounts[0]
        assert isinstance(first_account, dict), "bankAccountTransparency items should be dictionaries"
        required_bank_fields = ["bankName", "accountNumber", "accountHolderName", "description"]
        for field in required_bank_fields:
            assert field in first_account, f"Bank account missing field '{field}'"
            assert first_account[field], f"Bank account field '{field}' should not be empty"

test_public_mosque_settings_profile_api()
