"""
Seed-скрипт для заполнения БД тестовыми данными.

Данные взяты из моков фронтенда (web/src/mocks/*.ts).

user_sub получаем двумя методами:
  1. Keycloak Admin API (через client_credentials) — реальные sub
  2. Fallback на детерминированные UUID — если Keycloak недоступен

Запуск:
    cd app
    python -m scripts.seed                  # заполнить БД
    python -m scripts.seed --reset          # очистить и заполнить заново
    python -m scripts.seed --skip-keycloak  # использовать только fallback
    python -m scripts.seed --help           # помощь
"""

import argparse
import logging
import sys
import uuid
from datetime import date, datetime

import requests
from sqlalchemy import text
from sqlalchemy.orm import Session

from core.config import settings
from core.db import SessionLocal
from db.models.base import Base
from db.models.candidate import (
    Candidate,
    CandidateSkill,
    CandidateSoftSkill,
    Education,
    FspParticipation,
    Resume,
    WorkExperience,
)
from db.models.company import Company, CompanyMember
from db.models.dictionaries import SoftSkillDict
from db.models.enums import (
    CandidateStatus,
    ChatSender,
    CompanyIndustry,
    CompanySize,
    Direction,
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
from db.models.interaction import ChatMessage, Invitation, Response, Task
from db.models.questions import Question, QuestionOption
from db.models.roadmap import RoadmapTopic, TopicTest
from db.models.settings import CandidateSettings, EmployerSettings
from db.models.vacancy import Vacancy, VacancyHardSkill, VacancySoftSkill

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("seed")


# ============================================================================
# 🔑 Методы получения user_sub
# ============================================================================


# Fallback user_sub для пользователей, которых может не быть в Keycloak.
# Генерируются детерминированно через uuid5 — одинаковые между запусками.
def _fallback_sub(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"csh-{seed}"))


FALLBACK_USER_SUBS = {
    # Реальные пользователи из realm.json
    "candidat": _fallback_sub("candidat"),
    "employer": _fallback_sub("employer"),
    "admin": _fallback_sub("admin"),
    # Дополнительные кандидаты (нет в Keycloak — только в БД)
    "candidat_2": _fallback_sub("candidat-2"),
    "candidat_3": _fallback_sub("candidat-3"),
    "candidat_4": _fallback_sub("candidat-4"),
    "candidat_5": _fallback_sub("candidat-5"),
    "candidat_6": _fallback_sub("candidat-6"),
    "candidat_7": _fallback_sub("candidat-7"),
    "candidat_8": _fallback_sub("candidat-8"),
    # Дополнительные работодатели (владельцы компаний)
    "employer_2": _fallback_sub("employer-2"),
    "employer_3": _fallback_sub("employer-3"),
    "employer_4": _fallback_sub("employer-4"),
    "employer_5": _fallback_sub("employer-5"),
    "employer_6": _fallback_sub("employer-6"),
    "employer_7": _fallback_sub("employer-7"),
}

# Глобальный флаг — если True, пропускаем Keycloak API
_SKIP_KEYCLOAK = False


