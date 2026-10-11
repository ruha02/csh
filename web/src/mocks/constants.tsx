import {
    BarChartOutlined,
    BugOutlined,
    CheckCircleOutlined,
    CodeOutlined,
    DesktopOutlined,
    FormatPainterOutlined,
    TeamOutlined,
    TrophyOutlined,
    UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ChatSender, Direction, Grade, InvitationStatus, ParticipationType, ResponseStatus, ResultType, TaskResult, TaskSource, TaskStatus, TeamRole } from './types';
// ============================================================================
// 🏷️ Направления
// ============================================================================
export const DIRECTION_LABELS: Record<Direction, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    devops: 'DevOps',
    mobile: 'Mobile',
    data: 'Data Science',
    qa: 'QA',
};

export const DIRECTION_COLORS: Record<Direction, string> = {
    frontend: '#402FFF',
    backend: '#52c41a',
    devops: '#fa8c16',
    mobile: '#13c2c2',
    data: '#722ed1',
    qa: '#eb2f96',
};

// ============================================================================
// 🏷️ Грейды
// ============================================================================
export const GRADE_LABELS: Record<Grade, string> = {
    junior: 'Начинающий',
    middle: 'Продвинутый',
    senior: 'Профессионал',
};

export const GRADE_COLORS: Record<Grade, string> = {
    junior: '#87d068',
    middle: '#2db7f5',
    senior: '#f50',
};

export const GRADE_THRESHOLDS: Record<Grade, number> = {
    junior: 50,
    middle: 70,
    senior: 85,
};

// ============================================================================
// 🏷️ Тесты
// ============================================================================
export const MAX_ATTEMPTS = 3;
export const RETAKE_PERIOD_DAYS = 30;

// ============================================================================
// 🏷️ ФСП — Тип участия
// ============================================================================
export const PARTICIPATION_TYPE_LABELS: Record<ParticipationType, string> = {
    individual: 'Одиночное',
    team: 'Командное',
};

export const PARTICIPATION_TYPE_COLORS: Record<ParticipationType, string> = {
    individual: '#402FFF',
    team: '#722ed1',
};

// ============================================================================
// 🏷️ ФСП — Роли в команде
// ============================================================================
export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
    backend: 'Backend-разработчик',
    frontend: 'Frontend-разработчик',
    designer: 'Дизайнер',
    project_manager: 'Проект-менеджер',
    analyst: 'Аналитик',
    qa: 'QA-инженер',
    other: 'Другое',
};

export const TEAM_ROLE_ICONS: Record<TeamRole, React.ReactNode> = {
    backend: <CodeOutlined />,
    frontend: <DesktopOutlined />,
    designer: <FormatPainterOutlined />,
    project_manager: <TeamOutlined />,
    analyst: <BarChartOutlined />,
    qa: <BugOutlined />,
    other: <UserOutlined />,
};

export const TEAM_ROLE_COLORS: Record<TeamRole, string> = {
    backend: '#52c41a',
    frontend: '#402FFF',
    designer: '#eb2f96',
    project_manager: '#fa8c16',
    analyst: '#13c2c2',
    qa: '#f5222d',
    other: '#8c8c8c',
};

// ============================================================================
// 🏷️ ФСП — Результаты
// ============================================================================
export const RESULT_CONFIG: Record<ResultType, { label: string; color: string; icon: React.ReactNode }> = {
    first_place: {
        label: '1 место',
        color: '#faad14',
        icon: <TrophyOutlined style={{ color: '#faad14' }} />,
    },
    second_place: {
        label: '2 место',
        color: '#bfbfbf',
        icon: <TrophyOutlined style={{ color: '#8c8c8c' }} />,
    },
    third_place: {
        label: '3 место',
        color: '#d48806',
        icon: <TrophyOutlined style={{ color: '#d48806' }} />,
    },
    participation: {
        label: 'Участие',
        color: '#402FFF',
        icon: <CheckCircleOutlined style={{ color: '#402FFF' }} />,
    },
};

