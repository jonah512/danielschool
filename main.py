from fastapi import FastAPI
from service.routers.entity_router import router as entity_router
from service.routers.teacher_router import router as teacher_router
from service.routers.class_router import router as class_router

app = FastAPI(
    title="Daniel Service API",
    description="API documentation for Daniel Service",
    version="1.0.0"
)

# Include routers
app.include_router(entity_router, prefix="/api/entities", tags=["Entities"])
app.include_router(teacher_router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(class_router, prefix="/api/classes", tags=["Classes"])
