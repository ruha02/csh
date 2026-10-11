import type { RoadmapNode, Skill, TopicTest } from './types';

// ============================================================================
// 🗺️ Дорожные карты
// ============================================================================
export const ROADMAPS: Record<string, RoadmapNode[]> = {
    frontend: [
        {
            key: 'basics',
            title: 'Основы веб-разработки',
            children: [
                {
                    key: 'html',
                    title: 'HTML5',
                    children: [
                        { key: 'html-semantics', title: 'Семантическая верстка' },
                        { key: 'html-forms', title: 'Формы и валидация' },
                        { key: 'html-a11y', title: 'Доступность (a11y)' },
                    ],
                },
                {
                    key: 'css',
                    title: 'CSS3',
                    children: [
                        { key: 'css-flexbox', title: 'Flexbox' },
                        { key: 'css-grid', title: 'CSS Grid' },
                        { key: 'css-animations', title: 'Анимации и transitions' },
                        { key: 'css-responsive', title: 'Адаптивная верстка' },
                    ],
                },
                {
                    key: 'js',
                    title: 'JavaScript',
                    children: [
                        { key: 'js-es6', title: 'ES6+ синтаксис' },
                        { key: 'js-dom', title: 'Работа с DOM' },
                        { key: 'js-async', title: 'Async/Await и Promises' },
                        { key: 'js-modules', title: 'Модули и сборка' },
                    ],
                },
            ],
        },
        {
            key: 'frameworks',
            title: 'Фреймворки и библиотеки',
            children: [
                {
                    key: 'react',
                    title: 'React',
                    children: [
                        { key: 'react-components', title: 'Компоненты и JSX' },
                        { key: 'react-hooks', title: 'Hooks (useState, useEffect, useContext)' },
                        { key: 'react-state', title: 'State Management (Redux, Zustand)' },
                        { key: 'react-routing', title: 'React Router' },
                    ],
                },
                {
                    key: 'typescript',
                    title: 'TypeScript',
                    children: [
                        { key: 'ts-types', title: 'Типы и интерфейсы' },
                        { key: 'ts-generics', title: 'Дженерики' },
                        { key: 'ts-utility', title: 'Utility Types' },
                    ],
                },
            ],
        },
        {
            key: 'tools',
            title: 'Инструменты',
            children: [
                { key: 'git', title: 'Git и GitHub' },
                { key: 'webpack', title: 'Webpack/Vite' },
                { key: 'testing', title: 'Тестирование (Jest, RTL)' },
                { key: 'performance', title: 'Оптимизация производительности' },
            ],
        },
    ],
    backend: [
        {
            key: 'basics',
            title: 'Основы backend-разработки',
            children: [
                {
                    key: 'languages',
                    title: 'Языки программирования',
                    children: [
                        { key: 'python', title: 'Python (FastAPI, Django)' },
                        { key: 'nodejs', title: 'Node.js (Express, NestJS)' },
                        { key: 'go', title: 'Go (Gin, Echo)' },
                    ],
                },
                {
                    key: 'databases',
                    title: 'Базы данных',
                    children: [
                        { key: 'sql', title: 'SQL (PostgreSQL, MySQL)' },
                        { key: 'nosql', title: 'NoSQL (MongoDB, Redis)' },
                        { key: 'orm', title: 'ORM (SQLAlchemy, Prisma)' },
                    ],
                },
            ],
        },
        {
            key: 'api',
            title: 'API и протоколы',
            children: [
                { key: 'rest', title: 'REST API' },
                { key: 'graphql', title: 'GraphQL' },
                { key: 'websocket', title: 'WebSocket' },
                { key: 'auth', title: 'Аутентификация (JWT, OAuth)' },
            ],
        },
        {
            key: 'architecture',
            title: 'Архитектура',
            children: [
                { key: 'patterns', title: 'Паттерны проектирования' },
                { key: 'microservices', title: 'Микросервисы' },
                { key: 'cqrs', title: 'CQRS и Event Sourcing' },
            ],
        },
    ],
    devops: [
        {
            key: 'containers',
            title: 'Контейнеризация',
            children: [
                { key: 'docker', title: 'Docker' },
                { key: 'docker-compose', title: 'Docker Compose' },
                { key: 'kubernetes', title: 'Kubernetes' },
            ],
        },
        {
            key: 'ci-cd',
            title: 'CI/CD',
            children: [
                { key: 'gitlab-ci', title: 'GitLab CI' },
                { key: 'github-actions', title: 'GitHub Actions' },
                { key: 'jenkins', title: 'Jenkins' },
            ],
        },
        {
            key: 'monitoring',
            title: 'Мониторинг и логирование',
            children: [
                { key: 'prometheus', title: 'Prometheus' },
                { key: 'grafana', title: 'Grafana' },
                { key: 'elk', title: 'ELK Stack' },
            ],
        },
    ],
    mobile: [
        {
            key: 'platforms',
            title: 'Платформы',
            children: [
                { key: 'ios', title: 'iOS (Swift)' },
                { key: 'android', title: 'Android (Kotlin)' },
                { key: 'cross-platform', title: 'Cross-platform (RN, Flutter)' },
            ],
        },
        {
            key: 'concepts',
            title: 'Концепции',
            children: [
                { key: 'ui-ux', title: 'UI/UX для мобильных' },
                { key: 'offline', title: 'Offline-first' },
                { key: 'push', title: 'Push-уведомления' },
            ],
        },
    ],
    data: [
        {
            key: 'ml',
            title: 'Machine Learning',
            children: [
                { key: 'supervised', title: 'Supervised Learning' },
                { key: 'unsupervised', title: 'Unsupervised Learning' },
                { key: 'deep-learning', title: 'Deep Learning' },
            ],
        },
        {
            key: 'tools',
            title: 'Инструменты',
            children: [
                { key: 'pandas', title: 'Pandas, NumPy' },
                { key: 'sklearn', title: 'Scikit-learn' },
                { key: 'tensorflow', title: 'TensorFlow/PyTorch' },
            ],
        },
    ],
    qa: [
        {
            key: 'testing-types',
            title: 'Виды тестирования',
            children: [
                { key: 'manual', title: 'Ручное тестирование' },
                { key: 'automation', title: 'Автоматизация тестирования' },
                { key: 'performance', title: 'Нагрузочное тестирование' },
            ],
        },
        {
            key: 'tools-qa',
            title: 'Инструменты',
            children: [
                { key: 'selenium', title: 'Selenium' },
                { key: 'cypress', title: 'Cypress' },
                { key: 'postman', title: 'Postman' },
            ],
        },
    ],
};

