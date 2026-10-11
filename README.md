# 🎯 Cyber Sport Hunter (CSH)

**Платформа для подбора IT-специалистов** на основе верифицированных навыков, результатов тестирования и достижений в Федерации спортивного программирования (ФСП).

Проект объединяет кандидатов, работодателей и администраторов в единой экосистеме с прозрачной системой оценки компетенций через дорожные карты (Roadmaps) и автоматизированное тестирование.

---

## ✨ Возможности

### 👤 Для кандидатов
- 📝 Ведение анкеты: образование, опыт работы, soft skills
- 🎯 Добавление навыков с привязкой к дорожным картам (Frontend, Backend, DevOps, Mobile, Data, QA)
- 🧪 Прохождение тестов по темам (3 попытки, лучший результат, блокировка на 30 дней)
- 🏆 Интеграция с базой ФСП — автоматический импорт достижений
- 📄 Создание нескольких резюме под разные навыки
- 💼 Отклики на вакансии и получение приглашений
- 🤖 Запрос тестовых заданий у ИИ
- 💬 Чат с работодателями
- ⚙️ Гибкие настройки приватности и уведомлений

### 🏢 Для работодателей
- 🏗️ Профиль компании с описанием, технологиями и преимуществами
- 💼 Публикация вакансий с требованиями к hard/soft skills
- 🔍 Умный подбор кандидатов с расчётом % соответствия
- 📨 Управление откликами (шорт-лист, отклонение, отправка заданий)
- 🤝 Система приглашений кандидатов
- 👥 Команда с ролями (owner, hr, hiring_manager, viewer)
- 🔗 Интеграции с Telegram, hh.ru, Habr Career, GitHub

### 🛡️ Для администраторов
- 👥 Модерация кандидатов и работодателей (верификация, блокировка)
- 📚 Управление справочниками: направления, грейды, темы тестов, soft skills
- 📊 Статистика по платформе

---

## 🛠️ Стек технологий

| Слой | Технологии |
|------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Ant Design v5, React Router v6, Axios |
| **Backend** | FastAPI, SQLAlchemy 2.x, Alembic, Pydantic v2, Celery |
| **БД** | PostgreSQL 17, Redis 8 |
| **Авторизация** | Keycloak (SSO, JWT, realm roles) |
| **Инфраструктура** | Docker, Docker Compose, Traefik v3.7 (reverse proxy) |
| **Шрифты** | JetBrains Mono (основной), Unbounded (заголовки) |
| **Цвета** |  `#402FFF` — primary (синий)
|           |  `#EC1D35` — error/accent (красный)
|           |  `#EDEDED` — background layout
|           |  `#1B1C21` — text dark / header bg
|           |  `#C8C9CA` — muted text |

---

## 🚀 Локальный деплой

### Предварительные требования

- **Docker** и **Docker Compose** (v2+)
- **Git**
- Свободные порты: `80`, `3000`, `5432`, `6379`, `8000`, `8080`, `8081`

### 1. Клонирование репозитория

```bash
git clone [https://github.com/ruha02/csh](https://github.com/ruha02/csh)
cd csh
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта (или скопируйте из `.env.example`):

```bash
cp .env.example .env
```

Содержимое `.env`:

```env
APP_NAME=csh
PSQL_USERNAME=admin
PSQL_PASSOWRD=password
PSQL_DATABASE=csh_db
KC_ADMIN=admin
KC_PASSWORD=password
```

### 3. Запуск проекта

#### 🐧 Linux / macOS

```bash
chmod +x setup.sh
./setup.sh
```

#### 🪟 Windows

```cmd
setup.cmd
```

#### 🔧 Или вручную через Docker Compose

```bash
docker-compose up -d
```

Скрипты `setup.sh` / `setup.cmd` автоматически:
- Запустят все сервисы
- Дождутся завершения миграций БД (`alembic upgrade head`)
- Выполнят seed тестовых данных
- Выведут логи миграций и seed

### 4. Проверка работоспособности

```bash
docker-compose ps
```

Все сервисы должны иметь статус `Up` или `Exit 0` для одноразовых (`migrate`, `seed`, `keycloak-setup`).

---

## 🌐 Доступные URL

| Сервис | URL | Описание |
|--------|-----|----------|
| 🖥️ **Frontend** | http://web.localhost | Веб-интерфейс приложения |
| 📡 **API** | http://api.localhost/docs | Swagger UI (документация API) |
| 🔐 **Keycloak Admin** | http://kc.localhost:8081/admin | Консоль управления Keycloak |
| 🚦 **Traefik Dashboard** | http://localhost:8080 | Мониторинг reverse proxy |
| 🗄️ **PostgreSQL** | `localhost:5432` | База данных |
| ⚡ **Redis** | `localhost:6379` | Кэш и брокер Celery |

---

## 👥 Тестовые пользователи

Все пароли: `password123`

| Роль | Логин | Email | Описание |
|------|-------|-------|----------|
| 👤 Кандидат | `candidat` | ivanov@goodgenius.ru | Frontend-разработчик, Senior |
| 🏢 Работодатель | `employer` | employer@goodgenius.ru | Владелец ООО "ТехноСофт" |
| 🛡️ Администратор | `admin` | admin@goodgenius.ru | Администратор платформы |

> 💡 **Быстрый вход**: на странице логина Keycloak есть кнопки быстрого входа для dev-режима.

---

## 📁 Структура проекта

```
csh/
├── app/                    # Backend (FastAPI)
│   ├── alembic/            # Миграции БД
│   ├── core/               # Конфиг, auth, security, DB
│   ├── db/models/          # SQLAlchemy модели
│   ├── routers/            # API endpoints (admin, candidate, employer)
│   ├── schemas/            # Pydantic схемы
│   ├── workers/            # Celery воркеры
│   ├── main.py             # Точка входа FastAPI
│   └── seed.py             # Скрипт заполнения БД тестовыми данными
├── web/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/            # Axios клиент и API методы
│   │   ├── components/     # Переиспользуемые компоненты
│   │   ├── pages/          # Страницы (candidate/, employer/, admin/)
│   │   ├── App.tsx         # Корневой компонент с роутингом
│   │   └── keycloak.ts     # Конфигурация Keycloak
│   └── package.json
├── keycloak/               # Конфигурация Keycloak
│   ├── realm.json          # Экспорт realm csh
│   ├── scripts/            # Скрипты настройки Keycloak
│   └── themes/fsp/         # Кастомная тема логина
├── docker-compose.yml      # Оркестрация сервисов
├── .env.example            # Шаблон переменных окружения
├── setup.sh                # Скрипт запуска (Linux/macOS)
└── setup.cmd               # Скрипт запуска (Windows)
```

---


## 🧪 API тестирование

После запуска откройте http://api.localhost/docs — Swagger UI с полным описанием всех эндпоинтов.

Для авторизации в Swagger:
1. Получите токен через Keycloak: `POST http://kc.localhost:8081/realms/csh/protocol/openid-connect/token`
2. Используйте `Authorize` в Swagger UI с `Bearer <token>`

---

## 📄 Лицензия

Проект распространяется под лицензией **Apache License 2.0**.

© Good Genius 2026
```
