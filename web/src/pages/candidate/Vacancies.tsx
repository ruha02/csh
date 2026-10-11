import {
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EnvironmentOutlined,
    FilterOutlined,
    GlobalOutlined,
    HistoryOutlined,
    InboxOutlined,
    LinkOutlined,
    MailOutlined,
    ReloadOutlined,
    SearchOutlined,
    SendOutlined,
    StarOutlined,
    StopOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Alert,
    Badge,
    Button,
    Card,
    Checkbox,
    Col,
    Collapse,
    Divider,
    Empty,
    Input,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Statistic,
    Tag,
    Timeline,
    Tooltip,
    Typography,
    message,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    GRADE_ORDER,
    INVITATION_STATUS_COLORS,
    INVITATION_STATUS_LABELS,
    MOCK_INVITATIONS,
    MOCK_RESPONSES,
    MOCK_RESUMES,
    MOCK_SKILLS,
    MOCK_TASKS,
    MOCK_TOPIC_TESTS,
    MOCK_VACANCIES,
    RESPONSE_STATUS_COLORS,
    RESPONSE_STATUS_LABELS,
    TASK_STATUS_COLORS,
    TASK_STATUS_LABELS,
    compareGrades,
    formatSalary,
    getConfidenceColor,
    type ChatMessage,
    type Direction,
    type Grade,
    type Invitation,
    type InvitationStatus,
    type Skill,
    type Vacancy,
    type VacancyHardSkill,
    type VacancyResponse,
} from '../../mocks';

dayjs.locale('ru');
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ============================================================================
// 🧮 Вспомогательные функции
// ============================================================================
const getDaysLeft = (deadline: string | undefined): number | null => {
    if (!deadline) return null;
    return Math.max(0, dayjs(deadline).diff(dayjs(), 'day'));
};

const getDeadlineStatus = (deadline: string | undefined): {
    label: string;
    color: string;
} => {
    if (!deadline) return { label: '', color: '' };
    const days = getDaysLeft(deadline);
    if (days === null) return { label: '', color: '' };
    if (days === 0) return { label: 'Сегодня дедлайн!', color: '#f5222d' };
    if (days <= 3) return { label: `Осталось ${days} дня`, color: '#fa8c16' };
    if (days <= 7) return { label: `Осталось ${days} дней`, color: '#faad14' };
    return { label: `Осталось ${days} дней`, color: '#52c41a' };
};

const getResponseStatusIcon = (status: VacancyResponse['status']) => {
    switch (status) {
        case 'pending':
            return <ClockCircleOutlined />;
        case 'viewed':
            return <SearchOutlined />;
        case 'accepted':
            return <CheckCircleOutlined />;
        case 'rejected':
            return <CloseCircleOutlined />;
    }
};

const getInvitationStatusIcon = (status: InvitationStatus) => {
    switch (status) {
        case 'pending':
            return <ClockCircleOutlined />;
        case 'accepted':
            return <CheckCircleOutlined />;
        case 'rejected':
            return <CloseCircleOutlined />;
        case 'expired':
            return <StopOutlined />;
    }
};

// Расчёт требуемого процента грейда вакансии (среднее от hard skills)
const calculateRequiredPercent = (hardSkills: VacancyHardSkill[]): number => {
    if (hardSkills.length === 0) return 0;
    const sum = hardSkills.reduce((acc, hs) => acc + hs.requiredPercent, 0);
    return Math.round(sum / hardSkills.length);
};

// Получение своего процента по topicKey
const getMySkillPercent = (topicKey: string): number => {
    const test = MOCK_TOPIC_TESTS.find((t) => t.topicKey === topicKey);
    return test ? test.bestScore : 0;
};

// Получение названия темы по topicKey
const getTopicName = (topicKey: string): string => {
    const test = MOCK_TOPIC_TESTS.find((t) => t.topicKey === topicKey);
    return test ? test.testName : topicKey;
};

// Формирование заголовка вакансии
const getVacancyTitle = (vacancy: Vacancy): string => {
    return `${DIRECTION_LABELS[vacancy.direction]} • ${GRADE_LABELS[vacancy.grade]}`;
};

// Поиск навыка кандидата по направлению вакансии
const findMatchingSkill = (direction: Direction): Skill | undefined => {
    const matchingSkills = MOCK_SKILLS.filter((s) => s.direction === direction);
    if (matchingSkills.length === 0) return undefined;
    return matchingSkills.sort((a, b) => {
        const gradeDiff = (GRADE_ORDER[b.grade] || 0) - (GRADE_ORDER[a.grade] || 0);
        if (gradeDiff !== 0) return gradeDiff;
        return b.confidence - a.confidence;
    })[0];
};

// Получение процента по hard skill с учётом грейда
const getEffectiveSkillPercent = (
    hs: VacancyHardSkill,
    candidateSkill: Skill | undefined,
    gradeComparison: 'higher' | 'equal' | 'lower' | null
): number => {
    if (gradeComparison === 'higher') return 100;
    if (!candidateSkill || gradeComparison === 'lower') return 0;
    return getMySkillPercent(hs.topicKey);
};

