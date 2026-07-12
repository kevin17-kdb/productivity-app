from fastapi import APIRouter
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from schemas import UserCreate, UserLogin
from auth import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="",
    tags=["Authentication"]
)
# ==========================================================
# SIGNUP
# ==========================================================

@router.post("/signup")

def signup(

    user: UserCreate,

    db: Session = Depends(get_db)

):

    existing_user = db.query(User).filter(

        User.email == user.email

    ).first()

    if existing_user:

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

    return {

        "message": "User created successfully."

    }

# ==========================================================
# LOGIN
# ==========================================================

@router.post(
    "/login",
    response_model=Token
)

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

        {

            "sub": db_user.email

        }

    )

    return {

        "access_token": token,

        "token_type": "bearer"

    }

# ==========================================================
# CURRENT USER
# ==========================================================

# ==========================================================
# CURRENT USER
# ==========================================================

@router.get("/me")
def me(

    current_user: User = Depends(get_current_user)

):

    return {

        "id": current_user.id,

        "name": current_user.name,

        "email": current_user.email

    }
