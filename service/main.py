from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.student_router import router as student_router
from .routers.class_router import router as class_router
from .routers.teacher_router import router as teacher_router
from .routers.user_router import router as user_router
from .routers.session_router import router as session_router
from .routers.enrollment_router import router as enrollment_router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student_router, tags=["Student"])
app.include_router(class_router, tags=["Class"])
app.include_router(teacher_router, tags=["Teacher"])
app.include_router(user_router, tags=["User"])
app.include_router(session_router, tags=["Session"])
app.include_router(enrollment_router, tags=["Enrollment"])