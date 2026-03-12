from sqlalchemy import Column, String
from app.database import Base

class RegistrationRequest(Base):
    __tablename__ = "registration_requests"

    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    academic_email = Column(String, unique=True, nullable=False)
    birth_date = Column(String, nullable=False)
    apogee_code = Column(String, nullable=False)
    password = Column(String, nullable=False)
    status = Column(String, default="pending")