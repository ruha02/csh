import type { AdminDirection, AdminGrade, AdminSoftSkill, AdminTopic } from './types';

export const MOCK_ADMIN_DIRECTIONS: AdminDirection[] = [
    {
        key: 'frontend',
        label: 'Frontend',
        color: '#402FFF',
        description: 'Клиентская разработка: HTML, CSS, JavaScript, React, Vue, Angular',
        isActive: true,
        topicsCount: 22,
    },
    {
        key: 'backend',
        label: 'Backend',
        color: '#52c41a',
        description: 'Серверная разработка: Python, Node.js, Go, Java, базы данных',
        isActive: true,
        topicsCount: 13,
    },
    {
        key: 'devops',
        label: 'DevOps',
        color: '#fa8c16',
        description: 'Инфраструктура: Docker, Kubernetes, CI/CD, мониторинг',
        isActive: true,
        topicsCount: 9,
    },
    {
        key: 'mobile',
        label: 'Mobile',
        color: '#13c2c2',
        description: 'Мобильная разработка: iOS, Android, React Native, Flutter',
        isActive: true,
        topicsCount: 6,
    },
    {
        key: 'data',
        label: 'Data Science',
        color: '#722ed1',
        description: 'Анализ данных и машинное обучение: Python, ML, статистика',
        isActive: true,
        topicsCount: 6,
    },
    {
        key: 'qa',
        label: 'QA',
        color: '#eb2f96',
        description: 'Тестирование: ручное, автоматизация, нагрузочное',
        isActive: true,
        topicsCount: 6,
    },
];

export const MOCK_ADMIN_GRADES: AdminGrade[] = [
    {
        key: 'junior',
        label: 'Начинающий',
        color: '#87d068',
        threshold: 50,
        description: 'Опыт до 1 года. Базовые знания технологий, готовность учиться',
    },
    {
        key: 'middle',
        label: 'Продвинутый',
        color: '#2db7f5',
        threshold: 70,
        description: 'Опыт 1-3 года. Уверенное владение стеком, самостоятельная работа',
    },
    {
        key: 'senior',
        label: 'Профессионал',
        color: '#f50',
        threshold: 85,
        description: 'Опыт 3+ лет. Экспертные знания, менторство, архитектурные решения',
    },
];

