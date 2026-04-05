def test_get_posts(client):
    response = client.get("/posts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_post_as_user(client, test_user):
    login = client.post("/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    token = login.json()["access_token"]
    response = client.post("/posts", json={"content": "Test post"},
        headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403

def test_create_post_as_moderator(client, test_moderator):
    login = client.post("/login", data={
        "username": "mod@example.com",
        "password": "password123"
    })
    token = login.json()["access_token"]
    response = client.post("/posts", json={"content": "Mod post"},
        headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["content"] == "Mod post"

def test_add_comment(client, test_user, test_admin):
    login = client.post("/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert login.status_code == 200, f"Login failed: {login.json()}"
    token = login.json()["access_token"]
    
    admin_login = client.post("/login", data={
        "username": "admin@example.com",
        "password": "password123"
    })
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.json()}"
    admin_token = admin_login.json()["access_token"]
    
    post = client.post("/posts", json={"content": "Post for comment"},
        headers={"Authorization": f"Bearer {admin_token}"})
    assert post.status_code == 200, f"Create post failed: {post.json()}"
    post_id = post.json()["id"]
    
    response = client.post(f"/posts/{post_id}/comments", json={"content": "Test comment"},
        headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200, f"Add comment failed: {response.json()}"
    assert response.json()["content"] == "Test comment"