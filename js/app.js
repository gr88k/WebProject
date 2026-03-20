// ГЛАВНОЕ ПРИЛОЖЕНИЕ
const App = () => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [currentPage, setCurrentPage] = React.useState("feed");
    
    const [users, setUsers] = React.useState(
        typeof INITIAL_USERS !== 'undefined' ? INITIAL_USERS : []
    );
    const [posts, setPosts] = React.useState(
        typeof INITIAL_POSTS !== 'undefined' ? INITIAL_POSTS : []
    );
    const [comments, setComments] = React.useState(
        typeof INITIAL_COMMENTS !== 'undefined' ? INITIAL_COMMENTS : []
    );
    const [events, setEvents] = React.useState(
        typeof INITIAL_EVENTS !== 'undefined' ? INITIAL_EVENTS : []
    );
    const [groups, setGroups] = React.useState(
        typeof INITIAL_GROUPS !== 'undefined' ? INITIAL_GROUPS : []
    );
    const [messages, setMessages] = React.useState(
        typeof INITIAL_MESSAGES !== 'undefined' ? INITIAL_MESSAGES : []
    );
    const [groupMessages, setGroupMessages] = React.useState(
        typeof INITIAL_GROUP_MESSAGES !== 'undefined' ? INITIAL_GROUP_MESSAGES : []
    );

    // АВТОРИЗАЦИЯ
    const handleLogin = (user) => {
        setCurrentUser(user);
    };

    const handleRegister = (newUser) => {
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentPage("feed");
    };

    // ПОСТЫ
    const handleAddPost = (content) => {
        if (!currentUser) return;
        const newPost = {
            id: posts.length + 1,
            authorId: currentUser.id,
            content: content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setPosts([newPost, ...posts]);
    };

    // КОММЕНТАРИИ
    const handleAddComment = (postId, content) => {
        if (!currentUser) return;
        const newComment = {
            id: comments.length + 1,
            postId: postId,
            authorId: currentUser.id,
            content: content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setComments([...comments, newComment]);
    };

    // СОБЫТИЯ
    const handleAddEvent = (event) => {
        const newEvent = { ...event, id: events.length + 1 };
        setEvents([...events, newEvent]);
    };

    // ГРУППЫ
    const handleCreateGroup = (name) => {
        if (!currentUser) return;
        const newGroup = {
            id: groups.length + 1,
            name: name,
            members: [currentUser.id],
            creatorId: currentUser.id
        };
        setGroups([...groups, newGroup]);
    };

    const handleJoinGroup = (groupId) => {
        if (!currentUser) return;
        setGroups(groups.map(group => {
            if (group.id === groupId && !group.members.includes(currentUser.id)) {
                return { ...group, members: [...group.members, currentUser.id] };
            }
            return group;
        }));
    };

    const handleLeaveGroup = (groupId) => {
        if (!currentUser) return;
        setGroups(groups.map(group => {
            if (group.id === groupId) {
                return { 
                    ...group, 
                    members: group.members.filter(id => id !== currentUser.id) 
                };
            }
            return group;
        }));
    };

    // СООБЩЕНИЯ
    const handleSendMessage = (toId, text) => {
        if (!currentUser) return;
        const newMessage = {
            id: messages.length + 1,
            fromId: currentUser.id,
            toId: toId,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "private"
        };
        setMessages([...messages, newMessage]);
    };

    const handleSendGroupMessage = (groupId, text) => {
        if (!currentUser) return;
        const newMessage = {
            id: groupMessages.length + 1,
            groupId: groupId,
            fromId: currentUser.id,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setGroupMessages([...groupMessages, newMessage]);
    };

    // ПРОВЕРКА АВТОРИЗАЦИИ
    if (!currentUser) {
        return React.createElement(AuthPage, {
            onLogin: handleLogin,
            onRegister: handleRegister,
            users: users
        });
    }

    // РОУТИНГ
    const renderPage = () => {
        switch (currentPage) {
            case "feed":
                return React.createElement(FeedPage, {
                    currentUser: currentUser,
                    posts: posts,
                    comments: comments,
                    onAddPost: handleAddPost,
                    onAddComment: handleAddComment
                });

            case "chat":
                return React.createElement(ChatPage, {
                    currentUser: currentUser,
                    messages: messages,
                    groupMessages: groupMessages,
                    groups: groups,
                    onSendMessage: handleSendMessage,
                    onSendGroupMessage: handleSendGroupMessage
                });

            case "calendar":
                return React.createElement(CalendarPage, {
                    events: events,
                    onAddEvent: handleAddEvent
                });

            case "groups":
                return React.createElement(GroupsPage, {
                    groups: groups,
                    currentUser: currentUser,
                    onCreateGroup: handleCreateGroup,
                    onJoinGroup: handleJoinGroup,
                    onLeaveGroup: handleLeaveGroup
                });

            default:
                return React.createElement(FeedPage, {
                    currentUser: currentUser,
                    posts: posts,
                    comments: comments,
                    onAddPost: handleAddPost,
                    onAddComment: handleAddComment
                });
        }
    };

    // ОТРИСОВКА
    return React.createElement("div", null,
        React.createElement("header", { className: "header" },
            React.createElement("div", { className: "header-content" },
                React.createElement("h1", { className: "header-title" }, "Отечественный мессенджер Максим"),
                React.createElement("div", { className: "header-user" },
                    React.createElement("span", { className: "header-user-info" }, 
                        `${currentUser.name} (${currentUser.class})`
                    ),
                    React.createElement(Button, { variant: "secondary", onClick: handleLogout }, "Выйти")
                )
            )
        ),
        React.createElement("nav", { className: "nav" },
            React.createElement("div", { className: "nav-content" },
                React.createElement("div", { className: "nav-list" },
                    React.createElement("button", {
                        onClick: () => setCurrentPage("feed"),
                        className: `nav-item ${currentPage === "feed" ? "active" : ""}`
                    }, "Лента"),

                    React.createElement("button", {
                        onClick: () => setCurrentPage("chat"),
                        className: `nav-item ${currentPage === "chat" ? "active" : ""}`
                    }, "Сообщения"),

                    React.createElement("button", {
                        onClick: () => setCurrentPage("calendar"),
                        className: `nav-item ${currentPage === "calendar" ? "active" : ""}`
                    }, "Календарь"),

                    React.createElement("button", {
                        onClick: () => setCurrentPage("groups"),
                        className: `nav-item ${currentPage === "groups" ? "active" : ""}`
                    }, "Группы")
                )
            )
        ),
        React.createElement("main", { className: "main" }, renderPage())
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));