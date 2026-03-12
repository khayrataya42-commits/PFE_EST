from pydantic import BaseModel


class MessageCreate(BaseModel):
    sender: str
    receiver: str
    content: str


class MessageResponse(BaseModel):
    id: int
    sender: str
    receiver: str
    content: str

    class Config:
        from_attributes = True