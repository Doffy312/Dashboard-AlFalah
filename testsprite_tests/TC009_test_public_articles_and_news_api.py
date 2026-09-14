import requests

def test_public_articles_and_news_api():
    base_url = "http://localhost:3000"
    endpoint = "/api/articles"
    url = base_url + endpoint
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    data = None
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), "Response JSON should be a list of articles"

    for article in data:
        # Check category field presence and type
        assert 'category' in article, "Article must have 'category' field"
        assert isinstance(article['category'], str), "'category' must be a string"

        # Check timestamps (published_at, created_at, updated_at)
        timestamp_keys = ['published_at', 'created_at', 'updated_at']
        has_timestamp = any(key in article for key in timestamp_keys)
        assert has_timestamp, "Article must contain a timestamp field"

# All checks passed if reached here

test_public_articles_and_news_api()
