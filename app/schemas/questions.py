"""Схемы для банка вопросов."""

from pydantic import BaseModel, ConfigDict

QuestionType = str  # 'single' | 'multiple' | 'text'


class QuestionOptionCreate(BaseModel):
    text: str
    is_anti_ai: bool = False


class QuestionOptionResponse(QuestionOptionCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class QuestionCreate(BaseModel):
    topic_id: int
    text: str
    question_type: QuestionType
    correct_answer: str | None = None  # JSON: строка или массив
    explanation: str | None = None
    options: list[QuestionOptionCreate] = []


class QuestionResponse(QuestionCreate):
    id: int
    options: list[QuestionOptionResponse] = []

    model_config = ConfigDict(from_attributes=True)