def _get_user_sub_from_keycloak(username: str) -> str | None:
    """
    Метод 1: Получаем user_sub через Keycloak Admin API.

    Использует client credentials клиента 'api' для получения токена,
    затем ищет пользователя по username и возвращает его id (= sub).
    """
    if _SKIP_KEYCLOAK:
        return None

    try:
        # 1. Получаем access_token через client_credentials grant
        realm_url = "http://keycloak:8081/realms/csh".rstrip("/")
        token_url = f"{realm_url}/protocol/openid-connect/token"

        token_resp = requests.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.keycloak_client_id,
                "client_secret": "api-secret-key",  # из realm.json
            },
            timeout=5,
        )
        if token_resp.status_code != 200:
            logger.warning(
                f"Keycloak token request failed ({token_resp.status_code}). "
                f"Используем fallback."
            )
            return None

        access_token = token_resp.json().get("access_token")
        if not access_token:
            return None

        # 2. Ищем пользователя по username через Admin API
        admin_url = realm_url.replace("/realms/", "/admin/realms/")
        users_resp = requests.get(
            f"{admin_url}/users",
            params={"username": username, "max": 1, "exact": "true"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=5,
        )
        if users_resp.status_code != 200:
            logger.warning(
                f"Keycloak users request failed ({users_resp.status_code}). "
                f"Используем fallback."
            )
            return None

        users = users_resp.json()
        if not users:
            return None

        return users[0]["id"]

    except requests.RequestException as e:
        logger.warning(f"Keycloak API недоступен: {e}. Используем fallback.")
        return None
    except Exception as e:
        logger.warning(f"Ошибка при получении user_sub из Keycloak: {e}")
        return None


def get_user_sub(username: str) -> str:
    """
    Получаем user_sub для пользователя.

    Сначала пробуем Method 1 (Keycloak API), если не получилось — Method 2 (fallback).
    """
    sub = _get_user_sub_from_keycloak(username)
    if sub:
        logger.info(f"  ✓ {username}: user_sub из Keycloak = {sub[:8]}...")
        return sub

    fallback = FALLBACK_USER_SUBS.get(username)
    if not fallback:
        # Для неизвестных username генерируем на лету
        fallback = _fallback_sub(username)
        FALLBACK_USER_SUBS[username] = fallback
    logger.info(f"  ⚠ {username}: используем fallback = {fallback[:8]}...")
    return fallback


# ============================================================================
# 🗃️ Данные для seed (из моков фронтенда)
# ============================================================================

# ----------------------------------------------------------------------------
# Soft Skills справочник (15 штук)
# ----------------------------------------------------------------------------
SOFT_SKILLS_DATA = [
    {"name": "Коммуникабельность", "category": "Межличностные"},
    {"name": "Работа в команде", "category": "Межличностные"},
    {"name": "Аналитическое мышление", "category": "Когнитивные"},
    {"name": "Тайм-менеджмент", "category": "Организационные"},
    {"name": "Адаптивность", "category": "Личностные"},
    {"name": "Лидерские качества", "category": "Управленческие"},
    {"name": "Умение менторить", "category": "Управленческие"},
    {"name": "Внимательность к деталям", "category": "Когнитивные"},
    {"name": "Самоорганизованность", "category": "Организационные"},
    {"name": "Стрессоустойчивость", "category": "Личностные"},
    {"name": "Желание учиться", "category": "Личностные"},
    {"name": "Ответственность", "category": "Личностные"},
    {"name": "Креативность", "category": "Когнитивные"},
    {"name": "Проблемное мышление", "category": "Когнитивные"},
    {"name": "Эмоциональный интеллект", "category": "Межличностные"},
]

# ----------------------------------------------------------------------------
# Дорожная карта (дерево тем) — из ROADMAPS в skills.ts
# ----------------------------------------------------------------------------
ROADMAP_TREE = {
    "frontend": [
        {
            "key": "basics",
            "title": "Основы веб-разработки",
            "children": [
                {
                    "key": "html",
                    "title": "HTML5",
                    "children": [
                        {"key": "html-semantics", "title": "Семантическая верстка"},
                        {"key": "html-forms", "title": "Формы и валидация"},
                        {"key": "html-a11y", "title": "Доступность (a11y)"},
                    ],
                },
                {
                    "key": "css",
                    "title": "CSS3",
                    "children": [
                        {"key": "css-flexbox", "title": "Flexbox"},
                        {"key": "css-grid", "title": "CSS Grid"},
                        {"key": "css-animations", "title": "Анимации и transitions"},
                        {"key": "css-responsive", "title": "Адаптивная верстка"},
                    ],
                },
                {
                    "key": "js",
                    "title": "JavaScript",
                    "children": [
                        {"key": "js-es6", "title": "ES6+ синтаксис"},
                        {"key": "js-dom", "title": "Работа с DOM"},
                        {"key": "js-async", "title": "Async/Await и Promises"},
                        {"key": "js-modules", "title": "Модули и сборка"},
                    ],
                },
            ],
        },
        {
            "key": "frameworks",
            "title": "Фреймворки и библиотеки",
            "children": [
                {
                    "key": "react",
                    "title": "React",
                    "children": [
                        {"key": "react-components", "title": "Компоненты и JSX"},
                        {"key": "react-hooks", "title": "Hooks"},
                        {"key": "react-state", "title": "State Management"},
                        {"key": "react-routing", "title": "React Router"},
                    ],
                },
                {
                    "key": "typescript",
                    "title": "TypeScript",
                    "children": [
                        {"key": "ts-types", "title": "Типы и интерфейсы"},
                        {"key": "ts-generics", "title": "Дженерики"},
                        {"key": "ts-utility", "title": "Utility Types"},
                    ],
                },
            ],
        },
        {
            "key": "tools",
            "title": "Инструменты",
            "children": [
                {"key": "git", "title": "Git и GitHub"},
                {"key": "webpack", "title": "Webpack/Vite"},
                {"key": "testing", "title": "Тестирование (Jest, RTL)"},
                {"key": "performance", "title": "Оптимизация производительности"},
            ],
        },
    ],
    "backend": [
        {
            "key": "basics",
            "title": "Основы backend-разработки",
            "children": [
                {
                    "key": "languages",
                    "title": "Языки программирования",
                    "children": [
                        {"key": "python", "title": "Python (FastAPI, Django)"},
                        {"key": "nodejs", "title": "Node.js (Express, NestJS)"},
                        {"key": "go", "title": "Go (Gin, Echo)"},
                    ],
                },
                {
                    "key": "databases",
                    "title": "Базы данных",
                    "children": [
                        {"key": "sql", "title": "SQL (PostgreSQL, MySQL)"},
                        {"key": "nosql", "title": "NoSQL (MongoDB, Redis)"},
                        {"key": "orm", "title": "ORM (SQLAlchemy, Prisma)"},
                    ],
                },
            ],
        },
        {
            "key": "api",
            "title": "API и протоколы",
            "children": [
                {"key": "rest", "title": "REST API"},
                {"key": "graphql", "title": "GraphQL"},
                {"key": "websocket", "title": "WebSocket"},
                {"key": "auth", "title": "Аутентификация (JWT, OAuth)"},
            ],
        },
        {
            "key": "architecture",
            "title": "Архитектура",
            "children": [
                {"key": "patterns", "title": "Паттерны проектирования"},
                {"key": "microservices", "title": "Микросервисы"},
                {"key": "cqrs", "title": "CQRS и Event Sourcing"},
            ],
        },
    ],
    "devops": [
        {
            "key": "containers",
            "title": "Контейнеризация",
            "children": [
                {"key": "docker", "title": "Docker"},
                {"key": "docker-compose", "title": "Docker Compose"},
                {"key": "kubernetes", "title": "Kubernetes"},
            ],
        },
        {
            "key": "ci-cd",
            "title": "CI/CD",
            "children": [
                {"key": "gitlab-ci", "title": "GitLab CI"},
                {"key": "github-actions", "title": "GitHub Actions"},
                {"key": "jenkins", "title": "Jenkins"},
            ],
        },
        {
            "key": "monitoring",
            "title": "Мониторинг и логирование",
            "children": [
                {"key": "prometheus", "title": "Prometheus"},
                {"key": "grafana", "title": "Grafana"},
                {"key": "elk", "title": "ELK Stack"},
            ],
        },
    ],
    "mobile": [
        {
            "key": "platforms",
            "title": "Платформы",
            "children": [
                {"key": "ios", "title": "iOS (Swift)"},
                {"key": "android", "title": "Android (Kotlin)"},
                {"key": "cross-platform", "title": "Cross-platform (RN, Flutter)"},
            ],
        },
        {
            "key": "concepts",
            "title": "Концепции",
            "children": [
                {"key": "ui-ux", "title": "UI/UX для мобильных"},
                {"key": "offline", "title": "Offline-first"},
                {"key": "push", "title": "Push-уведомления"},
            ],
        },
    ],
    "data": [
        {
            "key": "ml",
            "title": "Machine Learning",
            "children": [
                {"key": "supervised", "title": "Supervised Learning"},
                {"key": "unsupervised", "title": "Unsupervised Learning"},
                {"key": "deep-learning", "title": "Deep Learning"},
            ],
        },
        {
            "key": "tools",
            "title": "Инструменты",
            "children": [
                {"key": "pandas", "title": "Pandas, NumPy"},
                {"key": "sklearn", "title": "Scikit-learn"},
                {"key": "tensorflow", "title": "TensorFlow/PyTorch"},
            ],
        },
    ],
    "qa": [
        {
            "key": "testing-types",
            "title": "Виды тестирования",
            "children": [
                {"key": "manual", "title": "Ручное тестирование"},
                {"key": "automation", "title": "Автоматизация тестирования"},
                {"key": "performance-qa", "title": "Нагрузочное тестирование"},
            ],
        },
        {
            "key": "tools-qa",
            "title": "Инструменты",
            "children": [
                {"key": "selenium", "title": "Selenium"},
                {"key": "cypress", "title": "Cypress"},
                {"key": "postman", "title": "Postman"},
            ],
        },
    ],
}


def _flatten_roadmap(nodes, parent_key=None, direction=None):
    """Преобразует дерево ROADMAP_TREE в плоский список с parent_key."""
    result = []
    for node in nodes:
        result.append(
            {
                "key": node["key"],
                "title": node["title"],
                "parent_key": parent_key,
                "direction": direction,
            }
        )
        if "children" in node:
            result.extend(_flatten_roadmap(node["children"], node["key"], direction))
    return result


# ----------------------------------------------------------------------------
# Кандидаты (8 человек)
# ----------------------------------------------------------------------------
CANDIDATES_DATA = [
    {
        "username": "candidat",
        "last_name": "Иванов",
        "first_name": "Иван",
        "middle_name": "Иванович",
        "phone": "+7 (900) 123-45-67",
        "email": "ivanov@goodgenius.ru",
        "telegram": "@ivanov_dev",
        "about_me": "Увлечённый frontend-разработчик с опытом создания высоконагруженных веб-приложений. Люблю изучать новые технологии и делиться знаниями с командой.",
        "status": CandidateStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 3, 15),
        "last_active_at": date(2026, 10, 10),
    },
    {
        "username": "candidat_2",
        "last_name": "Петрова",
        "first_name": "Анна",
        "middle_name": None,
        "phone": None,
        "email": "petrova@example.com",
        "telegram": "@petrova_frontend",
        "about_me": "Frontend Team Lead с опытом руководства командой из 5 разработчиков.",
        "status": CandidateStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 5, 20),
        "last_active_at": date(2026, 10, 8),
    },
    {
        "username": "candidat_3",
        "last_name": "Сидоров",
        "first_name": "Сергей",
        "middle_name": None,
        "phone": None,
        "email": "sidorov@example.com",
        "telegram": None,
        "about_me": "Backend-разработчик на Python. Опыт работы с FastAPI, PostgreSQL, Redis.",
        "status": CandidateStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 8, 10),
        "last_active_at": date(2026, 10, 9),
    },
    {
        "username": "candidat_4",
        "last_name": "Козлова",
        "first_name": "Мария",
        "middle_name": None,
        "phone": None,
        "email": "kozlova@example.com",
        "telegram": "@kozlova_dev",
        "about_me": "Начинающий frontend-разработчик. Активно изучаю React и TypeScript.",
        "status": CandidateStatus.pending_verification,
        "is_verified": False,
        "registered_at": date(2026, 1, 15),
        "last_active_at": date(2026, 10, 10),
    },
    {
        "username": "candidat_5",
        "last_name": "Волков",
        "first_name": "Дмитрий",
        "middle_name": None,
        "phone": None,
        "email": "volkov@example.com",
        "telegram": "@volkov_py",
        "about_me": "Backend-разработчик с опытом работы в финтехе. Специализируюсь на высоконагруженных системах.",
        "status": CandidateStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 2, 1),
        "last_active_at": date(2026, 10, 7),
    },
    {
        "username": "candidat_6",
        "last_name": "Новикова",
        "first_name": "Елена",
        "middle_name": None,
        "phone": None,
        "email": "novikova@example.com",
        "telegram": None,
        "about_me": "Junior frontend-разработчик. Недавно закончила курсы, сделала несколько pet-проектов.",
        "status": CandidateStatus.active,
        "is_verified": True,
        "registered_at": date(2026, 9, 1),
        "last_active_at": date(2026, 10, 10),
    },
    {
        "username": "candidat_7",
        "last_name": "Морозов",
        "first_name": "Алексей",
        "middle_name": None,
        "phone": None,
        "email": "morozov@example.com",
        "telegram": None,
        "about_me": None,
        "status": CandidateStatus.blocked,
        "is_verified": True,
        "block_reason": "Нарушение правил платформы: использование ИИ при прохождении тестов",
        "blocked_at": date(2026, 9, 16),
        "registered_at": date(2025, 11, 20),
        "last_active_at": date(2026, 9, 15),
    },
    {
        "username": "candidat_8",
        "last_name": "Лебедева",
        "first_name": "Ольга",
        "middle_name": None,
        "phone": None,
        "email": "lebedeva@example.com",
        "telegram": None,
        "about_me": None,
        "status": CandidateStatus.active,
        "is_verified": True,
        "registered_at": date(2026, 2, 10),
        "last_active_at": date(2026, 10, 5),
    },
]

