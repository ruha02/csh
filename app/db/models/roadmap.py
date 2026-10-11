"""Дорожная карта и результаты тестов."""

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from .base import Base
from .enums import Direction


class RoadmapTopic(Base):
    __tablename__ = "roadmap_topics"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="Уникальный ключ: react-hooks, css-grid...",
    )
    title = Column(String(200), nullable=False)
    direction = Column(
        SAEnum(Direction, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    parent_id = Column(
        Integer,
        ForeignKey("roadmap_topics.id"),
        nullable=True,
        comment="NULL = корневой узел",
    )
    is_active = Column(Boolean, default=True)

    parent = relationship("RoadmapTopic", remote_side=[id], backref="children")
    topic_tests = relationship("TopicTest", back_populates="topic")
    vacancy_hard_skills = relationship("VacancyHardSkill", back_populates="topic")
    questions = relationship("Question", back_populates="topic")
    __table_args__ = (
        UniqueConstraint("key", "direction", name="uq_roadmap_topic_key_direction"),
    )


class TopicTest(Base):
    __tablename__ = "topic_tests"

    id = Column(Integer, primary_key=True, index=True)
    candidate_skill_id = Column(
        Integer, ForeignKey("candidate_skills.id", ondelete="CASCADE"), nullable=False
    )
    topic_id = Column(
        Integer, ForeignKey("roadmap_topics.id", ondelete="CASCADE"), nullable=False
    )
    best_score = Column(Integer, default=0)
    last_score = Column(Integer, default=0)
    attempts = Column(Integer, default=0)
    passed = Column(Boolean, default=False)
    last_attempt_date = Column(Date, nullable=True)
    next_attempt_date = Column(Date, nullable=True)
    locked = Column(Boolean, default=False)

    candidate_skill = relationship("CandidateSkill", back_populates="topic_tests")
    topic = relationship("RoadmapTopic", back_populates="topic_tests")

    __table_args__ = (
        UniqueConstraint(
            "candidate_skill_id", "topic_id", name="uq_candidate_skill_topic"
        ),
    )
