from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship, Session, declarative_base
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# КОНФИГУРАЦИЯ
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
Base = declarative_base()

# МОДЕЛИ БД
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    class_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    group_memberships = relationship("GroupMember", back_populates="user")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    members = relationship("GroupMember", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_date = Column(DateTime, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    from_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_group = Column(Boolean, default=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# PYDANTIC СХЕМЫ
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)
    class_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    class_name: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)

class PostResponse(BaseModel):
    id: int
    content: str
    author_id: int
    author_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)

class CommentResponse(BaseModel):
    id: int
    content: str
    post_id: int
    author_id: int
    author_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None

class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    creator_id: int
    member_count: int = 0
    members: List[int] = []
    model_config = ConfigDict(from_attributes=True)

class EventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    event_date: datetime

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    event_date: datetime
    created_by: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class MessageCreate(BaseModel):
    to_id: Optional[int] = None
    group_id: Optional[int] = None
    content: str = Field(..., min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: int
    from_id: int
    to_id: Optional[int]
    group_id: Optional[int]
    content: str
    is_group: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# УТИЛИТЫ
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# ЗАВИСИМОСТИ
def get_db():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/school_social")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Неверный токен")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Неверный токен")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

def require_role(*roles: str):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        return current_user
    return checker

# ПРИЛОЖЕНИЕ
app = FastAPI(title="School Social Network API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# СОЗДАНИЕ ТАБЛИЦ
@app.on_event("startup")
def on_startup():
    from sqlalchemy import create_engine
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/school_social")
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)

# === РОУТЫ: Аутентификация ===
@app.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    new_user = User(
        email=user.email,
        name=user.name,
        class_name=user.class_name,
        hashed_password=hash_password(user.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users/search", response_model=List[UserResponse])
def search_users(
    q: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Поиск пользователей по имени (исключая текущего)"""
    query = db.query(User).filter(User.id != current_user.id)
    if q:
        query = query.filter(User.name.ilike(f"%{q}%"))
    return query.limit(20).all()

@app.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(User).filter(User.id != current_user.id).limit(50).all()

@app.get("/posts", response_model=List[PostResponse])
def get_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for post in posts:
        author = db.query(User).filter(User.id == post.author_id).first()
        result.append({
            "id": post.id,
            "content": post.content,
            "author_id": post.author_id,
            "author_name": author.name if author else "Пользователь",  # ← Добавляем имя
            "created_at": post.created_at
        })
    return result

@app.post("/posts", response_model=PostResponse)
def create_post(post: PostCreate, current_user: User = Depends(require_role("admin", "moderator")), db: Session = Depends(get_db)):
    new_post = Post(content=post.content, author_id=current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    #return new_post
    return {
        "id": new_post.id,
        "content": new_post.content,
        "author_id": new_post.author_id,
        "author_name": current_user.name,
        "created_at": new_post.created_at
    }

@app.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    result = []
    for comment in comments:
        author = db.query(User).filter(User.id == comment.author_id).first()
        result.append({
            "id": comment.id,
            "content": comment.content,
            "post_id": comment.post_id,
            "author_id": comment.author_id,
            "author_name": author.name if author else "Пользователь",
            "created_at": comment.created_at
        })
    return result

@app.post("/posts/{post_id}/comments", response_model=CommentResponse)
def add_comment(post_id: int, comment: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Пост не найден")
    new_comment = Comment(content=comment.content, post_id=post_id, author_id=current_user.id)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

# === РОУТЫ: Группы ===
@app.get("/groups", response_model=List[GroupResponse])
def get_groups(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    groups = db.query(Group).offset(skip).limit(limit).all()
    result = []
    for g in groups:
        member_count = db.query(GroupMember).filter(GroupMember.group_id == g.id).count()
        member_ids = [m.user_id for m in db.query(GroupMember).filter(GroupMember.group_id == g.id).all()]
        result.append({
            "id": g.id, "name": g.name, "description": g.description,
            "creator_id": g.creator_id, "member_count": member_count, "members": member_ids
        })
    return result

@app.post("/groups", response_model=GroupResponse)
def create_group(group: GroupCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_group = Group(name=group.name, description=group.description, creator_id=current_user.id)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    db.add(GroupMember(group_id=new_group.id, user_id=current_user.id))
    db.commit()
    return {"id": new_group.id, "name": new_group.name, "description": new_group.description, "creator_id": new_group.creator_id, "member_count": 1, "members": [current_user.id]}

@app.post("/groups/{group_id}/join")
def join_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(404, "Группа не найдена")
    existing = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first()
    if existing:
        return {"message": "Вы уже в этой группе", "status": "already_member"}
    db.add(GroupMember(group_id=group_id, user_id=current_user.id))
    db.commit()
    return {"message": "Вы вступили в группу", "status": "joined"}

@app.post("/groups/{group_id}/leave")
def leave_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(400, "Вы не в этой группе")
    db.delete(membership)
    db.commit()
    return {"message": "Вы вышли из группы", "status": "left"}

# === РОУТЫ: События ===
@app.get("/events", response_model=List[EventResponse])
def get_events(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date).offset(skip).limit(limit).all()

@app.post("/events", response_model=EventResponse)
def create_event(event: EventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_event = Event(title=event.title, description=event.description, event_date=event.event_date, created_by=current_user.id)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@app.get("/messages", response_model=List[MessageResponse])
def get_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Message).filter(
        ((Message.from_id == current_user.id) | (Message.to_id == current_user.id)),
        Message.is_group == False
    ).order_by(Message.created_at.asc()).limit(50).all()

@app.post("/messages", response_model=MessageResponse)
def send_message(message: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not message.to_id and not message.group_id:
        raise HTTPException(400, "Укажите получателя или группу")
    new_message = Message(
        from_id=current_user.id, to_id=message.to_id,
        group_id=message.group_id, content=message.content,
        is_group=bool(message.group_id)
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message

@app.get("/messages/group/{group_id}", response_model=List[MessageResponse])
def get_group_messages(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(403, "Вы не состоите в этой группе")
    return db.query(Message).filter(
        Message.group_id == group_id, Message.is_group == True
    ).order_by(Message.created_at.asc()).limit(50).all()

@app.post("/messages/group", response_model=MessageResponse)
def send_group_message(message: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not message.group_id:
        raise HTTPException(400, detail="Укажите группу")
    membership = db.query(GroupMember).filter(GroupMember.group_id == message.group_id, GroupMember.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(403, detail="Вы не состоите в этой группе")
    new_message = Message(
        from_id=current_user.id,
        to_id=None,
        group_id=message.group_id,
        content=message.content,
        is_group=True
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}