export const MOCK_ADMIN_TOPICS: AdminTopic[] = [
    // Frontend
    { key: 'html-semantics', title: 'Семантическая HTML-верстка', direction: 'frontend', parentKey: 'html', testsCount: 45, avgScore: 82, isActive: true },
    { key: 'html-forms', title: 'HTML-формы и валидация', direction: 'frontend', parentKey: 'html', testsCount: 38, avgScore: 75, isActive: true },
    { key: 'html-a11y', title: 'Доступность (a11y)', direction: 'frontend', parentKey: 'html', testsCount: 22, avgScore: 68, isActive: true },
    { key: 'css-flexbox', title: 'Flexbox', direction: 'frontend', parentKey: 'css', testsCount: 52, avgScore: 88, isActive: true },
    { key: 'css-grid', title: 'CSS Grid', direction: 'frontend', parentKey: 'css', testsCount: 48, avgScore: 85, isActive: true },
    { key: 'css-animations', title: 'CSS-анимации', direction: 'frontend', parentKey: 'css', testsCount: 30, avgScore: 60, isActive: true },
    { key: 'css-responsive', title: 'Адаптивная верстка', direction: 'frontend', parentKey: 'css', testsCount: 44, avgScore: 80, isActive: true },
    { key: 'js-es6', title: 'ES6+ синтаксис', direction: 'frontend', parentKey: 'js', testsCount: 58, avgScore: 90, isActive: true },
    { key: 'js-dom', title: 'Работа с DOM', direction: 'frontend', parentKey: 'js', testsCount: 40, avgScore: 78, isActive: true },
    { key: 'js-async', title: 'Async/Await и Promises', direction: 'frontend', parentKey: 'js', testsCount: 35, avgScore: 72, isActive: true },
    { key: 'react-hooks', title: 'React Hooks', direction: 'frontend', parentKey: 'react', testsCount: 55, avgScore: 86, isActive: true },
    { key: 'react-state', title: 'State Management', direction: 'frontend', parentKey: 'react', testsCount: 42, avgScore: 75, isActive: true },
    { key: 'ts-generics', title: 'Дженерики', direction: 'frontend', parentKey: 'typescript', testsCount: 28, avgScore: 65, isActive: true },
    // Backend
    { key: 'python', title: 'Python (FastAPI)', direction: 'backend', parentKey: 'languages', testsCount: 62, avgScore: 85, isActive: true },
    { key: 'nodejs', title: 'Node.js (Express)', direction: 'backend', parentKey: 'languages', testsCount: 38, avgScore: 78, isActive: true },
    { key: 'go', title: 'Go (Gin)', direction: 'backend', parentKey: 'languages', testsCount: 25, avgScore: 72, isActive: true },
    { key: 'sql', title: 'SQL (PostgreSQL)', direction: 'backend', parentKey: 'databases', testsCount: 58, avgScore: 82, isActive: true },
    { key: 'nosql', title: 'NoSQL (MongoDB)', direction: 'backend', parentKey: 'databases', testsCount: 32, avgScore: 70, isActive: true },
    { key: 'rest', title: 'REST API', direction: 'backend', parentKey: 'api', testsCount: 65, avgScore: 88, isActive: true },
    { key: 'graphql', title: 'GraphQL', direction: 'backend', parentKey: 'api', testsCount: 20, avgScore: 68, isActive: true },
    { key: 'microservices', title: 'Микросервисы', direction: 'backend', parentKey: 'architecture', testsCount: 35, avgScore: 75, isActive: true },
    // DevOps
    { key: 'docker', title: 'Docker', direction: 'devops', parentKey: 'containers', testsCount: 48, avgScore: 85, isActive: true },
    { key: 'kubernetes', title: 'Kubernetes', direction: 'devops', parentKey: 'containers', testsCount: 30, avgScore: 72, isActive: true },
    { key: 'gitlab-ci', title: 'GitLab CI', direction: 'devops', parentKey: 'ci-cd', testsCount: 35, avgScore: 78, isActive: true },
    { key: 'prometheus', title: 'Prometheus', direction: 'devops', parentKey: 'monitoring', testsCount: 22, avgScore: 68, isActive: true },
];

export const MOCK_ADMIN_SOFT_SKILLS: AdminSoftSkill[] = [
    { id: 1, name: 'Коммуникабельность', category: 'Межличностные', usageCount: 245, isActive: true },
    { id: 2, name: 'Работа в команде', category: 'Межличностные', usageCount: 238, isActive: true },
    { id: 3, name: 'Аналитическое мышление', category: 'Когнитивные', usageCount: 189, isActive: true },
    { id: 4, name: 'Тайм-менеджмент', category: 'Организационные', usageCount: 156, isActive: true },
    { id: 5, name: 'Адаптивность', category: 'Личностные', usageCount: 142, isActive: true },
    { id: 6, name: 'Лидерские качества', category: 'Управленческие', usageCount: 128, isActive: true },
    { id: 7, name: 'Умение менторить', category: 'Управленческие', usageCount: 95, isActive: true },
    { id: 8, name: 'Внимательность к деталям', category: 'Когнитивные', usageCount: 178, isActive: true },
    { id: 9, name: 'Самоорганизованность', category: 'Организационные', usageCount: 165, isActive: true },
    { id: 10, name: 'Стрессоустойчивость', category: 'Личностные', usageCount: 134, isActive: true },
    { id: 11, name: 'Желание учиться', category: 'Личностные', usageCount: 212, isActive: true },
    { id: 12, name: 'Ответственность', category: 'Личностные', usageCount: 198, isActive: true },
    { id: 13, name: 'Креативность', category: 'Когнитивные', usageCount: 88, isActive: true },
    { id: 14, name: 'Проблемное мышление', category: 'Когнитивные', usageCount: 145, isActive: true },
    { id: 15, name: 'Эмоциональный интеллект', category: 'Межличностные', usageCount: 72, isActive: true },
];