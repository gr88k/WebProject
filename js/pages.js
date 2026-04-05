// СТРАНИЦА АВТОРИЗАЦИИ
const AuthPage = ({ onLogin, onRegister }) => {
    const [isRegister, setIsRegister] = React.useState(false);
    const [formData, setFormData] = React.useState({ name: "", email: "", password: "", class_name: "" });
    const [error, setError] = React.useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRegister) {
            if (!formData.name || !formData.email || !formData.password || !formData.class_name) {
                setError("Заполните все поля");
                return;
            }
            onRegister(formData);
        } else {
            onLogin(formData.email, formData.password);
        }
    };

    return React.createElement("div", { className: "auth-page" },
        React.createElement("div", { className: "auth-card" },
            React.createElement("h1", { className: "auth-title" }, "Отечественный мессенджер Максим"),
            React.createElement("form", { onSubmit: handleSubmit },
                isRegister && React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { className: "form-label" }, "Имя"),
                        React.createElement("input", { type: "text", name: "name", placeholder: "Иван Иванов", value: formData.name, onChange: handleChange, required: true, className: "form-input" })
                    ),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { className: "form-label" }, "Класс"),
                        React.createElement("input", { type: "text", name: "class_name", placeholder: "10-Б", value: formData.class_name, onChange: handleChange, required: true, className: "form-input" })
                    )
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Email"),
                    React.createElement("input", { type: "email", name: "email", placeholder: "student@school.ru", value: formData.email, onChange: handleChange, required: true, className: "form-input" })
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Пароль"),
                    React.createElement("input", { type: "password", name: "password", placeholder: "••••••••", value: formData.password, onChange: handleChange, required: true, className: "form-input" })
                ),
                error && React.createElement("div", { className: "auth-error" }, error),
                React.createElement("button", { type: "submit", className: "btn btn-primary btn-full mt-4" }, isRegister ? "Зарегистрироваться" : "Войти")
            ),
            React.createElement("div", { className: "text-center mt-4", style: { fontSize: "0.875rem" } },
                isRegister ? "Уже есть аккаунт? " : "Нет аккаунта? ",
                React.createElement("button", { type: "button", className: "auth-link", onClick: () => { setIsRegister(!isRegister); setFormData({ name: "", email: "", password: "", class_name: "" }); setError(""); } }, isRegister ? "Войти" : "Зарегистрироваться")
            )
        )
    );
};

