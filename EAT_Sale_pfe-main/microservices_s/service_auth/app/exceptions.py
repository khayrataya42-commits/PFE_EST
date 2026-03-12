from fastapi import HTTPException

class TokenValidationError(HTTPException):
    def __init__(self, detail="Invalid or expired token"):
        super().__init__(status_code=401, detail=detail)

class AccessDeniedError(HTTPException):
    def __init__(self, detail="Access denied"):
        super().__init__(status_code=403, detail=detail)
