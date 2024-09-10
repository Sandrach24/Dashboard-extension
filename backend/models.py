from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True)
    field_name = Column(String, index=True)
    validation_message = Column(String, index=True)
    email_date = Column(String, index=True)
    url = Column(String, index=True)
    recipient = Column(String, index=True)
    content = Column(String, index=True)
    is_phishing = Column(Boolean)
    ip= Column(String,index=True)

class ValidationResultSchema(BaseModel):
    id: int
    field_name: str
    validation_message: str
    email_date: str
    url: str
    recipient: str
    content: str
    is_phishing: bool
    ip=str

    class Config:
        orm_mode = True