// ЛЕНТА НОВОСТЕЙ
const FeedPage = ({ currentUser, posts, commentsByPost, onAddPost, onAddComment }) => {
    if (!currentUser) return React.createElement("div", null, "Загрузка...");

    const [newPost, setNewPost] = React.useState("");
    const [openComments, setOpenComments] = React.useState({});
    const [commentInputs, setCommentInputs] = React.useState({});

    const canPost = currentUser.role === "admin" || currentUser.role === "moderator";

    const handlePost = () => {
        if (!newPost.trim()) return;
        onAddPost(newPost);
        setNewPost("");
    };

    const handleAddComment = (postId) => {
        const text = commentInputs[postId] || "";
        if (!text.trim()) return;
        onAddComment(postId, text);
        setCommentInputs({ ...commentInputs, [postId]: "" });
    };

    const toggleComments = (postId) => {
        setOpenComments({ ...openComments, [postId]: !openComments[postId] });
    };

    const getPostComments = (postId) => {
        return (commentsByPost?.[postId] || []);
    };

    const getCommentAuthorName = (comment) => {
        if (comment.author_name) return comment.author_name;
        if (comment.author?.name) return comment.author.name;
        const user = (allUsers || []).find(u => u.id === comment.author_id);
        return user ? user.name : `Пользователь #${comment.author_id}`;
    };

    return React.createElement("div", { className: "feed-container" },
        React.createElement("h2", { className: "page-title" }, "Лента новостей"),
        canPost
            ? React.createElement("div", { className: "create-post" },
                React.createElement("textarea", { placeholder: "Написать объявление...", value: newPost, onChange: (e) => setNewPost(e.target.value), className: "create-post-textarea", rows: "4" }),
                React.createElement("button", { onClick: handlePost, className: "btn btn-primary" }, "Опубликовать"),
                React.createElement("p", { className: "create-post-status" }, `Ваш статус: ${currentUser.role === "admin" ? "Администратор" : "Модератор"}`)
            )
            : React.createElement("div", { className: "no-permission" }, "Только администраторы и модераторы могут публиковать новости."),
        (posts || []).map(post => {
            const postComments = getPostComments(post.id);
            const isOpen = openComments[post.id];
            const commentValue = commentInputs[post.id] || "";

            return React.createElement("div", { key: post.id, className: "post" },
                React.createElement("div", { className: "post-header" },
                    React.createElement("span", { className: "post-author" }, post.author_name || `Пользователь #${post.author_id}`),
                    React.createElement("span", { className: "post-time" }, 
                        post.created_at ? new Date(post.created_at).toLocaleString('ru-RU') : ''
                    )
                ),
                React.createElement("p", { className: "post-content" }, post.content),
                React.createElement("button", { onClick: () => toggleComments(post.id), className: "comment-toggle-btn" }, `💬 Комментарии (${postComments.length})`),
                isOpen && React.createElement("div", { className: "comments-section" },
                    postComments.length > 0
                        ? postComments.map(comment => React.createElement("div", { key: comment.id, className: "comment" },
                            React.createElement("div", { className: "comment-header" },
                                React.createElement("span", { className: "comment-author" }, comment.author_name || `Пользователь #${comment.author_id}`),
                                React.createElement("span", { className: "comment-time" }, 
                                    comment.created_at ? new Date(comment.created_at).toLocaleString('ru-RU') : ''
                                )
                            ),
                            React.createElement("p", { className: "comment-text" }, comment.content)
                        ))
                        : React.createElement("p", { className: "no-comments" }, "Нет комментариев"),
                    React.createElement("div", { className: "add-comment" },
                        React.createElement("input", { type: "text", placeholder: "Написать комментарий...", value: commentValue, onChange: (e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value }), onKeyPress: (e) => e.key === 'Enter' && handleAddComment(post.id), className: "comment-input" }),
                        React.createElement("button", { onClick: () => handleAddComment(post.id), className: "btn btn-primary btn-small" }, "Отправить")
                    )
                )
            );
        })
    );
};

