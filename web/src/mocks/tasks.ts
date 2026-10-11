import type { Task } from './types';

export const MOCK_TASKS: Task[] = [
    {
        id: 1,
        title: 'Разработка REST API для сервиса уведомлений',
        vacancyTitle: 'Middle Backend Developer',
        employer: 'ООО "ТехноСофт"',
        source: 'employer',
        resumeId: 2,
        resumeTitle: 'Backend Developer (Python)',
        description:
            'Необходимо разработать REST API для сервиса email и push-уведомлений. Требования:\n' +
            '• Эндпоинты для создания, получения и отмены уведомлений\n' +
            '• Интеграция с SMTP-сервером и Firebase Cloud Messaging\n' +
            '• Покрытие кода unit-тестами (минимум 80%)\n' +
            '• Документация в Swagger/OpenAPI\n' +
            '• Docker-compose для локального запуска\n\n' +
            'Стек: Python 3.11, FastAPI, PostgreSQL, Redis, pytest.',
        direction: 'backend',
        grade: 'middle',
        status: 'evaluated',
        result: 'accepted',
        comment:
            'Отличная работа! Код чистый, хорошо структурирован. Особенно понравилась реализация retry-логики для отправки писем. Приглашаем на следующий этап — техническое собеседование.',
        solutionUrl: 'https://github.com/ivanov-dev/notifications-api',
        solutionFileName: 'notifications-api.zip',
        isPublic: true,
        receivedAt: '2026-09-20',
        deadline: '2026-09-27',
        acceptedAt: '2026-09-21',
        submittedAt: '2026-09-25',
        evaluatedAt: '2026-09-28',
    },
    {
        id: 2,
        title: 'Верстка адаптивного лендинга по макету из Figma',
        vacancyTitle: 'Junior Frontend Developer',
        employer: 'Студия "Digital Wave"',
        source: 'employer',
        resumeId: 1,
        resumeTitle: 'Senior Frontend Developer',
        description:
            'Сверстать адаптивный лендинг по готовому макету в Figma. Требования:\n' +
            '• Pixel-perfect верстка (отклонения не более 2px)\n' +
            '• Брейкпоинты: 375px, 768px, 1024px, 1440px\n' +
            '• Использование CSS Grid и Flexbox\n' +
            '• Семантическая разметка, соответствие WCAG 2.1 AA',
        direction: 'frontend',
        grade: 'junior',
        status: 'evaluated',
        result: 'rejected',
        comment:
            'В целом хорошо, но на планшете ломается сетка в секции "Преимущества" (768px), не хватает aria-label для иконок соцсетей. Рекомендуем доработать и попробовать снова.',
        solutionUrl: 'https://github.com/ivanov-dev/digital-wave-landing',
        solutionFileName: 'landing.zip',
        isPublic: false,
        receivedAt: '2026-10-01',
        deadline: '2026-10-05',
        acceptedAt: '2026-10-02',
        submittedAt: '2026-10-04',
        evaluatedAt: '2026-10-06',
    },
    {
        id: 3,
        title: 'Алгоритмическая задача: оптимизация маршрутов',
        employer: 'ИИ',
        source: 'ai',
        resumeId: 2,
        resumeTitle: 'Backend Developer (Python)',
        description:
            'Реализуйте алгоритм поиска кратчайшего пути в взвешенном графе с учётом ограничений по времени.\n\n' +
            'Входные данные:\n' +
            '• N вершин (до 10 000)\n' +
            '• M рёбер (до 50 000)\n' +
            '• Ограничение по времени прохождения пути T\n\n' +
            'Требования к решению:\n' +
            '• Сложность O((N + M) log N) или лучше\n' +
            '• Покрытие unit-тестами (граничные случаи обязательны)\n' +
            '• Язык: Python, Go или TypeScript на выбор',
        direction: 'backend',
        grade: 'middle',
        status: 'submitted',
        solutionUrl: 'https://github.com/ivanov-dev/shortest-path',
        solutionFileName: 'shortest-path.zip',
        receivedAt: '2026-10-03',
        deadline: '2026-10-06',
        acceptedAt: '2026-10-03',
        submittedAt: '2026-10-05',
        aiGeneratedAt: '2026-10-03',
    },
    {
        id: 4,
        title: 'Настройка CI/CD пайплайна для микросервиса',
        vacancyTitle: 'Junior DevOps Engineer',
        employer: 'АО "ИнфраТех"',
        source: 'employer',
        resumeId: 3,
        resumeTitle: 'DevOps Engineer (Docker)',
        description:
            'Настроить CI/CD пайплайн для учебного микросервиса на Node.js. Требования:\n' +
            '• GitLab CI или GitHub Actions\n' +
            '• Этапы: lint → test → build → docker build → push to registry → deploy to staging\n' +
            '• Интеграция с SonarQube для анализа кода\n' +
            '• Автоматическое создание release-тегов',
        direction: 'devops',
        grade: 'junior',
        status: 'in_progress',
        receivedAt: '2026-10-07',
        deadline: '2026-10-14',
        acceptedAt: '2026-10-08',
    },
    {
        id: 5,
        title: 'Мобильное приложение: трекер привычек',
        vacancyTitle: 'Middle Mobile Developer',
        employer: 'ИИ',
        source: 'ai',
        resumeId: 4,
        resumeTitle: 'Mobile Developer (React Native)',
        description:
            'Разработать прототип мобильного приложения для трекинга привычек.\n\n' +
            'Функциональность:\n' +
            '• Создание, редактирование и удаление привычек\n' +
            '• Ежедневные напоминания (push-уведомления)\n' +
            '• Визуализация прогресса (графики, streaks)\n' +
            '• Локальное хранение данных (SQLite / Realm)\n' +
            '• Тёмная тема\n\n' +
            'Технические требования:\n' +
            '• React Native или Flutter\n' +
            '• Архитектура: Clean Architecture или MVVM',
        direction: 'mobile',
        grade: 'middle',
        status: 'pending',
        receivedAt: '2026-10-08',
        deadline: '2026-10-20',
        aiGeneratedAt: '2026-10-08',
    },
    {
        id: 6,
        title: 'Тестовое задание: анализ данных продаж',
        vacancyTitle: 'Junior Data Analyst',
        employer: 'Ритейл-группа "МаркетПро"',
        source: 'employer',
        resumeId: 1,
        resumeTitle: 'Senior Frontend Developer',
        description:
            'На основе предоставленного датасета (10 000 транзакций за квартал) провести анализ:\n' +
            '• Выявить топ-10 самых продаваемых товаров\n' +
            '• Построить прогноз продаж на следующий месяц\n' +
            '• Найти аномалии в данных\n' +
            '• Подготовить отчёт в Jupyter Notebook с визуализациями\n\n' +
            'Стек: Python, pandas, matplotlib/seaborn.',
        direction: 'data',
        grade: 'junior',
        status: 'pending',
        receivedAt: '2026-10-10',
        deadline: '2026-10-17',
    },
];