"""Банк вопросов для тестов."""

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    Text,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from .base import Base
from .enums import QuestionType


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(
        Integer, ForeignKey("roadmap_topics.id", ondelete="CASCADE"), nullable=False
    )
    text = Column(Text, nullable=False)
    question_type = Column(
        SAEnum(QuestionType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    correct_answer = Column(Text, nullable=True, comment="JSON: строка или массив")
    explanation = Column(Text, nullable=True)

    topic = relationship("RoadmapTopic", back_populates="questions")
    options = relationship(
        "QuestionOption", back_populates="question", cascade="all, delete-orphan"
    )


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(
        Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False
    )
    text = Column(Text, nullable=False)
    is_anti_ai = Column(Boolean, default=False)

    question = relationship("Question", back_populates="options")