// ЧАТЫ
const ChatPage = ({ currentUser, messages, groupMessages, groups, allUsers, onSendMessage, onLoadGroupMessages, setGroupMessages, onSearchUsers }) => {
    if (!currentUser) return React.createElement("div", null, "Загрузка...");

    const [selectedTab, setSelectedTab] = React.useState("private");
    const [selectedUserId, setSelectedUserId] = React.useState(null);
    const [selectedGroupId, setSelectedGroupId] = React.useState(null);
    const [messageText, setMessageText] = React.useState("");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState([]);

    const chatUserIds = React.useMemo(() => {
        const userIds = new Set();
        (messages || []).forEach(msg => {
            if (msg.from_id !== currentUser.id) userIds.add(msg.from_id);
            if (msg.to_id && msg.to_id !== currentUser.id) userIds.add(msg.to_id);
        });
        return Array.from(userIds);
    }, [messages, currentUser.id]);

    const chatUsersWithInfo = chatUserIds.map(id => {
        const user = (allUsers || []).find(u => u.id === id);
        return user || { id, name: `Пользователь #${id}`, class_name: "" };
    });

    const displayUsers = searchQuery.trim().length >= 2
        ? (searchResults || []).length > 0 ? (searchResults || []) : (allUsers || []).filter(u => u.id !== currentUser.id)
        : chatUsersWithInfo;

    const userGroups = (groups || []).filter(g => (g.members || []).includes(currentUser.id));

    const getUserName = (id) => {
        const user = (allUsers || []).find(u => u.id === id);
        return user ? user.name : `Пользователь #${id}`;
    };

    const getGroupName = (id) => {
        const group = (groups || []).find(g => g.id === id);
        return group ? group.name : "Группа";
    };

    const getChatMessages = () => {
        if (!selectedUserId) return [];
        return (messages || []).filter(m =>
            (m.from_id === currentUser.id && m.to_id === selectedUserId) ||
            (m.from_id === selectedUserId && m.to_id === currentUser.id)
        ).sort((a, b) => new Date(a.created_at || a.time) - new Date(b.created_at || b.time));
    };

    const getGroupChatMessages = () => {
        if (!selectedGroupId) return [];
        return (groupMessages?.[selectedGroupId] || []).sort((a, b) =>
            new Date(a.created_at || a.time) - new Date(b.created_at || b.time)
        );
    };

    React.useEffect(() => {
        if (selectedGroupId && onLoadGroupMessages) {
            onLoadGroupMessages(selectedGroupId).then(msgs => {
                if (setGroupMessages) setGroupMessages(prev => ({ ...prev, [selectedGroupId]: msgs }));
            }).catch(console.error);
        }
    }, [selectedGroupId]);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim().length >= 2 && onSearchUsers) {
                onSearchUsers(searchQuery).then(results => {
                    setSearchResults(results || []);
                }).catch(() => setSearchResults([]));
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return React.createElement("div", { className: "chat-container" },
        React.createElement("h2", { className: "page-title" }, "Сообщения"),
        React.createElement("div", { className: "chat-tabs" },
            React.createElement("button", {
                onClick: () => { setSelectedTab("private"); setSelectedGroupId(null); },
                className: `chat-tab ${selectedTab === "private" ? "active" : ""}`
            }, "Личные"),
            React.createElement("button", {
                onClick: () => { setSelectedTab("group"); setSelectedUserId(null); },
                className: `chat-tab ${selectedTab === "group" ? "active" : ""}`
            }, `Группы (${userGroups.length})`)
        ),
        React.createElement("div", { className: "chat-wrapper" },
            React.createElement("div", { className: "chat-sidebar" },
                React.createElement("div", { className: "chat-sidebar-title" },
                    selectedTab === "private" ? "Чаты" : "Мои группы"
                ),
                selectedTab === "private" && React.createElement("div", { className: "chat-search" },
                    React.createElement("input", {
                        type: "text",
                        placeholder: "Поиск пользователей...",
                        value: searchQuery,
                        onChange: (e) => setSearchQuery(e.target.value),
                        className: "chat-search-input"
                    })
                ),
                React.createElement("div", { className: "chat-list" },
                    selectedTab === "private"
                        ? searchQuery.trim().length >= 2
                            ? (displayUsers || []).length > 0
                                ? (displayUsers || []).map(user =>
                                    React.createElement("div", {
                                        key: user.id,
                                        onClick: () => {
                                            setSelectedUserId(user.id);
                                            setSearchQuery("");
                                            setSearchResults([]);
                                        },
                                        className: `chat-item ${selectedUserId === user.id ? "active" : ""} ${!chatUserIds.includes(user.id) ? "new-user" : ""}`
                                    },
                                        React.createElement("div", { className: "chat-item-name" },
                                            user.name,
                                            !chatUserIds.includes(user.id) && React.createElement("span", { className: "new-badge" }, "")
                                        ),
                                        React.createElement("div", { className: "chat-item-class" }, user.class_name || "—")
                                    )
                                )
                                : React.createElement("div", { className: "chat-item" }, "Пользователи не найдены")
                            : chatUsersWithInfo.length > 0
                                ? chatUsersWithInfo.map(user =>
                                    React.createElement("div", {
                                        key: user.id,
                                        onClick: () => setSelectedUserId(user.id),
                                        className: `chat-item ${selectedUserId === user.id ? "active" : ""}`
                                    },
                                        React.createElement("div", { className: "chat-item-name" }, user.name),
                                        React.createElement("div", { className: "chat-item-class" }, user.class_name || "—")
                                    )
                                )
                                : React.createElement("div", { className: "chat-item" }, "Нет активных чатов. Начните поиск!")
                        : userGroups.length > 0
                            ? userGroups.map(group =>
                                React.createElement("div", {
                                    key: group.id,
                                    onClick: () => setSelectedGroupId(group.id),
                                    className: `chat-item ${selectedGroupId === group.id ? "active" : ""}`
                                },
                                    React.createElement("div", { className: "chat-item-name" }, group.name),
                                    React.createElement("div", { className: "chat-item-class" }, `${group.member_count || (group.members?.length || 0)} участников`)
                                )
                            )
                            : React.createElement("div", { className: "chat-item" }, "Вы не состоите ни в одной группе")
                )
            ),
            React.createElement("div", { className: "chat-area" },
                selectedTab === "private"
                    ? selectedUserId
                        ? React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "chat-area-header" }, getUserName(selectedUserId)),
                            React.createElement("div", { className: "chat-messages" },
                                getChatMessages().length > 0
                                    ? getChatMessages().map(msg =>
                                        React.createElement("div", {
                                            key: msg.id,
                                            className: `message ${msg.from_id === currentUser.id ? "message-sent" : "message-received"}`
                                        },
                                            React.createElement("div", { className: "message-content" }, msg.content),
                                            React.createElement("div", { className: "message-time" },
                                                new Date(msg.created_at || msg.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            )
                                        )
                                    )
                                    : React.createElement("p", { className: "chat-empty" }, "Нет сообщений. Напишите первым!")
                            ),
                            React.createElement("div", { className: "chat-input-wrapper" },
                                React.createElement("input", {
                                    type: "text",
                                    placeholder: "Напишите сообщение...",
                                    value: messageText,
                                    onChange: (e) => setMessageText(e.target.value),
                                    onKeyPress: (e) => e.key === 'Enter' && onSendMessage(selectedUserId, messageText, false) && setMessageText(""),
                                    className: "chat-input"
                                }),
                                React.createElement("button", {
                                    onClick: () => { onSendMessage(selectedUserId, messageText, false); setMessageText(""); },
                                    className: "btn btn-primary"
                                }, "Отправить")
                            )
                        )
                        : React.createElement("div", { className: "chat-placeholder" }, "Выберите пользователя или начните поиск")
                    : selectedGroupId
                        ? React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "chat-area-header" }, `${getGroupName(selectedGroupId)} (общий чат)`),
                            React.createElement("div", { className: "chat-messages" },
                                getGroupChatMessages().length > 0
                                    ? getGroupChatMessages().map(msg =>
                                        React.createElement("div", {
                                            key: msg.id,
                                            className: `message ${msg.from_id === currentUser.id ? "message-sent" : "message-received"}`
                                        },
                                            React.createElement("div", { className: "message-content" }, msg.content),
                                            React.createElement("div", { className: "message-time" },
                                                new Date(msg.created_at || msg.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            )
                                        )
                                    )
                                    : React.createElement("p", { className: "chat-empty" }, "Групповой чат пока пуст")
                            ),
                            React.createElement("div", { className: "chat-input-wrapper" },
                                React.createElement("input", {
                                    type: "text",
                                    placeholder: "Напишите сообщение в группу...",
                                    value: messageText,
                                    onChange: (e) => setMessageText(e.target.value),
                                    onKeyPress: (e) => e.key === 'Enter' && onSendMessage(selectedGroupId, messageText, true) && setMessageText(""),
                                    className: "chat-input"
                                }),
                                React.createElement("button", {
                                    onClick: () => { onSendMessage(selectedGroupId, messageText, true); setMessageText(""); },
                                    className: "btn btn-primary"
                                }, "Отправить")
                            )
                        )
                        : React.createElement("div", { className: "chat-placeholder" }, "Выберите группу для общения")
            )
        )
    );
};

