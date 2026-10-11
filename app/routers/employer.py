# app/routers/employer.py
"""Роутер работодателя: профиль компании, вакансии, отклики, приглашения, задания, настройки."""

import json
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from core.db import get_sync_session
from core.dependencies import get_user_sub, require_role
from db.models.candidate import Candidate, CandidateSoftSkill
from db.models.company import Company, CompanyMember
from db.models.enums import (
    ChatSender,
    CompanyIndustry,
    CompanySize,
    Direction,
    EmployerStatus,
    Grade,
    InvitationStatus,
    MemberRole,
    ResponseStatus,
    TaskResult,
    TaskSource,
    TaskStatus,
    VacancyStatus,
)
from db.models.interaction import ChatMessage, Invitation, Response, Task
from db.models.settings import EmployerSettings
from db.models.vacancy import Vacancy, VacancyHardSkill, VacancySoftSkill
from schemas.candidate import (
    CandidateSearchResult,
    CandidateSkillResponse,
)
from schemas.company import (
    CompanyMemberResponse,
    CompanyProfileResponse,
    CompanyResponse,
    CompanyUpdate,
)
from schemas.interaction import (
    ChatMessageCreate,
    ChatMessageResponse,
    InvitationCreate,
    InvitationResponse,
    ResponseResponse,
    TaskCreate,
    TaskResponse,
)
from schemas.settings import EmployerSettingsCreate, EmployerSettingsResponse
from schemas.vacancy import (
    VacancyCreate,
    VacancyHardSkillResponse,
    VacancyResponse,
    VacancySoftSkillResponse,
    VacancyUpdate,
)

router = APIRouter(prefix="/employer", tags=["employer"])


# ============================================================================
# 🔧 Вспомогательные функции
# ============================================================================
def _get_company_or_404(db: Session, user_sub: str) -> Company:
    company = db.execute(
        select(Company).where(Company.user_sub == user_sub)
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль компании не найден. Создайте профиль компании.",
        )
    return company


def _get_vacancy_or_404(db: Session, vacancy_id: int, company_id: int) -> Vacancy:
    vacancy = db.execute(
        select(Vacancy).where(
            Vacancy.id == vacancy_id,
            Vacancy.company_id == company_id,
        )
    ).scalar_one_or_none()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")
    return vacancy


def _serialize_vacancy(v: Vacancy) -> VacancyResponse:
    hard_skills = [
        VacancyHardSkillResponse(
            id=hs.id,
            topic_id=hs.topic_id,
            required_percent=hs.required_percent,
            topic_key=hs.topic.key if hs.topic else "",
            topic_title=hs.topic.title if hs.topic else "",
        )
        for hs in v.hard_skills
    ]
    soft_skills = [
        VacancySoftSkillResponse(
            id=ss.id,
            soft_skill_dict_id=ss.soft_skill_dict_id,
            name=ss.soft_skill.name if ss.soft_skill else "",
        )
        for ss in v.soft_skills
    ]
    return VacancyResponse(
        id=v.id,
        company_id=v.company_id,
        title=v.title,
        direction=v.direction.value
        if isinstance(v.direction, Direction)
        else v.direction,
        grade=v.grade.value if isinstance(v.grade, Grade) else v.grade,
        description=v.description,
        salary_from=v.salary_from,
        salary_to=v.salary_to,
        currency=v.currency,
        location=v.location,
        is_remote=v.is_remote,
        status=v.status.value if isinstance(v.status, VacancyStatus) else v.status,
        published_at=v.published_at,
        deadline=v.deadline,
        created_at=v.created_at,
        updated_at=v.updated_at,
        hard_skills=hard_skills,
        soft_skills=soft_skills,
        responses_count=len(v.responses) if v.responses else 0,
        viewed_count=0,
    )


