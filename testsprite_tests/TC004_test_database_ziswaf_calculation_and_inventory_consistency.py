import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = "/api/auth/sign-in/email"
ZISWAF_ENDPOINT = "/api/ziswaf"
INVENTARIS_ENDPOINT = "/api/inventaris"
TIMEOUT = 30

EMAIL = "admin_alfalah@example.com"
PASSWORD = "password123"

def test_database_ziswaf_calculation_and_inventory_consistency():
    session = requests.Session()
    try:
        # Authenticate to get Bearer token
        auth_resp = session.post(
            BASE_URL + AUTH_ENDPOINT,
            json={"email": EMAIL, "password": PASSWORD},
            timeout=TIMEOUT,
        )
        assert auth_resp.status_code == 200, f"Auth failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        token = auth_data.get("token")
        assert token and isinstance(token, str), "Token missing or invalid in auth response"

        headers = {"Authorization": f"Bearer {token}"}

        # Step 1: Read current ZISWAF data
        ziswaf_resp = session.get(
            BASE_URL + ZISWAF_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert ziswaf_resp.status_code == 200, f"Failed to fetch ZISWAF data: {ziswaf_resp.text}"
        ziswaf_data = ziswaf_resp.json()
        assert isinstance(ziswaf_data, list), "ZISWAF response is not a list"

        # Step 2: Read current inventory data
        inventaris_resp = session.get(
            BASE_URL + INVENTARIS_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert inventaris_resp.status_code == 200, f"Failed to fetch inventory data: {inventaris_resp.text}"
        inventaris_data = inventaris_resp.json()
        assert isinstance(inventaris_data, list), "Inventory response is not a list"

        # Step 3: Mathematical and schema consistency checks across ZISWAF items
        # Validate total ZISWAF amounts by category and sum of individual values
        category_totals = {}
        total_ziswaf_value = 0
        for entry in ziswaf_data:
            # Schema validations
            assert "id" in entry, "ZISWAF entry missing id"
            assert "category" in entry, "ZISWAF entry missing category"
            cat = entry["category"]
            assert isinstance(cat, str) and cat.strip(), "ZISWAF category invalid"
            assert "quantity" in entry, "ZISWAF entry missing quantity"
            qty = entry["quantity"]
            assert isinstance(qty, (int, float)) and qty >= 0, "ZISWAF quantity invalid"
            assert "value" in entry, "ZISWAF entry missing value"
            val = entry["value"]
            assert isinstance(val, (int, float)) and val >= 0, "ZISWAF value invalid"

            # Calculate totals per category
            category_totals[cat] = category_totals.get(cat, 0) + qty
            total_ziswaf_value += val

        # Verify category totals are positive or zero
        for cat, qty_sum in category_totals.items():
            assert qty_sum >= 0, f"Quantity sum for category {cat} is negative"

        # Step 4: Mathematical consistency checks for inventory items
        inventory_quantities = {}
        for item in inventaris_data:
            # Schema validations
            assert "id" in item, "Inventory item missing id"
            assert "category" in item, "Inventory item missing category"
            icat = item["category"]
            assert isinstance(icat, str) and icat.strip(), "Inventory category invalid"
            assert "quantity" in item, "Inventory item missing quantity"
            iqty = item["quantity"]
            assert isinstance(iqty, (int, float)) and iqty >= 0, "Inventory quantity invalid"

            # Aggregate quantities by category
            inventory_quantities[icat] = inventory_quantities.get(icat, 0) + iqty

        # Quantities in inventory grouped by category non-negative
        for cat, qty_sum in inventory_quantities.items():
            assert qty_sum >= 0, f"Inventory quantity sum for category {cat} is negative"

        # Step 5: Cross-validation is limited due to lack of 'value' field in inventory per PRD
        # So, no total value comparison is done here.

        # Step 6: Verify audit logs exist for recent ZISWAF additions (if available)
        # Since no explicit audit log endpoint in PRD, verify at least that the GET requests return a "lastUpdated" or "updatedAt" field in items
        for entry in ziswaf_data:
            assert any(k in entry for k in ["updatedAt", "lastUpdated", "modifiedAt"]), "ZISWAF entry missing audit timestamp"

        for item in inventaris_data:
            assert any(k in item for k in ["updatedAt", "lastUpdated", "modifiedAt"]), "Inventory item missing audit timestamp"

    except RequestException as e:
        assert False, f"HTTP request failed: {e}"
    finally:
        session.close()

test_database_ziswaf_calculation_and_inventory_consistency()
