"""Экспорт всех схем."""

from .candidate import (
    CandidateProfileCreate,
    CandidateProfileResponse,
    CandidateProfileUpdate,
    CandidateSearchResult,
    CandidateSkillCreate,
    CandidateSkillResponse,
    CandidateSoftSkillCreate,
    CandidateSoftSkillResponse,
    EducationCreate,
    EducationResponse,
    FspParticipationCreate,
    FspParticipationResponse,
    ResumeCreate,
    ResumeResponse,
    TopicTestResponse,
    WorkExperienceCreate,
    WorkExperienceResponse,
)
from .company import (
    CompanyCreate,
    CompanyMemberCreate,
    CompanyMemberResponse,
    CompanyProfileResponse,
    CompanyResponse,
    CompanyUpdate,
)
from .dictionaries import (
    RoadmapTopicCreate,
    RoadmapTopicResponse,
    SoftSkillDictCreate,
    SoftSkillDictResponse,
)
from .interaction import (
    ChatMessageCreate,
    ChatMessageResponse,
    InvitationCreate,
    InvitationResponse,
    ResponseCreate,
    ResponseResponse,
    TaskCreate,
    TaskResponse,
)
from .questions import (
    QuestionCreate,
    QuestionOptionCreate,
    QuestionOptionResponse,
    QuestionResponse,
)
from .settings import (
    CandidateSettingsCreate,
    CandidateSettingsResponse,
    EmployerSettingsCreate,
    EmployerSettingsResponse,
)
from .vacancy import (
    VacancyCreate,
    VacancyHardSkillCreate,
    VacancyHardSkillResponse,
    VacancyResponse,
    VacancySoftSkillCreate,
    VacancySoftSkillResponse,
    VacancyUpdate,
)

__all__ = [
    # Candidate
    "CandidateProfileCreate",
    "CandidateProfileResponse",
    "CandidateProfileUpdate",
    "CandidateSearchResult",
    "CandidateSkillCreate",
    "CandidateSkillResponse",
    "CandidateSoftSkillCreate",
    "CandidateSoftSkillResponse",
    "EducationCreate",
    "EducationResponse",
    "FspParticipationCreate",
    "FspParticipationResponse",
    "ResumeCreate",
    "ResumeResponse",
    "TopicTestResponse",
    "WorkExperienceCreate",
    "WorkExperienceResponse",
    # Company
    "CompanyCreate",
    "CompanyMemberCreate",
    "CompanyMemberResponse",
    "CompanyProfileResponse",
    "CompanyResponse",
    "CompanyUpdate",
    # Dictionaries
    "RoadmapTopicCreate",
    "RoadmapTopicResponse",
    "SoftSkillDictCreate",
    "SoftSkillDictResponse",
    # Interaction
    "ChatMessageCreate",
    "ChatMessageResponse",
    "InvitationCreate",
    "InvitationResponse",
    "ResponseCreate",
    "ResponseResponse",
    "TaskCreate",
    "TaskResponse",
    # Questions
    "QuestionCreate",
    "QuestionOptionCreate",
    "QuestionOptionResponse",
    "QuestionResponse",
    # Settings
    "CandidateSettingsCreate",
    "CandidateSettingsResponse",
    "EmployerSettingsCreate",
    "EmployerSettingsResponse",
    # Vacancy
    "VacancyCreate",
    "VacancyHardSkillCreate",
    "VacancyHardSkillResponse",
    "VacancyResponse",
    "VacancySoftSkillCreate",
    "VacancySoftSkillResponse",
    "VacancyUpdate",
]
