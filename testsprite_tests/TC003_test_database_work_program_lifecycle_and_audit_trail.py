import requests
import uuid
import time
from datetime import datetime

BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = "/api/auth/sign-in/email"
PROGRAMS_ENDPOINT = "/api/programs"
AUDIT_TRAIL_ENDPOINT = "/api/notifications"  # Assuming audit logs are under notifications endpoint

EMAIL = "admin_alfalah@example.com"
PASSWORD = "password123"

TIMEOUT = 30

def test_database_work_program_lifecycle_and_audit_trail():
    session = requests.Session()
    token = None

    # Authenticate and retrieve Bearer token
    auth_payload = {
        "email": EMAIL,
        "password": PASSWORD
    }

    try:
        auth_resp = session.post(
            BASE_URL + AUTH_ENDPOINT,
            json=auth_payload,
            timeout=TIMEOUT
        )
        assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        # Token may be in various keys, try common pattern
        token = auth_data.get("token") or auth_data.get("accessToken") or auth_data.get("access_token")
        assert token, "No token found in authentication response"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Step 1: Create a new work program with status 'Direncanakan' (planned)
        unique_suffix = str(uuid.uuid4())[:8]
        today_date = datetime.utcnow().strftime('%Y-%m-%d')
        new_program_payload = {
            "name": f"Test Program {unique_suffix}",
            "title": f"Test Program {unique_suffix}",
            "budget": 1000000,
            "pic": "Test PIC",
            "status": "Direncanakan",  # Planned status
            "date": today_date,
            "description": "Automated test program description"
        }

        create_resp = session.post(
            BASE_URL + PROGRAMS_ENDPOINT,
            headers=headers,
            json=new_program_payload,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Failed to create program: {create_resp.text}"
        created_program = create_resp.json()
        program_id = created_program.get("id")
        assert program_id, "Created program ID is missing"

        # Step 2: GET the program to verify initial status
        get_resp = session.get(
            f"{BASE_URL}{PROGRAMS_ENDPOINT}/{program_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Failed to get program: {get_resp.text}"
        program_data = get_resp.json()
        assert program_data.get("status") == "Direncanakan", "Initial status incorrect"

        # Step 3: Transition status from 'Direncanakan' -> 'Sedang Berjalan' (running)
        # Include all required fields when updating, as per API validation
        update_payload = {
            "name": program_data.get("name"),
            "title": program_data.get("title"),
            "budget": program_data.get("budget"),
            "pic": program_data.get("pic"),
            "status": "Sedang Berjalan",
            "date": program_data.get("date"),
            "description": program_data.get("description")
        }
        update_resp = session.put(
            f"{BASE_URL}{PROGRAMS_ENDPOINT}/{program_id}",
            headers=headers,
            json=update_payload,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Failed to update program status: {update_resp.text}"
        updated_program = update_resp.json()
        assert updated_program.get("status") == "Sedang Berjalan", "Program status did not update"

        # Step 4: Validate audit trail record creation corresponding to status update
        # We may need to filter audit logs by program ID or details
        # Assuming audit logs are accessible in /api/notifications

        # Wait briefly for DB consistency if needed
        time.sleep(1)

        audit_resp = session.get(
            BASE_URL + AUDIT_TRAIL_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert audit_resp.status_code == 200, f"Failed to get audit trail: {audit_resp.text}"
        audit_logs = audit_resp.json()

        # Validate audit logs contain an entry for this program status change
        found_audit_entry = False
        for log in audit_logs if isinstance(audit_logs, list) else audit_logs.get("data", []):
            message = log.get("message", "").lower()
            details = log.get("details", {})
            entity_id = log.get("entityId") or details.get("programId") or details.get("id")

            if entity_id == program_id and "sedang berjalan" in message:
                found_audit_entry = True
                break

        assert found_audit_entry, "No audit trail record found for program status transition to 'Sedang Berjalan'"

        # Step 5: (Optional) Check program data again for consistency
        final_get_resp = session.get(
            f"{BASE_URL}{PROGRAMS_ENDPOINT}/{program_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert final_get_resp.status_code == 200, f"Failed to get final program data: {final_get_resp.text}"
        final_program_data = final_get_resp.json()
        assert final_program_data.get("status") == "Sedang Berjalan", "Final program status inconsistent"

    finally:
        # Cleanup: Delete the created program to maintain database state
        if token and 'program_id' in locals():
            delete_resp = session.delete(
                f"{BASE_URL}{PROGRAMS_ENDPOINT}/{program_id}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=TIMEOUT
            )
            # Accept 200 or 204 as success for deletion
            assert delete_resp.status_code in (200, 204), f"Failed to delete test program: {delete_resp.text}"

test_database_work_program_lifecycle_and_audit_trail()
