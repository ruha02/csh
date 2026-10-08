
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.db import get_sync_session
from core.dependencies import get_current_user
from core.rbac import require_roles
from db.models.candidate import Candidate, SoftSkill, WorkExperience
from schemas.candidate import CandidateCreate, CandidateResponse, CandidateUpdate

router = APIRouter(prefix="/candidate", tags=["candidate"])


@router.get("/profile", response_model=CandidateResponse)
def get_profile(
    current_user: dict = Depends(get_current_user),
    roles: set = Depends(require_roles(["candidats"])),
    session: Session = Depends(get_sync_session),
):
    """Получить анкету текущего кандидата."""
    user_sub = current_user["sub"]
    candidate = session.query(Candidate).filter(Candidate.user_sub == user_sub).first()

    if not candidate:
        # Создаём профиль с данными из токена Keycloak
        candidate = Candidate(
            user_sub=user_sub,
            last_name=current_user.get("family_name", ""),
            first_name=current_user.get("given_name", ""),
            middle_name="",
        )
        session.add(candidate)
        session.commit()
        session.refresh(candidate)

    return candidate


@router.post("/profile", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_data: CandidateCreate,
    current_user: dict = Depends(get_current_user),
    roles: set = Depends(require_roles(["candidats"])),
    session: Session = Depends(get_sync_session),
):
    """Создать анкету кандидата."""
    user_sub = current_user["sub"]

    existing = session.query(Candidate).filter(Candidate.user_sub == user_sub).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists. Use PUT to update.",
        )

    candidate = Candidate(
        user_sub=user_sub,
        last_name=profile_data.last_name,
        first_name=profile_data.first_name,
        middle_name=profile_data.middle_name,
        phone=profile_data.phone,
        email=profile_data.email,
        telegram=profile_data.telegram,
        about_me=profile_data.about_me,
    )
    session.add(candidate)
    session.flush()

    # Добавляем опыт работы
    for exp in profile_data.work_experiences:
        work_exp = WorkExperience(
            candidate_id=candidate.id,
            start_date=exp.start_date,
            end_date=exp.end_date,
            is_current=exp.is_current,
            company=exp.company,
            position=exp.position,
            description=exp.description,
        )
        session.add(work_exp)

    # Добавляем софт-скиллы
    for skill_name in profile_data.soft_skills:
        skill = SoftSkill(
            candidate_id=candidate.id,
            name=skill_name,
        )
        session.add(skill)

    session.commit()
    session.refresh(candidate)

    return candidate


@router.put("/profile", response_model=CandidateResponse)
def update_profile(
    profile_data: CandidateUpdate,
    current_user: dict = Depends(get_current_user),
    roles: set = Depends(require_roles(["candidats"])),
    session: Session = Depends(get_sync_session),
):
    """Обновить анкету кандидата."""
    user_sub = current_user["sub"]
    candidate = session.query(Candidate).filter(Candidate.user_sub == user_sub).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Use POST to create.",
        )

    # Обновляем основные поля
    candidate.last_name = profile_data.last_name
    candidate.first_name = profile_data.first_name
    candidate.middle_name = profile_data.middle_name
    candidate.phone = profile_data.phone
    candidate.email = profile_data.email
    candidate.telegram = profile_data.telegram
    candidate.about_me = profile_data.about_me

    # Обновляем опыт работы (полная замена)
    session.query(WorkExperience).filter(WorkExperience.candidate_id == candidate.id).delete()
    for exp in profile_data.work_experiences:
        work_exp = WorkExperience(
            candidate_id=candidate.id,
            start_date=exp.start_date,
            end_date=exp.end_date,
            is_current=exp.is_current,
            company=exp.company,
            position=exp.position,
            description=exp.description,
        )
        session.add(work_exp)

    # Обновляем софт-скиллы (полная замена)
    session.query(SoftSkill).filter(SoftSkill.candidate_id == candidate.id).delete()
    for skill_name in profile_data.soft_skills:
        skill = SoftSkill(
            candidate_id=candidate.id,
            name=skill_name,
        )
        session.add(skill)

    session.commit()
    session.refresh(candidate)

    return candidate
