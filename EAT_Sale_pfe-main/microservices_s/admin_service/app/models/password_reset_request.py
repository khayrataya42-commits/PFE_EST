from sqlalchemy import Column, String
from app.database import Base
from uuid import uuid4


class PasswordResetRequest(Base):
    __tablename__ = "password_reset_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    academic_email = Column(String, nullable=False)
    apogee_code = Column(String, nullable=False)
    birth_date = Column(String, nullable=False)
    status = Column(String, default="pending")