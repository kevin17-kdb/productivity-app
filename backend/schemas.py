from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# =====================================================
# USER
# =====================================================

class UserCreate(BaseModel):

    name: str

    email: EmailStr

    password: str


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int

    name: str

    email: EmailStr

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# TOKEN
# =====================================================

class Token(BaseModel):

    access_token: str

    token_type: str


# =====================================================
# CHAT REQUEST
# =====================================================

class ChatRequest(BaseModel):

    subject: str

    question: str


class ChatResponse(BaseModel):

    subject: str

    question: str

    answer: str


# =====================================================
# SUBJECT REQUEST
# =====================================================

class SubjectRequest(BaseModel):

    subject: str


# =====================================================
# RENAME CONVERSATION
# =====================================================

class RenameConversation(BaseModel):

    title: str


# =====================================================
# GENERIC MESSAGE
# =====================================================

class MessageResponse(BaseModel):

    message: str


# =====================================================
# DOCUMENT
# =====================================================

class DocumentResponse(BaseModel):

    filename: str

    subject: str


# =====================================================
# DASHBOARD
# =====================================================

class DashboardResponse(BaseModel):

    uploads: int = 0

    questions: int = 0

    quizzes: int = 0

    flashcards: int = 0

    summaries: int = 0

    important_questions: int = 0


# =====================================================
# CHAT HISTORY
# =====================================================

class ChatHistoryResponse(BaseModel):

    id: int

    subject: str

    question: str

    answer: str

    title: str | None = None

    created_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )