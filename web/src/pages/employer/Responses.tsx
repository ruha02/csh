import {
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CodeOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    FileTextOutlined,
    FilterOutlined,
    GlobalOutlined,
    HistoryOutlined,
    InboxOutlined,
    MailOutlined,
    ReloadOutlined,
    SendOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Collapse,
    Descriptions,
    Divider,
    Empty,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Timeline,
    Typography,
    message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useRef, useState } from 'react';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS, MOCK_CANDIDATES_SEARCH, MOCK_EMPLOYER_RESPONSES,
    MOCK_EMPLOYER_VACANCIES, type CandidateSearchResult, type ChatMessage,
    type EmployerResponse,
    type EmployerResponseStatus,
    type EmployerVacancy
} from '../../mocks';
import EmployerResumePreview from './ResumePreview';
dayjs.locale('ru');

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ============================================================================
// 🏷️ Конфигурация статусов
// ============================================================================
const RESPONSE_STATUS_CONFIG: Record<
    EmployerResponseStatus,
    { label: string; color: string; icon: React.ReactNode }
> = {
    new: { label: 'Новый', color: '#402FFF', icon: <InboxOutlined /> },
    viewed: { label: 'Просмотрен', color: '#722ed1', icon: <EyeOutlined /> },
    shortlisted: { label: 'В шорт-листе', color: '#52c41a', icon: <CheckCircleOutlined /> },
    rejected: { label: 'Отклонён', color: '#f5222d', icon: <CloseCircleOutlined /> },
    task_sent: { label: 'Отправлено задание', color: '#fa8c16', icon: <SendOutlined /> },
};