// ============================================================================
// 🧮 Утилиты
// ============================================================================
export const getConfidenceColor = (percent: number): string => {
    if (percent === 0) return '#d9d9d9';
    if (percent < 30) return '#f5222d';
    if (percent < 70) return '#faad14';
    if (percent < 100) return '#1890ff';
    return '#52c41a';
};

export const formatSalary = (amount: number, currency: string): string => {
    return `${amount.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
};

export const formatPeriod = (startDate: string, endDate?: string, isCurrent?: boolean): string => {
    const start = dayjs(startDate).format('MMMM YYYY');
    if (isCurrent || !endDate) {
        return `${start} — по настоящее время`;
    }
    const end = dayjs(endDate).format('MMMM YYYY');
    return `${start} — ${end}`;
};

export const getDaysUntilRetake = (nextAttemptDate: string | undefined): number => {
    if (!nextAttemptDate) return 0;
    return Math.max(0, dayjs(nextAttemptDate).diff(dayjs(), 'day'));
};

export const getDayWord = (days: number): string => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
};

export const getYearWord = (years: number): string => {
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
};

// ============================================================================
// 🏷️ Тестовые задания — Источники
// ============================================================================
export const TASK_SOURCE_LABELS: Record<TaskSource, string> = {
    employer: 'От работодателя',
    ai: 'Сгенерировано ИИ',
};

export const TASK_SOURCE_COLORS: Record<TaskSource, string> = {
    employer: '#402FFF',
    ai: '#722ed1',
};

// ============================================================================
// 🏷️ Тестовые задания — Статусы
// ============================================================================
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    pending: 'Ожидает принятия',
    in_progress: 'Выполняется',
    submitted: 'На оценивании',
    evaluated: 'Оценено',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
    pending: '#402FFF',
    in_progress: '#fa8c16',
    submitted: '#722ed1',
    evaluated: '#52c41a',
};

// ============================================================================
// 🏷️ Тестовые задания — Результаты
// ============================================================================
export const TASK_RESULT_LABELS: Record<TaskResult, string> = {
    accepted: 'Принято',
    rejected: 'Отклонено',
};

export const TASK_RESULT_COLORS: Record<TaskResult, string> = {
    accepted: '#52c41a',
    rejected: '#f5222d',
};

// ============================================================================
// 🏷️ Вакансии — Формат работы
// ============================================================================
export const WORK_FORMAT_LABELS: Record<string, string> = {
    remote: 'Удалённо',
    office: 'В офисе',
    hybrid: 'Гибрид',
};

// ============================================================================
// 🏷️ Отклики — Статусы
// ============================================================================
export const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
    pending: 'Ожидает рассмотрения',
    viewed: 'Просмотрено',
    accepted: 'Принято',
    rejected: 'Отклонено',
};

export const RESPONSE_STATUS_COLORS: Record<ResponseStatus, string> = {
    pending: '#402FFF',
    viewed: '#722ed1',
    accepted: '#52c41a',
    rejected: '#f5222d',
};

// ============================================================================
// 🏷️ Приглашения — Статусы
// ============================================================================
export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
    pending: 'Ожидает решения',
    accepted: 'Принято',
    rejected: 'Отклонено',
    expired: 'Истекло',
};

export const INVITATION_STATUS_COLORS: Record<InvitationStatus, string> = {
    pending: '#fa8c16',
    accepted: '#52c41a',
    rejected: '#f5222d',
    expired: '#8c8c8c',
};

// ============================================================================
// 🏷️ Чат — Отправитель
// ============================================================================
export const CHAT_SENDER_LABELS: Record<ChatSender, string> = {
    candidate: 'Вы',
    employer: 'Работодатель',
};

// ============================================================================
// 🏷️ Сравнение грейдов
// ============================================================================
export const GRADE_ORDER: Record<Grade, number> = {
    junior: 1,
    middle: 2,
    senior: 3,
};

export const compareGrades = (
    candidateGrade: Grade,
    vacancyGrade: Grade
): 'higher' | 'equal' | 'lower' => {
    const diff = GRADE_ORDER[candidateGrade] - GRADE_ORDER[vacancyGrade];
    if (diff > 0) return 'higher';
    if (diff < 0) return 'lower';
    return 'equal';
};