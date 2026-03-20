// MOCK
const INITIAL_USERS = [
    { id: 1, name: "Алексей Смирнов", email: "admin@school.ru", password: "123", role: "admin", class: "10-Б" },
    { id: 2, name: "Мария Иванова", email: "maria@school.ru", password: "123", role: "user", class: "9-А" },
    { id: 3, name: "Елена Петрова", email: "moder@school.ru", password: "123", role: "moderator", class: "11-Б" },
    { id: 4, name: "Дмитрий Козлов", email: "dima@school.ru", password: "123", role: "user", class: "10-А" }
];

const INITIAL_POSTS = [
    { id: 1, authorId: 1, content: "Объявление: родительское собрание в пятницу!", time: "10:00" },
    { id: 2, authorId: 3, content: "Не забудьте сдать тетради до конца недели", time: "Вчера" }
];

const INITIAL_COMMENTS = [
    { id: 1, postId: 1, authorId: 2, content: "Спасибо за информацию!", time: "10:15" },
    { id: 2, postId: 1, authorId: 4, content: "А во сколько начало?", time: "10:30" },
    { id: 3, postId: 2, authorId: 1, content: "Напоминаем всем!", time: "11:00" }
];

const INITIAL_EVENTS = [
    { id: 1, title: "День открытых дверей", date: 15, month: 10 },
    { id: 2, title: "Олимпиада по математике", date: 18, month: 10 },
    { id: 3, title: "Футбольный матч", date: 22, month: 10 }
];

const INITIAL_GROUPS = [
    { id: 1, name: "10-Б Класс", members: [1], creatorId: 1 },
    { id: 2, name: "Школьный Театр", members: [3], creatorId: 3 },
    { id: 3, name: "Программирование", members: [1, 4], creatorId: 1 }
];

const INITIAL_MESSAGES = [
    { id: 1, fromId: 2, toId: 1, text: "Привет! Как дела?", time: "10:00", type: "private" },
    { id: 2, fromId: 1, toId: 2, text: "Привет, нормально!", time: "10:05", type: "private" },
    { id: 3, fromId: 4, toId: 1, text: "Скинь домашку", time: "09:30", type: "private" }
];

const INITIAL_GROUP_MESSAGES = [
    { id: 1, groupId: 1, fromId: 1, text: "Всем привет в чате класса!", time: "09:00" }
];