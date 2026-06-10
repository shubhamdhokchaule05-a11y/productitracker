from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    role = Column(String, default="User")
    phone = Column(String, default="")
    department = Column(String, default="")
    location = Column(String, default="")
    reset_code = Column(String, nullable=True)
    reset_code_expires_at = Column(String, nullable=True)

    tasks = relationship("Task", back_populates="owner")
    attendance = relationship("Attendance", back_populates="user")
    leave_requests = relationship("LeaveRequest", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    app_usages = relationship("AppUsage", back_populates="user")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, in_progress, completed
    priority = Column(String, default="medium") # low, medium, high
    due_date = Column(String, nullable=True) # YYYY-MM-DD
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="tasks")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String) # YYYY-MM-DD
    check_in = Column(String, nullable=True) # HH:MM AM/PM
    check_out = Column(String, nullable=True)
    break_time = Column(String, nullable=True)
    total_hours = Column(String, nullable=True)
    break_start = Column(String, nullable=True)
    break_end = Column(String, nullable=True)
    status = Column(String) # present, absent, leave
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="attendance")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    leave_type = Column(String)  # Sick Leave, Casual Leave, Paid Leave
    start_date = Column(String)  # YYYY-MM-DD
    end_date = Column(String)    # YYYY-MM-DD
    reason = Column(String)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected
    applied_on = Column(String)  # YYYY-MM-DD
    admin_notes = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="leave_requests")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(String)  # YYYY-MM-DD HH:MM:SS
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="notifications")

class AppUsage(Base):
    __tablename__ = "app_usages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    app_name = Column(String, index=True)
    window_title = Column(String, nullable=True)
    active_duration = Column(Integer, default=0)  # stored in seconds
    is_productive = Column(Boolean, default=True)
    timestamp = Column(String)  # YYYY-MM-DD HH:MM:SS (Last synced)
    date = Column(String, index=True)  # YYYY-MM-DD (For quick filtering)

    user = relationship("User", back_populates="app_usages")

