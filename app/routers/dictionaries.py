# app/routers/dictionaries.py
"""Роутер справочников: дорожная карта, soft skills."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from core.db import get_sync_session
from db.models.dictionaries import SoftSkillDict
from db.models.roadmap import RoadmapTopic, TopicTest
from schemas.dictionaries import RoadmapTopicResponse, SoftSkillDictResponse

router = APIRouter(prefix="/dictionaries", tags=["dictionaries"])


# ============================================================================
# 🗺️ Дорожная карта
# ============================================================================
@router.get(
    "/roadmap",
    response_model=list[RoadmapTopicResponse],
    summary="Получить дорожную карту (дерево тем)",
)
def get_roadmap(
    direction: str | None = None,
    db: Session = Depends(get_sync_session),
):
    """
    Возвращает дерево тем дорожной карты.
    Если указан direction — фильтрует по направлению (frontend, backend, ...).
    """
    query = select(RoadmapTopic).where(RoadmapTopic.is_active.is_(True))
    if direction:
        query = query.where(RoadmapTopic.direction == direction)

    topics = db.execute(query).scalars().all()

    # Строим словарь для быстрого доступа
    topics_by_id = {t.id: t for t in topics}

    # Считаем статистику по каждой теме
    def build_tree(topic: RoadmapTopic) -> RoadmapTopicResponse:
        # Количество тестов и средний балл
        stats = db.execute(
            select(
                func.count(TopicTest.id),
                func.avg(TopicTest.best_score),
            ).where(
                TopicTest.topic_id == topic.id,
                TopicTest.attempts > 0,
            )
        ).one()
        tests_count = stats[0] or 0
        avg_score = int(stats[1] or 0)

        children = [
            build_tree(child) for child in topics if child.parent_id == topic.id
        ]

        return RoadmapTopicResponse(
            id=topic.id,
            key=topic.key,
            title=topic.title,
            direction=topic.direction.value,
            parent_id=topic.parent_id,
            is_active=topic.is_active,
            children=children,
            tests_count=tests_count,
            avg_score=avg_score,
        )

    # Возвращаем только корневые темы (parent_id is None)
    root_topics = [t for t in topics if t.parent_id is None]
    return [build_tree(t) for t in root_topics]


@router.get(
    "/roadmap/flat",
    response_model=list[RoadmapTopicResponse],
    summary="Получить все темы плоским списком",
)
def get_roadmap_flat(
    direction: str | None = None,
    db: Session = Depends(get_sync_session),
):
    """Возвращает все темы без иерархии (удобно для select-ов)."""
    query = select(RoadmapTopic).where(RoadmapTopic.is_active.is_(True))
    if direction:
        query = query.where(RoadmapTopic.direction == direction)

    topics = (
        db.execute(query.order_by(RoadmapTopic.direction, RoadmapTopic.title))
        .scalars()
        .all()
    )

    result = []
    for topic in topics:
        stats = db.execute(
            select(
                func.count(TopicTest.id),
                func.avg(TopicTest.best_score),
            ).where(
                TopicTest.topic_id == topic.id,
                TopicTest.attempts > 0,
            )
        ).one()
        result.append(
            RoadmapTopicResponse(
                id=topic.id,
                key=topic.key,
                title=topic.title,
                direction=topic.direction.value,
                parent_id=topic.parent_id,
                is_active=topic.is_active,
                children=[],
                tests_count=stats[0] or 0,
                avg_score=int(stats[1] or 0),
            )
        )
    return result


# ============================================================================
# 🌟 Soft Skills справочник
# ============================================================================
@router.get(
    "/soft-skills",
    response_model=list[SoftSkillDictResponse],
    summary="Получить справочник soft skills",
)
def get_soft_skills_dict(db: Session = Depends(get_sync_session)):
    """Возвращает все активные soft skills с подсчётом использований."""
    rows = (
        db.execute(
            select(SoftSkillDict)
            .where(SoftSkillDict.is_active.is_(True))
            .order_by(SoftSkillDict.name)
        )
        .scalars()
        .all()
    )

    result = []
    for skill in rows:
        # Считаем, сколько раз этот soft skill используется кандидатами
        from db.models.candidate import CandidateSoftSkill

        usage_count = (
            db.execute(
                select(func.count(CandidateSoftSkill.id)).where(
                    CandidateSoftSkill.soft_skill_dict_id == skill.id
                )
            ).scalar()
            or 0
        )

        result.append(
            SoftSkillDictResponse(
                id=skill.id,
                name=skill.name,
                category=skill.category,
                is_active=skill.is_active,
                usage_count=usage_count,
            )
        )
    return result