// ============================================================================
// 🎨 Компонент чата
// ============================================================================
interface ChatBoxProps {
    messages: ChatMessage[];
    onSend: (text: string) => void;
    employerName: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSend, employerName }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        onSend(text);
        setInputValue('');
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    return (
        <div
            style={{
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#fafafa',
            }}
        >
            <div
                style={{
                    padding: '12px 16px',
                    background: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <UserOutlined style={{ color: '#402FFF' }} />
                <Text strong style={{ fontSize: 14 }}>Чат с работодателем</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>• {employerName}</Text>
            </div>
            <div
                style={{
                    height: 320,
                    overflowY: 'auto',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                }}
            >
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">Сообщений пока нет. Напишите первым!</Text>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender === 'candidate';
                        return (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '75%',
                                        padding: '10px 14px',
                                        borderRadius: 12,
                                        background: isMe ? '#402FFF' : '#fff',
                                        color: isMe ? '#fff' : '#1B1C21',
                                        border: isMe ? 'none' : '1px solid #e5e7eb',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.text}</div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            marginTop: 4,
                                            opacity: 0.7,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {dayjs(msg.timestamp).format('D MMM, HH:mm')}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <div
                style={{
                    padding: 12,
                    background: '#fff',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    gap: 8,
                }}
            >
                <Input
                    placeholder="Введите сообщение..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleSend}
                    style={{ flex: 1 }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    Отправить
                </Button>
            </div>
        </div>
    );
};

// ============================================================================
// 🎨 Компонент страницы
// ============================================================================
const CandidateVacancies: React.FC = () => {
    const navigate = useNavigate();
    const [vacancies] = useState<Vacancy[]>(MOCK_VACANCIES);
    const [responses, setResponses] = useState<VacancyResponse[]>(MOCK_RESPONSES);
    const [invitations, setInvitations] = useState<Invitation[]>(MOCK_INVITATIONS);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(
        MOCK_VACANCIES.length > 0 ? MOCK_VACANCIES[0] : null
    );
    const [activeTab, setActiveTab] = useState<'vacancies' | 'responses'>('vacancies');

    // Фильтры вакансий
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDirection, setFilterDirection] = useState<Direction | 'all'>('all');
    const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');
    const [filterRemote, setFilterRemote] = useState<'all' | 'remote' | 'office'>('all');

    // Фильтры откликов/приглашений
    const [filterItemType, setFilterItemType] = useState<'all' | 'response' | 'invitation'>('all');
    const [filterItemStatus, setFilterItemStatus] = useState<string>('all');

    // Модалка отклика
    const [responseModalVacancy, setResponseModalVacancy] = useState<Vacancy | null>(null);

    // Модалка принятия приглашения
    const [acceptInvitationModal, setAcceptInvitationModal] = useState<Invitation | null>(null);
    const [rejectInvitationModal, setRejectInvitationModal] = useState<Invitation | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Чекбокс сравнения навыков
    const [compareSkills, setCompareSkills] = useState(false);

    const filteredVacancies = vacancies.filter((vacancy) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!vacancy.employer.toLowerCase().includes(query)) return false;
        }
        if (filterDirection !== 'all' && vacancy.direction !== filterDirection) return false;
        if (filterGrade !== 'all' && vacancy.grade !== filterGrade) return false;
        if (filterRemote === 'remote' && !vacancy.isRemote) return false;
        if (filterRemote === 'office' && vacancy.isRemote) return false;
        return true;
    });

    const hasResponded = (vacancyId: number): VacancyResponse | undefined => {
        return responses.find((r) => r.vacancyId === vacancyId);
    };

    // ========================================================================
    // 📊 Статистика
    // ========================================================================

    const responsesStats = {
        totalResponses: responses.length,
        totalInvitations: invitations.length,
        pendingResponses: responses.filter((r) => r.status === 'pending').length,
        pendingInvitations: invitations.filter((i) => i.status === 'pending').length,
        acceptedResponses: responses.filter((r) => r.status === 'accepted').length,
        acceptedInvitations: invitations.filter((i) => i.status === 'accepted').length,
        rejectedResponses: responses.filter((r) => r.status === 'rejected').length,
        rejectedInvitations: invitations.filter((i) => i.status === 'rejected').length,
    };

    // ========================================================================
    // 🎯 Действия — отклики
    // ========================================================================
    const handleOpenResponseModal = (vacancy: Vacancy) => {
        setResponseModalVacancy(vacancy);
    };

    const handleResponseSubmit = (values: { resumeId: number; coverLetter: string }) => {
        if (!responseModalVacancy) return;
        const resume = MOCK_RESUMES.find((r) => r.id === values.resumeId);

        const newResponse: VacancyResponse = {
            id: Date.now(),
            vacancyId: responseModalVacancy.id,
            resumeId: values.resumeId,
            resumeTitle: resume?.title || 'Резюме',
            coverLetter: values.coverLetter,
            status: 'pending',
            createdAt: dayjs().format('YYYY-MM-DD'),
            messages: [],
        };
        setResponses([newResponse, ...responses]);
        setResponseModalVacancy(null);
        message.success('Отклик успешно отправлен!');
    };

    const handleSendMessage = (responseId: number, text: string) => {
        const newMessage: ChatMessage = {
            id: Date.now(),
            sender: 'candidate',
            text,
            timestamp: dayjs().format(),
        };
        setResponses((prev) =>
            prev.map((r) =>
                r.id === responseId
                    ? { ...r, messages: [...r.messages, newMessage] }
                    : r
            )
        );
    };

    // ========================================================================
    // 🎯 Действия — приглашения
    // ========================================================================
    const handleAcceptInvitation = () => {
        if (!acceptInvitationModal || !selectedResumeId) {
            message.error('Выберите резюме');
            return;
        }
        const resume = MOCK_RESUMES.find((r) => r.id === selectedResumeId);
        setInvitations((prev) =>
            prev.map((inv) =>
                inv.id === acceptInvitationModal.id
                    ? {
                        ...inv,
                        status: 'accepted' as InvitationStatus,
                        resumeId: selectedResumeId,
                        resumeTitle: resume?.title || 'Резюме',
                        respondedAt: dayjs().format('YYYY-MM-DD'),
                    }
                    : inv
            )
        );
        setAcceptInvitationModal(null);
        setSelectedResumeId(null);
        setCoverLetter('');
        message.success('Приглашение принято! Работодатель уведомлён.');
    };

    const handleRejectInvitation = () => {
        if (!rejectInvitationModal) return;
        setInvitations((prev) =>
            prev.map((inv) =>
                inv.id === rejectInvitationModal.id
                    ? {
                        ...inv,
                        status: 'rejected' as InvitationStatus,
                        respondedAt: dayjs().format('YYYY-MM-DD'),
                        rejectionReason: rejectionReason.trim() || undefined,
                    }
                    : inv
            )
        );
        setRejectInvitationModal(null);
        setRejectionReason('');
        message.info('Приглашение отклонено');
    };

    const handleGoToTask = (taskId: number) => {
        navigate(`/candidate/tasks?taskId=${taskId}`);
    };

    // ========================================================================
    // 🎨 Рендер карточки hard skill с опциональным сравнением
    // ========================================================================
    const renderHardSkill = (hs: VacancyHardSkill) => {
        const topicName = getTopicName(hs.topicKey);
        const candidateSkill = selectedVacancy
            ? findMatchingSkill(selectedVacancy.direction)
            : undefined;
        const gradeComparison = candidateSkill && selectedVacancy
            ? compareGrades(candidateSkill.grade, selectedVacancy.grade)
            : null;
        const effectivePercent = getEffectiveSkillPercent(hs, candidateSkill, gradeComparison);
        const meetsRequirement = effectivePercent >= hs.requiredPercent;

        return (
            <div
                key={hs.topicKey}
                style={{
                    padding: 12,
                    background: '#fafafa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                        flexWrap: 'wrap',
                        gap: 8,
                    }}
                >
                    <Text strong style={{ fontSize: 13 }}>
                        {topicName}
                    </Text>
                    <Tag
                        color={meetsRequirement ? '#52c41a' : '#f5222d'}
                        style={{ fontSize: 11, padding: '2px 8px', margin: 0 }}
                    >
                        Требуется: {hs.requiredPercent}%
                    </Tag>
                </div>
                {compareSkills && candidateSkill && gradeComparison !== 'lower' && (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 4,
                            }}
                        >
                            <Text style={{ fontSize: 12 }}>
                                Ваш уровень:{' '}
                                <Text strong style={{ color: getConfidenceColor(effectivePercent) }}>
                                    {effectivePercent}%
                                    {gradeComparison === 'higher' && (
                                        <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                                            (автоматически)
                                        </Text>
                                    )}
                                </Text>
                            </Text>
                            {meetsRequirement ? (
                                <Tag
                                    color="#52c41a"
                                    icon={<CheckCircleOutlined />}
                                    style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                                >
                                    Соответствует
                                </Tag>
                            ) : (
                                <Tag
                                    color="#f5222d"
                                    icon={<CloseCircleOutlined />}
                                    style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                                >
                                    Не хватает {hs.requiredPercent - effectivePercent}%
                                </Tag>
                            )}
                        </div>
                        <div style={{ position: 'relative', height: 8 }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 8,
                                    background: '#f0f0f0',
                                    borderRadius: 4,
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: `${hs.requiredPercent}%`,
                                    width: 2,
                                    height: 8,
                                    background: '#f5222d',
                                    zIndex: 2,
                                }}
                            />
                            <Progress
                                percent={effectivePercent}
                                showInfo={false}
                                size="small"
                                strokeColor={getConfidenceColor(effectivePercent)}
                                style={{ margin: 0, position: 'relative', zIndex: 1 }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ========================================================================
    // 🎨 Рендер панели отклика в Collapse
    // ========================================================================
    const renderResponsePanel = (response: VacancyResponse) => {
        const vacancy = vacancies.find((v) => v.id === response.vacancyId);
        if (!vacancy) return null;

        return (
            <div>
                {/* Шапка отклика */}
                <div
                    style={{
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        borderLeft: `4px solid ${DIRECTION_COLORS[vacancy.direction]}`,
                        marginBottom: 16,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 12,
                            marginBottom: 12,
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <Tag color="#402FFF" icon={<SendOutlined />} style={{ margin: 0 }}>
                                    Мой отклик
                                </Tag>
                                <Tag
                                    color={RESPONSE_STATUS_COLORS[response.status]}
                                    icon={getResponseStatusIcon(response.status)}
                                >
                                    {RESPONSE_STATUS_LABELS[response.status]}
                                </Tag>
                            </div>
                            <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
                                {getVacancyTitle(vacancy)}
                            </Text>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <BankOutlined style={{ color: '#402FFF' }} />
                                <Text style={{ fontSize: 13 }}>{vacancy.employer}</Text>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Text strong style={{ fontSize: 16, color: '#402FFF', display: 'block' }}>
                                {calculateRequiredPercent(vacancy.hardSkills)}%
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                требуемый грейд
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                        <Text type="secondary">
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            Отклик: {dayjs(response.createdAt).format('D MMM YYYY')}
                        </Text>
                        <Text type="secondary">
                            <UserOutlined style={{ marginRight: 4 }} />
                            Резюме: <Text strong>{response.resumeTitle}</Text>
                        </Text>
                    </div>
                </div>

                {/* Описание вакансии */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Описание вакансии
                    </Text>
                    <div
                        style={{
                            padding: 12,
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <Paragraph
                            style={{
                                fontSize: 13,
                                lineHeight: 1.7,
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {vacancy.description}
                        </Paragraph>
                    </div>
                </div>

                {/* Тестовое задание (если есть) */}
                {response.taskId && (() => {
                    const task = MOCK_TASKS.find((t) => t.id === response.taskId);
                    if (!task) return null;
                    return (
                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Тестовое задание
                            </Text>
                            <Card
                                size="small"
                                style={{
                                    background: '#fafafa',
                                    borderLeft: `4px solid ${TASK_STATUS_COLORS[task.status]}`,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 12,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div>
                                        <Text strong style={{ fontSize: 13 }}>{task.title}</Text>
                                        <div>
                                            <Tag
                                                color={TASK_STATUS_COLORS[task.status]}
                                                style={{ fontSize: 11, padding: '2px 8px', marginTop: 4 }}
                                            >
                                                {TASK_STATUS_LABELS[task.status]}
                                            </Tag>
                                        </div>
                                    </div>
                                    <Button
                                        type="link"
                                        icon={<LinkOutlined />}
                                        onClick={() => handleGoToTask(task.id)}
                                        style={{ padding: 0 }}
                                    >
                                        Перейти →
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    );
                })()}

                {/* Комментарий работодателя */}
                {response.comment && (
                    <Alert
                        message="Ответ работодателя"
                        description={response.comment}
                        type={
                            response.status === 'accepted'
                                ? 'success'
                                : response.status === 'rejected'
                                    ? 'error'
                                    : 'info'
                        }
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                    />
                )}

                {/* История статусов (скрытая) */}
                <Collapse
                    size="small"
                    style={{ marginBottom: 16 }}
                    items={[
                        {
                            key: 'history',
                            label: (
                                <span>
                                    <HistoryOutlined style={{ marginRight: 8 }} />
                                    История статусов
                                </span>
                            ),
                            children: (
                                <Timeline
                                    style={{ marginBottom: 0 }}
                                    items={[
                                        {
                                            color: '#402FFF',
                                            children: (
                                                <Text style={{ fontSize: 12 }}>
                                                    <Text strong>Отклик отправлен</Text>
                                                    <br />
                                                    <Text type="secondary">
                                                        {dayjs(response.createdAt).format('D MMM YYYY')}
                                                    </Text>
                                                </Text>
                                            ),
                                        },
                                        response.viewedAt && {
                                            color: '#722ed1',
                                            children: (
                                                <Text style={{ fontSize: 12 }}>
                                                    <Text strong>Работодатель просмотрел</Text>
                                                    <br />
                                                    <Text type="secondary">
                                                        {dayjs(response.viewedAt).format('D MMM YYYY')}
                                                    </Text>
                                                </Text>
                                            ),
                                        },
                                        response.respondedAt && {
                                            color:
                                                response.status === 'accepted'
                                                    ? '#52c41a'
                                                    : response.status === 'rejected'
                                                        ? '#f5222d'
                                                        : '#402FFF',
                                            children: (
                                                <Text style={{ fontSize: 12 }}>
                                                    <Text strong>
                                                        {response.status === 'accepted'
                                                            ? 'Принято'
                                                            : response.status === 'rejected'
                                                                ? 'Отклонено'
                                                                : 'Получен ответ'}
                                                    </Text>
                                                    <br />
                                                    <Text type="secondary">
                                                        {dayjs(response.respondedAt).format('D MMM YYYY')}
                                                    </Text>
                                                </Text>
                                            ),
                                        },
                                    ].filter(Boolean) as any[]}
                                />
                            ),
                        },
                    ]}
                />

                {/* Чат */}
                <ChatBox
                    messages={response.messages}
                    onSend={(text) => handleSendMessage(response.id, text)}
                    employerName={vacancy.employer}
                />
            </div>
        );
    };

    // ========================================================================
    // 🎨 Рендер панели приглашения в Collapse
    // ========================================================================
    const renderInvitationPanel = (invitation: Invitation) => {
        const vacancy = vacancies.find((v) => v.id === invitation.vacancyId);
        if (!vacancy) return null;

        const daysLeft = getDaysLeft(invitation.expiresAt);
        const isPending = invitation.status === 'pending';

        return (
            <div>
                {/* Шапка приглашения */}
                <div
                    style={{
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        borderLeft: `4px solid ${INVITATION_STATUS_COLORS[invitation.status]}`,
                        marginBottom: 16,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 12,
                            marginBottom: 12,
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                <Tag color="#722ed1" icon={<MailOutlined />} style={{ margin: 0 }}>
                                    Приглашение от работодателя
                                </Tag>
                                <Tag
                                    color={INVITATION_STATUS_COLORS[invitation.status]}
                                    icon={getInvitationStatusIcon(invitation.status)}
                                >
                                    {INVITATION_STATUS_LABELS[invitation.status]}
                                </Tag>
                            </div>
                            <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
                                {getVacancyTitle(vacancy)}
                            </Text>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <BankOutlined style={{ color: '#402FFF' }} />
                                <Text style={{ fontSize: 13 }}>{vacancy.employer}</Text>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Text strong style={{ fontSize: 16, color: '#402FFF', display: 'block' }}>
                                {calculateRequiredPercent(vacancy.hardSkills)}%
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                требуемый грейд
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                        <Text type="secondary">
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            Получено: {dayjs(invitation.createdAt).format('D MMM YYYY')}
                        </Text>
                        {isPending && invitation.expiresAt && daysLeft !== null && (
                            <Text
                                type="secondary"
                                style={{
                                    color: daysLeft <= 2 ? '#f5222d' : daysLeft <= 5 ? '#faad14' : '#52c41a',
                                    fontWeight: 600,
                                }}
                            >
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {daysLeft === 0
                                    ? 'Истекает сегодня!'
                                    : `Осталось ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`}
                            </Text>
                        )}
                        {invitation.respondedAt && (
                            <Text type="secondary">
                                <CheckCircleOutlined style={{ marginRight: 4 }} />
                                Решение: {dayjs(invitation.respondedAt).format('D MMM YYYY')}
                            </Text>
                        )}
                    </div>
                </div>

                {/* Текст приглашения */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Текст приглашения
                    </Text>
                    <div
                        style={{
                            padding: 12,
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <Paragraph
                            style={{
                                fontSize: 13,
                                lineHeight: 1.7,
                                margin: 0,
                            }}
                        >
                            {invitation.description}
                        </Paragraph>
                    </div>
                </div>

                {/* Описание вакансии */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Описание вакансии
                    </Text>
                    <div
                        style={{
                            padding: 12,
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <Paragraph
                            style={{
                                fontSize: 13,
                                lineHeight: 1.7,
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {vacancy.description}
                        </Paragraph>
                    </div>
                </div>

                {/* Тестовое задание (если принято и есть) */}
                {invitation.status === 'accepted' && invitation.taskId && (() => {
                    const task = MOCK_TASKS.find((t) => t.id === invitation.taskId);
                    if (!task) return null;
                    return (
                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Тестовое задание
                            </Text>
                            <Card
                                size="small"
                                style={{
                                    background: '#fafafa',
                                    borderLeft: `4px solid ${TASK_STATUS_COLORS[task.status]}`,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 12,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div>
                                        <Text strong style={{ fontSize: 13 }}>{task.title}</Text>
                                        <div>
                                            <Tag
                                                color={TASK_STATUS_COLORS[task.status]}
                                                style={{ fontSize: 11, padding: '2px 8px', marginTop: 4 }}
                                            >
                                                {TASK_STATUS_LABELS[task.status]}
                                            </Tag>
                                        </div>
                                    </div>
                                    <Button
                                        type="link"
                                        icon={<LinkOutlined />}
                                        onClick={() => handleGoToTask(task.id)}
                                        style={{ padding: 0 }}
                                    >
                                        Перейти →
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    );
                })()}

                {/* Причина отклонения */}
                {invitation.status === 'rejected' && invitation.rejectionReason && (
                    <Alert
                        message="Ваша причина отклонения"
                        description={invitation.rejectionReason}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                    />
                )}

                {/* Действия */}
                {isPending && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => setAcceptInvitationModal(invitation)}
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Принять приглашение
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => setRejectInvitationModal(invitation)}
                        >
                            Отклонить
                        </Button>
                    </div>
                )}

                {invitation.status === 'accepted' && (
                    <Alert
                        message="Приглашение принято"
                        description="Работодатель уведомлён о вашем согласии. Ожидайте дальнейших шагов."
                        type="success"
                        showIcon
                        style={{ marginTop: 16, borderRadius: 8 }}
                    />
                )}

                {invitation.status === 'rejected' && (
                    <Alert
                        message="Приглашение отклонено"
                        description="Вы отклонили это приглашение. Работодатель уведомлён."
                        type="error"
                        showIcon
                        style={{ marginTop: 16, borderRadius: 8 }}
                    />
                )}

                {invitation.status === 'expired' && (
                    <Alert
                        message="Приглашение истекло"
                        description="Срок действия приглашения истёк."
                        type="warning"
                        showIcon
                        style={{ marginTop: 16, borderRadius: 8 }}
                    />
                )}
            </div>
        );
    };

    // ========================================================================
    // 🎨 Объединённый список откликов и приглашений
    // ========================================================================
    type ItemType = 'response' | 'invitation';
    interface UnifiedItem {
        type: ItemType;
        id: number;
        vacancyId: number;
        status: string;
        createdAt: string;
        data: VacancyResponse | Invitation;
    }

    const unifiedItems: UnifiedItem[] = [
        ...responses.map((r) => ({
            type: 'response' as ItemType,
            id: r.id,
            vacancyId: r.vacancyId,
            status: r.status,
            createdAt: r.createdAt,
            data: r,
        })),
        ...invitations.map((i) => ({
            type: 'invitation' as ItemType,
            id: i.id,
            vacancyId: i.vacancyId,
            status: i.status,
            createdAt: i.createdAt,
            data: i,
        })),
    ].sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

    const filteredUnifiedItems = unifiedItems.filter((item) => {
        if (filterItemType !== 'all' && item.type !== filterItemType) return false;
        if (filterItemStatus !== 'all' && item.status !== filterItemStatus) return false;
        return true;
    });

    // ========================================================================
    // 🎨 Рендер
    // ========================================================================
    const collapseItems = filteredUnifiedItems.map((item) => {
        const vacancy = vacancies.find((v) => v.id === item.vacancyId);
        if (!vacancy) return null;

        const isResponse = item.type === 'response';
        const statusColor = isResponse
            ? RESPONSE_STATUS_COLORS[(item.data as VacancyResponse).status]
            : INVITATION_STATUS_COLORS[(item.data as Invitation).status];
        const statusLabel = isResponse
            ? RESPONSE_STATUS_LABELS[(item.data as VacancyResponse).status]
            : INVITATION_STATUS_LABELS[(item.data as Invitation).status];
        const statusIcon = isResponse
            ? getResponseStatusIcon((item.data as VacancyResponse).status)
            : getInvitationStatusIcon((item.data as Invitation).status);

        return {
            key: `${item.type}-${item.id}`,
            label: (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        width: '100%',
                    }}
                >
                    <Tag
                        color={isResponse ? '#402FFF' : '#722ed1'}
                        icon={isResponse ? <SendOutlined /> : <MailOutlined />}
                        style={{ margin: 0 }}
                    >
                        {isResponse ? 'Мой отклик' : 'Приглашение'}
                    </Tag>
                    <Tag color={DIRECTION_COLORS[vacancy.direction]} style={{ margin: 0 }}>
                        {DIRECTION_LABELS[vacancy.direction]}
                    </Tag>
                    <Tag color={GRADE_COLORS[vacancy.grade]} style={{ margin: 0 }}>
                        {GRADE_LABELS[vacancy.grade]}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {vacancy.employer}
                    </Text>
                    <div style={{ marginLeft: 'auto' }}>
                        <Tag color={statusColor} icon={statusIcon} style={{ margin: 0 }}>
                            {statusLabel}
                        </Tag>
                    </div>
                </div>
            ),
            children: isResponse
                ? renderResponsePanel(item.data as VacancyResponse)
                : renderInvitationPanel(item.data as Invitation),
        };
    }).filter(Boolean) as any[];

    return (
        <div>
            {/* Заголовок */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <BankOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>Вакансии</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Актуальные вакансии от работодателей, ваши отклики и приглашения
                </Text>
            </div>

            {/* Табы */}
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 24,
                    borderBottom: '1px solid #f0f0f0',
                }}
            >
                <Button
                    type={activeTab === 'vacancies' ? 'primary' : 'text'}
                    onClick={() => setActiveTab('vacancies')}
                    icon={<BankOutlined />}
                    style={
                        activeTab === 'vacancies'
                            ? { background: '#402FFF', borderColor: '#402FFF' }
                            : {}
                    }
                >
                    Вакансии <Badge count={vacancies.length} style={{ marginLeft: 8 }} />
                </Button>
                <Button
                    type={activeTab === 'responses' ? 'primary' : 'text'}
                    onClick={() => setActiveTab('responses')}
                    icon={<InboxOutlined />}
                    style={
                        activeTab === 'responses'
                            ? { background: '#402FFF', borderColor: '#402FFF' }
                            : {}
                    }
                >
                    Мои отклики и приглашения{' '}
                    <Badge
                        count={responses.length + invitations.length}
                        style={{ marginLeft: 8 }}
                    />
                </Button>
            </div>

            {/* ================================================================== */}
            {/* ВКЛАДКА: ВАКАНСИИ                                                   */}
            {/* ================================================================== */}
            {activeTab === 'vacancies' && (
                <>
                    {/* Фильтры */}
                    <Card style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <FilterOutlined style={{ color: '#402FFF' }} />
                            <Text strong>Фильтры и поиск</Text>
                        </div>
                        <Row gutter={16} align="bottom">
                            <Col xs={24} sm={12} md={6}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Поиск</Text>
                                </div>
                                <Search
                                    placeholder="Работодатель"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    allowClear
                                />
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Направление</Text>
                                </div>
                                <Select
                                    value={filterDirection}
                                    onChange={setFilterDirection}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="all">Все направления</Select.Option>
                                    {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Грейд</Text>
                                </div>
                                <Select
                                    value={filterGrade}
                                    onChange={setFilterGrade}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="all">Все грейды</Select.Option>
                                    {Object.entries(GRADE_LABELS).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Формат</Text>
                                </div>
                                <Select
                                    value={filterRemote}
                                    onChange={setFilterRemote}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="all">Любой формат</Select.Option>
                                    <Select.Option value="remote">Удалённо</Select.Option>
                                    <Select.Option value="office">В офисе</Select.Option>
                                </Select>
                            </Col>
                            <Col
                                xs={24}
                                sm={12}
                                md={6}
                                style={{ display: 'flex', alignItems: 'flex-end' }}
                            >
                                <div style={{ marginBottom: 8, visibility: 'hidden' }}>
                                    <Text strong>.</Text>
                                </div>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterDirection('all');
                                        setFilterGrade('all');
                                        setFilterRemote('all');
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Основной контент вакансий */}
                    {filteredVacancies.length === 0 ? (
                        <Card>
                            <Empty description="Нет вакансий, соответствующих выбранным фильтрам" />
                        </Card>
                    ) : (
                        <Row gutter={24}>
                            {/* Левая колонка: список вакансий */}
                            <Col xs={24} lg={8}>
                                <Card title="Список вакансий" style={{ marginBottom: 24 }}>
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        {filteredVacancies.map((vacancy) => {
                                            const deadlineStatus = getDeadlineStatus(vacancy.deadline);
                                            const existingResponse = hasResponded(vacancy.id);
                                            const requiredPercent = calculateRequiredPercent(vacancy.hardSkills);
                                            return (
                                                <Card
                                                    key={vacancy.id}
                                                    size="small"
                                                    hoverable
                                                    onClick={() => setSelectedVacancy(vacancy)}
                                                    style={{
                                                        border:
                                                            selectedVacancy?.id === vacancy.id
                                                                ? '2px solid #402FFF'
                                                                : '1px solid #d9d9d9',
                                                        borderLeft: `4px solid ${DIRECTION_COLORS[vacancy.direction]}`,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <div style={{ marginBottom: 8 }}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 8,
                                                                marginBottom: 6,
                                                            }}
                                                        >
                                                            <BankOutlined style={{ color: '#402FFF' }} />
                                                            <Text
                                                                type="secondary"
                                                                style={{ fontSize: 12, flex: 1 }}
                                                                ellipsis={{ tooltip: vacancy.employer }}
                                                            >
                                                                {vacancy.employer}
                                                            </Text>
                                                            {vacancy.isRemote && (
                                                                <Tag
                                                                    color="#52c41a"
                                                                    icon={<GlobalOutlined />}
                                                                    style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                                                                >
                                                                    Удалённо
                                                                </Tag>
                                                            )}
                                                        </div>
                                                        <Text
                                                            strong
                                                            style={{
                                                                fontSize: 15,
                                                                display: 'block',
                                                                marginBottom: 8,
                                                                color: '#1B1C21',
                                                            }}
                                                        >
                                                            {getVacancyTitle(vacancy)}
                                                        </Text>
                                                        <Space size={4} wrap style={{ marginBottom: 8 }}>
                                                            <Tag
                                                                color={DIRECTION_COLORS[vacancy.direction]}
                                                                style={{ fontSize: 11, padding: '2px 8px' }}
                                                            >
                                                                {DIRECTION_LABELS[vacancy.direction]}
                                                            </Tag>
                                                            <Tag
                                                                color={GRADE_COLORS[vacancy.grade]}
                                                                style={{ fontSize: 11, padding: '2px 8px' }}
                                                            >
                                                                {GRADE_LABELS[vacancy.grade]}
                                                            </Tag>
                                                            <Tag
                                                                style={{
                                                                    fontSize: 11,
                                                                    padding: '2px 8px',
                                                                    background: '#f5f5f5',
                                                                    border: '1px solid #e5e7eb',
                                                                }}
                                                            >
                                                                <Text strong style={{ color: '#402FFF', fontSize: 11 }}>
                                                                    {requiredPercent}%
                                                                </Text>
                                                            </Tag>
                                                        </Space>
                                                        <Text
                                                            strong
                                                            style={{
                                                                fontSize: 14,
                                                                color: '#402FFF',
                                                                display: 'block',
                                                            }}
                                                        >
                                                            {formatSalary(vacancy.salaryFrom, vacancy.currency)}
                                                            {vacancy.salaryTo &&
                                                                ` — ${formatSalary(vacancy.salaryTo, vacancy.currency)}`}
                                                        </Text>
                                                        {existingResponse && (
                                                            <div
                                                                style={{
                                                                    marginTop: 8,
                                                                    paddingTop: 8,
                                                                    borderTop: '1px solid #f0f0f0',
                                                                }}
                                                            >
                                                                <Tag
                                                                    color={RESPONSE_STATUS_COLORS[existingResponse.status]}
                                                                    icon={getResponseStatusIcon(existingResponse.status)}
                                                                    style={{ fontSize: 11, padding: '2px 8px' }}
                                                                >
                                                                    {RESPONSE_STATUS_LABELS[existingResponse.status]}
                                                                </Tag>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {deadlineStatus.label && (
                                                        <div
                                                            style={{
                                                                marginTop: 8,
                                                                paddingTop: 8,
                                                                borderTop: '1px solid #f0f0f0',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 6,
                                                            }}
                                                        >
                                                            <ClockCircleOutlined
                                                                style={{ color: deadlineStatus.color, fontSize: 12 }}
                                                            />
                                                            <Text
                                                                style={{
                                                                    color: deadlineStatus.color,
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {deadlineStatus.label}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </Space>
                                </Card>
                            </Col>

                            {/* Правая колонка: детали вакансии */}
                            <Col xs={24} lg={16}>
                                {selectedVacancy ? (
                                    <Card
                                        title={
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <span>Вакансия</span>
                                                <Tag color={DIRECTION_COLORS[selectedVacancy.direction]}>
                                                    {DIRECTION_LABELS[selectedVacancy.direction]}
                                                </Tag>
                                                <Tag color={GRADE_COLORS[selectedVacancy.grade]}>
                                                    {GRADE_LABELS[selectedVacancy.grade]}
                                                </Tag>
                                                {selectedVacancy.isRemote && (
                                                    <Tag color="#52c41a" icon={<GlobalOutlined />}>
                                                        Удалённо
                                                    </Tag>
                                                )}
                                            </div>
                                        }
                                    >
                                        {/* Шапка */}
                                        <div
                                            style={{
                                                marginBottom: 24,
                                                padding: 16,
                                                background: '#f5f5f5',
                                                borderRadius: 8,
                                                borderLeft: `4px solid ${DIRECTION_COLORS[selectedVacancy.direction]}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    flexWrap: 'wrap',
                                                    gap: 12,
                                                    marginBottom: 12,
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Text
                                                        strong
                                                        style={{
                                                            fontSize: 22,
                                                            display: 'block',
                                                            marginBottom: 8,
                                                            color: '#1B1C21',
                                                        }}
                                                    >
                                                        {getVacancyTitle(selectedVacancy)}
                                                    </Text>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        <BankOutlined style={{ color: '#402FFF', fontSize: 16 }} />
                                                        <Text style={{ fontSize: 15 }}>
                                                            Работодатель: <Text strong>{selectedVacancy.employer}</Text>
                                                        </Text>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 16,
                                                            flexWrap: 'wrap',
                                                        }}
                                                    >
                                                        {selectedVacancy.location && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <EnvironmentOutlined style={{ color: '#402FFF' }} />
                                                                <Text style={{ fontSize: 14 }}>{selectedVacancy.location}</Text>
                                                            </div>
                                                        )}
                                                        {selectedVacancy.isRemote && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <GlobalOutlined style={{ color: '#52c41a' }} />
                                                                <Text style={{ fontSize: 14, color: '#52c41a' }}>
                                                                    Возможна удалённая работа
                                                                </Text>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div
                                                        style={{
                                                            fontSize: 36,
                                                            fontWeight: 700,
                                                            color: '#402FFF',
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        {calculateRequiredPercent(selectedVacancy.hardSkills)}%
                                                    </div>
                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                        требуемый грейд
                                                    </Text>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    padding: '12px 16px',
                                                    background: '#fff',
                                                    borderRadius: 8,
                                                    border: '1px solid #e5e7eb',
                                                }}
                                            >
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#402FFF',
                                                        display: 'block',
                                                    }}
                                                >
                                                    {formatSalary(selectedVacancy.salaryFrom, selectedVacancy.currency)}
                                                    {selectedVacancy.salaryTo &&
                                                        ` — ${formatSalary(selectedVacancy.salaryTo, selectedVacancy.currency)}`}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Ожидаемая зарплата
                                                </Text>
                                            </div>
                                        </div>

                                        {/* Описание */}
                                        <div style={{ marginBottom: 24 }}>
                                            <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}>
                                                <SearchOutlined style={{ marginRight: 8 }} />
                                                Описание вакансии
                                            </Title>
                                            <div
                                                style={{
                                                    padding: 16,
                                                    background: '#fafafa',
                                                    borderRadius: 8,
                                                    border: '1px solid #f0f0f0',
                                                }}
                                            >
                                                <Paragraph
                                                    style={{
                                                        fontSize: 14,
                                                        lineHeight: 1.8,
                                                        color: '#1B1C21',
                                                        margin: 0,
                                                        whiteSpace: 'pre-wrap',
                                                    }}
                                                >
                                                    {selectedVacancy.description}
                                                </Paragraph>
                                            </div>
                                        </div>

                                        <Divider />

                                        {/* Hard Skills */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 16,
                                                    flexWrap: 'wrap',
                                                    gap: 12,
                                                }}
                                            >
                                                <Title level={4} style={{ margin: 0, color: '#402FFF' }}>
                                                    <StarOutlined style={{ marginRight: 8 }} />
                                                    Требования к hard skills
                                                </Title>
                                                <Tooltip title="Показать ваш уровень по каждой теме">
                                                    <Checkbox
                                                        checked={compareSkills}
                                                        onChange={(e) => setCompareSkills(e.target.checked)}
                                                    >
                                                        Сравнить со своими навыками
                                                    </Checkbox>
                                                </Tooltip>
                                            </div>
                                            {(() => {
                                                const candidateSkill = findMatchingSkill(selectedVacancy.direction);
                                                const gradeComparison = candidateSkill
                                                    ? compareGrades(candidateSkill.grade, selectedVacancy.grade)
                                                    : null;

                                                if (!candidateSkill || gradeComparison === 'lower') {
                                                    return (
                                                        <>
                                                            <Alert
                                                                message={
                                                                    !candidateSkill
                                                                        ? `У вас нет навыка в направлении "${DIRECTION_LABELS[selectedVacancy.direction]}"`
                                                                        : `Ваш грейд недостаточен для этой вакансии`
                                                                }
                                                                description={
                                                                    !candidateSkill ? (
                                                                        <span>
                                                                            Добавьте навык в разделе <Text strong>"Навыки"</Text>, чтобы увидеть сравнение.
                                                                        </span>
                                                                    ) : (
                                                                        <span>
                                                                            Требуется: <Text strong>{GRADE_LABELS[selectedVacancy.grade]}</Text>.
                                                                            <br />
                                                                            У вас: <Text strong>{GRADE_LABELS[candidateSkill.grade]}</Text>.
                                                                        </span>
                                                                    )
                                                                }
                                                                type="warning"
                                                                showIcon
                                                                style={{ borderRadius: 8 }}
                                                            />
                                                            <div style={{ marginTop: 16 }}>
                                                                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                                                                    Требования (для справки):
                                                                </Text>
                                                                <Space wrap size={8}>
                                                                    {selectedVacancy.hardSkills.map((hs) => (
                                                                        <Tag
                                                                            key={hs.topicKey}
                                                                            style={{
                                                                                fontSize: 12,
                                                                                padding: '4px 10px',
                                                                                background: '#f5f5f5',
                                                                                border: '1px solid #e5e7eb',
                                                                                color: '#6b7280',
                                                                            }}
                                                                        >
                                                                            {getTopicName(hs.topicKey)} ({hs.requiredPercent}%)
                                                                        </Tag>
                                                                    ))}
                                                                </Space>
                                                            </div>
                                                        </>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        {gradeComparison === 'higher' && (
                                                            <Alert
                                                                message={
                                                                    <span>
                                                                        Ваш грейд <Text strong>{GRADE_LABELS[candidateSkill.grade]}</Text> выше
                                                                        требуемого <Text strong>{GRADE_LABELS[selectedVacancy.grade]}</Text>.
                                                                        Все навыки автоматически засчитаны на 100%.
                                                                    </span>
                                                                }
                                                                type="success"
                                                                showIcon
                                                                style={{ marginBottom: 16, borderRadius: 8 }}
                                                            />
                                                        )}
                                                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                            {selectedVacancy.hardSkills.map(renderHardSkill)}
                                                        </Space>
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        <Divider />

                                        {/* Soft Skills */}
                                        <div style={{ marginBottom: 24 }}>
                                            <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}>
                                                <UserOutlined style={{ marginRight: 8 }} />
                                                Требования к soft skills
                                            </Title>
                                            <Space wrap size={[8, 8]}>
                                                {selectedVacancy.softSkills.map((skill, index) => (
                                                    <Tag
                                                        key={index}
                                                        color="#722ed1"
                                                        style={{
                                                            fontSize: 13,
                                                            padding: '6px 12px',
                                                        }}
                                                    >
                                                        {skill}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </div>

                                        <Divider />

                                        {/* Даты */}
                                        <div
                                            style={{
                                                padding: 16,
                                                background: '#f5f5f5',
                                                borderRadius: 8,
                                                marginBottom: 24,
                                            }}
                                        >
                                            <Row gutter={16}>
                                                <Col xs={24} sm={12}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <CalendarOutlined style={{ color: '#402FFF', fontSize: 16 }} />
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                                                Опубликовано
                                                            </Text>
                                                            <Text strong style={{ fontSize: 14 }}>
                                                                {dayjs(selectedVacancy.publishedAt).format('D MMMM YYYY')}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </Col>
                                                {selectedVacancy.deadline && (
                                                    <Col xs={24} sm={12}>
                                                        {(() => {
                                                            const deadlineStatus = getDeadlineStatus(selectedVacancy.deadline);
                                                            return (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <ClockCircleOutlined
                                                                        style={{ color: deadlineStatus.color, fontSize: 16 }}
                                                                    />
                                                                    <div>
                                                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                                                            Дедлайн отклика
                                                                        </Text>
                                                                        <Text
                                                                            strong
                                                                            style={{ fontSize: 14, color: deadlineStatus.color }}
                                                                        >
                                                                            {dayjs(selectedVacancy.deadline).format('D MMMM YYYY')}
                                                                        </Text>
                                                                        <Text
                                                                            type="secondary"
                                                                            style={{ fontSize: 11, marginLeft: 8 }}
                                                                        >
                                                                            ({deadlineStatus.label})
                                                                        </Text>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>

                                        {/* Кнопка отклика или статус */}
                                        {(() => {
                                            const existingResponse = hasResponded(selectedVacancy.id);
                                            // Также проверяем, есть ли приглашение на эту вакансию
                                            const existingInvitation = invitations.find(
                                                (i) => i.vacancyId === selectedVacancy.id && i.status === 'pending'
                                            );
                                            if (existingInvitation) {
                                                return (
                                                    <Alert
                                                        message={
                                                            <div>
                                                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                                                    У вас есть активное приглашение на эту вакансию
                                                                </Text>
                                                                <Text style={{ fontSize: 13 }}>
                                                                    Перейдите во вкладку <Text strong>"Мои отклики и приглашения"</Text>,
                                                                    чтобы принять или отклонить приглашение.
                                                                </Text>
                                                            </div>
                                                        }
                                                        type="info"
                                                        showIcon
                                                        icon={<MailOutlined />}
                                                        style={{ borderRadius: 8 }}
                                                        action={
                                                            <Button
                                                                size="small"
                                                                type="link"
                                                                onClick={() => setActiveTab('responses')}
                                                            >
                                                                Перейти к приглашениям →
                                                            </Button>
                                                        }
                                                    />
                                                );
                                            }
                                            if (existingResponse) {
                                                return (
                                                    <Alert
                                                        message={
                                                            <div>
                                                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                                                    Вы уже откликнулись на эту вакансию
                                                                </Text>
                                                                <Text style={{ fontSize: 13 }}>
                                                                    Статус:{' '}
                                                                    <Text
                                                                        strong
                                                                        style={{
                                                                            color: RESPONSE_STATUS_COLORS[existingResponse.status],
                                                                        }}
                                                                    >
                                                                        {RESPONSE_STATUS_LABELS[existingResponse.status]}
                                                                    </Text>
                                                                    .
                                                                </Text>
                                                            </div>
                                                        }
                                                        type={
                                                            existingResponse.status === 'accepted'
                                                                ? 'success'
                                                                : existingResponse.status === 'rejected'
                                                                    ? 'error'
                                                                    : 'info'
                                                        }
                                                        showIcon
                                                        style={{ borderRadius: 8 }}
                                                        action={
                                                            <Button
                                                                size="small"
                                                                type="link"
                                                                onClick={() => setActiveTab('responses')}
                                                            >
                                                                Перейти к откликам →
                                                            </Button>
                                                        }
                                                    />
                                                );
                                            }
                                            return (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    block
                                                    icon={<SendOutlined />}
                                                    onClick={() => handleOpenResponseModal(selectedVacancy)}
                                                    style={{
                                                        background: '#402FFF',
                                                        borderColor: '#402FFF',
                                                        height: 48,
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    Откликнуться на вакансию
                                                </Button>
                                            );
                                        })()}
                                    </Card>
                                ) : (
                                    <Card>
                                        <Empty description="Выберите вакансию из списка слева" />
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    )}
                </>
            )}

            {/* ================================================================== */}
            {/* ВКЛАДКА: МОИ ОТКЛИКИ И ПРИГЛАШЕНИЯ                                  */}
            {/* ================================================================== */}
            {activeTab === 'responses' && (
                <>
                    {/* Статистика */}
                    <Card style={{ marginBottom: 24 }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic
                                    title="Всего откликов"
                                    value={responsesStats.totalResponses}
                                    prefix={<SendOutlined />}
                                    valueStyle={{ color: '#402FFF' }}
                                />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic
                                    title="Всего приглашений"
                                    value={responsesStats.totalInvitations}
                                    prefix={<MailOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic
                                    title="Ожидают ответа"
                                    value={responsesStats.pendingResponses + responsesStats.pendingInvitations}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                                />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic
                                    title="Принято"
                                    value={responsesStats.acceptedResponses + responsesStats.acceptedInvitations}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                                />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic
                                    title="Отклонено"
                                    value={responsesStats.rejectedResponses + responsesStats.rejectedInvitations}
                                    prefix={<CloseCircleOutlined />}
                                    valueStyle={{ color: '#f5222d', fontSize: 20 }}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Фильтры */}
                    <Card style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <FilterOutlined style={{ color: '#402FFF' }} />
                            <Text strong>Фильтры</Text>
                        </div>
                        <Row gutter={16} align="bottom">
                            <Col xs={24} sm={12} md={6}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Тип</Text>
                                </div>
                                <Select
                                    value={filterItemType}
                                    onChange={setFilterItemType}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="all">Все</Select.Option>
                                    <Select.Option value="response">Мои отклики</Select.Option>
                                    <Select.Option value="invitation">Приглашения от работодателей</Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Статус</Text>
                                </div>
                                <Select
                                    value={filterItemStatus}
                                    onChange={setFilterItemStatus}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="all">Все статусы</Select.Option>
                                    <Select.OptGroup label="Для откликов">
                                        <Select.Option value="pending">Ожидает рассмотрения</Select.Option>
                                        <Select.Option value="viewed">Просмотрено</Select.Option>
                                        <Select.Option value="accepted">Принято</Select.Option>
                                        <Select.Option value="rejected">Отклонено</Select.Option>
                                    </Select.OptGroup>
                                    <Select.OptGroup label="Для приглашений">
                                        <Select.Option value="pending">Ожидает решения</Select.Option>
                                        <Select.Option value="accepted">Принято</Select.Option>
                                        <Select.Option value="rejected">Отклонено</Select.Option>
                                        <Select.Option value="expired">Истекло</Select.Option>
                                    </Select.OptGroup>
                                </Select>
                            </Col>
                            <Col
                                xs={24}
                                sm={12}
                                md={6}
                                style={{ display: 'flex', alignItems: 'flex-end' }}
                            >
                                <div style={{ marginBottom: 8, visibility: 'hidden' }}>
                                    <Text strong>.</Text>
                                </div>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        setFilterItemType('all');
                                        setFilterItemStatus('all');
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Список */}
                    {filteredUnifiedItems.length === 0 ? (
                        <Card>
                            <Empty
                                description={
                                    <div>
                                        <Text style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                            {filterItemType === 'invitation'
                                                ? 'Нет приглашений с выбранным статусом'
                                                : filterItemType === 'response'
                                                    ? 'Нет откликов с выбранным статусом'
                                                    : 'Нет откликов и приглашений с выбранными фильтрами'}
                                        </Text>
                                        <Text type="secondary">
                                            Откликнитесь на подходящую вакансию или дождитесь приглашения от работодателя
                                        </Text>
                                    </div>
                                }
                            />
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <Button
                                    type="primary"
                                    onClick={() => setActiveTab('vacancies')}
                                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                                >
                                    Перейти к вакансиям
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Card title="История откликов и приглашений">
                            <Collapse
                                items={collapseItems}
                                defaultActiveKey={
                                    filteredUnifiedItems.length > 0
                                        ? [`${filteredUnifiedItems[0].type}-${filteredUnifiedItems[0].id}`]
                                        : []
                                }
                                style={{ background: '#fff' }}
                            />
                        </Card>
                    )}
                </>
            )}

            {/* ================================================================== */}
            {/* Модалка отклика на вакансию                                         */}
            {/* ================================================================== */}
            {responseModalVacancy && (
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <SendOutlined style={{ color: '#402FFF' }} />
                            <span>Отклик на вакансию</span>
                        </div>
                    }
                    open={!!responseModalVacancy}
                    onCancel={() => setResponseModalVacancy(null)}
                    footer={null}
                    width={560}
                >
                    <ResponseForm
                        vacancy={responseModalVacancy}
                        onSubmit={handleResponseSubmit}
                        onCancel={() => setResponseModalVacancy(null)}
                    />
                </Modal>
            )}

            {/* ================================================================== */}
            {/* Модалка принятия приглашения                                        */}
            {/* ================================================================== */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>Принять приглашение</span>
                    </div>
                }
                open={!!acceptInvitationModal}
                onOk={handleAcceptInvitation}
                onCancel={() => {
                    setAcceptInvitationModal(null);
                    setSelectedResumeId(null);
                    setCoverLetter('');
                }}
                okText="Принять"
                cancelText="Отмена"
                okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
                width={560}
            >
                {acceptInvitationModal && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={`Вы принимаете приглашение на вакансию "${getVacancyTitle(
                                vacancies.find((v) => v.id === acceptInvitationModal.vacancyId)!
                            )}"`}
                            description="Выберите резюме, от имени которого вы отвечаете."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Выберите резюме *</Text>
                            </div>
                            <Select
                                placeholder="Выберите резюме"
                                style={{ width: '100%' }}
                                value={selectedResumeId}
                                onChange={setSelectedResumeId}
                            >
                                {MOCK_RESUMES.map((resume) => (
                                    <Select.Option key={resume.id} value={resume.id}>
                                        <Space>
                                            <Text strong>{resume.title}</Text>
                                            <Tag color="#402FFF" style={{ fontSize: 11 }}>
                                                {resume.direction}
                                            </Tag>
                                        </Space>
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Сопроводительное сообщение</Text>
                                <Tag style={{ fontSize: 11, marginLeft: 8 }}>необязательно</Tag>
                            </div>
                            <Input.TextArea
                                rows={4}
                                placeholder="Здравствуйте! Рад принять ваше приглашение..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                maxLength={1000}
                                showCount
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* ================================================================== */}
            {/* Модалка отклонения приглашения                                      */}
            {/* ================================================================== */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CloseCircleOutlined style={{ color: '#f5222d' }} />
                        <span>Отклонить приглашение</span>
                    </div>
                }
                open={!!rejectInvitationModal}
                onOk={handleRejectInvitation}
                onCancel={() => {
                    setRejectInvitationModal(null);
                    setRejectionReason('');
                }}
                okText="Отклонить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
                width={500}
            >
                {rejectInvitationModal && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={`Вы отклоняете приглашение на вакансию "${getVacancyTitle(
                                vacancies.find((v) => v.id === rejectInvitationModal.vacancyId)!
                            )}"`}
                            description="Укажите причину отклонения (необязательно)."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <div>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Причина отклонения</Text>
                                <Tag style={{ fontSize: 11, marginLeft: 8 }}>необязательно</Tag>
                            </div>
                            <Input.TextArea
                                rows={4}
                                placeholder="Например: на данный момент не рассматриваю предложения..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                maxLength={500}
                                showCount
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ============================================================================
// 🎨 Вспомогательный компонент формы отклика
// ============================================================================
interface ResponseFormProps {
    vacancy: Vacancy;
    onSubmit: (values: { resumeId: number; coverLetter: string }) => void;
    onCancel: () => void;
}

const ResponseForm: React.FC<ResponseFormProps> = ({ vacancy, onSubmit, onCancel }) => {
    const [resumeId, setResumeId] = useState<number | null>(
        MOCK_RESUMES.find((r) => r.direction === vacancy.direction)?.id || null
    );
    const [coverLetter, setCoverLetter] = useState('');

    const handleSubmit = () => {
        if (!resumeId) {
            message.error('Выберите резюме');
            return;
        }
        onSubmit({ resumeId, coverLetter });
    };

    return (
        <div style={{ marginTop: 16 }}>
            <div
                style={{
                    padding: 16,
                    background: '#f5f5f5',
                    borderRadius: 8,
                    borderLeft: `4px solid ${DIRECTION_COLORS[vacancy.direction]}`,
                    marginBottom: 20,
                }}
            >
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                    {getVacancyTitle(vacancy)}
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {vacancy.employer}
                    </Text>
                    <Tag color={DIRECTION_COLORS[vacancy.direction]} style={{ fontSize: 11 }}>
                        {DIRECTION_LABELS[vacancy.direction]}
                    </Tag>
                    <Tag color={GRADE_COLORS[vacancy.grade]} style={{ fontSize: 11 }}>
                        {GRADE_LABELS[vacancy.grade]}
                    </Tag>
                </div>
            </div>
            <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                    <Text strong>Выберите резюме *</Text>
                </div>
                <Select
                    placeholder="Выберите резюме"
                    style={{ width: '100%' }}
                    value={resumeId}
                    onChange={setResumeId}
                >
                    {MOCK_RESUMES.map((resume) => (
                        <Select.Option key={resume.id} value={resume.id}>
                            <Space>
                                <Text strong>{resume.title}</Text>
                                <Tag color="#402FFF" style={{ fontSize: 11 }}>
                                    {resume.direction}
                                </Tag>
                            </Space>
                        </Select.Option>
                    ))}
                </Select>
            </div>
            <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 8 }}>
                    <Text strong>Сопроводительное письмо</Text>
                    <Tag style={{ fontSize: 11, marginLeft: 8 }}>необязательно</Tag>
                </div>
                <Input.TextArea
                    rows={4}
                    placeholder="Здравствуйте! Меня заинтересовала ваша вакансия..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    maxLength={1000}
                    showCount
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={onCancel}>Отмена</Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    Отправить отклик
                </Button>
            </div>
        </div>
    );
};

export default CandidateVacancies;