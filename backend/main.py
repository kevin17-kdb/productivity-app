from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session
from fastapi import Form

import os
import shutil
import pickle

# ----------------------------------------------------
# DATABASE
# ----------------------------------------------------

from database import (
    Base,
    engine,
    SessionLocal,
    get_db
)

# ----------------------------------------------------
# MODELS
# ----------------------------------------------------

import models

from models import (
    User,
    Subject,
    Document,
    ChatHistory,
    Conversation,
    Message
)

# ----------------------------------------------------
# SCHEMAS
# ----------------------------------------------------

from schemas import (
    UserCreate,
    UserLogin,
    Token,
    ChatRequest,
    SubjectRequest,
    QuizRequest,
    RenameConversation
)

# ----------------------------------------------------
# AUTH
# ----------------------------------------------------

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)

# ----------------------------------------------------
# LOCAL MODULES
# ----------------------------------------------------

from pdf_reader import extract_text
from embeddings import create_vector_store
from search import search

from analytics import get_dashboard_stats

from gemini import (
    ask_gemini,
    generate_quiz,
    generate_flashcards,
    generate_summary,
    generate_important_questions,
    detect_subject
)

# ----------------------------------------------------
# FASTAPI
# ----------------------------------------------------

app = FastAPI(

    title="StudyMate AI",

    version="2.0.0"

)

# ----------------------------------------------------
# DATABASE
# ----------------------------------------------------

Base.metadata.create_all(bind=engine)

# ----------------------------------------------------
# OAUTH
# ----------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(

    tokenUrl="login"

)

# ----------------------------------------------------
# CURRENT USER
# ----------------------------------------------------

def get_current_user(

    token: str = Depends(oauth2_scheme),

    db: Session = Depends(get_db)

):

    payload = verify_token(token)

    if payload is None:

        raise HTTPException(

            status_code=401,

            detail="Invalid token."

        )

    email = payload.get("sub")

    user = db.query(User).filter(

        User.email == email

    ).first()

    if user is None:

        raise HTTPException(

            status_code=404,

            detail="User not found."

        )

    return user
# =====================================================
# SIGNUP
# =====================================================

