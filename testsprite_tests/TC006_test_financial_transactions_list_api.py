import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_financial_transactions_list_api():
    url = f"{BASE_URL}/api/transactions"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()

        # Assert the base response structure
        assert isinstance(data, dict), "Response should be a JSON object"
        # Assuming the API returns keys like 'transactions', 'pagination', 'total_balance' based on description
        
        # Assert presence of transactions list
        assert "transactions" in data, "'transactions' key missing in response"
        assert isinstance(data["transactions"], list), "'transactions' should be a list"
        
        # Assert pagination presence and correctness
        assert "pagination" in data, "'pagination' key missing in response"
        pagination = data["pagination"]
        assert isinstance(pagination, dict), "'pagination' should be a dictionary"
        for key in ["page", "pageSize", "totalPages", "totalRecords"]:
            assert key in pagination, f"Pagination missing '{key}'"
            assert isinstance(pagination[key], int), f"Pagination '{key}' should be int"

        # Assert total_balance calculations presence
        assert "total_balance" in data, "'total_balance' key missing in response"
        total_balance = data["total_balance"]
        assert isinstance(total_balance, (int, float)), "'total_balance' should be numeric"

        # Check each transaction structure for cash flow and category details
        for tx in data["transactions"]:
            assert isinstance(tx, dict), "Each transaction should be a dict"
            # Expecting keys like id, date, amount, type (income/expense), and category details
            for key in ["id", "date", "amount", "type", "category"]:
                assert key in tx, f"Transaction missing expected '{key}'"
            # Validate amount is numeric
            assert isinstance(tx["amount"], (int, float)), "'amount' should be numeric"
            # Validate type is string and one of expected values
            assert tx["type"] in ["income", "expense"], "'type' must be 'income' or 'expense'"
            # Validate category details is a dict with name and id or similar
            category = tx["category"]
            assert isinstance(category, dict), "'category' must be a dict"
            assert "id" in category and "name" in category, "Category must contain 'id' and 'name'"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_financial_transactions_list_api()