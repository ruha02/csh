// ============================================================================
// 📦 Типы данных для моков
// ============================================================================

// --- Направления и грейды ---
export type Direction = 'frontend' | 'backend' | 'devops' | 'mobile' | 'data' | 'qa';
export type Grade = 'junior' | 'middle' | 'senior';

// --- Навыки ---
export interface Skill {
    id: number;
    direction: Direction;
    grade: Grade;
    language: string;
    confidence: number;
}

// --- Дорожная карта ---
export interface RoadmapNode {
    key: string;
    title: string;
    children?: RoadmapNode[];
}

// --- Тесты по темам ---
export interface TopicTest {
    topicKey: string;
    skillId: number;
    testName: string;
    bestScore: number;
    lastScore: number;
    attempts: number;
    passed: boolean;
    lastAttemptDate?: string;
    nextAttemptDate?: string;
    locked?: boolean;
}

export type TestStatus = 'available' | 'locked' | 'passed' | 'in_progress' | 'not_started';

// --- ФСП ---
export type ParticipationType = 'individual' | 'team';
export type TeamRole = 'backend' | 'frontend' | 'designer' | 'project_manager' | 'analyst' | 'qa' | 'other';
export type ResultType = 'first_place' | 'second_place' | 'third_place' | 'participation';

export interface FspParticipation {
    id: number;
    eventName: string;
    eventDate: string;
    result: ResultType;
    resultDetails?: string;
    participationType: ParticipationType;
    teamRole?: TeamRole;
    teamName?: string;
    organizer?: string;
    location?: string;
}

// --- Резюме ---
export interface Resume {
    id: number;
    title: string;
    skillId: number;
    skillName: string;
    direction: string;
    grade: Grade;
    confidence: number;
    salaryFrom: number;
    salaryTo: number;
    currency: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

// --- Профиль кандидата ---
export interface EducationItem {
    institution: string;
    specialty: string;
    startYear: number;
    endYear?: number;
    isCurrent: boolean;
    degree?: string;
}

export interface WorkExperienceItem {
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    company: string;
    position: string;
    description: string;
}

export interface CandidateProfileData {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
    telegram: string;
    education: EducationItem[];
    workExperience: WorkExperienceItem[];
    softSkills: string[];
    aboutMe: string;
}

// --- Вопросы теста ---
export type QuestionType = 'single' | 'multiple' | 'text';

export interface QuestionOption {
    id: string;
    text: string;
    isAntiAi?: boolean;
}

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    options?: QuestionOption[];
    correctAnswer?: string | string[];
    explanation?: string;
}

// ============================================================================
// 📝 Тестовые задания
// ============================================================================
export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'evaluated';
export type TaskResult = 'accepted' | 'rejected';
export type TaskSource = 'employer' | 'ai';

export interface Task {
    id: number;
    title: string;
    vacancyTitle?: string;
    employer: string;
    source: TaskSource;
    // Связь с резюме
    resumeId: number;
    resumeTitle: string;
    // Описание задания
    description: string;
    // Статус и результат
    status: TaskStatus;
    result?: TaskResult;
    comment?: string;
    // Метаданные
    direction?: Direction;
    grade?: Grade;
    // Решение кандидата
    solutionUrl?: string;
    solutionFileName?: string;
    // Видимость для других работодателей
    isPublic?: boolean;
    // Даты
    receivedAt: string;
    deadline?: string;
    acceptedAt?: string;
    submittedAt?: string;
    evaluatedAt?: string;
    aiGeneratedAt?: string;
}

// ============================================================================
// 💼 Вакансии
// ============================================================================
export interface VacancyHardSkill {
    topicKey: string;        // Ссылка на конечный узел дорожной карты
    requiredPercent: number; // Требуемый процент уверенности (0-100)
}

export interface Vacancy {
    id: number;
    employer: string;
    direction: Direction;
    grade: Grade;
    salaryFrom: number;
    salaryTo: number;
    currency: string;
    description: string;
    hardSkills: VacancyHardSkill[];
    softSkills: string[];
    location?: string;
    isRemote: boolean;
    publishedAt: string;
    deadline?: string;
}

// ============================================================================
// 💬 Сообщения чата
// ============================================================================
export type ChatSender = 'candidate' | 'employer';

export interface ChatMessage {
    id: number;
    sender: ChatSender;
    text: string;
    timestamp: string;
}

// ============================================================================
// 📨 Отклики на вакансии
// ============================================================================
export type ResponseStatus = 'pending' | 'viewed' | 'accepted' | 'rejected';

export interface VacancyResponse {
    id: number;
    vacancyId: number;
    resumeId: number;
    resumeTitle: string;
    coverLetter: string;
    status: ResponseStatus;
    taskId?: number;
    createdAt: string;
    viewedAt?: string;
    respondedAt?: string;
    comment?: string;
    messages: ChatMessage[];
}