# ----------------------------------------------------------------------------
# Компании (7 штук)
# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# Компании (7 штук)
# ----------------------------------------------------------------------------
COMPANIES_DATA = [
    {
        "username": "employer",
        "name": 'ООО "ТехноСофт"',
        "description": "Команда энтузиастов, создающих инновационные IT-решения для бизнеса.",
        "email": "hr@technosoft.example.com",
        "phone": "+7 (495) 123-45-67",
        "website": "https://technosoft.example.com",
        "address": "г. Москва, ул. Тверская, д. 15, офис 301",
        "industry": CompanyIndustry.it,  # <-- Объект Enum
        "size": CompanySize.s51_200,  # <-- Объект Enum (SQLAlchemy возьмет значение "51-200")
        "founded_year": 2015,
        "about": "Компания основана в 2015 году. За 10 лет работы реализовали более 200 проектов.",
        "status": EmployerStatus.active,  # <-- Объект Enum
        "is_verified": True,
        "registered_at": date(2025, 1, 15),
        "last_active_at": date(2026, 10, 10),
    },
    {
        "username": "employer_2",
        "name": 'АО "Инновационные Решения"',
        "description": "Крупная IT-компания, разрабатывающая корпоративные решения.",
        "email": "hr@innovations.example.com",
        "phone": "+7 (812) 987-65-43",
        "website": "https://innovations.example.com",
        "industry": CompanyIndustry.it,
        "size": CompanySize.s201_500,  # <-- Значение будет "201-500"
        "status": EmployerStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 3, 20),
        "last_active_at": date(2026, 10, 9),
    },
    {
        "username": "employer_3",
        "name": 'Студия "Digital Wave"',
        "description": "Креативная digital-студия.",
        "email": "hr@digitalwave.example.com",
        "website": "https://digitalwave.example.com",
        "industry": CompanyIndustry.media,
        "size": CompanySize.s11_50,  # <-- Значение будет "11-50"
        "status": EmployerStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 6, 10),
        "last_active_at": date(2026, 10, 8),
    },
    {
        "username": "employer_4",
        "name": 'Финтех-компания "АльфаКод"',
        "description": "Разработка финансовых технологий.",
        "email": "hr@alfacode.example.com",
        "phone": "+7 (495) 555-12-34",
        "website": "https://alfacode.example.com",
        "industry": CompanyIndustry.finance,
        "size": CompanySize.s501_1000,  # <-- Значение будет "501-1000"
        "status": EmployerStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 2, 1),
        "last_active_at": date(2026, 10, 7),
    },
    {
        "username": "employer_5",
        "name": 'Стартап "WebFlow Labs"',
        "description": "Молодой стартап в области веб-технологий.",
        "email": "hr@webflow.example.com",
        "industry": CompanyIndustry.it,
        "size": CompanySize.s1_10,  # <-- Значение будет "1-10"
        "status": EmployerStatus.pending_verification,
        "is_verified": False,
        "registered_at": date(2026, 1, 15),
        "last_active_at": date(2026, 10, 10),
    },
    {
        "username": "employer_6",
        "name": 'Ритейл-группа "МаркетПро"',
        "description": "Крупная ритейл-компания.",
        "email": "hr@marketpro.example.com",
        "phone": "+7 (495) 777-88-99",
        "website": "https://marketpro.example.com",
        "industry": CompanyIndustry.retail,
        "size": CompanySize.s1000_plus,  # <-- Значение будет "1000+"
        "status": EmployerStatus.active,
        "is_verified": True,
        "registered_at": date(2025, 4, 5),
        "last_active_at": date(2026, 10, 6),
    },
    {
        "username": "employer_7",
        "name": 'АО "ИнфраТех"',
        "description": "Консалтинговая компания.",
        "email": "hr@infratech.example.com",
        "industry": CompanyIndustry.consulting,
        "size": CompanySize.s201_500,  # <-- Значение будет "201-500"
        "status": EmployerStatus.blocked,
        "is_verified": True,
        "block_reason": "Нарушение правил: публикация недостоверной информации о вакансиях",
        "blocked_at": date(2026, 9, 20),
        "registered_at": date(2025, 7, 20),
        "last_active_at": date(2026, 10, 5),
    },
]


# ============================================================================
# 🌱 Функции seed
# ============================================================================


def _reset_db(session: Session):
    """Полная очистка БД."""
    logger.info("🗑️  Очистка БД...")
    # Отключаем FK checks для корректного удаления
    session.execute(text("SET session_replication_role = 'replica';"))
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(
            text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;')
        )
    session.execute(text("SET session_replication_role = 'origin';"))
    session.commit()
    logger.info("✓ БД очищена")


