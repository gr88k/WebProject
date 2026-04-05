def test_register_user(client):
    response = client.post("/register", json={
        "email": "new@example.com",
        "password": "password123",
        "name": "New User",
        "class_name": "9-А"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert data["role"] == "user"

def test_register_duplicate_email(client, test_user):
    response = client.post("/register", json={
        "email": "test@example.com",
        "password": "password123",
        "name": "Duplicate",
        "class_name": "9-А"
    })
    assert response.status_code == 400

def test_login_success(client, test_user):
    response = client.post("/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

def test_login_wrong_password(client, test_user):
    response = client.post("/login", data={
        "username": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_current_user(client, test_user):
    login = client.post("/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    token = login.json()["access_token"]
    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"