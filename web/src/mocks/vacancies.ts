import type { Vacancy } from './types';

export const MOCK_VACANCIES: Vacancy[] = [
    {
        id: 1,
        employer: 'ООО "ТехноСофт"',
        direction: 'frontend',
        grade: 'senior',
        salaryFrom: 300000,
        salaryTo: 450000,
        currency: 'RUB',
        description:
            'Мы ищем опытного Frontend-разработчика для работы над крупным финтех-проектом. ' +
            'Вы будете отвечать за архитектуру фронтенда, менторство младших разработчиков и внедрение лучших практик.\n\n' +
            'Основные задачи:\n' +
            '• Разработка и поддержка SPA на React + TypeScript\n' +
            '• Оптимизация производительности и доступности\n' +
            '• Участие в код-ревью и архитектурных решениях\n' +
            '• Менторство junior/middle разработчиков',
        hardSkills: [
            { topicKey: 'react-hooks', requiredPercent: 85 },
            { topicKey: 'react-state', requiredPercent: 80 },
            { topicKey: 'ts-generics', requiredPercent: 75 },
            { topicKey: 'ts-utility', requiredPercent: 70 },
            { topicKey: 'testing', requiredPercent: 75 },
            { topicKey: 'performance', requiredPercent: 80 },
        ],
        softSkills: [
            'Лидерские качества',
            'Умение менторить',
            'Аналитическое мышление',
            'Коммуникабельность',
        ],
        location: 'Москва',
        isRemote: true,
        publishedAt: '2026-10-01',
        deadline: '2026-11-01',
    },
    {
        id: 2,
        employer: 'АО "Инновационные Решения"',
        direction: 'backend',
        grade: 'junior',
        salaryFrom: 200000,
        salaryTo: 300000,
        currency: 'RUB',
        description:
            'Разработка микросервисов для e-commerce платформы. Работа в команде из 8 backend-разработчиков.\n\n' +
            'Что предстоит делать:\n' +
            '• Разработка REST API на FastAPI\n' +
            '• Работа с PostgreSQL и Redis\n' +
            '• Интеграция с внешними сервисами\n' +
            '• Написание unit и integration тестов',
        hardSkills: [
            { topicKey: 'python', requiredPercent: 75 },
            { topicKey: 'sql', requiredPercent: 70 },
            { topicKey: 'orm', requiredPercent: 65 },
            { topicKey: 'rest', requiredPercent: 80 },
            { topicKey: 'auth', requiredPercent: 70 },
        ],
        softSkills: [
            'Работа в команде',
            'Внимательность к деталям',
            'Самоорганизованность',
        ],
        location: 'Санкт-Петербург',
        isRemote: false,
        publishedAt: '2026-10-05',
        deadline: '2026-11-05',
    },
    {
        id: 3,
        employer: 'Студия "Digital Wave"',
        direction: 'frontend',
        grade: 'junior',
        salaryFrom: 120000,
        salaryTo: 180000,
        currency: 'RUB',
        description:
            'Ищем начинающего Frontend-разработчика для работы над SaaS-платформой. ' +
            'Отличный шанс расти вместе с командой!\n\n' +
            'Что нужно делать:\n' +
            '• Вёрстка компонентов по макетам из Figma\n' +
            '• Разработка простых интерфейсов на React\n' +
            '• Интеграция с API\n' +
            '• Исправление багов',
        hardSkills: [
            { topicKey: 'html-semantics', requiredPercent: 60 },
            { topicKey: 'css-flexbox', requiredPercent: 65 },
            { topicKey: 'css-grid', requiredPercent: 60 },
            { topicKey: 'js-es6', requiredPercent: 60 },
            { topicKey: 'react-components', requiredPercent: 55 },
        ],
        softSkills: [
            'Желание учиться',
            'Ответственность',
            'Внимательность',
        ],
        location: 'Москва',
        isRemote: true,
        publishedAt: '2026-10-09',
        deadline: '2026-11-25',
    },
    {
        id: 4,
        employer: 'Финтех-компания "АльфаКод"',
        direction: 'backend',
        grade: 'senior',
        salaryFrom: 350000,
        salaryTo: 500000,
        currency: 'RUB',
        description:
            'Разработка высоконагруженных микросервисов для финансовой платформы. ' +
            'Работа со сложной бизнес-логикой и большими данными.\n\n' +
            'Задачи:\n' +
            '• Проектирование архитектуры микросервисов\n' +
            '• Оптимизация производительности БД\n' +
            '• Менторство middle-разработчиков\n' +
            '• Участие в технических решениях',
        hardSkills: [
            { topicKey: 'python', requiredPercent: 90 },
            { topicKey: 'sql', requiredPercent: 85 },
            { topicKey: 'microservices', requiredPercent: 85 },
            { topicKey: 'patterns', requiredPercent: 80 },
            { topicKey: 'cqrs', requiredPercent: 70 },
        ],
        softSkills: [
            'Аналитическое мышление',
            'Лидерские качества',
            'Самостоятельность',
        ],
        location: 'Москва',
        isRemote: false,
        publishedAt: '2026-09-28',
        deadline: '2026-10-28',
    },
];