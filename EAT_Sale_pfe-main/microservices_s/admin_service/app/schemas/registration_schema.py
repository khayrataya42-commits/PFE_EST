from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class RegistrationRequestCreate(BaseModel):
    first_name: str
    last_name: str
    academic_email: EmailStr
    birth_date: date
    apogee_code: str
    password: str


class RegistrationRequestOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    academic_email: EmailStr
    birth_date: date
    apogee_code: str
    status: str


class RegistrationDecisionOut(BaseModel):
    message: str