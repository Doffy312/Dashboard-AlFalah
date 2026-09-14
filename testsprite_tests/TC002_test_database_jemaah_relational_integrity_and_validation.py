import requests
import uuid

BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = "/api/auth/sign-in/email"
JEMAAH_ENDPOINT = "/api/jemaah"
HEADERS_JSON = {"Content-Type": "application/json"}
TIMEOUT = 30

def authenticate():
    url = BASE_URL + AUTH_ENDPOINT
    payload = {
        "email": "admin_alfalah@example.com",
        "password": "password123"
    }
    try:
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        # changed from 'accessToken' to 'token' as per common convention
        token = resp.json().get("token")
        assert token and isinstance(token, str), "Authentication token not found or invalid in response"
        return token
    except Exception as e:
        raise Exception(f"Authentication failed: {e}")

def test_database_jemaah_relational_integrity_and_validation():
    token = authenticate()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Valid jemaah data (minimal representative example fitting expected schema)
    valid_jemaah = {
        "nama": "Test Jemaah "+str(uuid.uuid4()),
        "alamat": "Jl. Contoh No.123",
        "kategori": "Umum",
        "no_telepon": "081234567890",
        "email": "test.jemaah@example.com",
        "tgl_lahir": "1990-01-01",
        "jenis_kelamin": "Laki-Laki"
    }

    # Invalid jemaah data - wrong data types and missing required fields
    invalid_jemaah_cases = [
        # Missing required field 'nama'
        {
            "alamat": "No Name Street",
            "kategori": "Umum",
            "no_telepon": "081234567890",
            "email": "no.name@example.com",
            "tgl_lahir": "1980-12-12",
            "jenis_kelamin": "Perempuan"
        },
        # Invalid type: kategori as number
        {
            "nama": "Invalid Kategori",
            "alamat": "Jl. Invalid Type",
            "kategori": 123,
            "no_telepon": "081234567890",
            "email": "invalid.kategori@example.com",
            "tgl_lahir": "1985-05-05",
            "jenis_kelamin": "Laki-Laki"
        },
        # Invalid type: tgl_lahir as string not date format
        {
            "nama": "Invalid Date",
            "alamat": "Jl. Invalid Date",
            "kategori": "Umum",
            "no_telepon": "081234567890",
            "email": "invalid.date@example.com",
            "tgl_lahir": "not-a-date",
            "jenis_kelamin": "Laki-Laki"
        }
    ]
    created_jemaah_id = None

    # Create valid jemaah record
    try:
        create_resp = requests.post(BASE_URL + JEMAAH_ENDPOINT, headers=headers, json=valid_jemaah, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Failed to create valid jemaah, status: {create_resp.status_code}"
        created = create_resp.json()
        created_jemaah_id = created.get("id") or created.get("uuid")
        assert created_jemaah_id, "Created jemaah ID missing in response"

        # Validate saved record's types by GETting and verifying key fields
        get_resp = requests.get(f"{BASE_URL}{JEMAAH_ENDPOINT}/{created_jemaah_id}", headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, "Failed to retrieve jemaah after creation"
        jemaah_data = get_resp.json()
        # Type assertions
        assert isinstance(jemaah_data.get("nama"), str), "nama should be a string"
        assert isinstance(jemaah_data.get("kategori"), str), "kategori should be a string"
        assert isinstance(jemaah_data.get("no_telepon"), (str, type(None))), "no_telepon should be a string or null"
        assert isinstance(jemaah_data.get("email"), (str, type(None))), "email should be string or null"
        assert isinstance(jemaah_data.get("jenis_kelamin"), str), "jenis_kelamin should be a string"
        # Validate tanggal lahir format (simple iso date)
        from datetime import datetime
        try:
            datetime.strptime(jemaah_data.get("tgl_lahir"), "%Y-%m-%d")
        except Exception:
            assert False, "tgl_lahir is not in 'YYYY-MM-DD' format"

        # Now test invalid jemaah inputs: each should be rejected with 4xx (validation)
        for invalid_payload in invalid_jemaah_cases:
            invalid_resp = requests.post(BASE_URL + JEMAAH_ENDPOINT, headers=headers, json=invalid_payload, timeout=TIMEOUT)
            assert invalid_resp.status_code >= 400 and invalid_resp.status_code < 500, \
                f"Invalid jemaah input was accepted: {invalid_payload}"

        # After invalid attempts, verify original jemaah remains intact (data not corrupted)
        check_resp = requests.get(f"{BASE_URL}{JEMAAH_ENDPOINT}/{created_jemaah_id}", headers=headers, timeout=TIMEOUT)
        assert check_resp.status_code == 200, "Jemaah record missing after invalid inputs"
        current_data = check_resp.json()
        assert current_data.get("nama") == valid_jemaah["nama"], "Jemaah data corrupted after invalid inputs"

    finally:
        # Cleanup: delete created jemaah if any
        if created_jemaah_id:
            delete_resp = requests.delete(f"{BASE_URL}{JEMAAH_ENDPOINT}/{created_jemaah_id}", headers=headers, timeout=TIMEOUT)
            assert delete_resp.status_code == 200 or delete_resp.status_code == 204, "Cleanup deletion failed"

test_database_jemaah_relational_integrity_and_validation()
