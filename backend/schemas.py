from pydantic import BaseModel
from typing import Optional, List

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None
    owner_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class Task(TaskBase):
    id: int
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    break_time: Optional[str] = None
    total_hours: Optional[str] = None
    break_start: Optional[str] = None
    break_end: Optional[str] = None
    status: str
    user_id: Optional[int] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    date: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    break_time: Optional[str] = None
    total_hours: Optional[str] = None
    break_start: Optional[str] = None
    break_end: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[int] = None

class Attendance(AttendanceBase):
    id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    name: str
    role: Optional[str] = "User"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    tasks: List[Task] = []
    attendance: List[Attendance] = []

    class Config:
        from_attributes = True