// ============================================================================
// 📨 Приглашения от работодателей
// ============================================================================
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Invitation {
    id: number;
    vacancyId: number;
    vacancyTitle: string;
    employer: string;
    description: string; // текст приглашения от работодателя
    status: InvitationStatus;
    // Связь с тестовым заданием (создаётся после принятия)
    taskId?: number;
    // Связь с резюме, от имени которого кандидат ответил
    resumeId?: number;
    resumeTitle?: string;
    // Даты
    createdAt: string;
    expiresAt?: string;
    respondedAt?: string;
    // Комментарий кандидата при отклонении
    rejectionReason?: string;
    // Ответное сообщение от работодателя
    employerComment?: string;
}

// ============================================================================
// ⚙️ Настройки кандидата
// ============================================================================
export interface NotificationChannels {
    email: boolean;
    telegram: boolean;
    inApp: boolean;
}

export interface NotificationEvents {
    newVacancies: boolean;
    responseViewed: boolean;
    newTask: boolean;
    taskFeedback: boolean;
    newInvitation: boolean;
    invitationExpiring: boolean;
}

export interface CandidateSettings {
    notifications: {
        channels: NotificationChannels;
        events: NotificationEvents;
    };
    privacy: {
        profileVisibility: 'all' | 'applied' | 'hidden';
        hideCurrentEmployer: boolean;
        showTestResults: boolean;
        showFspResults: boolean;
    };
    integrations: {
        github: { connected: boolean; username?: string };
        telegram: { connected: boolean; username?: string };
        habr: { connected: boolean; username?: string };
    };
}

// ============================================================================
// 🏢 Профиль компании (работодатель)
// ============================================================================
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
export type CompanyIndustry =
    | 'it'
    | 'finance'
    | 'retail'
    | 'manufacturing'
    | 'education'
    | 'healthcare'
    | 'media'
    | 'consulting'
    | 'other';

export interface CompanyProfileData {
    name: string;
    description: string;
    logo?: string;
    website?: string;
    email: string;
    phone?: string;
    address?: string;
    industry: CompanyIndustry;
    size: CompanySize;
    foundedYear?: number;
    socialLinks: {
        telegram?: string;
        vk?: string;
        linkedin?: string;
        github?: string;
    };
    about?: string;
    benefits?: string[];
    technologies?: string[];
}

// ============================================================================
// 🏢 Вакансии работодателя
// ============================================================================
export type EmployerVacancyStatus = 'draft' | 'published' | 'archived' | 'closed';

export interface EmployerVacancy {
    id: number;
    title: string;
    direction: Direction;
    grade: Grade;
    description: string;
    salaryFrom: number;
    salaryTo: number;
    currency: string;
    hardSkills: VacancyHardSkill[];
    softSkills: string[];
    location?: string;
    isRemote: boolean;
    status: EmployerVacancyStatus;
    publishedAt?: string;
    deadline?: string;
    createdAt: string;
    updatedAt: string;
    // Статистика
    responsesCount: number;
    viewedCount: number;
}

// ============================================================================
// 📨 Отклики кандидатов на вакансии работодателя
// ============================================================================
// ============================================================================
// 📨 Отклики кандидатов на вакансии работодателя
// ============================================================================
export type EmployerResponseStatus = 'new' | 'viewed' | 'shortlisted' | 'rejected' | 'task_sent';

export interface EmployerResponse {
    id: number;
    vacancyId: number;
    candidateName: string;
    candidateEmail: string;
    candidateTelegram?: string;
    resumeTitle: string;
    resumeId: number;
    direction: Direction;
    grade: Grade;
    confidence: number;
    coverLetter: string;
    status: EmployerResponseStatus;
    appliedAt: string;
    viewedAt?: string;
    // Решение работодателя
    comment?: string;
    taskId?: number;
    // Hard skills кандидата по требованиям вакансии
    hardSkillsMatch: {
        topicKey: string;
        topicName: string;
        requiredPercent: number;
        candidatePercent: number;
    }[];
    // Совопадением по soft skills
    softSkillsMatch: string[];
    // Общий процент соответствия
    matchPercent: number;
    // 💬 Чат с кандидатом
    messages: ChatMessage[];
}
// ============================================================================
// 🔍 Подбор кандидатов (для работодателя)
// ============================================================================
// ============================================================================
// 🔍 Подбор кандидатов (для работодателя)
// ============================================================================
export interface CandidateTopicTest {
    topicKey: string;
    bestScore: number;
}