# ============================================================================
# 🏢 Профиль компании
# ============================================================================
@router.get(
    "/company-profile",
    response_model=CompanyProfileResponse,
    summary="Получить профиль компании",
)
def get_company_profile(
    request: Request,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    members = (
        db.execute(select(CompanyMember).where(CompanyMember.company_id == company.id))
        .scalars()
        .all()
    )

    return CompanyProfileResponse(
        id=company.id,
        user_sub=company.user_sub,
        name=company.name,
        description=company.description,
        logo_url=company.logo_url,
        website=company.website,
        email=company.email,
        phone=company.phone,
        address=company.address,
        industry=company.industry.value
        if isinstance(company.industry, CompanyIndustry)
        else company.industry,
        size=company.size.value
        if isinstance(company.size, CompanySize)
        else company.size,
        founded_year=company.founded_year,
        about=company.about,
        social_links=json.loads(company.social_links) if company.social_links else None,
        benefits=json.loads(company.benefits) if company.benefits else None,
        technologies=json.loads(company.technologies) if company.technologies else None,
        members=[
            CompanyMemberResponse(
                id=m.id,
                company_id=m.company_id,
                user_sub=m.user_sub,
                role=m.role.value if isinstance(m.role, MemberRole) else m.role,
                joined_at=m.joined_at,
            )
            for m in members
        ],
        registered_at=company.registered_at,
        last_active_at=company.last_active_at,
        status=company.status.value
        if isinstance(company.status, EmployerStatus)
        else company.status,
        is_verified=company.is_verified,
    )


@router.put(
    "/company-profile",
    response_model=CompanyResponse,
    summary="Обновить профиль компании",
)
def update_company_profile(
    request: Request,
    payload: CompanyUpdate,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in ("social_links", "benefits", "technologies") and isinstance(
            value, (dict, list)
        ):
            value = json.dumps(value, ensure_ascii=False)
        setattr(company, field, value)

    company.updated_at = date.today()
    db.commit()
    db.refresh(company)

    return CompanyResponse(
        id=company.id,
        user_sub=company.user_sub,
        name=company.name,
        description=company.description,
        email=company.email,
        phone=company.phone,
        website=company.website,
        address=company.address,
        industry=company.industry.value
        if isinstance(company.industry, CompanyIndustry)
        else company.industry,
        size=company.size.value
        if isinstance(company.size, CompanySize)
        else company.size,
        founded_year=company.founded_year,
        about=company.about,
        logo_url=company.logo_url,
        social_links=json.loads(company.social_links) if company.social_links else None,
        benefits=json.loads(company.benefits) if company.benefits else None,
        technologies=json.loads(company.technologies) if company.technologies else None,
        registered_at=company.registered_at,
        last_active_at=company.last_active_at,
        status=company.status.value
        if isinstance(company.status, EmployerStatus)
        else company.status,
        is_verified=company.is_verified,
    )


# ============================================================================
# 💼 Вакансии
# ============================================================================
@router.get(
    "/vacancies",
    response_model=list[VacancyResponse],
    summary="Получить вакансии компании",
)
def get_vacancies(
    request: Request,
    status_filter: VacancyStatus | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    query = (
        select(Vacancy)
        .options(
            joinedload(Vacancy.hard_skills).joinedload(VacancyHardSkill.topic),
            joinedload(Vacancy.soft_skills).joinedload(VacancySoftSkill.soft_skill),
            joinedload(Vacancy.responses),
        )
        .where(Vacancy.company_id == company.id)
    )
    if status_filter:
        query = query.where(Vacancy.status == status_filter)

    vacancies = (
        db.execute(query.order_by(Vacancy.created_at.desc())).scalars().unique().all()
    )
    return [_serialize_vacancy(v) for v in vacancies]


@router.post(
    "/vacancies",
    response_model=VacancyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать вакансию",
)
def create_vacancy(
    request: Request,
    payload: VacancyCreate,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    today = date.today()
    vacancy = Vacancy(
        company_id=company.id,
        title=payload.title,
        direction=payload.direction,
        grade=payload.grade,
        description=payload.description,
        salary_from=payload.salary_from,
        salary_to=payload.salary_to,
        currency=payload.currency,
        location=payload.location,
        is_remote=payload.is_remote,
        deadline=payload.deadline,
        created_at=today,
        updated_at=today,
    )
    db.add(vacancy)
    db.flush()

    # Hard skills
    for hs in payload.hard_skills:
        db.add(
            VacancyHardSkill(
                vacancy_id=vacancy.id,
                topic_id=hs.topic_id,
                required_percent=hs.required_percent,
            )
        )

    # Soft skills
    for ss in payload.soft_skills:
        db.add(
            VacancySoftSkill(
                vacancy_id=vacancy.id, soft_skill_dict_id=ss.soft_skill_dict_id
            )
        )

    db.commit()
    db.refresh(vacancy)

    # Перезагружаем с relationships
    vacancy = db.execute(
        select(Vacancy)
        .options(
            joinedload(Vacancy.hard_skills).joinedload(VacancyHardSkill.topic),
            joinedload(Vacancy.soft_skills).joinedload(VacancySoftSkill.soft_skill),
        )
        .where(Vacancy.id == vacancy.id)
    ).scalar_one()

    return _serialize_vacancy(vacancy)


@router.get(
    "/vacancies/{vacancy_id}",
    response_model=VacancyResponse,
    summary="Получить вакансию по ID",
)
def get_vacancy(
    request: Request,
    vacancy_id: int,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)
    vacancy = _get_vacancy_or_404(db, vacancy_id, company.id)

    vacancy = db.execute(
        select(Vacancy)
        .options(
            joinedload(Vacancy.hard_skills).joinedload(VacancyHardSkill.topic),
            joinedload(Vacancy.soft_skills).joinedload(VacancySoftSkill.soft_skill),
            joinedload(Vacancy.responses),
        )
        .where(Vacancy.id == vacancy.id)
    ).scalar_one()

    return _serialize_vacancy(vacancy)


@router.put(
    "/vacancies/{vacancy_id}",
    response_model=VacancyResponse,
    summary="Обновить вакансию",
)
def update_vacancy(
    request: Request,
    vacancy_id: int,
    payload: VacancyUpdate,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)
    vacancy = _get_vacancy_or_404(db, vacancy_id, company.id)

    update_data = payload.model_dump(exclude_unset=True)
    hard_skills_data = update_data.pop("hard_skills", None)
    soft_skills_data = update_data.pop("soft_skills", None)

    for field, value in update_data.items():
        setattr(vacancy, field, value)

    vacancy.updated_at = date.today()

    # Обновляем hard skills если переданы
    if hard_skills_data is not None:
        db.execute(
            select(VacancyHardSkill).where(VacancyHardSkill.vacancy_id == vacancy.id)
        ).scalars().all()
        for hs in (
            db.execute(
                select(VacancyHardSkill).where(
                    VacancyHardSkill.vacancy_id == vacancy.id
                )
            )
            .scalars()
            .all()
        ):
            db.delete(hs)
        db.flush()
        for hs in hard_skills_data:
            db.add(
                VacancyHardSkill(
                    vacancy_id=vacancy.id,
                    topic_id=hs.topic_id,
                    required_percent=hs.required_percent,
                )
            )

    # Обновляем soft skills если переданы
    if soft_skills_data is not None:
        for ss in (
            db.execute(
                select(VacancySoftSkill).where(
                    VacancySoftSkill.vacancy_id == vacancy.id
                )
            )
            .scalars()
            .all()
        ):
            db.delete(ss)
        db.flush()
        for ss in soft_skills_data:
            db.add(
                VacancySoftSkill(
                    vacancy_id=vacancy.id, soft_skill_dict_id=ss.soft_skill_dict_id
                )
            )

    db.commit()
    db.refresh(vacancy)

    vacancy = db.execute(
        select(Vacancy)
        .options(
            joinedload(Vacancy.hard_skills).joinedload(VacancyHardSkill.topic),
            joinedload(Vacancy.soft_skills).joinedload(VacancySoftSkill.soft_skill),
        )
        .where(Vacancy.id == vacancy.id)
    ).scalar_one()

    return _serialize_vacancy(vacancy)


@router.delete(
    "/vacancies/{vacancy_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить вакансию",
)
def delete_vacancy(
    request: Request,
    vacancy_id: int,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)
    vacancy = _get_vacancy_or_404(db, vacancy_id, company.id)

    db.delete(vacancy)
    db.commit()


# ============================================================================
# 📨 Отклики на вакансии компании
# ============================================================================
@router.get(
    "/responses",
    response_model=list[ResponseResponse],
    summary="Получить отклики на вакансии компании",
)
def get_responses(
    request: Request,
    vacancy_id: int | None = None,
    status_filter: ResponseStatus | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    query = (
        select(Response)
        .options(
            joinedload(Response.messages),
            joinedload(Response.vacancy),
            joinedload(Response.candidate),
        )
        .join(Vacancy, Response.vacancy_id == Vacancy.id)
        .where(Vacancy.company_id == company.id)
    )
    if vacancy_id:
        query = query.where(Response.vacancy_id == vacancy_id)
    if status_filter:
        query = query.where(Response.status == status_filter)

    responses = (
        db.execute(query.order_by(Response.created_at.desc())).scalars().unique().all()
    )

    result = []
    for r in responses:
        result.append(
            ResponseResponse(
                id=r.id,
                vacancy_id=r.vacancy_id,
                candidate_id=r.candidate_id,
                resume_id=r.resume_id,
                cover_letter=r.cover_letter,
                status=r.status.value
                if isinstance(r.status, ResponseStatus)
                else r.status,
                task_id=r.task_id,
                created_at=r.created_at,
                viewed_at=r.viewed_at,
                responded_at=r.responded_at,
                comment=r.comment,
                messages=[
                    ChatMessageResponse(
                        id=m.id,
                        response_id=m.response_id,
                        invitation_id=m.invitation_id,
                        sender=m.sender.value
                        if isinstance(m.sender, ChatSender)
                        else m.sender,
                        text=m.text,
                        timestamp=m.timestamp,
                    )
                    for m in (r.messages or [])
                ],
            )
        )
    return result


@router.put(
    "/responses/{response_id}/status",
    response_model=ResponseResponse,
    summary="Изменить статус отклика",
)
def update_response_status(
    request: Request,
    response_id: int,
    new_status: ResponseStatus,
    comment: str | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    response = db.execute(
        select(Response)
        .join(Vacancy, Response.vacancy_id == Vacancy.id)
        .where(Response.id == response_id, Vacancy.company_id == company.id)
    ).scalar_one_or_none()

    if not response:
        raise HTTPException(status_code=404, detail="Отклик не найден")

    response.status = new_status
    if comment:
        response.comment = comment
    if new_status == ResponseStatus.viewed and not response.viewed_at:
        response.viewed_at = datetime.utcnow()

    db.commit()
    db.refresh(response)

    return ResponseResponse(
        id=response.id,
        vacancy_id=response.vacancy_id,
        candidate_id=response.candidate_id,
        resume_id=response.resume_id,
        cover_letter=response.cover_letter,
        status=response.status.value
        if isinstance(response.status, ResponseStatus)
        else response.status,
        task_id=response.task_id,
        created_at=response.created_at,
        viewed_at=response.viewed_at,
        responded_at=response.responded_at,
        comment=response.comment,
        messages=[],
    )


@router.post(
    "/responses/{response_id}/messages",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Отправить сообщение в чате отклика",
)
def send_response_message(
    request: Request,
    response_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    response = db.execute(
        select(Response)
        .join(Vacancy, Response.vacancy_id == Vacancy.id)
        .where(Response.id == response_id, Vacancy.company_id == company.id)
    ).scalar_one_or_none()

    if not response:
        raise HTTPException(status_code=404, detail="Отклик не найден")

    msg = ChatMessage(
        response_id=response.id,
        sender=ChatSender.employer,
        text=payload.text,
        timestamp=datetime.utcnow(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return ChatMessageResponse(
        id=msg.id,
        response_id=msg.response_id,
        invitation_id=msg.invitation_id,
        sender=msg.sender.value if isinstance(msg.sender, ChatSender) else msg.sender,
        text=msg.text,
        timestamp=msg.timestamp,
    )


# ============================================================================
#  Приглашения
# ============================================================================
@router.post(
    "/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Отправить приглашение кандидату",
)
def create_invitation(
    request: Request,
    payload: InvitationCreate,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    # Проверяем, что вакансия принадлежит компании
    vacancy = db.execute(
        select(Vacancy).where(
            Vacancy.id == payload.vacancy_id, Vacancy.company_id == company.id
        )
    ).scalar_one_or_none()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")

    # Проверяем, что кандидат существует
    candidate = db.get(Candidate, payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Кандидат не найден")

    invitation = Invitation(
        vacancy_id=payload.vacancy_id,
        candidate_id=payload.candidate_id,
        resume_id=payload.resume_id,
        description=payload.description,
        expires_at=payload.expires_at,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    return InvitationResponse(
        id=invitation.id,
        vacancy_id=invitation.vacancy_id,
        candidate_id=invitation.candidate_id,
        resume_id=invitation.resume_id,
        description=invitation.description,
        status=invitation.status.value
        if isinstance(invitation.status, InvitationStatus)
        else invitation.status,
        task_id=invitation.task_id,
        created_at=invitation.created_at,
        expires_at=invitation.expires_at,
        responded_at=invitation.responded_at,
        rejection_reason=invitation.rejection_reason,
        messages=[],
    )


@router.get(
    "/invitations",
    response_model=list[InvitationResponse],
    summary="Получить приглашения, отправленные компанией",
)
def get_invitations(
    request: Request,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    invitations = (
        db.execute(
            select(Invitation)
            .join(Vacancy, Invitation.vacancy_id == Vacancy.id)
            .where(Vacancy.company_id == company.id)
            .order_by(Invitation.created_at.desc())
        )
        .scalars()
        .all()
    )

    return [
        InvitationResponse(
            id=i.id,
            vacancy_id=i.vacancy_id,
            candidate_id=i.candidate_id,
            resume_id=i.resume_id,
            description=i.description,
            status=i.status.value
            if isinstance(i.status, InvitationStatus)
            else i.status,
            task_id=i.task_id,
            created_at=i.created_at,
            expires_at=i.expires_at,
            responded_at=i.responded_at,
            rejection_reason=i.rejection_reason,
            messages=[],
        )
        for i in invitations
    ]


# ============================================================================
#  Тестовые задания от работодателя
# ============================================================================
@router.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать тестовое задание",
)
def create_task(
    request: Request,
    payload: TaskCreate,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    task = Task(
        title=payload.title,
        employer_name=company.name,
        source=TaskSource.employer,
        description=payload.description,
        direction=payload.direction,
        grade=payload.grade,
        deadline=payload.deadline,
        received_at=datetime.utcnow(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return TaskResponse(
        id=task.id,
        vacancy_id=task.vacancy_id,
        resume_id=task.resume_id,
        response_id=task.response_id,
        title=task.title,
        employer_name=task.employer_name,
        source=task.source.value
        if isinstance(task.source, TaskSource)
        else task.source,
        description=task.description,
        direction=task.direction.value
        if isinstance(task.direction, Direction)
        else task.direction,
        grade=task.grade.value if isinstance(task.grade, Grade) else task.grade,
        status=task.status.value
        if isinstance(task.status, TaskStatus)
        else task.status,
        result=task.result.value
        if isinstance(task.result, TaskResult)
        else task.result,
        comment=task.comment,
        solution_url=task.solution_url,
        solution_file_name=task.solution_file_name,
        is_public=task.is_public,
        received_at=task.received_at,
        deadline=task.deadline,
        accepted_at=task.accepted_at,
        submitted_at=task.submitted_at,
        evaluated_at=task.evaluated_at,
        ai_generated_at=task.ai_generated_at,
    )


@router.get(
    "/tasks",
    response_model=list[TaskResponse],
    summary="Получить задания, созданные компанией",
)
def get_tasks(
    request: Request,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    tasks = (
        db.execute(
            select(Task)
            .join(Vacancy, Task.vacancy_id == Vacancy.id, isouter=True)
            .where(
                or_(
                    Vacancy.company_id == company.id, Task.employer_name == company.name
                )
            )
            .order_by(Task.received_at.desc())
        )
        .scalars()
        .all()
    )

    return [
        TaskResponse(
            id=t.id,
            vacancy_id=t.vacancy_id,
            resume_id=t.resume_id,
            response_id=t.response_id,
            title=t.title,
            employer_name=t.employer_name,
            source=t.source.value if isinstance(t.source, TaskSource) else t.source,
            description=t.description,
            direction=t.direction.value
            if isinstance(t.direction, Direction)
            else t.direction,
            grade=t.grade.value if isinstance(t.grade, Grade) else t.grade,
            status=t.status.value if isinstance(t.status, TaskStatus) else t.status,
            result=t.result.value if isinstance(t.result, TaskResult) else t.result,
            comment=t.comment,
            solution_url=t.solution_url,
            solution_file_name=t.solution_file_name,
            is_public=t.is_public,
            received_at=t.received_at,
            deadline=t.deadline,
            accepted_at=t.accepted_at,
            submitted_at=t.submitted_at,
            evaluated_at=t.evaluated_at,
            ai_generated_at=t.ai_generated_at,
        )
        for t in tasks
    ]


# ============================================================================
# 🔍 Поиск кандидатов
# ============================================================================
@router.get(
    "/candidates",
    response_model=list[CandidateSearchResult],
    summary="Поиск кандидатов",
)
def search_candidates(
    request: Request,
    direction: Direction | None = None,
    grade: Grade | None = None,
    search: str | None = None,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    """Поиск кандидатов с фильтрацией по направлению, грейду и тексту."""
    query = (
        select(Candidate)
        .options(
            joinedload(Candidate.skills),
            joinedload(Candidate.candidate_soft_skills).joinedload(
                CandidateSoftSkill.soft_skill
            ),
            joinedload(Candidate.educations),
            joinedload(Candidate.work_experiences),
            joinedload(Candidate.resumes),
            joinedload(Candidate.fsp_participations),
        )
        .where(Candidate.status == "active", Candidate.is_verified == True)
    )

    if search:
        query = query.where(
            or_(
                Candidate.last_name.ilike(f"%{search}%"),
                Candidate.first_name.ilike(f"%{search}%"),
                Candidate.about_me.ilike(f"%{search}%"),
            )
        )

    candidates = db.execute(query).scalars().unique().all()

    result = []
    for c in candidates:
        # Фильтр по направлению
        if direction:
            c.skills = [s for s in (c.skills or []) if s.direction == direction]
            if not c.skills:
                continue

        # Фильтр по грейду
        if grade:
            c.skills = [s for s in (c.skills or []) if s.grade == grade]
            if not c.skills:
                continue

        # Вычисляем опыт работы
        total_years = 0
        current_company = None
        current_position = None
        if c.work_experiences:
            for exp in c.work_experiences:
                if exp.is_current:
                    current_company = exp.company
                    current_position = exp.position
                start = exp.start_date
                end = exp.end_date or date.today()
                total_years += (end - start).days // 365

        # Зарплатные ожидания из резюме
        salary_from = None
        salary_to = None
        currency = "RUB"
        is_remote = False
        if c.resumes:
            resume = c.resumes[0]
            salary_from = resume.salary_from
            salary_to = resume.salary_to
            currency = resume.currency or "RUB"

        # Soft skills
        soft_skills = [
            cs.soft_skill.name
            for cs in (c.candidate_soft_skills or [])
            if cs.soft_skill
        ]

        # Topic tests — собираем по всем навыкам
        topic_tests = []
        for skill in c.skills or []:
            tests = (
                db.execute(
                    select(TopicTest).where(TopicTest.candidate_skill_id == skill.id)
                )
                .scalars()
                .all()
            )
            for t in tests:
                topic_tests.append(
                    {
                        "topic_key": t.topic.key if t.topic else "",
                        "best_score": t.best_score,
                    }
                )

        # FSP achievements
        fsp_achievements = [
            {
                "event_name": f.event_name,
                "result": f.result.value if isinstance(f.result, str) else f.result,
                "event_date": f.event_date.isoformat() if f.event_date else None,
            }
            for f in (c.fsp_participations or [])
        ]

        # Education
        education = [
            {
                "institution": e.institution,
                "specialty": e.specialty,
                "end_year": e.end_year,
            }
            for e in (c.educations or [])
        ]

        result.append(
            CandidateSearchResult(
                id=c.id,
                user_sub=c.user_sub,
                last_name=c.last_name,
                first_name=c.first_name,
                middle_name=c.middle_name,
                email=c.email,
                phone=c.phone,
                telegram=c.telegram,
                about_me=c.about_me,
                skills=[
                    CandidateSkillResponse(
                        id=s.id,
                        candidate_id=s.candidate_id,
                        direction=s.direction.value
                        if isinstance(s.direction, Direction)
                        else s.direction,
                        grade=s.grade.value if isinstance(s.grade, Grade) else s.grade,
                        language=s.language,
                        confidence=0,
                    )
                    for s in (c.skills or [])
                ],
                topic_tests=topic_tests,
                total_experience_years=total_years,
                current_company=current_company,
                current_position=current_position,
                salary_expectation_from=salary_from,
                salary_expectation_to=salary_to,
                currency=currency,
                location=None,
                is_remote_available=is_remote,
                is_looking_for_job=True,
                last_active_at=c.last_active_at,
                soft_skills=soft_skills,
                education=education,
                fsp_achievements=fsp_achievements,
            )
        )

    return result


# ============================================================================
# ⚙️ Настройки работодателя
# ============================================================================
@router.get(
    "/settings",
    response_model=EmployerSettingsResponse,
    summary="Получить настройки работодателя",
)
def get_settings(
    request: Request,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    settings = db.execute(
        select(EmployerSettings).where(EmployerSettings.company_id == company.id)
    ).scalar_one_or_none()

    if not settings:
        settings = EmployerSettings(
            company_id=company.id,
            notifications='{"channels":{"email":true,"telegram":true,"inApp":true},"events":{"newResponse":true}}',
            vacancy_defaults='{"defaultDeadlineDays":30,"defaultFormat":"hybrid","showSalary":true}',
            privacy='{"companyVisibility":"public","showContactEmail":true}',
            integrations="{}",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return EmployerSettingsResponse(
        id=settings.id,
        company_id=settings.company_id,
        notifications=json.loads(settings.notifications)
        if settings.notifications
        else None,
        vacancy_defaults=json.loads(settings.vacancy_defaults)
        if settings.vacancy_defaults
        else None,
        privacy=json.loads(settings.privacy) if settings.privacy else None,
        integrations=json.loads(settings.integrations)
        if settings.integrations
        else None,
    )


@router.put(
    "/settings",
    response_model=EmployerSettingsResponse,
    summary="Обновить настройки работодателя",
)
def update_settings(
    request: Request,
    payload: EmployerSettingsCreate,
    db: Session = Depends(get_sync_session),
    _: None = Depends(require_role("employers")),
):
    user_sub = get_user_sub(request)
    company = _get_company_or_404(db, user_sub)

    settings = db.execute(
        select(EmployerSettings).where(EmployerSettings.company_id == company.id)
    ).scalar_one_or_none()

    if not settings:
        settings = EmployerSettings(company_id=company.id)
        db.add(settings)

    if payload.notifications is not None:
        settings.notifications = json.dumps(payload.notifications, ensure_ascii=False)
    if payload.vacancy_defaults is not None:
        settings.vacancy_defaults = json.dumps(
            payload.vacancy_defaults, ensure_ascii=False
        )
    if payload.privacy is not None:
        settings.privacy = json.dumps(payload.privacy, ensure_ascii=False)
    if payload.integrations is not None:
        settings.integrations = json.dumps(payload.integrations, ensure_ascii=False)

    db.commit()
    db.refresh(settings)

    return EmployerSettingsResponse(
        id=settings.id,
        company_id=settings.company_id,
        notifications=json.loads(settings.notifications)
        if settings.notifications
        else None,
        vacancy_defaults=json.loads(settings.vacancy_defaults)
        if settings.vacancy_defaults
        else None,
        privacy=json.loads(settings.privacy) if settings.privacy else None,
        integrations=json.loads(settings.integrations)
        if settings.integrations
        else None,
    )