// ============================================================================
// 🧪 Моковые навыки
// ============================================================================
export const MOCK_SKILLS: Skill[] = [
    { id: 1, direction: 'frontend', grade: 'middle', language: 'TypeScript', confidence: 0 },
    { id: 2, direction: 'backend', grade: 'junior', language: 'Python', confidence: 0 },
    { id: 3, direction: 'devops', grade: 'junior', language: 'Docker', confidence: 0 },
    { id: 4, direction: 'mobile', grade: 'middle', language: 'React Native', confidence: 0 },
];

// ============================================================================
// 🧪 Моковые результаты тестов по темам
// ============================================================================
export const MOCK_TOPIC_TESTS: TopicTest[] = [
    // Frontend (skillId: 1)
    { topicKey: 'html-semantics', skillId: 1, testName: 'Семантическая HTML-верстка', bestScore: 90, lastScore: 90, attempts: 1, passed: true, lastAttemptDate: '2026-10-01', locked: false },
    { topicKey: 'html-forms', skillId: 1, testName: 'HTML-формы и валидация', bestScore: 75, lastScore: 75, attempts: 2, passed: true, lastAttemptDate: '2026-10-03', locked: false },
    { topicKey: 'html-a11y', skillId: 1, testName: 'Доступность (a11y)', bestScore: 0, lastScore: 0, attempts: 0, passed: false, locked: false },
    { topicKey: 'css-flexbox', skillId: 1, testName: 'Flexbox', bestScore: 100, lastScore: 100, attempts: 1, passed: true, lastAttemptDate: '2026-09-25', locked: false },
    { topicKey: 'css-grid', skillId: 1, testName: 'CSS Grid', bestScore: 85, lastScore: 85, attempts: 1, passed: true, lastAttemptDate: '2026-09-28', locked: false },
    { topicKey: 'css-animations', skillId: 1, testName: 'CSS-анимации', bestScore: 60, lastScore: 60, attempts: 3, passed: false, lastAttemptDate: '2026-09-10', nextAttemptDate: '2026-10-10', locked: true },
    { topicKey: 'css-responsive', skillId: 1, testName: 'Адаптивная верстка', bestScore: 80, lastScore: 80, attempts: 1, passed: true, lastAttemptDate: '2026-10-02' },
    { topicKey: 'js-es6', skillId: 1, testName: 'ES6+ синтаксис', bestScore: 95, lastScore: 95, attempts: 1, passed: true, lastAttemptDate: '2026-09-20' },
    { topicKey: 'js-dom', skillId: 1, testName: 'Работа с DOM', bestScore: 70, lastScore: 70, attempts: 2, passed: true, lastAttemptDate: '2026-09-22' },
    { topicKey: 'js-async', skillId: 1, testName: 'Async/Await и Promises', bestScore: 45, lastScore: 45, attempts: 2, passed: false, lastAttemptDate: '2026-10-04' },
    { topicKey: 'js-modules', skillId: 1, testName: 'Модули и сборка', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'react-components', skillId: 1, testName: 'Компоненты и JSX', bestScore: 100, lastScore: 100, attempts: 1, passed: true, lastAttemptDate: '2026-09-15' },
    { topicKey: 'react-hooks', skillId: 1, testName: 'React Hooks', bestScore: 88, lastScore: 88, attempts: 1, passed: true, lastAttemptDate: '2026-09-18' },
    { topicKey: 'react-state', skillId: 1, testName: 'State Management', bestScore: 55, lastScore: 55, attempts: 1, passed: false, lastAttemptDate: '2026-10-06' },
    { topicKey: 'react-routing', skillId: 1, testName: 'React Router', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'ts-types', skillId: 1, testName: 'Типы и интерфейсы', bestScore: 82, lastScore: 82, attempts: 1, passed: true, lastAttemptDate: '2026-09-30' },
    { topicKey: 'ts-generics', skillId: 1, testName: 'Дженерики', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'ts-utility', skillId: 1, testName: 'Utility Types', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'git', skillId: 1, testName: 'Git и GitHub', bestScore: 95, lastScore: 95, attempts: 1, passed: true, lastAttemptDate: '2026-09-10' },
    { topicKey: 'webpack', skillId: 1, testName: 'Webpack/Vite', bestScore: 40, lastScore: 40, attempts: 1, passed: false, lastAttemptDate: '2026-10-07' },
    { topicKey: 'testing', skillId: 1, testName: 'Jest и React Testing Library', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'performance', skillId: 1, testName: 'Оптимизация производительности', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    // Backend (skillId: 2)
    { topicKey: 'python', skillId: 2, testName: 'Python (FastAPI)', bestScore: 70, lastScore: 70, attempts: 2, passed: true, lastAttemptDate: '2026-10-01' },
    { topicKey: 'nodejs', skillId: 2, testName: 'Node.js (Express)', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'go', skillId: 2, testName: 'Go (Gin)', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'sql', skillId: 2, testName: 'SQL (PostgreSQL)', bestScore: 65, lastScore: 65, attempts: 1, passed: false, lastAttemptDate: '2026-10-05' },
    { topicKey: 'nosql', skillId: 2, testName: 'NoSQL (MongoDB)', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'orm', skillId: 2, testName: 'ORM (SQLAlchemy)', bestScore: 30, lastScore: 30, attempts: 1, passed: false, lastAttemptDate: '2026-10-08' },
    { topicKey: 'rest', skillId: 2, testName: 'REST API', bestScore: 85, lastScore: 85, attempts: 1, passed: true, lastAttemptDate: '2026-09-28' },
    { topicKey: 'graphql', skillId: 2, testName: 'GraphQL', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'websocket', skillId: 2, testName: 'WebSocket', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'auth', skillId: 2, testName: 'Аутентификация (JWT)', bestScore: 50, lastScore: 50, attempts: 1, passed: false, lastAttemptDate: '2026-10-03' },
    { topicKey: 'patterns', skillId: 2, testName: 'Паттерны проектирования', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'microservices', skillId: 2, testName: 'Микросервисы', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
    { topicKey: 'cqrs', skillId: 2, testName: 'CQRS и Event Sourcing', bestScore: 0, lastScore: 0, attempts: 0, passed: false },
];