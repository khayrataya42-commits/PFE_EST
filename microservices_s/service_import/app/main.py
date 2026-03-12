from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, calendar, notification, courses, teacher,users,student

app = FastAPI()

# Liste des origines autorisées (tu peux ajuster cela selon tes besoins)
origins = [
    "http://localhost:5173",  # Frontend en développement
]
# Middleware CORS pour autoriser le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend en développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(upload.router, tags=["Upload/Download"])
app.include_router(calendar.router, tags=["Calendar"])
app.include_router(notification.router, tags=["Notification"])
app.include_router(courses.router, tags=["Courses"])
app.include_router(teacher.router, tags=["Teacher"])
app.include_router(student.router, tags=["Student"])
app.include_router(users.router, tags=["Users"])

@app.get("/")
def root():
    return {"message": "Microservice de téléchargement opérationnel"}