// КАЛЕНДАРЬ
const CalendarPage = ({ events, onAddEvent }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [newEvent, setNewEvent] = React.useState({ title: "", date: "" });

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date) { alert("Заполните все поля"); return; }
        onAddEvent({ title: newEvent.title, description: "", event_date: new Date(`${newEvent.date}T12:00:00`) });
        setNewEvent({ title: "", date: "" });
        setShowModal(false);
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return React.createElement("div", { className: "calendar-container" },
        React.createElement("div", { className: "calendar-header" },
            React.createElement("h2", { className: "page-title" }, "Календарь мероприятий"),
            React.createElement("button", { onClick: () => setShowModal(true), className: "btn btn-primary" }, "+ Добавить")
        ),
        React.createElement("div", { className: "calendar-grid" },
            React.createElement("div", { className: "calendar-weekdays" },
                React.createElement("div", null, "Пн"), React.createElement("div", null, "Вт"), React.createElement("div", null, "Ср"),
                React.createElement("div", null, "Чт"), React.createElement("div", null, "Пт"), React.createElement("div", null, "Сб"), React.createElement("div", null, "Вс")
            ),
            React.createElement("div", { className: "calendar-days" },
                React.createElement("div", { className: "calendar-day empty" }), React.createElement("div", { className: "calendar-day empty" }),
                ...days.map(day => {
                    const event = (events || []).find(e => { const d = new Date(e.event_date); return d.getDate() === day; });
                    return React.createElement("div", { key: day, className: `calendar-day ${event ? "has-event" : ""}` },
                        React.createElement("span", { className: "calendar-day-number" }, day),
                        event && React.createElement("div", { className: "calendar-event" }, event.title)
                    );
                })
            )
        ),
        showModal && React.createElement("div", { className: "modal", onClick: () => setShowModal(false) },
            React.createElement("form", { onSubmit: handleAddEvent, className: "modal-content", onClick: (e) => e.stopPropagation() },
                React.createElement("h3", { className: "modal-title" }, "Добавить мероприятие"),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Название"),
                    React.createElement("input", { type: "text", placeholder: "Например: Родительское собрание", value: newEvent.title, onChange: (e) => setNewEvent({ ...newEvent, title: e.target.value }), className: "form-input", required: true })
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Дата"),
                    React.createElement("input", { type: "date", value: newEvent.date, onChange: (e) => setNewEvent({ ...newEvent, date: e.target.value }), className: "form-input", required: true })
                ),
                React.createElement("div", { className: "modal-actions" },
                    React.createElement("button", { type: "button", onClick: () => setShowModal(false), className: "btn btn-secondary" }, "Отмена"),
                    React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Добавить")
                )
            )
        )
    );
};

