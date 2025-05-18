# test_flow.py
import sys
from fastapi.testclient import TestClient
from fastapi import FastAPI

sys.path.append(".")

from backend.api.endpoints.news import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def simulate_flow():
    # Step 1: Create news
    create_response = client.post(
        "/news/",
        json={"title": "Test News", "content": "Fake content", "author": "John Doe"}
    )
    
    print(f"STATUS CODE: {create_response.status_code}")
    print(f"RAW RESPONSE: {create_response.content}")
    
    if create_response.status_code != 200:
        print("❌ Failed to create news")
        return
    
    news_id = create_response.json()["news_id"]
    print(f"\n📰 News created: {news_id}")

# Step 2: Validate AI Analysis
    validate_ai = client.post(
        "/news/validate-step",
        json={"news_id": news_id, "step": "ai_analysis", "result": {"score": 0.95}},
        headers={"Authorization": "Bearer fake_ai_token"}
    )
    print(f"AI Analysis Status: {validate_ai.status_code}")
    print(f"AI Response: {validate_ai.json()}")
    if validate_ai.status_code != 200:
        print("❌ AI Analysis Failed")
        return
    print("✅ AI Analysis:", validate_ai.json()["steps"][0]["blockchain_tx"])

    # Step 3: Validate Community Analysis
    validate_community = client.post(
        "/news/validate-step",
        json={"news_id": news_id, "step": "community_analysis", "result": {"votes_valid": 150}},
        headers={"Authorization": "Bearer fake_community_token"}
    )
    print(f"Community Analysis Status: {validate_community.status_code}")
    print(f"Community Response: {validate_community.json()}")  # Debug line
    if validate_community.status_code != 200:
        print("❌ Community Analysis Failed")
        return
    print("✅ Community Analysis:", validate_community.json()["steps"][1]["blockchain_tx"])

    # Step 4: Validate Person Question (Step 3)
    person_result = {"response": "I confirm the information is accurate"}
    validate_person = client.post(
        "/news/validate-step",  # Correct endpoint
        json={
            "news_id": news_id,
            "step": "person_question",
            "result": {"response": "I confirm the information is accurate"}
        },
        headers={"Authorization": "Bearer fake_moderator_token"}  # Correct token
    )
    print("✅ Person Question:", validate_person.json()["steps"][2]["blockchain_tx"])

    # Step 5: Validate Author Question (Step 4)
    author_result = {"response": "I stand by my publication"}
    validate_author = client.post(
        "/news/validate-step",  # Correct endpoint
        json={
            "news_id": news_id,
            "step": "author_question",
            "result": author_result
        },
        headers={"Authorization": "Bearer fake_moderator_token"}
    )
    final_news = validate_author.json()
    print("✅ Author Question:", final_news["steps"][3]["blockchain_tx"])
    print("\n🔍 Final News Status:", final_news["status"])
    print("🔗 All Blockchain TXs:", [step["blockchain_tx"] for step in final_news["steps"]])

if __name__ == "__main__":
    simulate_flow()