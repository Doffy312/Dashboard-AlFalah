import requests


def test_work_programs_kanban_api():
    base_url = "http://localhost:3000"
    url = f"{base_url}/api/programs"
    timeout = 30
    headers = {
        "Accept": "application/json",
        "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
    }

    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    data = response.json()

    assert isinstance(data, (dict, list)), "Response data is not a dict or list"

    if isinstance(data, dict):
        for status_key in ["rencana", "berjalan", "selesai"]:
            assert status_key in data, f"Response missing '{status_key}' category"
            assert isinstance(data[status_key], list), f"'{status_key}' should be a list"

            for program in data[status_key]:
                assert isinstance(program, dict), f"Program under '{status_key}' is not a dict"

                assert "id" in program, "'id' missing in program"
                assert "nama" in program or "name" in program, "'nama' or 'name' missing in program"
                has_progress = any(
                    key in program and isinstance(program[key], (int, float)) for key in [
                        "progress", "progress_percentage", "progressValue", "progress_value"
                    ]
                )
                assert has_progress, "Program missing progress metric"

                assert "status" in program, "'status' missing in program dict"
                assert program["status"].lower() == status_key, f"Program status '{program['status']}' does not match category '{status_key}'"
    else:
        for program in data:
            assert isinstance(program, dict), "Program item is not a dictionary"
            assert "status" in program, "'status' missing in program"
            assert program["status"].lower() in ["rencana", "berjalan", "selesai"], f"Unknown status value: {program['status']}"
            has_progress = any(
                key in program and isinstance(program[key], (int, float)) for key in [
                    "progress", "progress_percentage", "progressValue", "progress_value"
                ]
            )
            assert has_progress, "Program missing progress metric"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"


test_work_programs_kanban_api()