# ----------------------------------------------------------------------------
# 1. Справочник soft skills
# ----------------------------------------------------------------------------
def seed_soft_skill_dict(session: Session) -> dict[str, int]:
    """Заполняет soft_skill_dict. Возвращает {name: id}."""
    logger.info("📚 Заполнение soft_skill_dict...")
    mapping = {}
    for item in SOFT_SKILLS_DATA:
        obj = SoftSkillDict(
            name=item["name"], category=item["category"], is_active=True
        )
        session.add(obj)
        session.flush()
        mapping[item["name"]] = obj.id
    logger.info(f"  ✓ Добавлено {len(mapping)} soft skills")
    return mapping


# ----------------------------------------------------------------------------
# 2. Дорожная карта (roadmap_topics)
# ----------------------------------------------------------------------------
def seed_roadmap_topics(session: Session) -> dict[str, int]:
    """Заполняет roadmap_topics. Возвращает {key: id}."""
    logger.info("🗺️  Заполнение roadmap_topics...")

    # Собираем все темы из дерева
    all_topics = []
    for direction, tree in ROADMAP_TREE.items():
        all_topics.extend(_flatten_roadmap(tree, direction=direction))

    # Первый проход: вставляем все темы без parent_id
    topics_by_key = {}
    for topic in all_topics:
        obj = RoadmapTopic(
            key=topic["key"],
            title=topic["title"],
            direction=Direction(topic["direction"]),
            parent_id=None,
            is_active=True,
        )
        session.add(obj)
        session.flush()
        topics_by_key[topic["key"]] = {"id": obj.id, "parent_key": topic["parent_key"]}

    # Второй проход: устанавливаем parent_id
    for key, data in topics_by_key.items():
        if data["parent_key"]:
            parent_id = topics_by_key[data["parent_key"]]["id"]
            session.execute(
                text("UPDATE roadmap_topics SET parent_id = :pid WHERE key = :key"),
                {"pid": parent_id, "key": key},
            )

    mapping = {k: v["id"] for k, v in topics_by_key.items()}
    logger.info(f"  ✓ Добавлено {len(mapping)} тем")
    return mapping


# ----------------------------------------------------------------------------
# 3. Кандидаты
# ----------------------------------------------------------------------------
def seed_candidates(session: Session) -> dict[str, int]:
    """Заполняет candidates. Возвращает {username: id}."""
    logger.info("👤 Заполнение candidates...")
    mapping = {}
    for data in CANDIDATES_DATA:
        user_sub = get_user_sub(data["username"])
        obj = Candidate(
            user_sub=user_sub,
            last_name=data["last_name"],
            first_name=data["first_name"],
            middle_name=data.get("middle_name"),
            phone=data.get("phone"),
            email=data.get("email"),
            telegram=data.get("telegram"),
            about_me=data.get("about_me"),
            registered_at=data.get("registered_at"),
            last_active_at=data.get("last_active_at"),
            status=data.get("status", CandidateStatus.active),
            is_verified=data.get("is_verified", False),
            block_reason=data.get("block_reason"),
            blocked_at=data.get("blocked_at"),
        )
        session.add(obj)
        session.flush()
        mapping[data["username"]] = obj.id
    logger.info(f"  ✓ Добавлено {len(mapping)} кандидатов")
    return mapping


# ----------------------------------------------------------------------------
# 4. Навыки кандидатов (candidate_skills)
# ----------------------------------------------------------------------------
def seed_candidate_skills(
    session: Session, candidates: dict[str, int]
) -> dict[tuple, int]:
    """Заполняет candidate_skills. Возвращает {(username, language): id}."""
    logger.info("💪 Заполнение candidate_skills...")
    skills_data = [
        ("candidat", Direction.frontend, Grade.middle, "TypeScript"),
        ("candidat_2", Direction.frontend, Grade.senior, "React"),
        ("candidat_3", Direction.backend, Grade.middle, "Python"),
        ("candidat_4", Direction.frontend, Grade.junior, "React"),
        ("candidat_5", Direction.backend, Grade.senior, "Python"),
        ("candidat_6", Direction.frontend, Grade.junior, "React"),
        ("candidat_7", Direction.backend, Grade.middle, "Node.js"),
        ("candidat_8", Direction.devops, Grade.middle, "Docker"),
    ]
    mapping = {}
    for username, direction, grade, language in skills_data:
        candidate_id = candidates[username]
        obj = CandidateSkill(
            candidate_id=candidate_id,
            direction=direction,
            grade=grade,
            language=language,
        )
        session.add(obj)
        session.flush()
        mapping[(username, language)] = obj.id
    logger.info(f"  ✓ Добавлено {len(mapping)} навыков")
    return mapping


# ----------------------------------------------------------------------------
# 5. Результаты тестов (topic_tests)
# ----------------------------------------------------------------------------
def seed_topic_tests(
    session: Session,
    candidate_skills: dict[tuple, int],
    topics: dict[str, int],
):
    """Заполняет topic_tests для основных навыков."""
    logger.info("🧪 Заполнение topic_tests...")

    # Тесты для frontend (TypeScript) — кандидата
    frontend_tests = [
        ("html-semantics", 90, 90, 1, True, date(2026, 10, 1)),
        ("html-forms", 75, 75, 2, True, date(2026, 10, 3)),
        ("html-a11y", 0, 0, 0, False, None),
        ("css-flexbox", 100, 100, 1, True, date(2026, 9, 25)),
        ("css-grid", 85, 85, 1, True, date(2026, 9, 28)),
        ("css-animations", 60, 60, 3, False, date(2026, 9, 10)),
        ("css-responsive", 80, 80, 1, True, date(2026, 10, 2)),
        ("js-es6", 95, 95, 1, True, date(2026, 9, 20)),
        ("js-dom", 70, 70, 2, True, date(2026, 9, 22)),
        ("js-async", 45, 45, 2, False, date(2026, 10, 4)),
        ("react-components", 100, 100, 1, True, date(2026, 9, 15)),
        ("react-hooks", 88, 88, 1, True, date(2026, 9, 18)),
        ("react-state", 55, 55, 1, False, date(2026, 10, 6)),
        ("ts-types", 82, 82, 1, True, date(2026, 9, 30)),
        ("git", 95, 95, 1, True, date(2026, 9, 10)),
    ]
    skill_id = candidate_skills[("candidat", "TypeScript")]
    count = 0
    for topic_key, best, last, attempts, passed, last_date in frontend_tests:
        topic_id = topics.get(topic_key)
        if not topic_id:
            continue
        locked = attempts >= 3 and not passed
        next_date = date(2026, 11, 10) if locked else None
        obj = TopicTest(
            candidate_skill_id=skill_id,
            topic_id=topic_id,
            best_score=best,
            last_score=last,
            attempts=attempts,
            passed=passed,
            last_attempt_date=last_date,
            next_attempt_date=next_date,
            locked=locked,
        )
        session.add(obj)
        count += 1

    # Тесты для backend (Python) — candidat_3
    backend_tests = [
        ("python", 70, 70, 2, True, date(2026, 10, 1)),
        ("sql", 65, 65, 1, False, date(2026, 10, 5)),
        ("orm", 30, 30, 1, False, date(2026, 10, 8)),
        ("rest", 85, 85, 1, True, date(2026, 9, 28)),
        ("auth", 50, 50, 1, False, date(2026, 10, 3)),
    ]
    skill_id = candidate_skills[("candidat_3", "Python")]
    for topic_key, best, last, attempts, passed, last_date in backend_tests:
        topic_id = topics.get(topic_key)
        if not topic_id:
            continue
        obj = TopicTest(
            candidate_skill_id=skill_id,
            topic_id=topic_id,
            best_score=best,
            last_score=last,
            attempts=attempts,
            passed=passed,
            last_attempt_date=last_date,
            locked=False,
        )
        session.add(obj)
        count += 1

    logger.info(f"  ✓ Добавлено {count} результатов тестов")


