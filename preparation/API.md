1. Аутентификация пользователя
POST /api/auth/regsiter Регистрация нового пользователя
Тело запроса:
{"username": "johndoe","email": "john@example.com","password": "securepassword123",}

Успешный ответ (201 Created): {"id": 1,"username": "johndoe","email": "john@example.com","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}

Ошибка (400 Bad Request): {"error": "User with this email already exists"}


POST /api/auth/login Вход в систему
Тело запроса: {"email": "john@example.com", "password": "securepassword123"}

Успешный ответ (200 OK):
{"id": 1, "username": "johndoe", "email": "john@example.com", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}

Ошибка (401 Unauthorized):{"error": "Invalid email or password"}


POSt /api/auth/logout Выход из системы
Успешный ответ (200 OK): {"message": "Successfully logged out"}


GET /api/auth/me получить информацию о пользователе
Успешный ответ (200 OK): {"id": 1,"username": "johndoe","email": "john@example.com"}

Ошибка (401 Unauthorized): {"error": "Invalid or expired token"}


GET /api/users поиск пользователей (по имени, email)
Успешный ответ (200 OK): {"total": 15,"limit": 10,"offset": 0,"users": [{"id": 1,"username": "johndoe",},{"id": 5,"username": "johnny",}]}

2. Сообщения
GET /api/chats список чатов
Успешный ответ (200 OK):
[{"id": 1,"type": "private","lastMessage": {"text": "Увидимся завтра!","senderId": 2}},
  {"id": 2,"type": "private","lastMessage": {"text": "Как дела?","senderId": 3}}]


POSt /api/chats создание нового чата
Тело запроса:{"type": "private","participantIds": [2] // ID собеседника}

Успешный ответ (201 Created):{"id": 3,"type": "private","participants": [{"id": 1,"username": "johndoe"},{"id": 2,"username": "janedoe"}],}


GET /api/chats/{id}/messages получить историю сообщений в чате
Успешный ответ (200 OK):{"chatId": 1,"total": 150,"messages": [{"id": 101,"senderId": 2,"senderName": "Jane Doe","text": "Привет! Как прошла встреча?"},{"id": 100,"senderId": 1,"senderName": "John Doe","text": "Отлично! Все обсудили"}]}


POSt /api/chats/{id}/messages отправить сообщение в чате
Тело запроса:{"text": "Привет! Как дела?"}
Успешный ответ (201 Created):{"id": 102,"chatId": 1,"senderId": 1,"senderName": "John Doe","text": "Привет! Как дела?"}


3. Группы
GET /api/groups получить список групп
Успешный ответ (200 OK):{"total": 25,"groups": [{"id": 1,"name": "Любители котиков","description": "Группа для всех, кто любит кошек","memberCount": 42},
{"id": 2,"name": "Путешествия по России","description": "Делимся опытом и фотографиями","memberCount": 128}]}


POST /api/groups создать новую группу
Тело запроса:{"name": "Название группы","description": "Описание группы",}

Успешный ответ (201 Created):{"id": 3,"name": "Название группы","description": "Описание группы","creatorId": 1,"creatorName": "John Doe","memberCount": 1}


GET /api/groups/{id} получить информацию о группе
Успешный ответ (200 OK):{"id": 1,"name": "Любители котиков","description": "Группа для всех, кто любит кошек","creatorId": 5,"creatorName": "Jane Smith","memberCount": 42}


POST /api/groups/{id}/join	Вступить в группу
Успешный ответ (200 OK):{"message": "You have joined the group","groupId": 1}

Ошибка (400 Bad Request):{"error": "You are already a member of this group"}


POST /api/groups/{id}/leave	Покинуть группу
Успешный ответ (200 OK):{"message": "You have left the group","groupId": 1}

Ошибка (400 Bad Request):{"error": "Creator cannot leave the group. Transfer ownership first or delete the group."}


GET /api/groups/{id}/members получить список участников
Успешный ответ (200 OK):{"total": 42,"members": [{"id": 5,"username": "janesmith"},
{"id": 1,"username": "johndoe"}]}


DELETE /api/groups/{id}/members/{userId} удалить участника
Успешный ответ (200 OK):{"message": "User has been removed from the group"}

Ошибка (403 Forbidden):{"error": "Only creator and admins can remove members"}


4. Сообщения в группах
GET /api/groups/{id}/messages получить сообщения в группе
Успешный ответ (200 OK):
{"groupId": 1,"messages": [{"id": 201,"senderId": 1,"senderName": "John Doe","text": "Всем привет! Кто идет на встречу?"},
{"id": 200,"senderId": 5,"senderName": "Jane Smith","text": "Завтра собрание в 18:00"}]}


POST /api/groups/{id}/messages написать сообщение в группе
Тело запроса:{"text": "Всем привет!"}

Успешный ответ (201 Created):{"id": 202,"groupId": 1,"senderId": 1,"senderName": "John Doe","text": "Всем привет!"}


5. Мероприятия
GET /api/events получить список мероприятий
Успешный ответ (200 OK):
{
  "total": 8,
  "events": [
    {
      "id": 1,
      "title": "Пикник в парке",
      "description": "Берите еду и хорошее настроение",
      "location": "Центральный парк",
      "startTime": "2026-03-15T12:00:00Z",
      "endTime": "2026-03-15T18:00:00Z",
      "creatorId": 1,
      "creatorName": "John Doe",
      "attendeeCount": 12
    }
    {
      "id": 2,
      "title": "Лекция о путешествиях",
      "description": "Расскажем о поездке в Азию",
      "location": "Онлайн",
      "startTime": "2026-03-10T19:00:00Z",
      "endTime": "2026-03-10T21:00:00Z",
      "creatorId": 2,
      "creatorName": "Jane Smith",
      "attendeeCount": 45
    }
  ]
}


POST /api/events создать мероприятие
Тело запроса:
{
  "title": "Название мероприятия",
  "description": "Описание мероприятия",
  "location": "Место проведения или ссылка",
  "startTime": "2026-04-01T15:00:00Z",
  "endTime": "2026-04-01T18:00:00Z"
}

Успешный ответ (201 Created):
{
  "id": 3,
  "title": "Название мероприятия",
  "description": "Описание мероприятия",
  "location": "Место проведения",
  "startTime": "2026-04-01T15:00:00Z",
  "endTime": "2026-04-01T18:00:00Z",
  "creatorId": 1,
  "creatorName": "John Doe",
  "attendeeCount": 1
}

DELETE /api/events/{id} удалить мероприятие
Успешный ответ (200 OK):{"message": "Event has been deleted"}

Ошибка (403 Forbidden):{"error": "Only creator can delete this event"}