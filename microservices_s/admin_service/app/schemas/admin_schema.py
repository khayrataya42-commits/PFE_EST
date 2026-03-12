from pydantic import BaseModel, EmailStr
from typing import List, Optional


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    roles: List[str] = []


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    roles: Optional[List[str]] = None


class RoleAssign(BaseModel):
    user_id: str
    roles: List[str]


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    roles: List[str] = []