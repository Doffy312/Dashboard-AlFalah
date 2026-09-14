import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_inventory_and_asset_management_api():
    url = f"{BASE_URL}/api/inventaris"
    headers = {
        "Accept": "application/json",
        "Authorization": "Bearer test_token"
    }

    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), "Response JSON should be a list"

    # Validate each item contains required fields
    for item in data:
        assert isinstance(item, dict), "Each inventory item should be a dict"
        assert "nama_aset" in item or "asset" in item or "name" in item, "Asset name field missing"
        condition_found = any(k in item for k in ("condition", "kondisi"))
        quantity_found = any(k in item for k in ("quantity", "jumlah"))
        location_found = any(k in item for k in ("location", "lokasi"))

        assert condition_found, "Condition field missing in an inventory item"
        assert quantity_found, "Quantity field missing in an inventory item"
        assert location_found, "Location field missing in an inventory item"


if __name__ == "__main__":
    test_inventory_and_asset_management_api()
