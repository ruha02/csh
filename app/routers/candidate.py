# app/routers/candidate.py
"""Роутер кандидата: анкета, навыки, ФСП, тесты, резюме, задания, вакансии, отклики, приглашения, настройки."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from core.db import get_sync_session
from db.models.candidate import (
    Candidate,
    CandidateSkill,
    CandidateSoftSkill,
    Education,
    FspParticipation,
    Resume,
    WorkExperience,
)
from db.models.dictionaries import SoftSkillDict
from db.models.roadmap import TopicTest
from db.models.settings import CandidateSettings
from schemas.candidate import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    CandidateSkillCreate,
    CandidateSkillResponse,
    CandidateSoftSkillCreate,
    CandidateSoftSkillResponse,
    EducationCreate,
    EducationResponse,
    FspParticipationResponse,
    ResumeCreate,
    ResumeResponse,
    TopicTestResponse,
    WorkExperienceCreate,
    WorkExperienceResponse,
)
from schemas.settings import CandidateSettingsCreate, CandidateSettingsResponse

router = APIRouter(prefix="/candidate", tags=["candidate"])


# ============================================================================
# 🔧 Зависимости
# ============================================================================
def get_user_sub(request: Request) -> str:
    """Получает user_sub из request.state (устанавливается middleware)."""
    user_sub = getattr(request.state, "user_sub", None)
    if not user_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user_sub


def _get_candidate_or_404(db: Session, user_sub: str) -> Candidate:
    """Получить кандидата по user_sub или 404."""
    candidate = db.execute(
        select(Candidate).where(Candidate.user_sub == user_sub)
    ).scalar_one_or_none()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль кандидата не найден. Создайте профиль сначала.",
        )
    return candidate


# ============================================================================
# 👤 Профиль кандидата
# ============================================================================
@router.get(
    "/profile",
    response_model=CandidateProfileResponse,
    summary="Получить профиль текущего кандидата",
)
def get_profile(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    """
    Возвращает полный профиль кандидата со всеми связанными данными:
    образование, опыт работы, soft skills, ФСП, навыки, резюме.
    """
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)

    # Обновляем last_active_at
    candidate.last_active_at = date.today()
    db.commit()
    db.refresh(candidate)

    return candidate


@router.put(
    "/profile",
    response_model=CandidateProfileResponse,
    summary="Обновить профиль кандидата",
)
def update_profile(
    request: Request,
    payload: CandidateProfileUpdate,
    db: Session = Depends(get_sync_session),
):
    """Обновляет только переданные поля профиля."""
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)

    db.commit()
    db.refresh(candidate)
    return candidate


# ============================================================================
# 💪 Навыки кандидата
# ============================================================================
@router.get(
    "/skills",
    response_model=list[CandidateSkillResponse],
    summary="Получить навыки кандидата",
)
def get_skills(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    """Возвращает список навыков кандидата с рассчитанной уверенностью."""
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    skills = (
        db.execute(
            select(CandidateSkill).where(CandidateSkill.candidate_id == candidate.id)
        )
        .scalars()
        .all()
    )

    result = []
    for skill in skills:
        # Рассчитываем confidence как средний балл по пройденным тестам
        tests = (
            db.execute(
                select(TopicTest).where(
                    TopicTest.candidate_skill_id == skill.id,
                    TopicTest.passed.is_(True),
                )
            )
            .scalars()
            .all()
        )

        if tests:
            confidence = round(sum(t.best_score for t in tests) / len(tests))
        else:
            confidence = 0

        result.append(
            CandidateSkillResponse(
                id=skill.id,
                candidate_id=skill.candidate_id,
                direction=skill.direction.value,
                grade=skill.grade.value,
                language=skill.language,
                confidence=confidence,
            )
        )
    return result


@router.post(
    "/skills",
    response_model=CandidateSkillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Добавить навык",
)
def create_skill(
    request: Request,
    payload: CandidateSkillCreate,
    db: Session = Depends(get_sync_session),
):
    """Добавляет новый навык кандидату."""
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)

    skill = CandidateSkill(
        candidate_id=candidate.id,
        direction=payload.direction,
        grade=payload.grade,
        language=payload.language,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    return CandidateSkillResponse(
        id=skill.id,
        candidate_id=skill.candidate_id,
        direction=skill.direction.value,
        grade=skill.grade.value,
        language=skill.language,
        confidence=0,
    )


@router.delete(
    "/skills/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить навык",
)
def delete_skill(
    request: Request,
    skill_id: int,
    db: Session = Depends(get_sync_session),
):
    """Удаляет навык и все связанные результаты тестов."""
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)

    skill = db.execute(
        select(CandidateSkill).where(
            CandidateSkill.id == skill_id,
            CandidateSkill.candidate_id == candidate.id,
        )
    ).scalar_one_or_none()

    if not skill:
        raise HTTPException(status_code=404, detail="Навык не найден")

    db.delete(skill)
    db.commit()


# ============================================================================
# 🎓 Образование
# ============================================================================
@router.get(
    "/educations",
    response_model=list[EducationResponse],
    summary="Получить образование",
)
def get_educations(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    return (
        db.execute(
            select(Education)
            .where(Education.candidate_id == candidate.id)
            .order_by(Education.start_year.desc())
        )
        .scalars()
        .all()
    )


@router.post(
    "/educations",
    response_model=EducationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Добавить образование",
)
def create_education(
    request: Request,
    payload: EducationCreate,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    edu = Education(candidate_id=candidate.id, **payload.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


# ============================================================================
# 💼 Опыт работы
# ============================================================================
@router.get(
    "/work-experiences",
    response_model=list[WorkExperienceResponse],
    summary="Получить опыт работы",
)
def get_work_experiences(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    return (
        db.execute(
            select(WorkExperience)
            .where(WorkExperience.candidate_id == candidate.id)
            .order_by(WorkExperience.start_date.desc())
        )
        .scalars()
        .all()
    )


@router.post(
    "/work-experiences",
    response_model=WorkExperienceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Добавить опыт работы",
)
def create_work_experience(
    request: Request,
    payload: WorkExperienceCreate,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    exp = WorkExperience(candidate_id=candidate.id, **payload.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


# ============================================================================
# 🌟 Soft skills
# ============================================================================
@router.get(
    "/soft-skills",
    response_model=list[CandidateSoftSkillResponse],
    summary="Получить soft skills кандидата",
)
def get_soft_skills(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    rows = (
        db.execute(
            select(CandidateSoftSkill)
            .options(joinedload(CandidateSoftSkill.soft_skill))
            .where(CandidateSoftSkill.candidate_id == candidate.id)
        )
        .scalars()
        .all()
    )

    return [
        CandidateSoftSkillResponse(
            id=cs.id,
            soft_skill_dict_id=cs.soft_skill_dict_id,
            name=cs.soft_skill.name if cs.soft_skill else "",
        )
        for cs in rows
    ]


@router.post(
    "/soft-skills",
    response_model=CandidateSoftSkillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Добавить soft skill",
)
def add_soft_skill(
    request: Request,
    payload: CandidateSoftSkillCreate,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)

    # Проверяем существование в справочнике
    dict_skill = db.get(SoftSkillDict, payload.soft_skill_dict_id)
    if not dict_skill:
        raise HTTPException(
            status_code=404, detail="Soft skill не найден в справочнике"
        )

    cs = CandidateSoftSkill(
        candidate_id=candidate.id,
        soft_skill_dict_id=payload.soft_skill_dict_id,
    )
    db.add(cs)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Этот soft skill уже добавлен")
    db.refresh(cs)

    return CandidateSoftSkillResponse(
        id=cs.id,
        soft_skill_dict_id=cs.soft_skill_dict_id,
        name=dict_skill.name,
    )


# ============================================================================
# 🏆 ФСП участия
# ============================================================================
@router.get(
    "/fsp",
    response_model=list[FspParticipationResponse],
    summary="Получить участия в ФСП",
)
def get_fsp_participations(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    """
    Данные ФСП приходят из внешней базы Федерации спортивного программирования.
    Здесь возвращаем записи, привязанные к кандидату.
    """
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    return (
        db.execute(
            select(FspParticipation)
            .where(FspParticipation.candidate_id == candidate.id)
            .order_by(FspParticipation.event_date.desc())
        )
        .scalars()
        .all()
    )


# ============================================================================
# 🧪 Тесты по темам
# ============================================================================
@router.get(
    "/tests",
    response_model=list[TopicTestResponse],
    summary="Получить результаты тестов по темам",
)
def get_topic_tests(
    request: Request,
    skill_id: int | None = None,
    db: Session = Depends(get_sync_session),
):
    """
    Возвращает результаты тестов кандидата.
    Если указан skill_id — фильтрует по навыку.
    """
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)

    # Получаем ID навыков кандидата
    candidate_skill_ids = (
        db.execute(
            select(CandidateSkill.id).where(CandidateSkill.candidate_id == candidate.id)
        )
        .scalars()
        .all()
    )

    if not candidate_skill_ids:
        return []

    query = (
        select(TopicTest)
        .options(joinedload(TopicTest.topic))
        .where(TopicTest.candidate_skill_id.in_(candidate_skill_ids))
    )
    if skill_id is not None:
        if skill_id not in candidate_skill_ids:
            raise HTTPException(status_code=404, detail="Навык не найден")
        query = query.where(TopicTest.candidate_skill_id == skill_id)

    rows = db.execute(query.order_by(TopicTest.id)).scalars().unique().all()

    return [
        TopicTestResponse(
            id=t.id,
            topic_id=t.topic_id,
            topic_key=t.topic.key if t.topic else "",
            topic_title=t.topic.title if t.topic else "",
            best_score=t.best_score,
            last_score=t.last_score,
            attempts=t.attempts,
            passed=t.passed,
            last_attempt_date=t.last_attempt_date,
            next_attempt_date=t.next_attempt_date,
            locked=t.locked,
        )
        for t in rows
    ]


# ============================================================================
# 📄 Резюме
# ============================================================================
@router.get(
    "/resumes",
    response_model=list[ResumeResponse],
    summary="Получить резюме кандидата",
)
def get_resumes(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    rows = (
        db.execute(
            select(Resume)
            .options(joinedload(Resume.skill))
            .where(Resume.candidate_id == candidate.id)
            .order_by(Resume.updated_at.desc())
        )
        .scalars()
        .unique()
        .all()
    )

    result = []
    for r in rows:
        direction = r.skill.direction.value if r.skill else None
        grade = r.skill.grade.value if r.skill else None

        # Рассчитываем confidence по тестам навыка
        confidence = 0
        if r.skill:
            tests = (
                db.execute(
                    select(TopicTest).where(
                        TopicTest.candidate_skill_id == r.skill.id,
                        TopicTest.passed.is_(True),
                    )
                )
                .scalars()
                .all()
            )
            if tests:
                confidence = round(sum(t.best_score for t in tests) / len(tests))

        result.append(
            ResumeResponse(
                id=r.id,
                candidate_id=r.candidate_id,
                title=r.title,
                skill_id=r.skill_id,
                salary_from=r.salary_from,
                salary_to=r.salary_to,
                currency=r.currency,
                description=r.description,
                created_at=r.created_at,
                updated_at=r.updated_at,
                direction=direction,
                grade=grade,
                confidence=confidence,
            )
        )
    return result


@router.post(
    "/resumes",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать резюме",
)
def create_resume(
    request: Request,
    payload: ResumeCreate,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    today = date.today()
    resume = Resume(
        candidate_id=candidate.id,
        **payload.model_dump(),
        created_at=today,
        updated_at=today,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    direction = None
    grade = None
    if resume.skill:
        direction = resume.skill.direction.value
        grade = resume.skill.grade.value

    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        title=resume.title,
        skill_id=resume.skill_id,
        salary_from=resume.salary_from,
        salary_to=resume.salary_to,
        currency=resume.currency,
        description=resume.description,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
        direction=direction,
        grade=grade,
        confidence=0,
    )


# ============================================================================
# ⚙️ Настройки
# ============================================================================
@router.get(
    "/settings",
    response_model=CandidateSettingsResponse,
    summary="Получить настройки кандидата",
)
def get_settings(
    request: Request,
    db: Session = Depends(get_sync_session),
):
    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    settings = db.execute(
        select(CandidateSettings).where(CandidateSettings.candidate_id == candidate.id)
    ).scalar_one_or_none()

    if not settings:
        # Создаём дефолтные настройки
        settings = CandidateSettings(
            candidate_id=candidate.id,
            notifications='{"channels":{"email":true,"telegram":true,"inApp":true},"events":{"newVacancies":true,"responseViewed":true,"newTask":true,"taskFeedback":true,"newInvitation":true,"invitationExpiring":true}}',
            privacy='{"profileVisibility":"all","hideCurrentEmployer":false,"showTestResults":true,"showFspResults":true}',
            integrations='{"github":{"connected":false},"telegram":{"connected":false},"habr":{"connected":false}}',
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    import json

    return CandidateSettingsResponse(
        id=settings.id,
        candidate_id=settings.candidate_id,
        notifications=json.loads(settings.notifications)
        if settings.notifications
        else None,
        privacy=json.loads(settings.privacy) if settings.privacy else None,
        integrations=json.loads(settings.integrations)
        if settings.integrations
        else None,
    )


@router.put(
    "/settings",
    response_model=CandidateSettingsResponse,
    summary="Обновить настройки кандидата",
)
def update_settings(
    request: Request,
    payload: CandidateSettingsCreate,
    db: Session = Depends(get_sync_session),
):
    import json

    user_sub = get_user_sub(request)
    candidate = _get_candidate_or_404(db, user_sub)
    settings = db.execute(
        select(CandidateSettings).where(CandidateSettings.candidate_id == candidate.id)
    ).scalar_one_or_none()

    if not settings:
        settings = CandidateSettings(candidate_id=candidate.id)
        db.add(settings)

    if payload.notifications is not None:
        settings.notifications = json.dumps(payload.notifications, ensure_ascii=False)
    if payload.privacy is not None:
        settings.privacy = json.dumps(payload.privacy, ensure_ascii=False)
    if payload.integrations is not None:
        settings.integrations = json.dumps(payload.integrations, ensure_ascii=False)

    db.commit()
    db.refresh(settings)

    return CandidateSettingsResponse(
        id=settings.id,
        candidate_id=settings.candidate_id,
        notifications=json.loads(settings.notifications)
        if settings.notifications
        else None,
        privacy=json.loads(settings.privacy) if settings.privacy else None,
        integrations=json.loads(settings.integrations)
        if settings.integrations
        else None,
    )
