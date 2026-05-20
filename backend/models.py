from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    role = Column(String, default="User")

    tasks = relationship("Task", back_populates="owner")
    attendance = relationship("Attendance", back_populates="user")

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