@app.post("/signup", response_model=Token)
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        {"sub": new_user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =====================================================
# LOGIN
# =====================================================

@app.post("/login", response_model=Token)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    token = create_access_token(
        {"sub": db_user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =====================================================
# CURRENT USER
# =====================================================

@app.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }

# ----------------------------------------------------
# CORS
# ----------------------------------------------------

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:5173",

        "http://localhost:5174"

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)

# ----------------------------------------------------
# FOLDERS
# ----------------------------------------------------

UPLOAD_FOLDER = "uploads"

VECTOR_FOLDER = "vector_db"

os.makedirs(

    UPLOAD_FOLDER,

    exist_ok=True

)

os.makedirs(

    VECTOR_FOLDER,

    exist_ok=True

)

# ----------------------------------------------------
# ANALYTICS
# ----------------------------------------------------

usage = {

    "questions": 0,

    "quizzes": 0,

    "flashcards": 0,

    "summaries": 0,

    "important_questions": 0

}
# -----------------------------
# Dashboard
# -----------------------------

@app.get("/dashboard")

def dashboard():

    stats = get_dashboard_stats()

    stats["questions"] = usage["questions"]

    stats["quizzes"] = usage["quizzes"]

    stats["flashcards"] = usage["flashcards"]

    stats["summaries"] = usage["summaries"]

    stats["important_questions"] = usage["important_questions"]

    return stats
# ==========================================================
# RECENT DOCUMENTS
# ==========================================================

@app.get("/recent-documents")

def recent_documents(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    documents = (

        db.query(Document)

        .filter(

            Document.user_id == current_user.id

        )

        .order_by(

            Document.id.desc()

        )

        .limit(5)

        .all()

    )

    return [

        {

            "filename": doc.filename,

            "subject": doc.subject

        }

        for doc in documents

    ]
# ==========================================================
# RECENT QUESTIONS
# ==========================================================

@app.get("/recent-questions")

def recent_questions(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    chats = (

        db.query(ChatHistory)

        .filter(

            ChatHistory.user_id == current_user.id

        )

        .order_by(

            ChatHistory.id.desc()

        )

        .limit(5)

        .all()

    )

    return [

        {

            "subject": chat.subject,

            "question": chat.question

        }

        for chat in chats

    ]


# ==========================================================
# UPLOAD PDF
# ==========================================================

@app.post("/upload")
async def upload_pdf(
    subject: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(

            status_code=400,

            detail="Only PDF files are allowed."

        )

    subject_folder = os.path.join(

        UPLOAD_FOLDER,

        subject

    )

    os.makedirs(

        subject_folder,

        exist_ok=True

    )

    pdf_path = os.path.join(

        subject_folder,

        file.filename

    )

    with open(pdf_path, "wb") as buffer:

        shutil.copyfileobj(

            file.file,

            buffer

        )

    extracted_text = extract_text(

        pdf_path

    )

    if not extracted_text.strip():

        raise HTTPException(

            status_code=400,

            detail="No readable text found in PDF."

        )

    total_chunks = create_vector_store(

        extracted_text,

        subject

    )

    existing_subject = db.query(Subject).filter(

        Subject.user_id == current_user.id,

        Subject.name == subject

    ).first()

    if existing_subject is None:

        db.add(

            Subject(

                name=subject,

                user_id=current_user.id

            )

        )

    db.add(

        Document(

            filename=file.filename,

            subject=subject,

            user_id=current_user.id

        )

    )

    db.commit()

    return {

        "message": "PDF uploaded successfully.",

        "subject": subject,

        "filename": file.filename,

        "characters": len(extracted_text),

        "chunks": total_chunks

    }


# ==========================================================
# CHAT
# ==========================================================

@app.post("/chat")
def chat(

    request: ChatRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):
    try:

        usage["questions"] += 1

        chunks = search(

            request.question,

            request.subject

        )

        context = "\n\n".join(

            chunks

        )

        answer = ask_gemini(

            context,

            request.question

        )

        # -----------------------------
        # Save Chat History
        # -----------------------------

        db.add(

            ChatHistory(

                subject=request.subject,

                question=request.question,

                answer=answer,

                user_id=current_user.id

            )

        )

        db.commit()

        return {

            "subject": request.subject,

            "question": request.question,

            "answer": answer

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )
    # ==========================================================
# CHAT HISTORY
# ==========================================================

@app.get("/chat-history")
def get_chat_history(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    chats = (

        db.query(ChatHistory)

        .filter(

            ChatHistory.user_id == current_user.id

        )

        .order_by(

            ChatHistory.created_at.desc()

        )

        .all()

    )

    return [

        {

            "id": chat.id,

            "subject": chat.subject,

            "question": chat.question,

            "answer": chat.answer,

            "created_at": chat.created_at

        }

        for chat in chats

    ]
# =====================================================
# CONVERSATION
# =====================================================



# ==========================================================
# DELETE CHAT
# ==========================================================

@app.delete("/chat/{chat_id}")

def delete_chat(

    chat_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    chat = db.query(

        ChatHistory

    ).filter(

        ChatHistory.id == chat_id,

        ChatHistory.user_id == current_user.id

    ).first()

    if chat is None:

        raise HTTPException(

            status_code=404,

            detail="Chat not found."

        )

    db.delete(chat)

    db.commit()

    return {

        "message": "Chat deleted successfully."

    }

# ==========================================================
# SINGLE CHAT
# ==========================================================

@app.get("/chat/{chat_id}")

def get_chat(

    chat_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    chat = db.query(

        ChatHistory

    ).filter(

        ChatHistory.id == chat_id,

        ChatHistory.user_id == current_user.id

    ).first()

    if chat is None:

        raise HTTPException(

            status_code=404,

            detail="Chat not found."

        )

    return {

        "id": chat.id,

        "subject": chat.subject,

        "question": chat.question,

        "answer": chat.answer,

        "created_at": chat.created_at

    }


# ==========================================================
# QUIZ
# ==========================================================

@app.post("/quiz")
def quiz(request: QuizRequest):

    try:

        usage["quizzes"] += 1

        subject = request.subject

        chunk_file = os.path.join(

            VECTOR_FOLDER,

            subject,

            "chunks.pkl"

        )

        with open(chunk_file, "rb") as f:

            chunks = pickle.load(f)

        context = "\n\n".join(chunks)

        quiz_text = generate_quiz(context, request.count)

        return {

            "subject": subject,

            "quiz": quiz_text

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ==========================================================
# FLASHCARDS
# ==========================================================

@app.post("/flashcards")
def flashcards(request: SubjectRequest):

    try:

        usage["flashcards"] += 1

        subject = request.subject

        chunk_file = os.path.join(

            VECTOR_FOLDER,

            subject,

            "chunks.pkl"

        )

        with open(chunk_file, "rb") as f:

            chunks = pickle.load(f)

        context = "\n\n".join(chunks)

        flashcards = generate_flashcards(context)

        return {

            "subject": subject,

            "flashcards": flashcards

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ==========================================================
# SUMMARY
# ==========================================================

@app.post("/summary")
def summary(request: SubjectRequest):

    try:

        usage["summaries"] += 1

        subject = request.subject

        chunk_file = os.path.join(

            VECTOR_FOLDER,

            subject,

            "chunks.pkl"

        )

        with open(chunk_file, "rb") as f:

            chunks = pickle.load(f)

        context = "\n\n".join(chunks)

        summary = generate_summary(context)

        return {

            "subject": subject,

            "summary": summary

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ==========================================================
# IMPORTANT QUESTIONS
# ==========================================================

@app.post("/important-questions")
def important_questions(request: SubjectRequest):

    try:

        usage["important_questions"] += 1

        subject = request.subject

        chunk_file = os.path.join(

            VECTOR_FOLDER,

            subject,

            "chunks.pkl"

        )

        with open(chunk_file, "rb") as f:

            chunks = pickle.load(f)

        context = "\n\n".join(chunks)

        questions = generate_important_questions(context)

        return {

            "subject": subject,

            "questions": questions

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )

# ==========================================================
# RENAME CHAT
# ==========================================================

@app.put("/chat-history/{chat_id}")

def rename_chat(

    chat_id: int,

    request: RenameConversation,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    chat = db.query(ChatHistory).filter(

        ChatHistory.id == chat_id,

        ChatHistory.user_id == current_user.id

    ).first()

    if chat is None:

        raise HTTPException(

            status_code=404,

            detail="Conversation not found."

        )

    chat.title = request.title

    db.commit()

    db.refresh(chat)

    return {

        "message": "Conversation renamed."

    }


# ==========================================================
# DETECT SUBJECT
# ==========================================================

@app.post("/detect-subject")
async def detect_pdf_subject(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Save to temp location to parse
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text(temp_path)
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in PDF."
            )

        subject = detect_subject(extracted_text)
        return {"subject": subject}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ==========================================================
# GET SUBJECTS
# ==========================================================

@app.get("/subjects")
def get_user_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    return [s.name for s in subjects]
