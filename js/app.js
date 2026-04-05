const App = () => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [currentPage, setCurrentPage] = React.useState("feed");
    const [token, setToken] = React.useState(localStorage.getItem("token"));
    const [posts, setPosts] = React.useState([]);
    const [commentsByPost, setCommentsByPost] = React.useState({});
    const [events, setEvents] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [messages, setMessages] = React.useState([]);
    const [groupMessages, setGroupMessages] = React.useState({});
    const [allUsers, setAllUsers] = React.useState([]);

    const API_URL = "http://localhost:8000";

    const api = {
        async request(endpoint, options = {}) {
            const headers = {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            };
            const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }
            return response.json();
        },
        async login(email, password) {
            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);
            const response = await fetch(`${API_URL}/login`, { method: "POST", body: formData });
            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                setToken(data.access_token);
                setCurrentUser(data.user);
            }
            return data;
        },
        async register(userData) {
            return await this.request("/register", { method: "POST", body: JSON.stringify(userData) });
        },
        async getCurrentUser() {
            return await this.request("/me");
        },
        async getPosts() { return await this.request("/posts"); },
        async createPost(content) {
            const post = await this.request("/posts", { method: "POST", body: JSON.stringify({ content }) });
            setPosts([post, ...posts]);
            return post;
        },
        async getPostComments(postId) {
            return await this.request(`/posts/${postId}/comments`);
        },
        async addComment(postId, content) {
            return await this.request(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) });
        },
        async getGroups() { return await this.request("/groups"); },
        async createGroup(name, description) {
            const group = await this.request("/groups", { method: "POST", body: JSON.stringify({ name, description }) });
            setGroups(prev => [...prev, group]);
            return group;
        },
        async joinGroup(groupId) {
            return await this.request(`/groups/${groupId}/join`, { method: "POST" });
        },
        async leaveGroup(groupId) {
            return await this.request(`/groups/${groupId}/leave`, { method: "POST" });
        },
        async getEvents() { return await this.request("/events"); },
        async createEvent(eventData) {
            const formatted = { ...eventData, event_date: eventData.event_date instanceof Date ? eventData.event_date.toISOString() : eventData.event_date };
            return await this.request("/events", { method: "POST", body: JSON.stringify(formatted) });
        },
        async getMessages() { return await this.request("/messages"); },
        async sendMessage(toId, content) {
            return await this.request("/messages", { method: "POST", body: JSON.stringify({ to_id: toId, content }) });
        },
        async getGroupMessages(groupId) {
            return await this.request(`/messages/group/${groupId}`);
        },
        async sendGroupMessage(groupId, content) {
            return await this.request("/messages/group", { method: "POST", body: JSON.stringify({ group_id: groupId, content }) });
        },
        async getUsers() {
            return await this.request("/users");
        },
        async searchUsers(query = "") {
            const q = query ? `?q=${encodeURIComponent(query)}` : "";
            return await this.request(`/users/search${q}`);
        }
    };

    React.useEffect(() => {
        if (token) {
            api.getCurrentUser().then(user => {
                setCurrentUser(user);
                
                api.getPosts().then(async (posts) => {
                    setPosts(posts);
                    const commentsMap = {};
                    for (const post of posts) {
                        const comments = await api.getPostComments(post.id);
                        commentsMap[post.id] = comments;
                    }
                    setCommentsByPost(commentsMap);
                }).catch(console.error);
                
                api.getEvents().then(setEvents).catch(console.error);
                api.getGroups().then(setGroups).catch(console.error);
                api.getMessages().then(setMessages).catch(console.error);
                api.getUsers().then(setAllUsers).catch(console.error);
            }).catch(() => {
                localStorage.removeItem("token");
                setToken(null);
                setCurrentUser(null);
            });
        }
    }, [token]);

    const handleLogin = async (email, password) => { try { await api.login(email, password); } catch (e) { alert(e.message); } };
    const handleRegister = async (userData) => { try { await api.register(userData); await api.login(userData.email, userData.password); } catch (e) { alert(e.message); } };
    const handleLogout = () => { localStorage.removeItem("token"); setToken(null); setCurrentUser(null); setCurrentPage("feed"); };
    const handleAddPost = async (content) => { try { await api.createPost(content); } catch (e) { alert(e.message); } };
    const handleAddComment = async (postId, content) => {
        try {
            await api.addComment(postId, content);
            const updated = await api.getPostComments(postId);
            setCommentsByPost(prev => ({ ...prev, [postId]: updated }));
        } catch (e) { alert(e.message); }
    };
    const handleJoinGroup = async (groupId) => { try { await api.joinGroup(groupId); const updated = await api.getGroups(); setGroups(updated); } catch (e) { if (!e.message?.includes("уже в этой группе")) alert(e.message); } };
    const handleLeaveGroup = async (groupId) => { try { await api.leaveGroup(groupId); const updated = await api.getGroups(); setGroups(updated); } catch (e) { alert(e.message); } };
    const handleSendMessage = async (targetId, text, isGroup = false) => {
        try {
            if (isGroup) {
                await api.sendGroupMessage(targetId, text);
                const updated = await api.getGroupMessages(targetId);
                setGroupMessages(prev => ({ ...prev, [targetId]: updated }));
            } else {
                await api.sendMessage(targetId, text);
                const updated = await api.getMessages();
                setMessages(updated);
            }
        } catch (e) { alert(e.message); }
    };
    const handleSearchUsers = async (query) => {
        try {
            return await api.searchUsers(query);
        } catch (e) { console.error(e); return []; }
    };

    // ПРОВЕРКА АВТОРИЗАЦИИ
    if (!currentUser && !token) {
        return React.createElement(AuthPage, { onLogin: handleLogin, onRegister: handleRegister });
    }

    if (!currentUser && token) {
        return React.createElement("div", { style: { padding: "2rem", textAlign: "center" } }, "Загрузка...");
    }

    const renderPage = () => {
        switch (currentPage) {
            case "feed":
                return React.createElement(FeedPage, {
                    currentUser,
                    posts,
                    commentsByPost,
                    onAddPost: handleAddPost,
                    onAddComment: handleAddComment
                });
            case "chat":
                return React.createElement(ChatPage, {
                    currentUser,
                    messages,
                    groupMessages,
                    groups,
                    allUsers,
                    onSendMessage: handleSendMessage,
                    onLoadGroupMessages: api.getGroupMessages.bind(api),
                    setGroupMessages,
                    onSearchUsers: handleSearchUsers
                });
            case "calendar":
                return React.createElement(CalendarPage, { events, onAddEvent: api.createEvent.bind(api) });
            case "groups":
                return React.createElement(GroupsPage, {
                    groups,
                    currentUser,
                    allUsers,
                    onCreateGroup: api.createGroup.bind(api),
                    onJoinGroup: handleJoinGroup,
                    onLeaveGroup: handleLeaveGroup
                });
            default:
                return React.createElement(FeedPage, {
                    currentUser,
                    posts,
                    commentsByPost,
                    onAddPost: handleAddPost,
                    onAddComment: handleAddComment
                });
        }
    };

    return React.createElement("div", null,
        React.createElement("header", { className: "header" },
            React.createElement("div", { className: "header-content" },
                React.createElement("h1", { className: "header-title" }, "Отечественный мессенджер Максим"),
                React.createElement("div", { className: "header-user" },
                    React.createElement("span", { className: "header-user-info" }, currentUser ? `${currentUser.name} (${currentUser.class_name})` : "Гость"),
                    React.createElement("button", { className: "btn btn-secondary", onClick: handleLogout }, "Выйти")
                )
            )
        ),
        React.createElement("nav", { className: "nav" },
            React.createElement("div", { className: "nav-content" },
                React.createElement("div", { className: "nav-list" },
                    React.createElement("button", { onClick: () => setCurrentPage("feed"), className: `nav-item ${currentPage === "feed" ? "active" : ""}` }, "Лента"),
                    React.createElement("button", { onClick: () => setCurrentPage("chat"), className: `nav-item ${currentPage === "chat" ? "active" : ""}` }, "Сообщения"),
                    React.createElement("button", { onClick: () => setCurrentPage("calendar"), className: `nav-item ${currentPage === "calendar" ? "active" : ""}` }, "Календарь"),
                    React.createElement("button", { onClick: () => setCurrentPage("groups"), className: `nav-item ${currentPage === "groups" ? "active" : ""}` }, "Группы")
                )
            )
        ),
        React.createElement("main", { className: "main" }, renderPage())
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));