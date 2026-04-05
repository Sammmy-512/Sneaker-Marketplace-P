def test_get_sneakers_returns_only_public_listings(client, create_user, create_sneaker):
    user = create_user()

    create_sneaker(owner_id=user.id, model="Air Jordan 1", is_public_listing=True)
    create_sneaker(owner_id=user.id, model="Private Pair", is_public_listing=False)

    response = client.get("/api/sneakers")

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["model"] == "Air Jordan 1"


def test_get_sneakers_model_filter(client, create_user, create_sneaker):
    user = create_user()

    create_sneaker(owner_id=user.id, model="Air Jordan 1", is_public_listing=True)
    create_sneaker(owner_id=user.id, model="Dunk Low", is_public_listing=True)

    response = client.get("/api/sneakers?model=Jordan")

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["model"] == "Air Jordan 1"


def test_get_sneakers_invalid_size_returns_400(client):
    response = client.get("/api/sneakers?size=abc")
    assert response.status_code == 400
    assert response.get_json()["message"] == "Invalid size value"


def test_get_brands_returns_distinct_public_brands(client, create_user, create_sneaker):
    user = create_user()

    create_sneaker(owner_id=user.id, brand="Nike", model="Air Jordan 1", is_public_listing=True)
    create_sneaker(owner_id=user.id, brand="Nike", model="Dunk Low", is_public_listing=True)
    create_sneaker(owner_id=user.id, brand="Adidas", model="Samba", is_public_listing=True)
    create_sneaker(owner_id=user.id, brand="New Balance", model="1906R", is_public_listing=False)

    response = client.get("/api/brands")

    assert response.status_code == 200
    data = response.get_json()
    assert sorted(data) == ["Adidas", "Nike"]