import {
    AuditOutlined,
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    FileTextOutlined,
    FilterOutlined,
    GlobalOutlined,
    LinkOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    RobotOutlined,
    UploadOutlined
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Tag,
    Timeline,
    Tooltip,
    Typography,
    Upload,
    message,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    MOCK_RESUMES,
    MOCK_TASKS,
    TASK_RESULT_COLORS,
    TASK_RESULT_LABELS,
    TASK_SOURCE_COLORS,
    TASK_SOURCE_LABELS,
    TASK_STATUS_COLORS,
    TASK_STATUS_LABELS,
    type Task,
    type TaskResult,
    type TaskSource,
    type TaskStatus
} from '../../mocks';

dayjs.locale('ru');
const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 🧮 Вспомогательные функции
// ============================================================================
const getDaysLeft = (deadline: string | undefined): number | null => {
    if (!deadline) return null;
    return Math.max(0, dayjs(deadline).diff(dayjs(), 'day'));
};

const getDeadlineStatus = (
    deadline: string | undefined,
    status: TaskStatus
): { label: string; color: string } => {
    if (!deadline || status === 'evaluated') return { label: '', color: '' };
    const days = getDaysLeft(deadline);
    if (days === null) return { label: '', color: '' };
    if (days === 0) return { label: 'Сегодня дедлайн!', color: '#f5222d' };
    if (days <= 2) return { label: `Осталось ${days} дня`, color: '#fa8c16' };
    if (days <= 7) return { label: `Осталось ${days} дней`, color: '#faad14' };
    return { label: `Осталось ${days} дней`, color: '#52c41a' };
};

const getSourceIcon = (source: TaskSource) => {
    if (source === 'ai') return <RobotOutlined style={{ color: '#722ed1' }} />;
    return <BankOutlined style={{ color: '#402FFF' }} />;
};

const getResultIcon = (result: TaskResult | undefined) => {
    if (!result) return null;
    if (result === 'accepted') return <CheckCircleOutlined />;
    return <CloseCircleOutlined />;
};

const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
        case 'pending':
            return <FileTextOutlined />;
        case 'in_progress':
            return <PlayCircleOutlined />;
        case 'submitted':
            return <EyeOutlined />;
        case 'evaluated':
            return <CheckCircleOutlined />;
    }
};

