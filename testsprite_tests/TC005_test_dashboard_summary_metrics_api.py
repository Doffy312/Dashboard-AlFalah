import requests

def test_dashboard_summary_metrics_api():
    base_url = "http://localhost:3000"
    endpoint = "/api/dashboard/stats"
    url = base_url + endpoint
    headers = {
        "Accept": "application/json",
        "Authorization": "Bearer dummy_valid_token"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"
    data = response.json()
    assert "saldo" in data, "Missing key 'saldo' in response"
    assert isinstance(data["saldo"], (int, float)), "'saldo' should be a number"
    assert "pemasukan" in data, "Missing key 'pemasukan' in response"
    assert isinstance(data["pemasukan"], (int, float)), "'pemasukan' should be a number"
    assert "pengeluaran" in data, "Missing key 'pengeluaran' in response"
    assert isinstance(data["pengeluaran"], (int, float)), "'pengeluaran' should be a number"
    assert "total_jemaah" in data, "Missing key 'total_jemaah' in response"
    assert isinstance(data["total_jemaah"], int), "'total_jemaah' should be an integer"
    assert "active_programs" in data, "Missing key 'active_programs' in response"
    assert isinstance(data["active_programs"], int), "'active_programs' should be an integer"


test_dashboard_summary_metrics_api()