// СТРАНИЦА АВТОРИЗАЦИИ
const AuthPage = ({ onLogin, onRegister, users }) => {
    const [isRegister, setIsRegister] = React.useState(false);
    const [formData, setFormData] = React.useState({ name: "", email: "", password: "", class: "" });
    const [error, setError] = React.useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRegister) {
            if (!formData.name || !formData.email || !formData.password || !formData.class) {
                setError("Заполните все поля");
                return;
            }
            if (users.find(u => u.email === formData.email)) {
                setError("Пользователь с таким email уже существует");
                return;
            }
            onRegister({ ...formData, role: "user", id: users.length + 1 });
        } else {
            const user = users.find(u => u.email === formData.email && u.password === formData.password);
            if (!user) {
                setError("Неверный email или пароль");
                return;
            }
            onLogin(user);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Отечественный мессенджер Максим</h1>
                <form onSubmit={handleSubmit}>

                    {isRegister && (
                        <>
                            <Input label="Имя и фамилия" name="name" placeholder="Иван Иванов" value={formData.name} onChange={handleChange} required />
                            <Input label="Класс" name="class" placeholder="10-Б" value={formData.class} onChange={handleChange} required />
                        </>
                    )}

                    <Input label="Email" type="email" name="email" placeholder="student@school.ru" value={formData.email} onChange={handleChange} required />
                    <Input label="Пароль" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                    {error && <div className="auth-error">{error}</div>}
                    <Button type="submit" className="btn-full mt-4">{isRegister ? "Зарегистрироваться" : "Войти"}</Button>
                </form>

                <div className="text-center mt-4" style={{fontSize: '0.875rem'}}>
                    {isRegister ? "Уже есть аккаунт? " : "Нет аккаунта? "}
                    <button onClick={() => { setIsRegister(!isRegister); setFormData({ name: "", email: "", password: "", class: "" }); setError(""); }} className="auth-link">
                        {isRegister ? "Войти" : "Зарегистрироваться"}
                    </button>
                </div>

                {!isRegister && (
                    <div className="auth-hint">
                        <p className="auth-hint-title">Тестовые аккаунты:</p>
                        <p>admin@school.ru / 123 (Админ)</p>
                        <p>moder@school.ru / 123 (Модератор)</p>
                        <p>maria@school.ru / 123 (Ученик)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ЛЕНТА НОВОСТЕЙ
const FeedPage = ({ currentUser, posts, comments, onAddPost, onAddComment }) => {
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

    const getAuthorName = (authorId) => {
        const user = INITIAL_USERS.find(u => u.id === authorId);
        return user ? user.name : "Неизвестно";
    };

    const getPostComments = (postId) => {
        return comments.filter(c => c.postId === postId);
    };

    return (
        <div className="feed-container">
            <h2 className="page-title">Лента новостей</h2>
            
            {canPost ? (
                <div className="create-post">
                    <textarea 
                        placeholder="Написать объявление..." 
                        value={newPost} 
                        onChange={(e) => setNewPost(e.target.value)} 
                        className="create-post-textarea"
                        rows="4"
                    />

                    <Button onClick={handlePost}>Опубликовать</Button>
                    <p className="create-post-status">Ваш статус: {currentUser.role === "admin" ? "Администратор" : "Модератор"}</p>
                </div>

            ) : (
                <div className="no-permission">Только администраторы и модераторы могут публиковать новости.</div>
            )}

            {posts.map(post => {
                const postComments = getPostComments(post.id);
                const isOpen = openComments[post.id];
                const commentValue = commentInputs[post.id] || "";
                
                return (
                    <div key={post.id} className="post">
                        <div className="post-header">

                            <span className="post-author">{getAuthorName(post.authorId)}</span>
                            <span className="post-time">{post.time}</span>

                        </div>
                        <p className="post-content">{post.content}</p>
                        
                        <button 
                            onClick={() => toggleComments(post.id)}
                            className="comment-toggle-btn"
                        >
                            💬 Комментарии ({postComments.length})
                        </button>

                        {isOpen && (
                            <div className="comments-section">
                                {postComments.length > 0 ? (
                                    postComments.map(comment => (
                                        <div key={comment.id} className="comment">
                                            <div className="comment-header">

                                                <span className="comment-author">{getAuthorName(comment.authorId)}</span>
                                                <span className="comment-time">{comment.time}</span>

                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-comments">Нет комментариев</p>
                                )}
                                
                                <div className="add-comment">
                                    <input
                                        type="text"
                                        placeholder="Написать комментарий..."
                                        value={commentValue}
                                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                        className="comment-input"
                                    />
                                    <Button onClick={() => handleAddComment(post.id)} className="btn-small">Отправить</Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ЧАТЫ
const ChatPage = ({ currentUser, messages, groupMessages, groups, onSendMessage, onSendGroupMessage }) => {
    const [selectedTab, setSelectedTab] = React.useState("private");
    const [selectedUserId, setSelectedUserId] = React.useState(null);
    const [selectedGroupId, setSelectedGroupId] = React.useState(null);
    const [messageText, setMessageText] = React.useState("");

    const otherUsers = INITIAL_USERS.filter(u => u.id !== currentUser.id);
    const chatMessages = messages.filter(m => (m.fromId === currentUser.id && m.toId === selectedUserId) || (m.fromId === selectedUserId && m.toId === currentUser.id));
    const userGroups = groups.filter(g => g.members.includes(currentUser.id));
    const groupChatMessages = selectedGroupId ? groupMessages.filter(m => m.groupId === selectedGroupId) : [];

    const handleSend = () => {
        if (!messageText.trim()) return;
        if (selectedTab === "private" && selectedUserId) onSendMessage(selectedUserId, messageText);
        else if (selectedTab === "group" && selectedGroupId) onSendGroupMessage(selectedGroupId, messageText);
        setMessageText("");
    };

    const getUserName = (id) => INITIAL_USERS.find(u => u.id === id)?.name || "Неизвестно";
    const getGroupName = (id) => groups.find(g => g.id === id)?.name || "Неизвестно";

    return (
        <div className="chat-container">
            <h2 className="page-title">Сообщения</h2>

            <div className="chat-tabs">
                <button onClick={() => { setSelectedTab("private"); setSelectedGroupId(null); }} className={`chat-tab ${selectedTab === "private" ? 'active' : ''}`}>Личные</button>
                <button onClick={() => { setSelectedTab("group"); setSelectedUserId(null); }} className={`chat-tab ${selectedTab === "group" ? 'active' : ''}`}>Группы ({userGroups.length})</button>
            </div>

            <div className="chat-wrapper">
                <div className="chat-sidebar">

                    <div className="chat-sidebar-title">{selectedTab === "private" ? "Чаты" : "Мои группы"}</div>
                    <div className="chat-list">

                        {selectedTab === "private" ? otherUsers.map(user => (
                            <div key={user.id} onClick={() => setSelectedUserId(user.id)} className={`chat-item ${selectedUserId === user.id ? 'active' : ''}`}>
                                <div className="chat-item-name">{user.name}</div>
                                <div className="chat-item-class">{user.class}</div>
                            </div>

                        )) : userGroups.length > 0 ? userGroups.map(group => (
                            <div key={group.id} onClick={() => setSelectedGroupId(group.id)} className={`chat-item ${selectedGroupId === group.id ? 'active' : ''}`}>
                                
                                <div className="chat-item-name">{group.name}</div>
                                <div className="chat-item-class">{group.members.length} участников</div>

                            </div>
                        )) : <div className="chat-item" style={{cursor: 'default'}}>Вы не состоите ни в одной группе</div>}
                    </div>
                </div>
                <div className="chat-area">
                    {selectedTab === "private" ? selectedUserId ? (
                        <>
                            <div className="chat-area-header">{getUserName(selectedUserId)}</div>
                            <div className="chat-messages">

                                {chatMessages.length === 0 ? <p className="chat-empty">Нет сообщений</p> : chatMessages.map(msg => (
                                    <div key={msg.id} className={`chat-message ${msg.fromId === currentUser.id ? 'own' : 'other'}`}>
                                        <p className="chat-message-text">{msg.text}</p>
                                        <p className="chat-message-time">{msg.time}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="chat-input-wrapper">
                                <input type="text" placeholder="Напишите сообщение..." value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="chat-input" />
                                <Button onClick={handleSend}>Отправить</Button>
                            </div>
                        </>
                    ) : <div className="chat-placeholder">Выберите чат для начала общения</div> : selectedGroupId ? (
                        <>
                            <div className="chat-area-header">{getGroupName(selectedGroupId)} (общий чат)</div>
                            <div className="chat-messages">

                                {groupChatMessages.length === 0 ? <p className="chat-empty">Нет сообщений</p> : groupChatMessages.map(msg => (
                                    <div key={msg.id} className={`chat-message ${msg.fromId === currentUser.id ? 'own' : 'other'}`}>
                                        <p className="chat-message-author">{getUserName(msg.fromId)}</p>
                                        <p className="chat-message-text">{msg.text}</p>
                                        <p className="chat-message-time">{msg.time}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="chat-input-wrapper">
                                <input type="text" placeholder="Напишите сообщение в группу..." value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="chat-input" />
                                <Button onClick={handleSend}>Отправить</Button>
                            </div>
                        </>
                    ) : <div className="chat-placeholder">Выберите группу для общения</div>}
                </div>
            </div>
        </div>
    );
};

// КАЛЕНДАРЬ
const CalendarPage = ({ events, onAddEvent }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [newEvent, setNewEvent] = React.useState({ title: "", date: "" });

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date) { alert("Заполните все поля"); return; }
        onAddEvent({ title: newEvent.title, date: parseInt(newEvent.date), month: 10 });
        setNewEvent({ title: "", date: "" });
        setShowModal(false);
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="calendar-container">
            
            <div className="calendar-header">
                <h2 className="page-title">Календарь мероприятий</h2>
                <Button onClick={() => setShowModal(true)}>+ Добавить</Button>
            </div>

            <div className="calendar-grid">
                <div className="calendar-weekdays">
                    <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                </div>

                <div className="calendar-days">
                    <div className="calendar-day empty"></div>
                    <div className="calendar-day empty"></div>

                    {days.map(day => {
                        const event = events.find(e => e.date === day);
                        return (
                            <div key={day} className={`calendar-day ${event ? 'has-event' : ''}`}>
                                <span className="calendar-day-number">{day}</span>
                                {event && <div className="calendar-event">{event.title}</div>}
                            </div>
                        );

                    })}
                </div>
            </div>
            {showModal && (
                <div className="modal" onClick={() => setShowModal(false)}>
                    <form onSubmit={handleAddEvent} className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Добавить мероприятие</h3>
                        <Input label="Название" placeholder="Например: Родительское собрание" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                        <Input label="День (1-31)" type="number" placeholder="15" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
                            <Button type="submit">Добавить</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

// ГРУППЫ 
const GroupsPage = ({ groups, currentUser, onCreateGroup, onJoinGroup, onLeaveGroup }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [newGroupName, setNewGroupName] = React.useState("");

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) { alert("Введите название группы"); return; }
        onCreateGroup(newGroupName);
        setNewGroupName("");
        setShowModal(false);
    };

    const getCreatorName = (creatorId) => INITIAL_USERS.find(u => u.id === creatorId)?.name || "Неизвестно";
    const isMember = (groupId) => { const group = groups.find(g => g.id === groupId); return group && group.members.includes(currentUser.id); };

    return (
        <div className="groups-container">
            <div className="groups-header">
                <h2 className="page-title">Группы</h2>
                <Button onClick={() => setShowModal(true)}>+ Создать группу</Button>
            </div>

            <div className="groups-grid">
                {groups.map(group => (
                    <div key={group.id} className="group-card">
                        <h3 className="group-name">{group.name}</h3>

                        <p className="group-creator">Создатель: {getCreatorName(group.creatorId)}</p>
                        <p className="group-members">Участников: {group.members.length}</p>
                        
                        {isMember(group.id) ? (
                            <Button variant="secondary" onClick={() => onLeaveGroup(group.id)} className="btn-full">Покинуть группу</Button>
                        ) : (
                            <Button onClick={() => onJoinGroup(group.id)} className="btn-full">Вступить</Button>
                        )}
                    </div>
                ))}
            </div>
            {showModal && (
                <div className="modal" onClick={() => setShowModal(false)}>
                    <form onSubmit={handleCreate} className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Создать группу</h3>
                        <Input label="Название группы" placeholder="Например: 10-Б Класс" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
                            <Button type="submit">Создать</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};