# ----------------------------------------------------------------------------
# 6. Образование, опыт, soft skills кандидата, резюме, ФСП
# ----------------------------------------------------------------------------
def seed_candidate_related(
    session: Session,
    candidates: dict[str, int],
    candidate_skills: dict[tuple, int],
    soft_skills_dict: dict[str, int],
):
    """Заполняет educations, work_experiences, candidate_soft_skills, resumes, fsp_participations."""
    logger.info("🎓 Заполнение связанных данных кандидатов...")

    # --- Образование для candidat ---
    educations_data = [
        (
            "candidat",
            "МГТУ им. Н.Э. Баумана",
            "Информатика и вычислительная техника",
            2015,
            2020,
            False,
            "Специалист",
        ),
        (
            "candidat",
            "Яндекс Практикум",
            "Веб-разработчик",
            2021,
            None,
            True,
            "Профессиональная переподготовка",
        ),
    ]
    for (
        username,
        institution,
        specialty,
        start_year,
        end_year,
        is_current,
        degree,
    ) in educations_data:
        session.add(
            Education(
                candidate_id=candidates[username],
                institution=institution,
                specialty=specialty,
                start_year=start_year,
                end_year=end_year,
                is_current=is_current,
                degree=degree,
            )
        )

    # --- Опыт работы для candidat ---
    work_exp_data = [
        (
            "candidat",
            date(2021, 3, 1),
            None,
            True,
            'ООО "Технологии Будущего"',
            "Senior Frontend Developer",
            "Разработка и поддержка веб-приложений на React. Руководство командой.",
        ),
        (
            "candidat",
            date(2019, 6, 1),
            date(2021, 2, 28),
            False,
            'АО "Инновационные Решения"',
            "Middle Frontend Developer",
            "Разработка пользовательских интерфейсов. Интеграция с REST API.",
        ),
    ]
    for (
        username,
        start_date,
        end_date,
        is_current,
        company,
        position,
        desc,
    ) in work_exp_data:
        session.add(
            WorkExperience(
                candidate_id=candidates[username],
                start_date=start_date,
                end_date=end_date,
                is_current=is_current,
                company=company,
                position=position,
                description=desc,
            )
        )

    # --- Soft skills для candidat (связь со справочником) ---
    candidat_soft_skills = [
        "Коммуникабельность",
        "Работа в команде",
        "Аналитическое мышление",
        "Тайм-менеджмент",
        "Адаптивность",
    ]
    for name in candidat_soft_skills:
        if name in soft_skills_dict:
            session.add(
                CandidateSoftSkill(
                    candidate_id=candidates["candidat"],
                    soft_skill_dict_id=soft_skills_dict[name],
                )
            )

    # --- Резюме ---
    resumes_data = [
        (
            "candidat",
            "TypeScript",
            "Senior Frontend Developer",
            250000,
            350000,
            "Ищу позицию Senior Frontend Developer.",
        ),
        (
            "candidat_3",
            "Python",
            "Backend Developer (Python)",
            200000,
            280000,
            "Разработка микросервисов на Python/FastAPI.",
        ),
    ]
    resume_ids = {}
    for username, language, title, sal_from, sal_to, desc in resumes_data:
        skill_id = candidate_skills.get((username, language))
        obj = Resume(
            candidate_id=candidates[username],
            skill_id=skill_id,
            title=title,
            salary_from=sal_from,
            salary_to=sal_to,
            currency="RUB",
            description=desc,
            created_at=date(2026, 9, 15),
            updated_at=date(2026, 10, 1),
        )
        session.add(obj)
        session.flush()
        resume_ids[(username, language)] = obj.id

    # --- ФСП участия для candidat ---
    fsp_data = [
        (
            "candidat",
            "Всероссийская олимпиада по программированию",
            date(2026, 9, 15),
            FspResult.first_place,
            "1 место из 250 участников",
            ParticipationType.individual,
            None,
            None,
            "Министерство образования РФ",
            "Москва",
        ),
        (
            "candidat",
            'Хакатон "Digital Breakthrough"',
            date(2026, 7, 20),
            FspResult.second_place,
            "2 место из 80 команд",
            ParticipationType.team,
            TeamRole.frontend,
            "CodeCrafters",
            'АНО "Россия — страна возможностей"',
            "Санкт-Петербург",
        ),
        (
            "candidat",
            "Международный конкурс ICPC",
            date(2026, 5, 10),
            FspResult.third_place,
            "3 место в региональном этапе",
            ParticipationType.team,
            TeamRole.backend,
            "AlgorithmMasters",
            "ICPC Foundation",
            "Казань",
        ),
    ]
    for (
        username,
        event_name,
        event_date,
        result,
        details,
        ptype,
        team_role,
        team_name,
        organizer,
        location,
    ) in fsp_data:
        session.add(
            FspParticipation(
                candidate_id=candidates[username],
                event_name=event_name,
                event_date=event_date,
                result=result,
                result_details=details,
                participation_type=ptype,
                team_role=team_role,
                team_name=team_name,
                organizer=organizer,
                location=location,
            )
        )

    logger.info("  ✓ Добавлено образование, опыт, soft skills, резюме, ФСП")
    return resume_ids


# ----------------------------------------------------------------------------
# 7. Компании
# ----------------------------------------------------------------------------
def seed_companies(session: Session) -> dict[str, int]:
    """Заполняет companies. Возвращает {username: id}."""
    logger.info("🏢 Заполнение companies...")
    companies = {}
    for data in COMPANIES_DATA:
        user_sub = get_user_sub(data["username"])
        obj = Company(
            user_sub=user_sub,
            name=data["name"],
            description=data.get("description"),
            email=data["email"],
            phone=data.get("phone"),
            website=data.get("website"),
            address=data.get("address"),
            industry=data["industry"],
            size=data["size"],
            founded_year=data.get("founded_year"),
            about=data.get("about"),
            registered_at=data.get("registered_at"),
            last_active_at=data.get("last_active_at"),
            status=data.get("status", EmployerStatus.active),
            is_verified=data.get("is_verified", False),
            block_reason=data.get("block_reason"),
            blocked_at=data.get("blocked_at"),
        )
        session.add(obj)
        session.flush()
        companies[data["username"]] = obj.id
    logger.info(f"  ✓ Добавлено {len(companies)} компаний")
    return companies


