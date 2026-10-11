# app/routers/admin.py
"""Роутер администратора: управление кандидатами, работодателями, справочниками."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from core.db import get_sync_session
from core.dependencies import require_role
from db.models.candidate import (
    Candidate,
    CandidateSkill,
    CandidateSoftSkill,
)
from db.models.company import Company
from db.models.dictionaries import SoftSkillDict
from db.models.enums import (
    CandidateStatus,
    CompanyIndustry,
    CompanySize,
    Direction,
    EmployerStatus,
    Grade,
)
from db.models.roadmap import RoadmapTopic, TopicTest  # ← TopicTest перенесён сюда
from db.models.vacancy import Vacancy

# Схемы
from schemas.admin import (
    AdminCandidateResponse,
    AdminDirectionResponse,
    AdminEmployerResponse,
    AdminGradeResponse,
    AdminSoftSkillResponse,
    AdminTopicResponse,
)
from schemas.candidate import CandidateProfileResponse
from schemas.dictionaries import RoadmapTopicResponse, SoftSkillDictResponse

router = APIRouter(prefix="/admin", tags=["admin"])


# ============================================================================
# 🔧 Вспомогательные функции
# ============================================================================
DIRECTIONS_META = {
    "frontend": {
        "label": "Frontend",
        "color": "#402FFF",
        "description": "Клиентская разработка",
    },
    "backend": {
        "label": "Backend",
        "color": "#52c41a",
        "description": "Серверная разработка",
    },
    "devops": {"label": "DevOps", "color": "#fa8c16", "description": "Инфраструктура"},
    "mobile": {
        "label": "Mobile",
        "color": "#13c2c2",
        "description": "Мобильная разработка",
    },
    "data": {
        "label": "Data Science",
        "color": "#722ed1",
        "description": "Анализ данных и ML",
    },
    "qa": {"label": "QA", "color": "#eb2f96", "description": "Тестирование"},
}

GRADES_META = {
    "junior": {
        "label": "Начинающий",
        "color": "#87d068",
        "threshold": 50,
        "description": "Опыт до 1 года",
    },
    "middle": {
        "label": "Продвинутый",
        "color": "#2db7f5",
        "threshold": 70,
        "description": "Опыт 1-3 года",
    },
    "senior": {
        "label": "Профессионал",
        "color": "#f50",
        "threshold": 85,
        "description": "Опыт 3+ лет",
    },
}


# ============================================================================
# 👥 Кандидаты
# ============================================================================
@router.get(
    "/candidates",
    response_model=list[AdminCandidateResponse],
    summary="Список кандидатов (админ)",
)
def get_candidates(
    request: Request,
    status_filter: CandidateStatus | None = None,
    search: str | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    query = select(Candidate).options(
        joinedload(Candidate.skills),
        joinedload(Candidate.responses),
        joinedload(Candidate.invitations),
    )
    if status_filter:
        query = query.where(Candidate.status == status_filter)
    if search:
        query = query.where(
            or_(
                Candidate.last_name.ilike(f"%{search}%"),
                Candidate.first_name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%"),
            )
        )

    candidates = (
        db.execute(query.order_by(Candidate.registered_at.desc()))
        .scalars()
        .unique()
        .all()
    )

    result = []
    for c in candidates:
        # Статистика
        tests_passed = (
            db.execute(
                select(func.count(TopicTest.id))
                .join(CandidateSkill, TopicTest.candidate_skill_id == CandidateSkill.id)
                .where(CandidateSkill.candidate_id == c.id, TopicTest.passed == True)
            ).scalar()
            or 0
        )

        result.append(
            AdminCandidateResponse(
                id=c.id,
                user_sub=c.user_sub or "",
                last_name=c.last_name,
                first_name=c.first_name,
                middle_name=c.middle_name,
                email=c.email or "",
                phone=c.phone,
                telegram=c.telegram,
                registered_at=c.registered_at or date.today(),
                last_active_at=c.last_active_at or date.today(),
                status=c.status.value
                if isinstance(c.status, CandidateStatus)
                else c.status,
                is_verified=c.is_verified,
                block_reason=c.block_reason,
                blocked_at=c.blocked_at,
                skills=[
                    {
                        "id": s.id,
                        "direction": s.direction.value
                        if isinstance(s.direction, Direction)
                        else s.direction,
                        "grade": s.grade.value
                        if isinstance(s.grade, Grade)
                        else s.grade,
                        "language": s.language,
                        "confidence": 0,
                    }
                    for s in (c.skills or [])
                ],
                total_tests_passed=tests_passed,
                total_responses=len(c.responses) if c.responses else 0,
                total_invitations=len(c.invitations) if c.invitations else 0,
                total_tasks=0,
            )
        )
    return result


@router.get(
    "/candidates/{candidate_id}",
    response_model=CandidateProfileResponse,
    summary="Детали кандидата (админ)",
)
def get_candidate_details(
    request: Request,
    candidate_id: int,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    candidate = db.execute(
        select(Candidate)
        .options(
            joinedload(Candidate.educations),
            joinedload(Candidate.work_experiences),
            joinedload(Candidate.candidate_soft_skills).joinedload(
                CandidateSoftSkill.soft_skill
            ),
            joinedload(Candidate.fsp_participations),
            joinedload(Candidate.skills),
            joinedload(Candidate.resumes),
        )
        .where(Candidate.id == candidate_id)
    ).scalar_one_or_none()

    if not candidate:
        raise HTTPException(status_code=404, detail="Кандидат не найден")

    return CandidateProfileResponse(
        id=candidate.id,
        user_sub=candidate.user_sub or "",
        last_name=candidate.last_name,
        first_name=candidate.first_name,
        middle_name=candidate.middle_name,
        phone=candidate.phone,
        email=candidate.email,
        telegram=candidate.telegram,
        about_me=candidate.about_me,
        educations=candidate.educations or [],
        work_experiences=candidate.work_experiences or [],
        soft_skills=[
            {
                "id": cs.id,
                "soft_skill_dict_id": cs.soft_skill_dict_id,
                "name": cs.soft_skill.name if cs.soft_skill else "",
            }
            for cs in (candidate.candidate_soft_skills or [])
        ],
        fsp_participations=candidate.fsp_participations or [],
        skills=candidate.skills or [],
        resumes=candidate.resumes or [],
        registered_at=candidate.registered_at,
        last_active_at=candidate.last_active_at,
        status=candidate.status.value
        if isinstance(candidate.status, CandidateStatus)
        else candidate.status,
        is_verified=candidate.is_verified,
    )


@router.put(
    "/candidates/{candidate_id}/verify",
    summary="Верифицировать/отозвать верификацию кандидата",
)
def toggle_candidate_verify(
    request: Request,
    candidate_id: int,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Кандидат не найден")

    candidate.is_verified = not candidate.is_verified
    if (
        candidate.is_verified
        and candidate.status == CandidateStatus.pending_verification
    ):
        candidate.status = CandidateStatus.active
    db.commit()
    return {
        "id": candidate.id,
        "is_verified": candidate.is_verified,
        "status": candidate.status.value,
    }


@router.put(
    "/candidates/{candidate_id}/block",
    summary="Заблокировать/разблокировать кандидата",
)
def toggle_candidate_block(
    request: Request,
    candidate_id: int,
    reason: str | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Кандидат не найден")

    if candidate.status == CandidateStatus.blocked:
        candidate.status = CandidateStatus.active
        candidate.block_reason = None
        candidate.blocked_at = None
    else:
        candidate.status = CandidateStatus.blocked
        candidate.block_reason = reason
        candidate.blocked_at = date.today()

    db.commit()
    return {
        "id": candidate.id,
        "status": candidate.status.value,
        "block_reason": candidate.block_reason,
        "blocked_at": candidate.blocked_at,
    }


# ============================================================================
# 🏢 Работодатели
# ============================================================================
@router.get(
    "/employers",
    response_model=list[AdminEmployerResponse],
    summary="Список работодателей (админ)",
)
def get_employers(
    request: Request,
    status_filter: EmployerStatus | None = None,
    search: str | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    query = select(Company).options(
        joinedload(Company.vacancies).joinedload(Vacancy.responses),
        joinedload(Company.members),
    )
    if status_filter:
        query = query.where(Company.status == status_filter)
    if search:
        query = query.where(Company.name.ilike(f"%{search}%"))

    companies = (
        db.execute(query.order_by(Company.registered_at.desc()))
        .scalars()
        .unique()
        .all()
    )

    result = []
    for c in companies:
        total_vacancies = len(c.vacancies) if c.vacancies else 0
        published = sum(
            1 for v in (c.vacancies or []) if v.status == VacancyStatus.published
        )
        total_responses = sum(len(v.responses) for v in (c.vacancies or []))

        result.append(
            AdminEmployerResponse(
                id=c.id,
                company_name=c.name,
                industry=c.industry.value
                if isinstance(c.industry, CompanyIndustry)
                else c.industry,
                size=c.size.value if isinstance(c.size, CompanySize) else c.size,
                email=c.email,
                phone=c.phone,
                website=c.website,
                registered_at=c.registered_at or date.today(),
                last_active_at=c.last_active_at or date.today(),
                status=c.status.value
                if isinstance(c.status, EmployerStatus)
                else c.status,
                is_verified=c.is_verified,
                block_reason=c.block_reason,
                blocked_at=c.blocked_at,
                total_vacancies=total_vacancies,
                published_vacancies=published,
                total_responses=total_responses,
                total_tasks=0,
                team_size=len(c.members) if c.members else 0,
            )
        )
    return result


@router.put(
    "/employers/{employer_id}/verify",
    summary="Верифицировать работодателя",
)
def toggle_employer_verify(
    request: Request,
    employer_id: int,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    company = db.get(Company, employer_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")

    company.is_verified = not company.is_verified
    if company.is_verified and company.status == EmployerStatus.pending_verification:
        company.status = EmployerStatus.active
    db.commit()
    return {"id": company.id, "is_verified": company.is_verified}


@router.put(
    "/employers/{employer_id}/block",
    summary="Заблокировать работодателя",
)
def toggle_employer_block(
    request: Request,
    employer_id: int,
    reason: str | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    company = db.get(Company, employer_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")

    if company.status == EmployerStatus.blocked:
        company.status = EmployerStatus.active
        company.block_reason = None
        company.blocked_at = None
    else:
        company.status = EmployerStatus.blocked
        company.block_reason = reason
        company.blocked_at = date.today()

    db.commit()
    return {"id": company.id, "status": company.status.value}


# ============================================================================
# 📚 Справочники
# ============================================================================
@router.get(
    "/dictionaries/directions",
    response_model=list[AdminDirectionResponse],
    summary="Список направлений",
)
def get_directions(
    request: Request,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    # Считаем количество тем по каждому направлению
    topics_count = db.execute(
        select(RoadmapTopic.direction, func.count(RoadmapTopic.id))
        .where(RoadmapTopic.is_active == True)
        .group_by(RoadmapTopic.direction)
    ).all()
    count_map = {
        d.value if isinstance(d, Direction) else d: cnt for d, cnt in topics_count
    }

    return [
        AdminDirectionResponse(
            key=key,
            label=meta["label"],
            color=meta["color"],
            description=meta["description"],
            is_active=True,
            topics_count=count_map.get(key, 0),
        )
        for key, meta in DIRECTIONS_META.items()
    ]


@router.get(
    "/dictionaries/grades",
    response_model=list[AdminGradeResponse],
    summary="Список грейдов",
)
def get_grades(
    request: Request,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    return [
        AdminGradeResponse(
            key=key,
            label=meta["label"],
            color=meta["color"],
            threshold=meta["threshold"],
            description=meta["description"],
        )
        for key, meta in GRADES_META.items()
    ]


@router.get(
    "/dictionaries/topics",
    response_model=list[AdminTopicResponse],
    summary="Список тем дорожной карты",
)
def get_topics(
    request: Request,
    direction: Direction | None = None,
    search: str | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    query = select(RoadmapTopic).where(RoadmapTopic.is_active == True)
    if direction:
        query = query.where(RoadmapTopic.direction == direction)
    if search:
        query = query.where(RoadmapTopic.title.ilike(f"%{search}%"))

    topics = (
        db.execute(query.order_by(RoadmapTopic.direction, RoadmapTopic.title))
        .scalars()
        .all()
    )

    result = []
    for t in topics:
        stats = db.execute(
            select(func.count(TopicTest.id), func.avg(TopicTest.best_score)).where(
                TopicTest.topic_id == t.id, TopicTest.attempts > 0
            )
        ).one()
        result.append(
            AdminTopicResponse(
                key=t.key,
                title=t.title,
                direction=t.direction.value
                if isinstance(t.direction, Direction)
                else t.direction,
                parent_key=t.parent.key if t.parent else None,
                tests_count=stats[0] or 0,
                avg_score=int(stats[1] or 0),
                is_active=t.is_active,
            )
        )
    return result


@router.post(
    "/dictionaries/topics",
    response_model=RoadmapTopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать тему",
)
def create_topic(
    request: Request,
    payload: RoadmapTopicResponse,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    topic = RoadmapTopic(
        key=payload.key,
        title=payload.title,
        direction=payload.direction,
        parent_id=payload.parent_id,
        is_active=True,
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)

    return RoadmapTopicResponse(
        id=topic.id,
        key=topic.key,
        title=topic.title,
        direction=topic.direction.value
        if isinstance(topic.direction, Direction)
        else topic.direction,
        parent_id=topic.parent_id,
        is_active=topic.is_active,
        children=[],
        tests_count=0,
        avg_score=0,
    )


@router.put(
    "/dictionaries/topics/{topic_id}",
    response_model=RoadmapTopicResponse,
    summary="Обновить тему",
)
def update_topic(
    request: Request,
    topic_id: int,
    payload: RoadmapTopicResponse,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    topic = db.get(RoadmapTopic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")

    topic.key = payload.key
    topic.title = payload.title
    topic.direction = payload.direction
    topic.parent_id = payload.parent_id
    topic.is_active = payload.is_active

    db.commit()
    db.refresh(topic)

    return RoadmapTopicResponse(
        id=topic.id,
        key=topic.key,
        title=topic.title,
        direction=topic.direction.value
        if isinstance(topic.direction, Direction)
        else topic.direction,
        parent_id=topic.parent_id,
        is_active=topic.is_active,
        children=[],
        tests_count=0,
        avg_score=0,
    )


@router.delete(
    "/dictionaries/topics/{topic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить тему",
)
def delete_topic(
    request: Request,
    topic_id: int,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    topic = db.get(RoadmapTopic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    db.delete(topic)
    db.commit()


@router.get(
    "/dictionaries/soft-skills",
    response_model=list[AdminSoftSkillResponse],
    summary="Список soft skills",
)
def get_soft_skills(
    request: Request,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    skills = (
        db.execute(select(SoftSkillDict).order_by(SoftSkillDict.name)).scalars().all()
    )

    result = []
    for s in skills:
        usage = (
            db.execute(
                select(func.count(CandidateSoftSkill.id)).where(
                    CandidateSoftSkill.soft_skill_dict_id == s.id
                )
            ).scalar()
            or 0
        )
        result.append(
            AdminSoftSkillResponse(
                id=s.id,
                name=s.name,
                category=s.category,
                usage_count=usage,
                is_active=s.is_active,
            )
        )
    return result


@router.post(
    "/dictionaries/soft-skills",
    response_model=SoftSkillDictResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать soft skill",
)
def create_soft_skill(
    request: Request,
    payload: SoftSkillDictResponse,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    skill = SoftSkillDict(name=payload.name, category=payload.category, is_active=True)
    db.add(skill)
    db.commit()
    db.refresh(skill)

    return SoftSkillDictResponse(
        id=skill.id,
        name=skill.name,
        category=skill.category,
        is_active=skill.is_active,
        usage_count=0,
    )


@router.put(
    "/dictionaries/soft-skills/{skill_id}",
    response_model=SoftSkillDictResponse,
    summary="Обновить soft skill",
)
def update_soft_skill(
    request: Request,
    skill_id: int,
    payload: SoftSkillDictResponse,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    skill = db.get(SoftSkillDict, skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Soft skill не найден")

    skill.name = payload.name
    skill.category = payload.category
    skill.is_active = payload.is_active

    db.commit()
    db.refresh(skill)

    usage = (
        db.execute(
            select(func.count(CandidateSoftSkill.id)).where(
                CandidateSoftSkill.soft_skill_dict_id == skill.id
            )
        ).scalar()
        or 0
    )

    return SoftSkillDictResponse(
        id=skill.id,
        name=skill.name,
        category=skill.category,
        is_active=skill.is_active,
        usage_count=usage,
    )


@router.delete(
    "/dictionaries/soft-skills/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить soft skill",
)
def delete_soft_skill(
    request: Request,
    skill_id: int,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("admins")),
):
    skill = db.get(SoftSkillDict, skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Soft skill не найден")
    db.delete(skill)
    db.commit()