// ============================================================================
// 🎨 Компонент страницы
// ============================================================================
const CandidateTasks: React.FC = () => {
    const [searchParams] = useSearchParams();

    const [selectedTask, setSelectedTask] = useState<Task | null>(() => {
        const taskIdParam = searchParams.get('taskId');
        if (taskIdParam) {
            const taskId = parseInt(taskIdParam, 10);
            return MOCK_TASKS.find((t) => t.id === taskId) || (MOCK_TASKS.length > 0 ? MOCK_TASKS[0] : null);
        }
        return MOCK_TASKS.length > 0 ? MOCK_TASKS[0] : null;
    });
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

    // Фильтры
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
    const [filterSource, setFilterSource] = useState<TaskSource | 'all'>('all');
    const [filterResumeId, setFilterResumeId] = useState<number | 'all'>('all');

    // Модалки
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isAiRequestModalOpen, setIsAiRequestModalOpen] = useState(false);
    const [solutionUrl, setSolutionUrl] = useState('');
    const [solutionFileName, setSolutionFileName] = useState('');
    const [aiRequestResumeId, setAiRequestResumeId] = useState<number | null>(null);
    const [aiRequestDescription, setAiRequestDescription] = useState('');

    const filteredTasks = tasks.filter((task) => {
        if (filterStatus !== 'all' && task.status !== filterStatus) return false;
        if (filterSource !== 'all' && task.source !== filterSource) return false;
        if (filterResumeId !== 'all' && task.resumeId !== filterResumeId) return false;
        return true;
    });

    // ========================================================================
    // 📊 Статистика
    // ========================================================================
    const stats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === 'pending').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        submitted: tasks.filter((t) => t.status === 'submitted').length,
        evaluated: tasks.filter((t) => t.status === 'evaluated').length,
        accepted: tasks.filter((t) => t.result === 'accepted').length,
        rejected: tasks.filter((t) => t.result === 'rejected').length,
        publicCount: tasks.filter((t) => t.isPublic).length,
    };

    // ========================================================================
    // 🎯 Действия над заданием
    // ========================================================================
    const handleAcceptTask = (task: Task) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === task.id
                    ? { ...t, status: 'in_progress', acceptedAt: dayjs().format('YYYY-MM-DD') }
                    : t
            )
        );
        if (selectedTask?.id === task.id) {
            setSelectedTask({
                ...task,
                status: 'in_progress',
                acceptedAt: dayjs().format('YYYY-MM-DD'),
            });
        }
        message.success('Задание принято в работу');
    };

    const openUploadModal = (task: Task) => {
        setSelectedTask(task);
        setSolutionUrl(task.solutionUrl || '');
        setSolutionFileName(task.solutionFileName || '');
        setIsUploadModalOpen(true);
    };

    const handleUploadSolution = () => {
        if (!selectedTask) return;
        if (!solutionUrl.trim() && !solutionFileName.trim()) {
            message.error('Укажите ссылку на решение или загрузите файл');
            return;
        }
        setTasks((prev) =>
            prev.map((t) =>
                t.id === selectedTask.id
                    ? {
                        ...t,
                        status: 'submitted',
                        solutionUrl: solutionUrl.trim() || undefined,
                        solutionFileName: solutionFileName.trim() || undefined,
                        submittedAt: dayjs().format('YYYY-MM-DD'),
                    }
                    : t
            )
        );
        setSelectedTask({
            ...selectedTask,
            status: 'submitted',
            solutionUrl: solutionUrl.trim() || undefined,
            solutionFileName: solutionFileName.trim() || undefined,
            submittedAt: dayjs().format('YYYY-MM-DD'),
        });
        setIsUploadModalOpen(false);
        setSolutionUrl('');
        setSolutionFileName('');
        message.success('Решение отправлено на оценивание');
    };

    const handleTogglePublic = (task: Task) => {
        const newIsPublic = !task.isPublic;
        setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, isPublic: newIsPublic } : t))
        );
        if (selectedTask?.id === task.id) {
            setSelectedTask({ ...task, isPublic: newIsPublic });
        }
        message.success(
            newIsPublic
                ? 'Решение теперь доступно другим работодателям'
                : 'Решение скрыто от других работодателей'
        );
    };

    const handleRequestAiTask = () => {
        if (!aiRequestResumeId) {
            message.error('Выберите резюме');
            return;
        }
        const resume = MOCK_RESUMES.find((r) => r.id === aiRequestResumeId);
        if (!resume) return;

        const newTask: Task = {
            id: Date.now(),
            title: `Тестовое задание по резюме "${resume.title}"`,
            employer: 'ИИ',
            source: 'ai',
            resumeId: resume.id,
            resumeTitle: resume.title,
            description:
                aiRequestDescription.trim() ||
                `Сгенерировано ИИ на основе резюме "${resume.title}". Задание будет подготовлено в течение нескольких минут.`,
            direction: resume.direction as any,
            grade: resume.grade,
            status: 'pending',
            receivedAt: dayjs().format('YYYY-MM-DD'),
            deadline: dayjs().add(7, 'day').format('YYYY-MM-DD'),
            aiGeneratedAt: dayjs().format('YYYY-MM-DD'),
        };
        setTasks([newTask, ...tasks]);
        setSelectedTask(newTask);
        setIsAiRequestModalOpen(false);
        setAiRequestResumeId(null);
        setAiRequestDescription('');
        message.success('Запрос отправлен. ИИ подготовит задание в течение нескольких минут.');
    };

    // ========================================================================
    // 🎨 Рендер
    // ========================================================================
    return (
        <div>
            {/* Заголовок */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    flexWrap: 'wrap',
                    gap: 12,
                }}
            >
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 8,
                        }}
                    >
                        <AuditOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                        <Title level={2} style={{ margin: 0 }}>
                            Тестовые задания
                        </Title>
                    </div>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Задания от работодателей и сгенерированные ИИ по вашим резюме
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={() => setIsAiRequestModalOpen(true)}
                    style={{ background: '#722ed1', borderColor: '#722ed1' }}
                >
                    Запросить задание у ИИ
                </Button>
            </div>

            {/* Статистика */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Всего заданий"
                            value={stats.total}
                            prefix={<AuditOutlined />}
                            valueStyle={{ color: '#402FFF' }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Ожидают принятия"
                            value={stats.pending}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#402FFF', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Выполняется"
                            value={stats.inProgress}
                            prefix={<PlayCircleOutlined />}
                            valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="На оценивании"
                            value={stats.submitted}
                            prefix={<EyeOutlined />}
                            valueStyle={{ color: '#722ed1', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Оценено"
                            value={stats.evaluated}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="✅ / ❌"
                            value={`${stats.accepted} / ${stats.rejected}`}
                            valueStyle={{ fontSize: 20, color: '#1B1C21' }}
                        />
                    </Col>
                </Row>
                {stats.publicCount > 0 && (
                    <>
                        <Divider style={{ margin: '16px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <GlobalOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                            <Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                    {stats.publicCount}
                                </Text>{' '}
                                {stats.publicCount === 1
                                    ? 'решение доступно'
                                    : stats.publicCount < 5
                                        ? 'решения доступны'
                                        : 'решений доступно'}{' '}
                                другим работодателям
                            </Text>
                        </div>
                    </>
                )}
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
                            <Text strong>Статус</Text>
                        </div>
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все статусы</Select.Option>
                            <Select.Option value="pending">Ожидает принятия</Select.Option>
                            <Select.Option value="in_progress">Выполняется</Select.Option>
                            <Select.Option value="submitted">На оценивании</Select.Option>
                            <Select.Option value="evaluated">Оценено</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Источник</Text>
                        </div>
                        <Select
                            value={filterSource}
                            onChange={setFilterSource}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все источники</Select.Option>
                            <Select.Option value="employer">От работодателя</Select.Option>
                            <Select.Option value="ai">Сгенерировано ИИ</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Резюме</Text>
                        </div>
                        <Select
                            value={filterResumeId}
                            onChange={setFilterResumeId}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все резюме</Select.Option>
                            {MOCK_RESUMES.map((resume) => (
                                <Select.Option key={resume.id} value={resume.id}>
                                    {resume.title}
                                </Select.Option>
                            ))}
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
                                setFilterStatus('all');
                                setFilterSource('all');
                                setFilterResumeId('all');
                            }}
                        >
                            Сбросить
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Основной контент */}
            {filteredTasks.length === 0 ? (
                <Card>
                    <Empty description="Нет заданий, соответствующих выбранным фильтрам" />
                </Card>
            ) : (
                <Row gutter={24}>
                    {/* Левая колонка: список заданий */}
                    <Col xs={24} lg={8}>
                        <Card title="Список заданий" style={{ marginBottom: 24 }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {filteredTasks.map((task) => {
                                    const deadlineStatus = getDeadlineStatus(task.deadline, task.status);
                                    return (
                                        <Card
                                            key={task.id}
                                            size="small"
                                            hoverable
                                            onClick={() => setSelectedTask(task)}
                                            style={{
                                                border:
                                                    selectedTask?.id === task.id
                                                        ? '2px solid #402FFF'
                                                        : '1px solid #d9d9d9',
                                                borderLeft: `4px solid ${TASK_STATUS_COLORS[task.status]}`,
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
                                                    {getSourceIcon(task.source)}
                                                    <Text
                                                        type="secondary"
                                                        style={{ fontSize: 12, flex: 1 }}
                                                        ellipsis={{ tooltip: task.employer }}
                                                    >
                                                        {task.employer}
                                                    </Text>
                                                    {task.isPublic && (
                                                        <Tooltip title="Доступно другим работодателям">
                                                            <GlobalOutlined
                                                                style={{ color: '#52c41a', fontSize: 12 }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 14,
                                                        display: 'block',
                                                        marginBottom: 8,
                                                        color: '#1B1C21',
                                                    }}
                                                >
                                                    {task.title}
                                                </Text>
                                                <div style={{ marginBottom: 6 }}>
                                                    <Tag
                                                        color="#f5f5f5"
                                                        style={{
                                                            fontSize: 11,
                                                            padding: '1px 6px',
                                                            color: '#6b7280',
                                                            border: '1px solid #e5e7eb',
                                                        }}
                                                    >
                                                        {task.resumeTitle}
                                                    </Tag>
                                                </div>
                                                <Space size={4} wrap>
                                                    <Tag
                                                        color={TASK_STATUS_COLORS[task.status]}
                                                        icon={getStatusIcon(task.status)}
                                                        style={{ fontSize: 11, padding: '2px 8px' }}
                                                    >
                                                        {TASK_STATUS_LABELS[task.status]}
                                                    </Tag>
                                                    {task.result && (
                                                        <Tag
                                                            color={TASK_RESULT_COLORS[task.result]}
                                                            icon={getResultIcon(task.result)}
                                                            style={{ fontSize: 11, padding: '2px 8px' }}
                                                        >
                                                            {TASK_RESULT_LABELS[task.result]}
                                                        </Tag>
                                                    )}
                                                </Space>
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
                                                        style={{
                                                            color: deadlineStatus.color,
                                                            fontSize: 12,
                                                        }}
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

                    {/* Правая колонка: детали задания */}
                    <Col xs={24} lg={16}>
                        {selectedTask ? (
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
                                        <span>Тестовое задание</span>
                                        <Tag
                                            color={TASK_SOURCE_COLORS[selectedTask.source]}
                                            icon={getSourceIcon(selectedTask.source)}
                                        >
                                            {TASK_SOURCE_LABELS[selectedTask.source]}
                                        </Tag>
                                        <Tag
                                            color={TASK_STATUS_COLORS[selectedTask.status]}
                                            icon={getStatusIcon(selectedTask.status)}
                                        >
                                            {TASK_STATUS_LABELS[selectedTask.status]}
                                        </Tag>
                                        {selectedTask.result && (
                                            <Tag
                                                color={TASK_RESULT_COLORS[selectedTask.result]}
                                                icon={getResultIcon(selectedTask.result)}
                                            >
                                                {TASK_RESULT_LABELS[selectedTask.result]}
                                            </Tag>
                                        )}
                                    </div>
                                }
                            >
                                {/* Шапка с основной информацией */}
                                <div
                                    style={{
                                        marginBottom: 24,
                                        padding: 16,
                                        background: '#f5f5f5',
                                        borderRadius: 8,
                                        borderLeft: `4px solid ${TASK_STATUS_COLORS[selectedTask.status]}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            flexWrap: 'wrap',
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 20,
                                                    display: 'block',
                                                    marginBottom: 8,
                                                    color: '#1B1C21',
                                                }}
                                            >
                                                {selectedTask.title}
                                            </Text
                                            >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {getSourceIcon(selectedTask.source)}
                                                <Text style={{ fontSize: 14 }}>
                                                    {selectedTask.source === 'ai' ? (
                                                        <>
                                                            Сгенерировано <Text strong>ИИ</Text>
                                                        </>
                                                    ) : (
                                                        <>
                                                            Работодатель: <Text strong>{selectedTask.employer}</Text>
                                                        </>
                                                    )}
                                                </Text>
                                            </div>
                                            {selectedTask.vacancyTitle && (
                                                <div style={{ marginTop: 4 }}>
                                                    <BankOutlined
                                                        style={{ marginRight: 6, color: '#402FFF' }}
                                                    />
                                                    <Text style={{ fontSize: 13 }}>
                                                        Вакансия: <Text strong>{selectedTask.vacancyTitle}</Text>
                                                    </Text>
                                                </div>
                                            )}
                                            <div style={{ marginTop: 8 }}>
                                                <FileTextOutlined
                                                    style={{ marginRight: 6, color: '#402FFF' }}
                                                />
                                                <Text style={{ fontSize: 13 }}>
                                                    Резюме:{' '}
                                                    <Text strong>{selectedTask.resumeTitle}</Text>
                                                </Text>
                                            </div>
                                            {selectedTask.direction && (
                                                <div style={{ marginTop: 8 }}>
                                                    <Space size={4}>
                                                        <Tag color={DIRECTION_COLORS[selectedTask.direction]}>
                                                            {DIRECTION_LABELS[selectedTask.direction]}
                                                        </Tag>
                                                        {selectedTask.grade && (
                                                            <Tag color={GRADE_COLORS[selectedTask.grade]}>
                                                                {GRADE_LABELS[selectedTask.grade]}
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </div>
                                            )}
                                        </div>
                                        {(() => {
                                            const deadlineStatus = getDeadlineStatus(
                                                selectedTask.deadline,
                                                selectedTask.status
                                            );
                                            if (!deadlineStatus.label) return null;
                                            return (
                                                <div
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#fff',
                                                        borderRadius: 8,
                                                        border: `1px solid ${deadlineStatus.color}`,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <ClockCircleOutlined
                                                        style={{
                                                            color: deadlineStatus.color,
                                                            fontSize: 18,
                                                            marginBottom: 4,
                                                            display: 'block',
                                                        }}
                                                    />
                                                    <Text
                                                        strong
                                                        style={{
                                                            color: deadlineStatus.color,
                                                            fontSize: 13,
                                                            display: 'block',
                                                        }}
                                                    >
                                                        {deadlineStatus.label}
                                                    </Text>
                                                    {selectedTask.deadline && (
                                                        <Text
                                                            type="secondary"
                                                            style={{ fontSize: 11, display: 'block' }}
                                                        >
                                                            до {dayjs(selectedTask.deadline).format('D MMM YYYY')}
                                                        </Text>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Описание задания */}
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}>
                                        <FileTextOutlined style={{ marginRight: 8 }} />
                                        Описание задания
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
                                            {selectedTask.description}
                                        </Paragraph>
                                    </div>
                                </div>

                                <Divider />

                                {/* Решение кандидата (если загружено) */}
                                {(selectedTask.solutionUrl || selectedTask.solutionFileName) && (
                                    <>
                                        <div style={{ marginBottom: 24 }}>
                                            <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}>
                                                <UploadOutlined style={{ marginRight: 8 }} />
                                                Ваше решение
                                            </Title>
                                            <div
                                                style={{
                                                    padding: 16,
                                                    background: '#f6ffed',
                                                    borderRadius: 8,
                                                    border: '1px solid #b7eb8f',
                                                }}
                                            >
                                                {selectedTask.solutionUrl && (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            marginBottom: selectedTask.solutionFileName ? 8 : 0,
                                                        }}
                                                    >
                                                        <LinkOutlined style={{ color: '#402FFF' }} />
                                                        <a
                                                            href={selectedTask.solutionUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: '#402FFF', wordBreak: 'break-all' }}
                                                        >
                                                            {selectedTask.solutionUrl}
                                                        </a>
                                                    </div>
                                                )}
                                                {selectedTask.solutionFileName && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <DownloadOutlined style={{ color: '#402FFF' }} />
                                                        <Text>{selectedTask.solutionFileName}</Text>
                                                    </div>
                                                )}
                                                {selectedTask.submittedAt && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            <CalendarOutlined style={{ marginRight: 4 }} />
                                                            Отправлено:{' '}
                                                            {dayjs(selectedTask.submittedAt).format('D MMMM YYYY')}
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Divider />
                                    </>
                                )}

                                {/* История статусов */}
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}>
                                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                                        История
                                    </Title>
                                    <Timeline
                                        items={[
                                            {
                                                color: '#402FFF',
                                                children: (
                                                    <div>
                                                        <Text strong>
                                                            {selectedTask.source === 'ai'
                                                                ? 'Задание сгенерировано ИИ'
                                                                : 'Задание получено от работодателя'}
                                                        </Text>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {dayjs(selectedTask.receivedAt).format('D MMMM YYYY')}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            selectedTask.acceptedAt && {
                                                color: '#fa8c16',
                                                children: (
                                                    <div>
                                                        <Text strong>Принято в работу</Text>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {dayjs(selectedTask.acceptedAt).format('D MMMM YYYY')}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            selectedTask.submittedAt && {
                                                color: '#722ed1',
                                                children: (
                                                    <div>
                                                        <Text strong>Решение загружено и отправлено на оценку</Text>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {dayjs(selectedTask.submittedAt).format('D MMMM YYYY')}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            selectedTask.evaluatedAt && {
                                                color:
                                                    selectedTask.result === 'accepted'
                                                        ? '#52c41a'
                                                        : '#f5222d',
                                                children: (
                                                    <div>
                                                        <Text strong>
                                                            {selectedTask.result === 'accepted'
                                                                ? 'Задание принято'
                                                                : 'Задание отклонено'}
                                                        </Text>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {dayjs(selectedTask.evaluatedAt).format('D MMMM YYYY')}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                        ].filter(Boolean) as any[]}
                                    />
                                </div>

                                {/* Результат (если оценено) */}
                                {selectedTask.status === 'evaluated' && selectedTask.result && (
                                    <>
                                        <Divider />
                                        <div style={{ marginBottom: 24 }}>
                                            <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}>
                                                <CheckCircleOutlined style={{ marginRight: 8 }} />
                                                Обратная связь
                                            </Title>
                                            <Alert
                                                message={
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                        }}
                                                    >
                                                        {getResultIcon(selectedTask.result)}
                                                        <Text strong style={{ fontSize: 16 }}>
                                                            {TASK_RESULT_LABELS[selectedTask.result]}
                                                        </Text>
                                                    </div>
                                                }
                                                description={
                                                    selectedTask.comment || 'Комментарий не предоставлен'
                                                }
                                                type={
                                                    selectedTask.result === 'accepted' ? 'success' : 'error'
                                                }
                                                showIcon={false}
                                                style={{
                                                    border: `2px solid ${TASK_RESULT_COLORS[selectedTask.result]}`,
                                                    borderRadius: 8,
                                                    padding: '16px',
                                                }}
                                            />
                                        </div>

                                        {/* Переключатель видимости */}
                                        <Divider />
                                        <div style={{ marginBottom: 24 }}>
                                            <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}>
                                                <GlobalOutlined style={{ marginRight: 8 }} />
                                                Видимость решения
                                            </Title>
                                            <Card
                                                size="small"
                                                style={{
                                                    background: selectedTask.isPublic ? '#f6ffed' : '#fafafa',
                                                    border: `1px solid ${selectedTask.isPublic ? '#b7eb8f' : '#f0f0f0'
                                                        }`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: 12,
                                                    }}
                                                >
                                                    <div style={{ flex: 1, minWidth: 200 }}>
                                                        <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                                            {selectedTask.isPublic
                                                                ? 'Решение доступно другим работодателям'
                                                                : 'Решение скрыто от других работодателей'}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                                            {selectedTask.isPublic
                                                                ? 'Работодатели смогут увидеть ваше решение и использовать его как пример при оценке других кандидатов.'
                                                                : 'Включите, чтобы ваше решение стало публичным примером для других кандидатов.'}
                                                        </Text>
                                                    </div>
                                                    <Switch
                                                        checked={selectedTask.isPublic}
                                                        onChange={() => handleTogglePublic(selectedTask)}
                                                        checkedChildren={<GlobalOutlined />}
                                                        unCheckedChildren={<EyeInvisibleOutlined />}
                                                    />
                                                </div>
                                            </Card>
                                        </div>
                                    </>
                                )}

                                {/* Действия */}
                                <Divider />
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {selectedTask.status === 'pending' && (
                                        <Button
                                            type="primary"
                                            icon={<PlayCircleOutlined />}
                                            onClick={() => handleAcceptTask(selectedTask)}
                                            style={{ background: '#402FFF', borderColor: '#402FFF' }}
                                        >
                                            Принять задание
                                        </Button>
                                    )}
                                    {selectedTask.status === 'in_progress' && (
                                        <Button
                                            type="primary"
                                            icon={<UploadOutlined />}
                                            onClick={() => openUploadModal(selectedTask)}
                                            style={{ background: '#402FFF', borderColor: '#402FFF' }}
                                        >
                                            Загрузить решение
                                        </Button>
                                    )}
                                    {selectedTask.status === 'submitted' && (
                                        <Alert
                                            message="Решение на оценивании"
                                            description="Работодатель или ИИ изучает ваше решение. Вы получите уведомление, когда появится обратная связь."
                                            type="info"
                                            showIcon
                                            icon={<EyeOutlined />}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                    {selectedTask.status === 'evaluated' &&
                                        selectedTask.result === 'accepted' && (
                                            <Alert
                                                message="Отличная работа!"
                                                description="Задание принято. Результат учтён в вашем профиле."
                                                type="success"
                                                showIcon
                                                style={{ flex: 1 }}
                                            />
                                        )}
                                    {selectedTask.status === 'evaluated' &&
                                        selectedTask.result === 'rejected' && (
                                            <Alert
                                                message="Задание отклонено"
                                                description="Проанализируйте обратную связь и учтите замечания в будущих заданиях."
                                                type="error"
                                                showIcon
                                                style={{ flex: 1 }}
                                            />
                                        )}
                                </div>
                            </Card>
                        ) : (
                            <Card>
                                <Empty description="Выберите задание из списка слева" />
                            </Card>
                        )}
                    </Col>
                </Row>
            )}

            {/* Модалка загрузки решения */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UploadOutlined style={{ color: '#402FFF' }} />
                        <span>Загрузить решение</span>
                    </div>
                }
                open={isUploadModalOpen}
                onOk={handleUploadSolution}
                onCancel={() => {
                    setIsUploadModalOpen(false);
                    setSolutionUrl('');
                    setSolutionFileName('');
                }}
                okText="Отправить на оценку"
                cancelText="Отмена"
                okButtonProps={{
                    style: { background: '#402FFF', borderColor: '#402FFF' },
                }}
            >
                <div style={{ marginTop: 16 }}>
                    <Alert
                        message="Укажите ссылку на решение или загрузите файл"
                        description="Можно указать и ссылку (например, на GitHub), и прикрепить архив с кодом."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>
                                <LinkOutlined style={{ marginRight: 6 }} />
                                Ссылка на решение
                            </Text>
                        </div>
                        <Input
                            placeholder="https://github.com/username/project"
                            value={solutionUrl}
                            onChange={(e) => setSolutionUrl(e.target.value)}
                            prefix={<LinkOutlined style={{ color: '#C8C9CA' }} />}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>
                                <DownloadOutlined style={{ marginRight: 6 }} />
                                Или загрузите файл
                            </Text>
                        </div>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            onChange={(info) => {
                                if (info.file.status !== 'removed' && info.file) {
                                    setSolutionFileName(info.file.name);
                                } else {
                                    setSolutionFileName('');
                                }
                            }}
                            onRemove={() => {
                                setSolutionFileName('');
                                return true;
                            }}
                        >
                            <Button icon={<UploadOutlined />} block>
                                {solutionFileName || 'Выбрать файл'}
                            </Button>
                        </Upload>
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                            Поддерживаются архивы (zip, rar), PDF, документы
                        </Text>
                    </div>
                </div>
            </Modal>

            {/* Модалка запроса задания у ИИ */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RobotOutlined style={{ color: '#722ed1' }} />
                        <span>Запросить тестовое задание у ИИ</span>
                    </div>
                }
                open={isAiRequestModalOpen}
                onOk={handleRequestAiTask}
                onCancel={() => {
                    setIsAiRequestModalOpen(false);
                    setAiRequestResumeId(null);
                    setAiRequestDescription('');
                }}
                okText="Сгенерировать"
                cancelText="Отмена"
                okButtonProps={{
                    style: { background: '#722ed1', borderColor: '#722ed1' },
                }}
            >
                <div style={{ marginTop: 16 }}>
                    <Alert
                        message="ИИ сгенерирует тестовое задание на основе вашего резюме"
                        description="Задание будет подготовлено с учётом вашего уровня, направления и указанных навыков. Обычно это занимает несколько минут."
                        type="info"
                        showIcon
                        icon={<RobotOutlined />}
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Выберите резюме *</Text>
                        </div>
                        <Select
                            placeholder="Выберите резюме"
                            style={{ width: '100%' }}
                            value={aiRequestResumeId}
                            onChange={setAiRequestResumeId}
                        >
                            {MOCK_RESUMES.map((resume) => (
                                <Select.Option key={resume.id} value={resume.id}>
                                    <Space>
                                        <Text strong>{resume.title}</Text>
                                        <Tag color={DIRECTION_COLORS[resume.direction as keyof typeof DIRECTION_COLORS]}>
                                            {resume.direction}
                                        </Tag>
                                        <Tag color={GRADE_COLORS[resume.grade]}>
                                            {GRADE_LABELS[resume.grade]}
                                        </Tag>
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Дополнительные пожелания (необязательно)</Text>
                        </div>
                        <Input.TextArea
                            rows={4}
                            placeholder="Например: сфокусируйся на работе с базами данных и микросервисной архитектуре..."
                            value={aiRequestDescription}
                            onChange={(e) => setAiRequestDescription(e.target.value)}
                            maxLength={500}
                            showCount
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CandidateTasks;