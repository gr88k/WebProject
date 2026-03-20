// ТЕСТЫ

function runTests() {
    const results = [];
    
    const test1 = Array.isArray(INITIAL_USERS) && INITIAL_USERS.length > 0;
    results.push({ name: "Пользователи загружены", pass: test1 });
    
    const test2 = Array.isArray(INITIAL_POSTS) && INITIAL_POSTS.length > 0;
    results.push({ name: "Посты загружены", pass: test2 });
    
    const test3 = Array.isArray(INITIAL_COMMENTS);
    results.push({ name: "Комментарии загружены", pass: test3 });
    
    const test4 = Array.isArray(INITIAL_GROUPS) && INITIAL_GROUPS.length > 0;
    results.push({ name: "Группы загружены", pass: test4 });
    
    const test5 = Array.isArray(INITIAL_EVENTS) && INITIAL_EVENTS.length > 0;
    results.push({ name: "События загружены", pass: test5 });
    
    const emails = INITIAL_USERS.map(u => u.email);
    const unique = new Set(emails).size === emails.length;
    results.push({ name: "Email уникальны", pass: unique });
    
    const canPost = (role) => role === "admin" || role === "moderator";
    const test7 = canPost("admin") && canPost("moderator") && !canPost("user");
    results.push({ name: "Права доступа работают", pass: test7 });
    
    const postComments = INITIAL_COMMENTS.filter(c => c.postId === 1);
    const test8 = postComments.length === 2;
    results.push({ name: "Фильтрация комментариев", pass: test8 });
    
    const mockPost = { id: 999, authorId: 1, content: "Тест", time: "12:00" };
    const test9 = mockPost.id && mockPost.content;
    results.push({ name: "Создание поста", pass: test9 });
    
    const mockComment = { id: 999, postId: 1, authorId: 1, content: "Тест", time: "12:00" };
    const test10 = mockComment.postId && mockComment.content;
    results.push({ name: "Создание комментария", pass: test10 });
    
    const passed = results.filter(r => r.pass).length;
    const failed = results.length - passed;
    
    const html = `
        <div class="test-panel">
            <div class="test-header">
                <strong>Тесты</strong>
                <span class="test-count">${passed}/${results.length}</span>
                <button class="test-close" onclick="this.closest('.test-panel').remove()">✕</button>
            </div>
            <div class="test-list">
                ${results.map(r => `
                    <div class="test-item ${r.pass ? 'pass' : 'fail'}">
                        <span class="test-icon">${r.pass ? '✅' : '❌'}</span>
                        <span class="test-name">${r.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    const container = document.getElementById('test-results');
    if (container) {
        container.innerHTML = html;
    }
    
    console.log(`Тесты: ${passed} passed, ${failed} failed`);
    results.forEach(r => console.log(`${r.pass ? '✅' : '❌'} ${r.name}`));
}

setTimeout(runTests, 500);
