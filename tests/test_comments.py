def test_delete_own_comment(client, test_user):
    login = client.post("/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    token = login.json()["access_token"]
    admin_login = client.post("/login", data={
        "username": "admin@example.com",
        "password": "password123"
    })
    admin_token = admin_login.json()["access_token"]
    post = client.post("/posts", json={"content": "Post"},
        headers={"Authorization": f"Bearer {admin_token}"})
    post_id = post.json()["id"]
    comment = client.post(f"/posts/{post_id}/comments", json={"content": "Comment"},
        headers={"Authorization": f"Bearer {token}"})
    comment_id = comment.json()["id"]

    response = client.delete(f"/comments/{comment_id}",
        headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_delete_other_comment(client, test_user, test_moderator):
    login = client.post("/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    token = login.json()["access_token"]
    admin_login = client.post("/login", data={
        "username": "admin@example.com",
        "password": "password123"
    })
    admin_token = admin_login.json()["access_token"]
    post = client.post("/posts", json={"content": "Post"},
        headers={"Authorization": f"Bearer {admin_token}"})
    post_id = post.json()["id"]
    comment = client.post(f"/posts/{post_id}/comments", json={"content": "Comment"},
        headers={"Authorization": f"Bearer {token}"})
    comment_id = comment.json()["id"]
    mod_login = client.post("/login", data={
        "username": "mod@example.com",
        "password": "password123"
    })
    mod_token = mod_login.json()["access_token"]
    response = client.delete(f"/comments/{comment_id}",
        headers={"Authorization": f"Bearer {mod_token}"})
    assert response.status_code == 403