// ============================================================================
// 🧮 Вспомогательные функции
// ============================================================================
const getDaysAgo = (date: string): string => {
    const days = Math.max(0, dayjs().diff(dayjs(date), 'day'));
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} ${days === 2 || days === 3 || days === 4 ? 'дня' : 'дней'} назад`;
    return dayjs(date).format('D MMM YYYY');
};

// ============================================================================
// 🎨 Компонент чата с кандидатом
// ============================================================================
interface ChatBoxProps {
    messages: ChatMessage[];
    onSend: (text: string) => void;
    candidateName: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSend, candidateName }) => {
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
                <Text strong style={{ fontSize: 14 }}>Чат с кандидатом</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>• {candidateName}</Text>
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
                        <Text type="secondary">Сообщений пока нет. Напишите кандидату первым!</Text>
                    </div>
                ) : (
                    messages.map((msg) => {
                        // Работодатель = "employer", кандидат = "candidate"
                        // Для работодателя "employer" — это "я", "candidate" — собеседник
                        const isMe = msg.sender === 'employer';
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
// 🎨 Основной компонент страницы
// ============================================================================
const EmployerResponses: React.FC = () => {
    const [responses, setResponses] = useState<EmployerResponse[]>(MOCK_EMPLOYER_RESPONSES);
    const [vacancies] = useState<EmployerVacancy[]>(MOCK_EMPLOYER_VACANCIES);

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVacancyId, setFilterVacancyId] = useState<number | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<EmployerResponseStatus | 'all'>('all');
    const [filterDirection, setFilterDirection] = useState<string>('all');
    const [filterGrade, setFilterGrade] = useState<string>('all');

    // Модалки
    const [rejectModalResponse, setRejectModalResponse] = useState<EmployerResponse | null>(null);
    const [rejectComment, setRejectComment] = useState('');
    const [taskModalResponse, setTaskModalResponse] = useState<EmployerResponse | null>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');
    // Модалка просмотра резюме кандидата
    const [previewCandidate, setPreviewCandidate] = useState<CandidateSearchResult | null>(null);
    // ========================================================================
    // 📊 Статистика
    // ========================================================================
    const stats = {
        total: responses.length,
        newCount: responses.filter((r) => r.status === 'new').length,
        viewed: responses.filter((r) => r.status === 'viewed').length,
        shortlisted: responses.filter((r) => r.status === 'shortlisted').length,
        taskSent: responses.filter((r) => r.status === 'task_sent').length,
        rejected: responses.filter((r) => r.status === 'rejected').length,
        avgMatch:
            responses.length > 0
                ? Math.round(
                    responses.reduce((sum, r) => sum + r.matchPercent, 0) / responses.length
                )
                : 0,
    };

    // ========================================================================
    // 🎯 Фильтрация
    // ========================================================================
    const filteredResponses = responses.filter((response) => {
        // Поиск по имени кандидата
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!response.candidateName.toLowerCase().includes(query)) return false;
        }

        // Фильтр по вакансии
        if (filterVacancyId !== 'all' && response.vacancyId !== filterVacancyId) return false;

        // Фильтр по статусу
        if (filterStatus !== 'all' && response.status !== filterStatus) return false;

        // Фильтр по направлению
        if (filterDirection !== 'all' && response.direction !== filterDirection) return false;

        // Фильтр по грейду
        if (filterGrade !== 'all' && response.grade !== filterGrade) return false;

        return true;
    });

    // ========================================================================
    // 🎯 Действия
    // ========================================================================
    const handleView = (responseId: number) => {
        setResponses(
            responses.map((r) =>
                r.id === responseId
                    ? { ...r, status: 'viewed', viewedAt: dayjs().format('YYYY-MM-DD') }
                    : r
            )
        );
        message.success('Отклик отмечен как просмотренный');
    };

    const handleShortlist = (responseId: number) => {
        setResponses(
            responses.map((r) =>
                r.id === responseId ? { ...r, status: 'shortlisted' } : r
            )
        );
        message.success('Кандидат добавлен в шорт-лист');
    };

    const handleOpenRejectModal = (response: EmployerResponse) => {
        setRejectModalResponse(response);
        setRejectComment('');
    };

    const handleConfirmReject = () => {
        if (!rejectModalResponse) return;
        setResponses(
            responses.map((r) =>
                r.id === rejectModalResponse.id
                    ? {
                        ...r,
                        status: 'rejected',
                        comment: rejectComment.trim() || r.comment,
                    }
                    : r
            )
        );
        setRejectModalResponse(null);
        setRejectComment('');
        message.info('Кандидат отклонён');
    };

    const handleOpenTaskModal = (response: EmployerResponse) => {
        setTaskModalResponse(response);
        const vacancy = vacancies.find((v) => v.id === response.vacancyId);
        setTaskTitle(vacancy ? `Тестовое задание: ${vacancy.title}` : 'Тестовое задание');
        setTaskDescription('');
        setTaskDeadline(dayjs().add(7, 'day').format('YYYY-MM-DD'));
    };

    const handleSendTask = () => {
        if (!taskModalResponse) return;
        if (!taskTitle.trim()) {
            message.error('Укажите название задания');
            return;
        }
        setResponses(
            responses.map((r) =>
                r.id === taskModalResponse.id
                    ? { ...r, status: 'task_sent', taskId: Date.now() }
                    : r
            )
        );
        setTaskModalResponse(null);
        setTaskTitle('');
        setTaskDescription('');
        setTaskDeadline('');
        message.success('Тестовое задание отправлено кандидату');
    };

    const handleSendMessage = (responseId: number, text: string) => {
        const newMessage: ChatMessage = {
            id: Date.now(),
            sender: 'employer',
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

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterVacancyId('all');
        setFilterStatus('all');
        setFilterDirection('all');
        setFilterGrade('all');
    };

    // ========================================================================
    // 🎨 Рендер таблицы hard skills
    // ========================================================================
    const renderHardSkillsTable = (response: EmployerResponse) => {
        if (response.hardSkillsMatch.length === 0) {
            return <Text type="secondary">Hard skills не указаны</Text>;
        }

        const columns: ColumnsType<(typeof response.hardSkillsMatch)[0]> = [
            {
                title: 'Тема',
                dataIndex: 'topicName',
                key: 'topicName',
                render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>,
            },
            {
                title: 'Требуется',
                dataIndex: 'requiredPercent',
                key: 'requiredPercent',
                align: 'center',
                width: 100,
                render: (percent: number) => (
                    <Tag color="#402FFF" style={{ margin: 0 }}>
                        {percent}%
                    </Tag>
                ),
            },
            {
                title: 'У кандидата',
                dataIndex: 'candidatePercent',
                key: 'candidatePercent',
                align: 'center',
                width: 120,
                render: (percent: number) => (
                    <Text
                        strong
                        style={{
                            color:
                                percent === 0
                                    ? '#d9d9d9'
                                    : percent < 30
                                        ? '#f5222d'
                                        : percent < 70
                                            ? '#faad14'
                                            : percent < 100
                                                ? '#1890ff'
                                                : '#52c41a',
                            fontSize: 14,
                        }}
                    >
                        {percent}%
                    </Text>
                ),
            },
            {
                title: 'Статус',
                key: 'status',
                align: 'center',
                width: 140,
                render: (_, record) => {
                    const meets = record.candidatePercent >= record.requiredPercent;
                    return meets ? (
                        <Tag
                            color="#52c41a"
                            icon={<CheckCircleOutlined />}
                            style={{ fontSize: 11, padding: '2px 8px', margin: 0 }}
                        >
                            Соответствует
                        </Tag>
                    ) : (
                        <Tag
                            color="#f5222d"
                            icon={<CloseCircleOutlined />}
                            style={{ fontSize: 11, padding: '2px 8px', margin: 0 }}
                        >
                            Не хватает {record.requiredPercent - record.candidatePercent}%
                        </Tag>
                    );
                },
            },
        ];

        return (
            <Table
                columns={columns}
                dataSource={response.hardSkillsMatch}
                rowKey="topicKey"
                pagination={false}
                size="small"
                bordered
                style={{ borderRadius: 8 }}
            />
        );
    };

    // ========================================================================
    // 🎨 Рендер панели отклика
    // ========================================================================
    const renderResponsePanel = (response: EmployerResponse) => {
        const vacancy = vacancies.find((v) => v.id === response.vacancyId);
        if (!vacancy) return null;

        return (
            <div>
                {/* Шапка с основной информацией */}
                <div
                    style={{
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        borderLeft: `4px solid ${DIRECTION_COLORS[response.direction]}`,
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <Avatar
                                size={48}
                                style={{
                                    backgroundColor: '#402FFF',
                                    fontSize: 18,
                                    fontWeight: 700,
                                }}
                            >
                                {response.candidateName
                                    .split(' ')
                                    .map((n) => n.charAt(0))
                                    .join('')
                                    .slice(0, 2)}
                            </Avatar>
                            <div>
                                <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
                                    {response.candidateName}
                                </Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        {response.resumeTitle}
                                    </Text>
                                    <Tag
                                        color={DIRECTION_COLORS[response.direction]}
                                        style={{ fontSize: 11, padding: '2px 8px' }}
                                    >
                                        {DIRECTION_LABELS[response.direction]}
                                    </Tag>
                                    <Tag
                                        color={GRADE_COLORS[response.grade]}
                                        style={{ fontSize: 11, padding: '2px 8px' }}
                                    >
                                        {GRADE_LABELS[response.grade]}
                                    </Tag>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div
                                style={{
                                    fontSize: 32,
                                    fontWeight: 700,
                                    color:
                                        response.matchPercent === 0
                                            ? '#d9d9d9'
                                            : response.matchPercent < 30
                                                ? '#f5222d'
                                                : response.matchPercent < 70
                                                    ? '#faad14'
                                                    : '#52c41a',
                                    lineHeight: 1,
                                }}
                            >
                                {response.matchPercent}%
                            </div>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                соответствие
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                        <Text type="secondary">
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            Отклик: {dayjs(response.appliedAt).format('D MMM YYYY')} ({getDaysAgo(response.appliedAt)})
                        </Text>
                        {response.viewedAt && (
                            <Text type="secondary">
                                <EyeOutlined style={{ marginRight: 4 }} />
                                Просмотрен: {dayjs(response.viewedAt).format('D MMM YYYY')}
                            </Text>
                        )}
                    </div>
                </div>

                {/* Информация о вакансии */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Вакансия
                    </Text>
                    <div
                        style={{
                            padding: 12,
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <BankOutlined style={{ color: '#402FFF' }} />
                            <Text strong style={{ fontSize: 15 }}>{vacancy.title}</Text>
                            <Tag color={DIRECTION_COLORS[vacancy.direction]} style={{ fontSize: 11 }}>
                                {DIRECTION_LABELS[vacancy.direction]}
                            </Tag>
                            <Tag color={GRADE_COLORS[vacancy.grade]} style={{ fontSize: 11 }}>
                                {GRADE_LABELS[vacancy.grade]}
                            </Tag>
                        </div>
                        {vacancy.location && (
                            <div style={{ marginTop: 4 }}>
                                <EnvironmentOutlined style={{ marginRight: 4, color: '#402FFF' }} />
                                <Text style={{ fontSize: 13 }}>{vacancy.location}</Text>
                                {vacancy.isRemote && (
                                    <Tag
                                        color="#52c41a"
                                        icon={<GlobalOutlined />}
                                        style={{ marginLeft: 8, fontSize: 11 }}
                                    >
                                        Удалённо
                                    </Tag>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Сопроводительное письмо */}
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Сопроводительное письмо
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
                            {response.coverLetter || 'Сопроводительное письмо не указано'}
                        </Paragraph>
                    </div>
                </div>

                {/* Hard skills сравнение */}
                <div style={{ marginBottom: 16 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                        }}
                    >
                        <CodeOutlined style={{ color: '#402FFF' }} />
                        <Text strong>Сравнение hard skills</Text>
                    </div>
                    {renderHardSkillsTable(response)}
                </div>

                {/* Soft skills */}
                {response.softSkillsMatch.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            <TeamOutlined style={{ color: '#722ed1' }} />
                            <Text strong>Совпадающие soft skills</Text>
                        </div>
                        <Space wrap size={[8, 8]}>
                            {response.softSkillsMatch.map((skill, idx) => (
                                <Tag
                                    key={idx}
                                    color="#722ed1"
                                    style={{ fontSize: 13, padding: '4px 12px' }}
                                >
                                    {skill}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                )}

                {/* Контакты */}
                <div style={{ marginBottom: 16 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                        }}
                    >
                        <MailOutlined style={{ color: '#402FFF' }} />
                        <Text strong>Контакты</Text>
                    </div>
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Email">
                            <MailOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            <a href={`mailto:${response.candidateEmail}`}>
                                {response.candidateEmail}
                            </a>
                        </Descriptions.Item>
                        {response.candidateTelegram && (
                            <Descriptions.Item label="Telegram">
                                <SendOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                                {response.candidateTelegram}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>

                {/* Комментарий (если есть) */}
                {response.comment && (
                    <Alert
                        message={
                            response.status === 'rejected'
                                ? 'Причина отклонения'
                                : response.status === 'shortlisted'
                                    ? 'Ваш комментарий'
                                    : 'Комментарий'
                        }
                        description={response.comment}
                        type={
                            response.status === 'rejected'
                                ? 'error'
                                : response.status === 'shortlisted'
                                    ? 'success'
                                    : 'info'
                        }
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                    />
                )}
                {/* Просмотр резюме кандидата */}
                <div style={{ marginBottom: 16 }}>
                    <Button
                        block
                        icon={<FileTextOutlined />}
                        onClick={() => {
                            // Ищем кандидата по email в моковых данных
                            const candidate = MOCK_CANDIDATES_SEARCH.find(
                                (c) => c.email === response.candidateEmail
                            );
                            if (candidate) {
                                setPreviewCandidate(candidate);
                            } else {
                                message.info('Резюме кандидата недоступно для просмотра');
                            }
                        }}
                        style={{
                            borderColor: '#402FFF',
                            color: '#402FFF',
                            height: 40,
                        }}
                    >
                        Просмотреть полное резюме кандидата
                    </Button>
                </div>
                {/* История статусов */}
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
                                                    <Text strong>Отклик получен</Text>
                                                    <br />
                                                    <Text type="secondary">
                                                        {dayjs(response.appliedAt).format('D MMMM YYYY')}
                                                    </Text>
                                                </Text>
                                            ),
                                        },
                                        response.viewedAt && {
                                            color: '#722ed1',
                                            children: (
                                                <Text style={{ fontSize: 12 }}>
                                                    <Text strong>Просмотрен</Text>
                                                    <br />
                                                    <Text type="secondary">
                                                        {dayjs(response.viewedAt).format('D MMMM YYYY')}
                                                    </Text>
                                                </Text>
                                            ),
                                        },
                                        response.status === 'shortlisted' && {
                                            color: '#52c41a',
                                            children: (
                                                <Text style={{ fontSize: 12 }}>
                                                    <Text strong>Добавлен в шорт-лист</Text>
                                                </Text>
                                            ),
                                        },
                                        response.status === 'task_sent' && {
                                            color: '#fa8c16',
                                            children: (
                                                <Text style={{ fontSize: 12 }}>
                                                    <Text strong>Отправлено тестовое задание</Text>
                                                </Text>
                                            ),
                                        },
                                        response.status === 'rejected' && {
                                            color: '#f5222d',
                                            children: (
                                                <Text style={{ fontSize: 12 }}>
                                                    <Text strong>Отклонён</Text>
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
                <div style={{ marginBottom: 16 }}>
                    <ChatBox
                        messages={response.messages}
                        onSend={(text) => handleSendMessage(response.id, text)}
                        candidateName={response.candidateName}
                    />
                </div>

                {/* Действия */}

                <Divider style={{ margin: '16px 0' }} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {response.status === 'new' && (
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleView(response.id)}
                        >
                            Отметить просмотренным
                        </Button>
                    )}
                    {(response.status === 'new' || response.status === 'viewed') && (
                        <>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleShortlist(response.id)}
                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                            >
                                В шорт-лист
                            </Button>
                            <Button
                                icon={<SendOutlined />}
                                onClick={() => handleOpenTaskModal(response)}
                                style={{ borderColor: '#fa8c16', color: '#fa8c16' }}
                            >
                                Отправить задание
                            </Button>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleOpenRejectModal(response)}
                            >
                                Отклонить
                            </Button>
                        </>
                    )}
                    {response.status === 'shortlisted' && (
                        <>
                            <Alert
                                message="Кандидат в шорт-листе"
                                type="success"
                                showIcon
                                style={{ padding: '4px 12px', borderRadius: 6, flex: 1 }}
                            />
                            <Button
                                icon={<SendOutlined />}
                                onClick={() => handleOpenTaskModal(response)}
                                style={{ borderColor: '#fa8c16', color: '#fa8c16' }}
                            >
                                Отправить задание
                            </Button>
                        </>
                    )}
                    {response.status === 'task_sent' && (
                        <Alert
                            message="Тестовое задание отправлено"
                            type="info"
                            showIcon
                            style={{ padding: '4px 12px', borderRadius: 6, flex: 1 }}
                        />
                    )}
                    {response.status === 'rejected' && (
                        <Alert
                            message="Кандидат отклонён"
                            type="error"
                            showIcon
                            style={{ padding: '4px 12px', borderRadius: 6, flex: 1 }}
                        />
                    )}
                </div>
            </div>
        );
    };

    // ========================================================================
    // 🎨 Collapse items
    // ========================================================================
    const collapseItems = filteredResponses.map((response) => {
        const vacancy = vacancies.find((v) => v.id === response.vacancyId);
        if (!vacancy) return null;

        const statusConfig = RESPONSE_STATUS_CONFIG[response.status];

        return {
            key: response.id.toString(),
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
                    <Avatar
                        size={32}
                        style={{
                            backgroundColor: '#402FFF',
                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        {response.candidateName
                            .split(' ')
                            .map((n) => n.charAt(0))
                            .join('')
                            .slice(0, 2)}
                    </Avatar>
                    <Text strong style={{ fontSize: 14 }}>
                        {response.candidateName}
                    </Text>
                    <Tag
                        color={DIRECTION_COLORS[response.direction]}
                        style={{ fontSize: 11, padding: '2px 8px', margin: 0 }}
                    >
                        {DIRECTION_LABELS[response.direction]}
                    </Tag>
                    <Tag
                        color={GRADE_COLORS[response.grade]}
                        style={{ fontSize: 11, padding: '2px 8px', margin: 0 }}
                    >
                        {GRADE_LABELS[response.grade]}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {vacancy.title}
                    </Text>
                    <Text
                        strong
                        style={{
                            fontSize: 14,
                            color:
                                response.matchPercent === 0
                                    ? '#d9d9d9'
                                    : response.matchPercent < 30
                                        ? '#f5222d'
                                        : response.matchPercent < 70
                                            ? '#faad14'
                                            : '#52c41a',
                        }}
                    >
                        {response.matchPercent}%
                    </Text>
                    <div style={{ marginLeft: 'auto' }}>
                        <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ margin: 0 }}>
                            {statusConfig.label}
                        </Tag>
                    </div>
                </div>
            ),
            children: renderResponsePanel(response),
        };
    }).filter(Boolean) as any[];

    // ========================================================================
    // 🎨 Рендер
    // ========================================================================
    return (
        <div>
            {/* Заголовок */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <InboxOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>
                        Отклики кандидатов
                    </Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Все отклики кандидатов на ваши вакансии в едином центре
                </Text>
            </div>

            {/* Статистика */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Всего откликов"
                            value={stats.total}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: '#402FFF' }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Новые"
                            value={stats.newCount}
                            prefix={<Badge status="processing" />}
                            valueStyle={{ color: '#402FFF', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Просмотрено"
                            value={stats.viewed}
                            prefix={<EyeOutlined />}
                            valueStyle={{ color: '#722ed1', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="В шорт-листе"
                            value={stats.shortlisted}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Отправлено заданий"
                            value={stats.taskSent}
                            prefix={<SendOutlined />}
                            valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Среднее соответствие"
                            value={stats.avgMatch}
                            suffix="%"
                            valueStyle={{
                                color:
                                    stats.avgMatch < 30
                                        ? '#f5222d'
                                        : stats.avgMatch < 70
                                            ? '#faad14'
                                            : '#52c41a',
                                fontSize: 20,
                            }}
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
                            <Text strong>Поиск</Text>
                        </div>
                        <Search
                            placeholder="Имя кандидата"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Вакансия</Text>
                        </div>
                        <Select
                            value={filterVacancyId}
                            onChange={setFilterVacancyId}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все вакансии</Select.Option>
                            {vacancies.map((v) => (
                                <Select.Option key={v.id} value={v.id}>
                                    <Space>
                                        <Text strong style={{ fontSize: 12 }}>{v.title}</Text>
                                        <Tag
                                            color={DIRECTION_COLORS[v.direction]}
                                            style={{ fontSize: 10, padding: '0 6px' }}
                                        >
                                            {DIRECTION_LABELS[v.direction]}
                                        </Tag>
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Статус</Text>
                        </div>
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все статусы</Select.Option>
                            {Object.entries(RESPONSE_STATUS_CONFIG).map(([key, cfg]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={cfg.color} icon={cfg.icon} style={{ fontSize: 11 }}>
                                        {cfg.label}
                                    </Tag>
                                </Select.Option>
                            ))}
                        </Select>
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
                </Row>
                <Row style={{ marginTop: 12 }}>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
                            Сбросить фильтры
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Список откликов */}
            {filteredResponses.length === 0 ? (
                <Card>
                    <Empty
                        description={
                            <div>
                                <Text style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                    Нет откликов, соответствующих выбранным фильтрам
                                </Text>
                                <Text type="secondary">
                                    Попробуйте изменить параметры фильтрации
                                </Text>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <InboxOutlined style={{ color: '#402FFF' }} />
                            <span>Отклики</span>
                            <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                {filteredResponses.length}
                            </Tag>
                        </div>
                    }
                >
                    <Collapse
                        items={collapseItems}
                        defaultActiveKey={
                            filteredResponses.length > 0
                                ? [filteredResponses[0].id.toString()]
                                : []
                        }
                        style={{ background: '#fff' }}
                    />
                </Card>
            )}

            {/* Модалка отклонения */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CloseCircleOutlined style={{ color: '#f5222d' }} />
                        <span>Отклонить кандидата</span>
                    </div>
                }
                open={!!rejectModalResponse}
                onOk={handleConfirmReject}
                onCancel={() => {
                    setRejectModalResponse(null);
                    setRejectComment('');
                }}
                okText="Отклонить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
            >
                {rejectModalResponse && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={`Вы отклоняете кандидата "${rejectModalResponse.candidateName}"`}
                            description="Укажите причину отклонения (необязательно). Она будет видна кандидату."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Причина отклонения</Text>
                            <Tag style={{ fontSize: 11, marginLeft: 8 }}>необязательно</Tag>
                        </div>
                        <Input.TextArea
                            rows={4}
                            placeholder="Например: На данный момент мы остановились на другом кандидате..."
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            maxLength={500}
                            showCount
                        />
                    </div>
                )}
            </Modal>

            {/* Модалка отправки задания */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SendOutlined style={{ color: '#fa8c16' }} />
                        <span>Отправить тестовое задание</span>
                    </div>
                }
                open={!!taskModalResponse}
                onOk={handleSendTask}
                onCancel={() => {
                    setTaskModalResponse(null);
                    setTaskTitle('');
                    setTaskDescription('');
                    setTaskDeadline('');
                }}
                okText="Отправить"
                cancelText="Отмена"
                okButtonProps={{
                    style: { background: '#fa8c16', borderColor: '#fa8c16' },
                }}
                width={600}
            >
                {taskModalResponse && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={`Задание для кандидата "${taskModalResponse.candidateName}"`}
                            description="Заполните информацию о тестовом задании. Кандидат получит уведомление."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Название задания *</Text>
                            </div>
                            <Input
                                placeholder="Например: Разработка REST API для сервиса уведомлений"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                maxLength={200}
                                showCount
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Описание задания</Text>
                                <Tag style={{ fontSize: 11, marginLeft: 8 }}>необязательно</Tag>
                            </div>
                            <Input.TextArea
                                rows={5}
                                placeholder="Опишите требования, стек технологий, критерии оценки..."
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                maxLength={2000}
                                showCount
                            />
                        </div>
                        <div>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Дедлайн</Text>
                            </div>
                            <Input
                                type="date"
                                value={taskDeadline}
                                onChange={(e) => setTaskDeadline(e.target.value)}
                                min={dayjs().format('YYYY-MM-DD')}
                            />
                        </div>
                    </div>
                )}
            </Modal>
            {/* Модалка просмотра резюме кандидата */}
            {previewCandidate && (
                <EmployerResumePreview
                    candidate={previewCandidate}
                    onClose={() => setPreviewCandidate(null)}
                />
            )}
        </div>
    );
};


export default EmployerResponses;