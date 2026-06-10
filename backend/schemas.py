from pydantic import BaseModel, Field
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

class LeaveRequestBase(BaseModel):
    leave_type: str
    start_date: str
    end_date: str
    reason: str
    status: Optional[str] = "Pending"
    applied_on: Optional[str] = None
    admin_notes: Optional[str] = None
    user_id: Optional[int] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class LeaveRequest(LeaveRequestBase):
    id: int

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    title: str
    message: str
    is_read: Optional[bool] = False
    created_at: Optional[str] = None
    user_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int

    class Config:
        from_attributes = True

class AppUsageBase(BaseModel):
    app_name: str
    window_title: Optional[str] = None
    active_duration: int
    is_productive: Optional[bool] = True
    timestamp: Optional[str] = None
    date: Optional[str] = None
    user_id: Optional[int] = None

class AppUsageCreate(AppUsageBase):
    pass

class AppUsage(AppUsageBase):
    id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    name: str
    role: Optional[str] = "User"
    phone: Optional[str] = ""
    department: Optional[str] = ""
    location: Optional[str] = ""

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    role: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None

class User(UserBase):
    id: int
    tasks: List[Task] = []
    attendance: List[Attendance] = []
    leave_requests: List[LeaveRequest] = []
    notifications: List[Notification] = []
    app_usages: List[AppUsage] = []

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str = Field(..., min_length=8)