# ----------------------------------------------------------------------------
# 8. Команды компаний
# ----------------------------------------------------------------------------
def seed_company_members(session: Session, companies: dict[str, int]):
    """Заполняет company_members."""
    logger.info("👥 Заполнение company_members...")
    technosoft_id = companies["employer"]
    members = [
        ("employer", "owner", date(2025, 1, 15)),
        ("candidat_2", "hr", date(2025, 3, 10)),
        ("candidat_5", "hiring_manager", date(2025, 6, 22)),
        ("candidat_6", "viewer", date(2026, 9, 1)),
    ]
    for username, role, joined_at in members:
        user_sub = get_user_sub(username)
        session.add(
            CompanyMember(
                company_id=technosoft_id,
                user_sub=user_sub,
                role=MemberRole(role),
                joined_at=joined_at,
            )
        )
    logger.info(f"  ✓ Добавлено {len(members)} членов команды")


# ----------------------------------------------------------------------------
# 9. Вакансии и их требования
# ----------------------------------------------------------------------------
def seed_vacancies(
    session: Session,
    companies: dict[str, int],
    topics: dict[str, int],
    soft_skills_dict: dict[str, int],
) -> dict[str, int]:
    """Заполняет vacancies, vacancy_hard_skills, vacancy_soft_skills."""
    logger.info("💼 Заполнение vacancies...")

    vacancies_data = [
        {
            "company": "employer",
            "title": "Senior Frontend Developer",
            "direction": Direction.frontend,
            "grade": Grade.senior,
            "description": "Разработка SPA на React + TypeScript. Менторство junior/middle разработчиков.",
            "salary_from": 300000,
            "salary_to": 450000,
            "location": "Москва",
            "is_remote": True,
            "status": VacancyStatus.published,
            "published_at": date(2026, 10, 1),
            "deadline": date(2026, 11, 1),
            "hard_skills": [
                ("react-hooks", 85),
                ("react-state", 80),
                ("ts-generics", 75),
                ("ts-utility", 70),
                ("testing", 75),
                ("performance", 80),
            ],
            "soft_skills": [
                "Лидерские качества",
                "Умение менторить",
                "Аналитическое мышление",
            ],
        },
        {
            "company": "employer",
            "title": "Middle Backend Developer (Python)",
            "direction": Direction.backend,
            "grade": Grade.middle,
            "description": "Разработка микросервисов для e-commerce платформы. FastAPI, PostgreSQL, Redis.",
            "salary_from": 250000,
            "salary_to": 350000,
            "location": "Санкт-Петербург",
            "is_remote": False,
            "status": VacancyStatus.published,
            "published_at": date(2026, 10, 5),
            "deadline": date(2026, 11, 5),
            "hard_skills": [
                ("python", 80),
                ("sql", 75),
                ("orm", 70),
                ("rest", 85),
                ("auth", 75),
            ],
            "soft_skills": ["Работа в команде", "Внимательность к деталям"],
        },
        {
            "company": "employer",
            "title": "Junior Frontend Developer",
            "direction": Direction.frontend,
            "grade": Grade.junior,
            "description": "Вёрстка компонентов по макетам из Figma. Разработка простых интерфейсов на React.",
            "salary_from": 120000,
            "salary_to": 180000,
            "location": "Москва",
            "is_remote": True,
            "status": VacancyStatus.published,
            "published_at": date(2026, 10, 9),
            "deadline": date(2026, 11, 25),
            "hard_skills": [
                ("html-semantics", 60),
                ("css-flexbox", 65),
                ("css-grid", 60),
                ("js-es6", 60),
                ("react-components", 55),
            ],
            "soft_skills": ["Желание учиться", "Ответственность"],
        },
        {
            "company": "employer",
            "title": "DevOps Engineer",
            "direction": Direction.devops,
            "grade": Grade.middle,
            "description": "Настройка и поддержка CI/CD пайплайнов, контейнеризация, мониторинг.",
            "salary_from": 280000,
            "salary_to": 380000,
            "location": "Москва",
            "is_remote": True,
            "status": VacancyStatus.draft,
            "hard_skills": [
                ("docker", 85),
                ("kubernetes", 80),
                ("gitlab-ci", 75),
                ("prometheus", 70),
            ],
            "soft_skills": ["Стрессоустойчивость", "Самостоятельность"],
        },
        {
            "company": "employer_4",
            "title": "Senior Backend Developer (Go)",
            "direction": Direction.backend,
            "grade": Grade.senior,
            "description": "Разработка высоконагруженных микросервисов на Go для платёжной системы.",
            "salary_from": 400000,
            "salary_to": 550000,
            "location": "Москва",
            "is_remote": False,
            "status": VacancyStatus.archived,
            "published_at": date(2026, 8, 15),
            "hard_skills": [
                ("go", 90),
                ("sql", 85),
                ("microservices", 85),
                ("patterns", 80),
            ],
            "soft_skills": ["Лидерские качества", "Аналитическое мышление"],
        },
        {
            "company": "employer_6",
            "title": "QA Automation Engineer",
            "direction": Direction.qa,
            "grade": Grade.middle,
            "description": "Автоматизация тестирования веб-приложений на Cypress и Playwright.",
            "salary_from": 200000,
            "salary_to": 280000,
            "location": "Казань",
            "is_remote": True,
            "status": VacancyStatus.closed,
            "published_at": date(2026, 9, 1),
            "hard_skills": [("cypress", 80), ("automation", 85), ("postman", 70)],
            "soft_skills": ["Внимательность к деталям"],
        },
    ]

    vacancy_ids = {}
    for data in vacancies_data:
        company_id = companies[data["company"]]
        obj = Vacancy(
            company_id=company_id,
            title=data["title"],
            direction=data["direction"],
            grade=data["grade"],
            description=data["description"],
            salary_from=data.get("salary_from"),
            salary_to=data.get("salary_to"),
            currency="RUB",
            location=data.get("location"),
            is_remote=data.get("is_remote", False),
            status=data["status"],
            published_at=data.get("published_at"),
            deadline=data.get("deadline"),
            created_at=data.get("published_at") or date(2026, 10, 1),
            updated_at=date(2026, 10, 10),
        )
        session.add(obj)
        session.flush()
        vacancy_ids[data["title"]] = obj.id

        # Hard skills
        for topic_key, required_percent in data.get("hard_skills", []):
            topic_id = topics.get(topic_key)
            if topic_id:
                session.add(
                    VacancyHardSkill(
                        vacancy_id=obj.id,
                        topic_id=topic_id,
                        required_percent=required_percent,
                    )
                )

        # Soft skills
        for skill_name in data.get("soft_skills", []):
            skill_dict_id = soft_skills_dict.get(skill_name)
            if skill_dict_id:
                session.add(
                    VacancySoftSkill(
                        vacancy_id=obj.id,
                        soft_skill_dict_id=skill_dict_id,
                    )
                )

    logger.info(f"  ✓ Добавлено {len(vacancy_ids)} вакансий с требованиями")
    return vacancy_ids


