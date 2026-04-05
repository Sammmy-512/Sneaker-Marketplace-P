def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "username": "sam",
        "email": "sam@example.com",
        "password": "123456"
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "User registered successfully"
    assert data["user"]["email"] == "sam@example.com"


def test_register_missing_fields(client):
    response = client.post("/api/auth/register", json={
        "username": "sam",
        "email": "sam@example.com"
    })

    assert response.status_code == 400
    assert response.get_json()["message"] == "Missing required fields"


def test_register_duplicate_email(client, create_user):
    create_user(email="sam@example.com")

    response = client.post("/api/auth/register", json={
        "username": "other",
        "email": "sam@example.com",
        "password": "123456"
    })

    assert response.status_code == 409
    assert response.get_json()["message"] == "Email already exists"


def test_login_success(client, create_user):
    create_user(email="sam@example.com", password="123456")

    response = client.post("/api/auth/login", json={
        "email": "sam@example.com",
        "password": "123456"
    })

    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data


def test_login_missing_fields(client):
    response = client.post("/api/auth/login", json={
        "email": "sam@example.com"
    })

    assert response.status_code == 400
    assert response.get_json()["message"] == "Email and password are required"


def test_login_invalid_credentials(client, create_user):
    create_user(email="sam@example.com", password="123456")

    response = client.post("/api/auth/login", json={
        "email": "sam@example.com",
        "password": "wrongpassword"
    })

    assert response.status_code == 401
    assert response.get_json()["message"] == "Invalid credentials"