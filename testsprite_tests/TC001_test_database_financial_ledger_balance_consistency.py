import requests
import time

BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = "/api/auth/sign-in/email"
TRANSACTIONS_ENDPOINT = "/api/transactions"

EMAIL = "admin_alfalah@example.com"
PASSWORD = "password123"

TIMEOUT = 30


def test_database_financial_ledger_balance_consistency():
    session = requests.Session()
    try:
        # Authenticate and get token
        auth_resp = session.post(
            BASE_URL + AUTH_ENDPOINT,
            json={"email": EMAIL, "password": PASSWORD},
            timeout=TIMEOUT,
        )
        assert auth_resp.status_code == 200, f"Auth failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        token = auth_data.get("token") or auth_data.get("accessToken")
        assert token, "No token received after authentication"
        session.headers.update({"Authorization": f"Bearer {token}"})

        # Step 1: Get current cash ledger balance and transactions list
        get_tx_resp = session.get(BASE_URL + TRANSACTIONS_ENDPOINT, timeout=TIMEOUT)
        assert get_tx_resp.status_code == 200, f"Failed to get transactions: {get_tx_resp.text}"
        tx_json = get_tx_resp.json()
        # Support response wrapping transactions in a 'data' field or the root list
        if isinstance(tx_json, dict):
            tx_list = tx_json.get('data') or tx_json.get('transactions')
            assert isinstance(tx_list, list), "Transactions response 'data' or 'transactions' field is not a list"
        elif isinstance(tx_json, list):
            tx_list = tx_json
        else:
            assert False, "Transactions response is not a list or dict containing list"

        # Calculate baseline balance by summing income and expenses
        baseline_balance = 0
        for tx in tx_list:
            assert "type" in tx and "amount" in tx, "Transaction missing required fields"
            if tx["type"] not in ("income", "expense"):
                continue
            amount = float(tx["amount"])
            if tx["type"] == "income":
                baseline_balance += amount
            else:
                baseline_balance -= amount

        # Step 2: Record a new income transaction
        income_payload = {
            "type": "income",
            "category": "Test Income",
            "amount": 1500.75,
            "date": time.strftime("%Y-%m-%d"),
            "description": "Integration test income transaction",
        }
        post_tx_resp = session.post(
            BASE_URL + TRANSACTIONS_ENDPOINT, json=income_payload, timeout=TIMEOUT
        )
        assert post_tx_resp.status_code in (200, 201), f"Failed to create income transaction: {post_tx_resp.text}"
        created_tx = post_tx_resp.json()
        tx_id = created_tx.get("id") or created_tx.get("_id")
        assert tx_id, "Created transaction ID missing"

        # Step 3: Get transactions again and verify recalculated balance
        get_tx_after_resp = session.get(BASE_URL + TRANSACTIONS_ENDPOINT, timeout=TIMEOUT)
        assert get_tx_after_resp.status_code == 200, f"Failed to get transactions after insert: {get_tx_after_resp.text}"
        tx_json_after = get_tx_after_resp.json()
        if isinstance(tx_json_after, dict):
            tx_list_after = tx_json_after.get('data') or tx_json_after.get('transactions')
            assert isinstance(tx_list_after, list), "Transactions response 'data' or 'transactions' field is not a list after insert"
        elif isinstance(tx_json_after, list):
            tx_list_after = tx_json_after
        else:
            assert False, "Transactions response is not a list or dict containing list after insert"

        recalculated_balance = 0
        found_new_tx = False
        for tx in tx_list_after:
            assert "type" in tx and "amount" in tx, "Transaction missing required fields after insert"
            if tx["type"] not in ("income", "expense"):
                continue
            amount = float(tx["amount"])
            if tx["type"] == "income":
                recalculated_balance += amount
            else:
                recalculated_balance -= amount
            if str(tx.get("id") or tx.get("_id")) == str(tx_id):
                found_new_tx = True
        assert found_new_tx, "New income transaction not found in transactions after insert"

        expected_balance = baseline_balance + income_payload["amount"]
        # Floating point tolerance check
        assert abs(recalculated_balance - expected_balance) < 0.01, (
            f"Balance not recalculated correctly: expected {expected_balance}, got {recalculated_balance}"
        )

    finally:
        # Step 4: Cleanup - delete the newly created transaction to rollback balance to baseline
        if 'tx_id' in locals():
            del_resp = session.delete(
                f"{BASE_URL}{TRANSACTIONS_ENDPOINT}/{tx_id}", timeout=TIMEOUT
            )
            assert del_resp.status_code in (200, 204), f"Failed to delete transaction in cleanup: {del_resp.text}"

        # Verify balance rolled back
        get_final_resp = session.get(BASE_URL + TRANSACTIONS_ENDPOINT, timeout=TIMEOUT)
        assert get_final_resp.status_code == 200, f"Failed to get transactions after cleanup: {get_final_resp.text}"
        tx_json_final = get_final_resp.json()
        if isinstance(tx_json_final, dict):
            tx_list_final = tx_json_final.get('data') or tx_json_final.get('transactions')
            assert isinstance(tx_list_final, list), "Transactions response 'data' or 'transactions' field is not a list after cleanup"
        elif isinstance(tx_json_final, list):
            tx_list_final = tx_json_final
        else:
            assert False, "Transactions response is not a list or dict containing list after cleanup"

        final_balance = 0
        for tx in tx_list_final:
            if tx["type"] not in ("income", "expense"):
                continue
            amount = float(tx["amount"])
            if tx["type"] == "income":
                final_balance += amount
            else:
                final_balance -= amount

        # Floating point tolerance to baseline
        assert abs(final_balance - baseline_balance) < 0.01, (
            f"Balance after cleanup does not match baseline: baseline {baseline_balance}, final {final_balance}"
        )

test_database_financial_ledger_balance_consistency()