# ----------------------------------------------------------------------------
# 10. Тестовые задания, отклики, приглашения, чат
# ----------------------------------------------------------------------------
def seed_interactions(
    session: Session,
    candidates: dict[str, int],
    companies: dict[str, int],
    vacancies: dict[str, int],
    resumes: dict[tuple, int],
):
    """Заполняет tasks, responses, invitations, chat_messages."""
    logger.info("💬 Заполнение взаимодействий...")

    # --- Tasks ---
    tasks_data = [
        {
            "vacancy": "Middle Backend Developer (Python)",
            "title": "Разработка REST API для сервиса уведомлений",
            "employer_name": 'ООО "ТехноСофт"',
            "source": TaskSource.employer,
            "resume": ("candidat_3", "Python"),
            "description": "Разработать REST API для email и push-уведомлений.",
            "direction": Direction.backend,
            "grade": Grade.middle,
            "status": TaskStatus.evaluated,
            "result": TaskResult.accepted,
            "comment": "Отличная работа! Код чистый, хорошо структурирован.",
            "solution_url": "https://github.com/ivanov-dev/notifications-api",
            "received_at": datetime(2026, 9, 20),
            "deadline": datetime(2026, 9, 27),
            "accepted_at": datetime(2026, 9, 21),
            "submitted_at": datetime(2026, 9, 25),
            "evaluated_at": datetime(2026, 9, 28),
        },
        {
            "vacancy": "Junior Frontend Developer",
            "title": "Верстка адаптивного лендинга по макету из Figma",
            "employer_name": 'Студия "Digital Wave"',
            "source": TaskSource.employer,
            "resume": ("candidat", "TypeScript"),
            "description": "Сверстать адаптивный лендинг по готовому макету.",
            "direction": Direction.frontend,
            "grade": Grade.junior,
            "status": TaskStatus.evaluated,
            "result": TaskResult.rejected,
            "comment": "На планшете ломается сетка в секции 'Преимущества'.",
            "solution_url": "https://github.com/ivanov-dev/digital-wave-landing",
            "received_at": datetime(2026, 10, 1),
            "deadline": datetime(2026, 10, 5),
            "accepted_at": datetime(2026, 10, 2),
            "submitted_at": datetime(2026, 10, 4),
            "evaluated_at": datetime(2026, 10, 6),
        },
        {
            "title": "Алгоритмическая задача: оптимизация маршрутов",
            "employer_name": "ИИ",
            "source": TaskSource.ai,
            "resume": ("candidat_3", "Python"),
            "description": "Реализуйте алгоритм поиска кратчайшего пути в взвешенном графе.",
            "direction": Direction.backend,
            "grade": Grade.middle,
            "status": TaskStatus.submitted,
            "solution_url": "https://github.com/ivanov-dev/shortest-path",
            "received_at": datetime(2026, 10, 3),
            "deadline": datetime(2026, 10, 6),
            "accepted_at": datetime(2026, 10, 3),
            "submitted_at": datetime(2026, 10, 5),
            "ai_generated_at": datetime(2026, 10, 3),
        },
    ]
    task_ids = {}
    for data in tasks_data:
        vacancy_id = vacancies.get(data.get("vacancy")) if data.get("vacancy") else None
        resume_id = resumes.get(data["resume"]) if data.get("resume") else None
        obj = Task(
            vacancy_id=vacancy_id,
            resume_id=resume_id,
            title=data["title"],
            employer_name=data["employer_name"],
            source=data["source"],
            description=data["description"],
            direction=data.get("direction"),
            grade=data.get("grade"),
            status=data["status"],
            result=data.get("result"),
            comment=data.get("comment"),
            solution_url=data.get("solution_url"),
            is_public=False,
            received_at=data["received_at"],
            deadline=data.get("deadline"),
            accepted_at=data.get("accepted_at"),
            submitted_at=data.get("submitted_at"),
            evaluated_at=data.get("evaluated_at"),
            ai_generated_at=data.get("ai_generated_at"),
        )
        session.add(obj)
        session.flush()
        task_ids[data["title"]] = obj.id

    # --- Responses ---
    responses_data = [
        {
            "vacancy": "Senior Frontend Developer",
            "candidate": "candidat",
            "resume": ("candidat", "TypeScript"),
            "cover_letter": "Здравствуйте! Меня заинтересовала ваша вакансия.",
            "status": ResponseStatus.accepted,
            "task": "Разработка REST API для сервиса уведомлений",
            "created_at": datetime(2026, 10, 2),
            "viewed_at": datetime(2026, 10, 3),
            "responded_at": datetime(2026, 10, 5),
            "comment": "Отличное резюме! Приглашаем на собеседование.",
            "messages": [
                (
                    ChatSender.employer,
                    "Иван, здравствуйте! Спасибо за отклик.",
                    datetime(2026, 10, 3, 10, 15),
                ),
                (
                    ChatSender.candidate,
                    "Добрый день! Рад это слышать.",
                    datetime(2026, 10, 3, 11, 30),
                ),
            ],
        },
        {
            "vacancy": "Middle Backend Developer (Python)",
            "candidate": "candidat_3",
            "resume": ("candidat_3", "Python"),
            "cover_letter": "Добрый день! Увидел вашу вакансию.",
            "status": ResponseStatus.viewed,
            "task": "Алгоритмическая задача: оптимизация маршрутов",
            "created_at": datetime(2026, 10, 6),
            "viewed_at": datetime(2026, 10, 7),
            "messages": [
                (
                    ChatSender.employer,
                    "Не могли бы вы уточнить ваш опыт работы с FastAPI?",
                    datetime(2026, 10, 7, 14, 20),
                ),
            ],
        },
        {
            "vacancy": "Senior Frontend Developer",
            "candidate": "candidat_2",
            "resume": ("candidat_2", "React"),
            "cover_letter": "Добрый день! Имею 7 лет опыта во frontend.",
            "status": ResponseStatus.pending,
            "created_at": datetime(2026, 10, 4),
            "messages": [],
        },
    ]
    response_ids = {}
    for data in responses_data:
        vacancy_id = vacancies[data["vacancy"]]
        candidate_id = candidates[data["candidate"]]
        resume_id = resumes.get(data.get("resume"))
        task_id = task_ids.get(data.get("task")) if data.get("task") else None
        obj = Response(
            vacancy_id=vacancy_id,
            candidate_id=candidate_id,
            resume_id=resume_id,
            cover_letter=data["cover_letter"],
            status=data["status"],
            task_id=task_id,
            created_at=data["created_at"],
            viewed_at=data.get("viewed_at"),
            responded_at=data.get("responded_at"),
            comment=data.get("comment"),
        )
        session.add(obj)
        session.flush()
        response_ids[data["vacancy"] + "|" + data["candidate"]] = obj.id

        # Messages
        for sender, text_, ts in data.get("messages", []):
            session.add(
                ChatMessage(
                    response_id=obj.id,
                    sender=sender,
                    text=text_,
                    timestamp=ts,
                )
            )

    # --- Invitations ---
    invitations_data = [
        {
            "vacancy": "Senior Frontend Developer",
            "candidate": "candidat",
            "description": "Иван, мы ознакомились с вашим профилем и хотели бы пригласить вас.",
            "status": InvitationStatus.pending,
            "created_at": datetime(2026, 10, 9),
            "expires_at": datetime(2026, 10, 16),
            "messages": [],
        },
        {
            "vacancy": "Senior Backend Developer (Go)",
            "candidate": "candidat_5",
            "description": "Дмитрий, ваше резюме впечатлило нашу команду.",
            "status": InvitationStatus.pending,
            "created_at": datetime(2026, 10, 10),
            "expires_at": datetime(2026, 10, 17),
            "messages": [],
        },
        {
            "vacancy": "Middle Backend Developer (Python)",
            "candidate": "candidat",
            "description": "Иван, приглашаем вас рассмотреть вакансию.",
            "status": InvitationStatus.rejected,
            "created_at": datetime(2026, 10, 1),
            "responded_at": datetime(2026, 10, 2),
            "rejection_reason": "Спасибо! Сейчас сосредоточен на frontend.",
            "messages": [],
        },
    ]
    for data in invitations_data:
        vacancy_id = vacancies[data["vacancy"]]
        candidate_id = candidates[data["candidate"]]
        obj = Invitation(
            vacancy_id=vacancy_id,
            candidate_id=candidate_id,
            description=data["description"],
            status=data["status"],
            created_at=data["created_at"],
            expires_at=data.get("expires_at"),
            responded_at=data.get("responded_at"),
            rejection_reason=data.get("rejection_reason"),
        )
        session.add(obj)
        session.flush()
        for sender, text_, ts in data.get("messages", []):
            session.add(
                ChatMessage(
                    invitation_id=obj.id,
                    sender=sender,
                    text=text_,
                    timestamp=ts,
                )
            )

    logger.info("  ✓ Добавлены задания, отклики, приглашения, сообщения")


