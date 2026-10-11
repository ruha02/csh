"""Все enum для моделей."""

import enum


class Direction(str, enum.Enum):
    frontend = "frontend"
    backend = "backend"
    devops = "devops"
    mobile = "mobile"
    data = "data"
    qa = "qa"


class Grade(str, enum.Enum):
    junior = "junior"
    middle = "middle"
    senior = "senior"


class CandidateStatus(str, enum.Enum):
    active = "active"
    blocked = "blocked"
    pending_verification = "pending_verification"


class EmployerStatus(str, enum.Enum):
    active = "active"
    blocked = "blocked"
    pending_verification = "pending_verification"


class CompanyIndustry(str, enum.Enum):
    it = "it"
    finance = "finance"
    retail = "retail"
    manufacturing = "manufacturing"
    education = "education"
    healthcare = "healthcare"
    media = "media"
    consulting = "consulting"
    other = "other"


class CompanySize(str, enum.Enum):
    s1_10 = "1-10"
    s11_50 = "11-50"
    s51_200 = "51-200"
    s201_500 = "201-500"
    s501_1000 = "501-1000"
    s1000_plus = "1000+"


class MemberRole(str, enum.Enum):
    owner = "owner"
    hr = "hr"
    hiring_manager = "hiring_manager"
    viewer = "viewer"


class VacancyStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"
    closed = "closed"


class ResponseStatus(str, enum.Enum):
    pending = "pending"
    viewed = "viewed"
    accepted = "accepted"
    rejected = "rejected"


class EmployerResponseStatus(str, enum.Enum):
    new = "new"
    viewed = "viewed"
    shortlisted = "shortlisted"
    rejected = "rejected"
    task_sent = "task_sent"


class InvitationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"


class TaskSource(str, enum.Enum):
    employer = "employer"
    ai = "ai"


class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    submitted = "submitted"
    evaluated = "evaluated"


class TaskResult(str, enum.Enum):
    accepted = "accepted"
    rejected = "rejected"


class FspResult(str, enum.Enum):
    first_place = "first_place"
    second_place = "second_place"
    third_place = "third_place"
    participation = "participation"


class ParticipationType(str, enum.Enum):
    individual = "individual"
    team = "team"


class TeamRole(str, enum.Enum):
    backend = "backend"
    frontend = "frontend"
    designer = "designer"
    project_manager = "project_manager"
    analyst = "analyst"
    qa = "qa"
    other = "other"


class ChatSender(str, enum.Enum):
    candidate = "candidate"
    employer = "employer"


class QuestionType(str, enum.Enum):
    single = "single"
    multiple = "multiple"
    text = "text"
