from .models.base import Base

# Модели
from .models.candidate import (
    Candidate,
    CandidateSoftSkill,
    Education,
    FspParticipation,
    Resume,
    WorkExperience,
)
from .models.company import Company, CompanyMember
from .models.dictionaries import SoftSkillDict

# Enums (импортируем для удобства)
from .models.enums import (
    CandidateStatus,
    ChatSender,
    CompanyIndustry,
    CompanySize,
    Direction,
    EmployerResponseStatus,
    EmployerStatus,
    FspResult,
    Grade,
    InvitationStatus,
    MemberRole,
    ParticipationType,
    QuestionType,
    ResponseStatus,
    TaskResult,
    TaskSource,
    TaskStatus,
    TeamRole,
    VacancyStatus,
)
from .models.interaction import ChatMessage, Invitation, Response, Task
from .models.questions import Question, QuestionOption
from .models.roadmap import RoadmapTopic, TopicTest
from .models.settings import CandidateSettings, EmployerSettings
from .models.vacancy import Vacancy, VacancyHardSkill, VacancySoftSkill

__all__ = [
    "Base",
    # Enums
    "Direction",
    "Grade",
    "CandidateStatus",
    "EmployerStatus",
    "CompanyIndustry",
    "CompanySize",
    "MemberRole",
    "VacancyStatus",
    "ResponseStatus",
    "EmployerResponseStatus",
    "InvitationStatus",
    "TaskSource",
    "TaskStatus",
    "TaskResult",
    "FspResult",
    "ParticipationType",
    "TeamRole",
    "ChatSender",
    "QuestionType",
    # Models
    "Candidate",
    "CandidateSkill",
    "Education",
    "WorkExperience",
    "SoftSkill",
    "Resume",
    "FspParticipation",
    "RoadmapTopic",
    "TopicTest",
    "SoftSkillDict",
    "Company",
    "CompanyMember",
    "Vacancy",
    "VacancyHardSkill",
    "VacancySoftSkill",
    "Response",
    "Invitation",
    "ChatMessage",
    "Task",
    "Question",
    "QuestionOption",
    "CandidateSettings",
    "EmployerSettings",
]