# ----------------------------------------------------------------------------
# 11. Банк вопросов
# ----------------------------------------------------------------------------
def seed_questions(session: Session, topics: dict[str, int]):
    """Заполняет questions и question_options."""
    logger.info("❓ Заполнение банка вопросов...")

    topic_id = topics.get("html-semantics")
    if not topic_id:
        logger.warning("  ⚠ Тема html-semantics не найдена, пропускаем вопросы")
        return

    questions_data = [
        {
            "text": "Какой атрибут используется для связи тега <label> с <input>?",
            "type": QuestionType.single,
            "correct_answer": "for",
            "options": [
                ("for", False),
                ("id", False),
                ("name", False),
                ("value", False),
            ],
        },
        {
            "text": "Какие теги являются семантическими в HTML5?",
            "type": QuestionType.multiple,
            "correct_answer": '["a", "b", "c"]',
            "options": [
                ("<article>", False),
                ("<nav>", False),
                ("<section>", False),
                ("<div>", True),
            ],
        },
        {
            "text": "Напишите CSS-свойство для скрытия элемента, сохраняя его в потоке.",
            "type": QuestionType.text,
            "correct_answer": "visibility: hidden",
            "options": [],
        },
    ]

    count = 0
    for q_data in questions_data:
        q = Question(
            topic_id=topic_id,
            text=q_data["text"],
            question_type=q_data["type"],
            correct_answer=q_data["correct_answer"],
        )
        session.add(q)
        session.flush()
        for opt_text, is_anti_ai in q_data["options"]:
            session.add(
                QuestionOption(
                    question_id=q.id,
                    text=opt_text,
                    is_anti_ai=is_anti_ai,
                )
            )
        count += 1

    logger.info(f"  ✓ Добавлено {count} вопросов с опциями")


# ----------------------------------------------------------------------------
# 12. Настройки
# ----------------------------------------------------------------------------
def seed_settings(
    session: Session,
    candidates: dict[str, int],
    companies: dict[str, int],
):
    """Заполняет candidate_settings и employer_settings."""
    logger.info("⚙️  Заполнение настроек...")

    session.add(
        CandidateSettings(
            candidate_id=candidates["candidat"],
            notifications='{"channels": {"email": true, "telegram": true, "inApp": true}, "events": {"newVacancies": true, "responseViewed": true}}',
            privacy='{"profileVisibility": "all", "hideCurrentEmployer": false, "showTestResults": true}',
            integrations='{"github": {"connected": true, "username": "ivanov-dev"}, "telegram": {"connected": true}}',
        )
    )

    session.add(
        EmployerSettings(
            company_id=companies["employer"],
            notifications='{"channels": {"email": true, "telegram": true, "inApp": true}}',
            vacancy_defaults='{"defaultDeadlineDays": 30, "defaultFormat": "hybrid", "showSalary": true}',
            privacy='{"companyVisibility": "public", "showContactEmail": true, "allowAiTaskGeneration": true}',
            integrations='{"telegram": {"connected": true, "username": "@technosoft_hr"}, "github": {"connected": true, "orgName": "technosoft"}}',
        )
    )

    logger.info("  ✓ Добавлены настройки")


# ============================================================================
# 🚀 Главный запуск
# ============================================================================


def _is_db_seeded(session: Session) -> bool:
    """Проверяет, заполнена ли БД (есть ли кандидаты)."""
    try:
        count = session.query(Candidate).count()
        return count > 0
    except Exception:
        return False


def seed_all(
    reset: bool = False, skip_keycloak: bool = False, skip_if_seeded: bool = False
):
    global _SKIP_KEYCLOAK
    _SKIP_KEYCLOAK = skip_keycloak

    logger.info("=" * 60)
    logger.info("🌱 Начинаем seed БД")

    with SessionLocal() as session:
        # Проверка: если БД уже заполнена и --reset не указан — выходим
        if skip_if_seeded and not reset and _is_db_seeded(session):
            logger.info("✅ БД уже заполнена (skip-if-seeded). Пропускаем.")
            logger.info("=" * 60)
            return

        if reset:
            logger.info("⚠️  Режим очистки БД активирован")
        if skip_keycloak:
            logger.info(
                "⚠️  Keycloak API пропущен — используем только fallback user_sub"
            )
        logger.info("=" * 60)

        try:
            if reset:
                _reset_db(session)

            # 1. Справочники
            soft_skills_dict = seed_soft_skill_dict(session)
            topics = seed_roadmap_topics(session)
            session.commit()

            # 2. Кандидаты
            candidates = seed_candidates(session)
            session.commit()

            # 3. Навыки кандидатов
            candidate_skills = seed_candidate_skills(session, candidates)
            session.commit()

            # 4. Тесты
            seed_topic_tests(session, candidate_skills, topics)
            session.commit()

            # 5. Связанные данные кандидатов
            resumes = seed_candidate_related(
                session, candidates, candidate_skills, soft_skills_dict
            )
            session.commit()

            # 6. Компании
            companies = seed_companies(session)
            session.commit()

            # 7. Команды компаний
            seed_company_members(session, companies)
            session.commit()

            # 8. Вакансии
            vacancies = seed_vacancies(session, companies, topics, soft_skills_dict)
            session.commit()

            # 9. Взаимодействия
            seed_interactions(session, candidates, companies, vacancies, resumes)
            session.commit()

            # 10. Вопросы
            seed_questions(session, topics)
            session.commit()

            # 11. Настройки
            seed_settings(session, candidates, companies)
            session.commit()

            logger.info("=" * 60)
            logger.info("✅ Seed завершён успешно!")
            logger.info("=" * 60)

        except Exception as e:
            session.rollback()
            logger.error(f"❌ Ошибка при seed: {e}")
            raise


def main():
    parser = argparse.ArgumentParser(description="Seed database with test data")
    parser.add_argument(
        "--reset", action="store_true", help="Очистить БД перед заполнением"
    )
    parser.add_argument(
        "--skip-keycloak",
        action="store_true",
        help="Не обращаться к Keycloak API, использовать только fallback user_sub",
    )
    parser.add_argument(
        "--skip-if-seeded",
        action="store_true",
        help="Пропустить seed, если БД уже заполнена",
    )
    args = parser.parse_args()

    try:
        seed_all(
            reset=args.reset,
            skip_keycloak=args.skip_keycloak,
            skip_if_seeded=args.skip_if_seeded,
        )
    except Exception as e:
        logger.error(f"Seed failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
