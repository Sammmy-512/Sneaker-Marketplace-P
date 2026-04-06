def test_get_vault_requires_auth(client):
    response = client.get("/api/vault")
    assert response.status_code == 401


def test_get_vault_returns_only_current_user_sneakers(client, create_user, create_token, create_sneaker):
    user1 = create_user(username="sam", email="sam@example.com")
    user2 = create_user(username="alex", email="alex@example.com")

    create_sneaker(owner_id=user1.id, model="Air Jordan 1")
    create_sneaker(owner_id=user2.id, model="Dunk Low")

    token = create_token(user1.id)
    response = client.get("/api/vault", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["model"] == "Air Jordan 1"
    assert data[0]["ownerId"] == user1.id


def test_add_to_vault_missing_fields(client, auth_header):
    response = client.post(
        "/api/vault",
        data={"brand": "Nike", "model": "Air Jordan 1"},
        headers=auth_header
    )

    assert response.status_code == 400
    assert response.get_json()["message"] == "Missing required sneaker fields"


def test_add_to_vault_success(client, auth_header):
    response = client.post(
        "/api/vault",
        data={
            "brand": "Nike",
            "model": "Air Jordan 1",
            "condition": "Like New",
            "size": "10",
            "price": "220",
            "avgMarketPrice": "260",
            "originalBox": "true",
            "quantity": "1",
        },
        headers=auth_header
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["brand"] == "Nike"
    assert data["model"] == "Air Jordan 1"
    assert data["condition"] == "Like New"
    assert data["isPublic"] is False
    assert data["status"] == "draft"