// ГРУППЫ
const GroupsPage = ({ groups, currentUser, allUsers, onCreateGroup, onJoinGroup, onLeaveGroup }) => {
    if (!currentUser) return React.createElement("div", null, "Загрузка...");

    const [showModal, setShowModal] = React.useState(false);
    const [newGroupName, setNewGroupName] = React.useState("");

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) { alert("Введите название группы"); return; }
        onCreateGroup(newGroupName, "");
        setNewGroupName("");
        setShowModal(false);
    };

    const getCreatorName = (creatorId) => {
        const user = (allUsers || []).find(u => u.id === creatorId);
        return user ? user.name : "Неизвестно";
    };

    const isMember = (groupId) => {
        const group = (groups || []).find(g => g.id === groupId);
        return group && group.members && group.members.includes(currentUser.id);
    };

    return React.createElement("div", { className: "groups-container" },
        React.createElement("div", { className: "groups-header" },
            React.createElement("h2", { className: "page-title" }, "Группы"),
            React.createElement("button", { onClick: () => setShowModal(true), className: "btn btn-primary" }, "+ Создать группу")
        ),
        React.createElement("div", { className: "groups-grid" },
            (groups || []).map(group =>
                React.createElement("div", { key: group.id, className: "group-card" },
                    React.createElement("h3", { className: "group-name" }, group.name),
                    React.createElement("p", { className: "group-creator" }, `Создатель: ${getCreatorName(group.creator_id || group.creatorId)}`),
                    React.createElement("p", { className: "group-members" }, `Участников: ${group.member_count || (group.members?.length || 0)}`),
                    isMember(group.id)
                        ? React.createElement("button", { onClick: () => onLeaveGroup(group.id), className: "btn btn-danger btn-full" }, "Выйти")
                        : React.createElement("button", { onClick: () => onJoinGroup(group.id), className: "btn btn-primary btn-full" }, "Вступить")
                )
            )
        ),
        showModal && React.createElement("div", { className: "modal", onClick: () => setShowModal(false) },
            React.createElement("form", { onSubmit: handleCreate, className: "modal-content", onClick: (e) => e.stopPropagation() },
                React.createElement("h3", { className: "modal-title" }, "Создать группу"),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Название"),
                    React.createElement("input", { type: "text", placeholder: "Например: 10-Б Класс", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value), className: "form-input", required: true })
                ),
                React.createElement("div", { className: "modal-actions" },
                    React.createElement("button", { type: "button", onClick: () => setShowModal(false), className: "btn btn-secondary" }, "Отмена"),
                    React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Создать")
                )
            )
        )
    );
};