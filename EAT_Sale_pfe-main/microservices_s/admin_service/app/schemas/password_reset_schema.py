from pydantic import BaseModel
from datetime import date


class PasswordResetRequestCreate(BaseModel):
    academic_email: str
    apogee_code: str
    birth_date: date