export interface CandidateSearchResult {
    id: number;
    userSub: string;
    lastName: string;
    firstName: string;
    middleName?: string;
    phone?: string;
    email?: string;
    telegram?: string;
    aboutMe?: string;
    // Навыки и грейды
    skills: {
        direction: Direction;
        grade: Grade;
        language: string;
        confidence: number;
    }[];
    // Результаты тестов по темам (для сравнения hard skills)
    topicTests: CandidateTopicTest[];
    // Опыт работы
    totalExperienceYears: number;
    currentCompany?: string;
    currentPosition?: string;
    // Зарплатные ожидания
    salaryExpectationFrom?: number;
    salaryExpectationTo?: number;
    currency: string;
    // Локация
    location?: string;
    isRemoteAvailable: boolean;
    // Статус
    isLookingForJob: boolean;
    lastActiveAt: string;
    // Soft skills
    softSkills: string[];
    // Образование
    education: {
        institution: string;
        specialty: string;
        endYear?: number;
    }[];
    // Участие в ФСП
    fspAchievements: {
        eventName: string;
        result: ResultType;
        eventDate: string;
    }[];
}

// ============================================================================
// ⚙️ Настройки работодателя
// ============================================================================
export interface EmployerNotificationChannels {
    email: boolean;
    telegram: boolean;
    inApp: boolean;
}

export interface EmployerNotificationEvents {
    newResponse: boolean;          // Новый отклик на вакансию
    responseViewedByCandidate: boolean; // Кандидат прочитал сообщение
    taskSubmitted: boolean;        // Кандидат сдал тестовое задание
    candidateShortlisted: boolean; // Кандидат в шорт-листе
    invitationExpiring: boolean;   // Приглашение скоро истечёт
    vacancyDeadlineSoon: boolean;  // Дедлайн вакансии скоро
    newCandidateMatch: boolean;    // Найден подходящий кандидат
}

export interface EmployerVacancyDefaults {
    defaultDeadlineDays: number;   // Дедлайн по умолчанию (в днях)
    defaultFormat: 'remote' | 'office' | 'hybrid';
    autoArchiveOnClose: boolean;   // Автоархивация закрытых вакансий
    showSalary: boolean;           // Показывать зарплату в вакансиях
}

export interface EmployerPrivacy {
    companyVisibility: 'public' | 'invited_only' | 'hidden';
    showContactEmail: boolean;
    showContactPhone: boolean;
    showRejectionReasons: boolean; // Показывать кандидатам причину отклонения
    allowAiTaskGeneration: boolean; // Разрешить ИИ генерировать задания для откликнувшихся
}

export interface EmployerTeamMember {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'hr' | 'hiring_manager' | 'viewer';
    joinedAt: string;
}

export interface EmployerSettings {
    notifications: {
        channels: EmployerNotificationChannels;
        events: EmployerNotificationEvents;
    };
    vacancyDefaults: EmployerVacancyDefaults;
    privacy: EmployerPrivacy;
    integrations: {
        telegram: { connected: boolean; username?: string };
        headhunter: { connected: boolean; accountName?: string };
        habrCareer: { connected: boolean; accountName?: string };
        github: { connected: boolean; orgName?: string };
    };
    team: EmployerTeamMember[];
}

// ============================================================================
// 👥 Администрирование — Кандидаты
// ============================================================================
export type AdminCandidateStatus = 'active' | 'blocked' | 'pending_verification';

export interface AdminCandidate {
    id: number;
    userSub: string;
    lastName: string;
    firstName: string;
    middleName?: string;
    email: string;
    phone?: string;
    telegram?: string;
    registeredAt: string;
    lastActiveAt: string;
    status: AdminCandidateStatus;
    // Навыки
    skills: {
        direction: Direction;
        grade: Grade;
        language: string;
        confidence: number;
    }[];
    // Статистика
    totalTestsPassed: number;
    totalResponses: number;
    totalInvitations: number;
    totalTasks: number;
    // Модерация
    isVerified: boolean;
    blockReason?: string;
    blockedAt?: string;
}

// ============================================================================
// 🏢 Администрирование — Работодатели
// ============================================================================
export type AdminEmployerStatus = 'active' | 'blocked' | 'pending_verification';

export interface AdminEmployer {
    id: number;
    companyName: string;
    industry: CompanyIndustry;
    size: CompanySize;
    email: string;
    phone?: string;
    website?: string;
    registeredAt: string;
    lastActiveAt: string;
    status: AdminEmployerStatus;
    // Статистика
    totalVacancies: number;
    publishedVacancies: number;
    totalResponses: number;
    totalTasks: number;
    // Модерация
    isVerified: boolean;
    blockReason?: string;
    blockedAt?: string;
    // Команда
    teamSize: number;
}

// ============================================================================
// 📚 Администрирование — Справочники
// ============================================================================
export interface AdminDirection {
    key: Direction;
    label: string;
    color: string;
    description: string;
    isActive: boolean;
    topicsCount: number;
}

export interface AdminGrade {
    key: Grade;
    label: string;
    color: string;
    threshold: number;
    description: string;
}

export interface AdminTopic {
    key: string;
    title: string;
    direction: Direction;
    parentKey?: string;
    testsCount: number;
    avgScore: number;
    isActive: boolean;
}

export interface AdminSoftSkill {
    id: number;
    name: string;
    category: string;
    usageCount: number;
    isActive: boolean;
}

