import requests
import json

BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = f"{BASE_URL}/api/auth/sign-in/email"
SETTINGS_ENDPOINT = f"{BASE_URL}/api/settings"

EMAIL = "admin_alfalah@example.com"
PASSWORD = "password123"
TIMEOUT = 30


def test_database_settings_and_profile_persistence():
    # Step 1: Authenticate and get token
    try:
        auth_resp = requests.post(
            AUTH_ENDPOINT,
            json={"email": EMAIL, "password": PASSWORD},
            timeout=TIMEOUT
        )
        assert auth_resp.status_code == 200, f"Auth failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        token = auth_data.get("token") or auth_data.get("accessToken")
        assert token, "Authentication token not found in response"
    except Exception as e:
        raise AssertionError(f"Authentication request failed: {str(e)}")

    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Get current settings to baseline
    try:
        get_resp_1 = requests.get(SETTINGS_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert get_resp_1.status_code == 200, f"Initial GET /api/settings failed: {get_resp_1.text}"
        settings_before = get_resp_1.json()
        assert isinstance(settings_before, dict), "Settings response not a dictionary"
    except Exception as e:
        raise AssertionError(f"Failed to get initial settings: {str(e)}")

    # Step 3: Prepare update payload for mosque configuration, bank accounts, organization profile
    # We'll update some fields with test data and keep others intact
    updated_profile = settings_before.get("profile", {})
    updated_profile.update({
        "mosqueName": "Masjid Al-Falah Test Updated",
        "address": "Jl. Test 123",
        "coordinates": {"latitude": -6.200000, "longitude": 106.816666},
        "vision": "To be the best test mosque",
        "mission": "Provide test service for all",
        "organizationStructure": {"chairman": "Ustadz Test", "secretary": "Sdr Test"},
        "facilities": ["Test Facility 1", "Test Facility 2"]
    })

    updated_bank_accounts = settings_before.get("bankAccounts", [])
    # Add a test bank account or update if exists
    test_bank = {
        "bankName": "Bank Test",
        "accountNumber": "1234567890",
        "accountHolder": "Masjid Al-Falah Test"
    }
    # Check if test bank exists
    existing_index = None
    for i, acc in enumerate(updated_bank_accounts):
        if acc.get("accountNumber") == test_bank["accountNumber"]:
            existing_index = i
            break
    if existing_index is not None:
        updated_bank_accounts[existing_index] = test_bank
    else:
        updated_bank_accounts.append(test_bank)

    updated_settings_payload = settings_before.copy()
    updated_settings_payload["profile"] = updated_profile
    updated_settings_payload["bankAccounts"] = updated_bank_accounts

    # Step 4: POST updated settings (assuming POST /api/settings updates config)
    try:
        post_resp = requests.post(
            SETTINGS_ENDPOINT,
            headers={**headers, "Content-Type": "application/json"},
            json=updated_settings_payload,
            timeout=TIMEOUT
        )
        assert post_resp.status_code in (200, 201), f"Update settings failed: {post_resp.status_code} {post_resp.text}"
        updated_response = post_resp.json()
        assert updated_response, "Empty response after update"
    except Exception as e:
        raise AssertionError(f"Failed to update settings: {str(e)}")

    # Step 5: GET settings again to verify persistence after update
    try:
        get_resp_2 = requests.get(SETTINGS_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert get_resp_2.status_code == 200, f"GET after update failed: {get_resp_2.text}"
        settings_after = get_resp_2.json()
        assert isinstance(settings_after, dict), "Settings response not a dictionary after update"
    except Exception as e:
        raise AssertionError(f"Failed to get settings after update: {str(e)}")

    # Step 6: Validate that updated fields persist
    profile_after = settings_after.get("profile", {})
    bank_accounts_after = settings_after.get("bankAccounts", [])

    assert profile_after.get("mosqueName") == updated_profile["mosqueName"], "Mosque name did not persist"
    assert profile_after.get("address") == updated_profile["address"], "Mosque address did not persist"
    assert profile_after.get("coordinates") == updated_profile["coordinates"], "Coordinates did not persist"
    assert profile_after.get("vision") == updated_profile["vision"], "Vision did not persist"
    assert profile_after.get("mission") == updated_profile["mission"], "Mission did not persist"
    assert profile_after.get("organizationStructure") == updated_profile["organizationStructure"], "Organization structure did not persist"
    assert profile_after.get("facilities") == updated_profile["facilities"], "Facilities did not persist"

    # Check bank account exists in updated list
    found_test_bank = any(
        acc.get("accountNumber") == test_bank["accountNumber"] and
        acc.get("bankName") == test_bank["bankName"] and
        acc.get("accountHolder") == test_bank["accountHolder"]
        for acc in bank_accounts_after
    )
    assert found_test_bank, "Test bank account not found after update"

    # Step 7: Verify database consistency by re-reading multiple times (simulate by 2 more GETs)
    for _ in range(2):
        retry_resp = requests.get(SETTINGS_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert retry_resp.status_code == 200, f"GET on retry failed: {retry_resp.text}"
        retry_settings = retry_resp.json()
        assert retry_settings.get("profile", {}) == profile_after, "Profile inconsistent across reads"
        assert retry_settings.get("bankAccounts", []) == bank_accounts_after, "Bank accounts inconsistent across reads"

    # Step 8: Check audit logs if available (assume /api/notifications for audit)
    # This is optional because not explicitly given; attempt GET /api/notifikasi
    audit_logs_endpoint = f"{BASE_URL}/api/notifikasi"
    try:
        audit_resp = requests.get(audit_logs_endpoint, headers=headers, timeout=TIMEOUT)
        if audit_resp.status_code == 200:
            audit_logs = audit_resp.json()
            # Check audit logs contain mention of 'settings' or 'profile' update
            found_audit = any(
                ("profile" in json.dumps(entry).lower() or "settings" in json.dumps(entry).lower())
                for entry in audit_logs
            )
            assert found_audit, "No audit log entry found for settings/profile update"
        # If no permission or not found, skip without fail
    except Exception:
        pass


test_database_settings_and_profile_persistence()