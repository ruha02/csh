import {
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    FilterOutlined,
    GlobalOutlined,
    InboxOutlined,
    MailOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    ReloadOutlined,
    SaveOutlined,
    SearchOutlined,
    SendOutlined,
    StarOutlined,
    StopOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Tag,
    Tooltip,
    Typography,
    message
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    MOCK_EMPLOYER_RESPONSES,
    MOCK_EMPLOYER_VACANCIES,
    MOCK_TOPIC_TESTS,
    ROADMAPS,
    formatSalary,
    getConfidenceColor,
    type Direction,
    type EmployerResponse,
    type EmployerResponseStatus,
    type EmployerVacancy,
    type EmployerVacancyStatus,
    type Grade,
    type RoadmapNode,
    type VacancyHardSkill,
} from '../../mocks';

dayjs.locale('ru');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ============================================================================
// 🏷️ Константы статусов вакансий
// ============================================================================
const VACANCY_STATUS_CONFIG: Record<
    EmployerVacancyStatus,
    { label: string; color: string; icon: React.ReactNode }
> = {
    draft: { label: 'Черновик', color: '#8c8c8c', icon: <EditOutlined /> },
    published: { label: 'Опубликована', color: '#52c41a', icon: <PlayCircleOutlined /> },
    archived: { label: 'В архиве', color: '#faad14', icon: <PauseCircleOutlined /> },
    closed: { label: 'Закрыта', color: '#f5222d', icon: <StopOutlined /> },
};

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
const getRequiredPercent = (hardSkills: VacancyHardSkill[]): number => {
    if (hardSkills.length === 0) return 0;
    const sum = hardSkills.reduce((acc, hs) => acc + hs.requiredPercent, 0);
    return Math.round(sum / hardSkills.length);
};

const getTopicName = (topicKey: string): string => {
    const test = MOCK_TOPIC_TESTS.find((t) => t.topicKey === topicKey);
    return test ? test.testName : topicKey;
};

const flattenRoadmap = (nodes: RoadmapNode[]): RoadmapNode[] => {
    const result: RoadmapNode[] = [];
    const traverse = (nodeList: RoadmapNode[]) => {
        nodeList.forEach((node) => {
            if (!node.children || node.children.length === 0) {
                result.push(node);
            } else {
                traverse(node.children);
            }
        });
    };
    traverse(nodes);
    return result;
};

const getDeadlineStatus = (deadline: string | undefined): { label: string; color: string } => {
    if (!deadline) return { label: '', color: '' };
    const days = Math.max(0, dayjs(deadline).diff(dayjs(), 'day'));
    if (days === 0) return { label: 'Сегодня!', color: '#f5222d' };
    if (days <= 3) return { label: `${days} дн.`, color: '#fa8c16' };
    if (days <= 7) return { label: `${days} дн.`, color: '#faad14' };
    return { label: `${days} дн.`, color: '#52c41a' };
};

// ============================================================================
// 🎨 Форма создания/редактирования вакансии
// ============================================================================
interface VacancyFormProps {
    vacancy: EmployerVacancy | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const VacancyForm: React.FC<VacancyFormProps> = ({ vacancy, onSubmit, onCancel }) => {
    const [form] = Form.useForm();
    const [hardSkills, setHardSkills] = useState<VacancyHardSkill[]>(
        vacancy?.hardSkills || [{ topicKey: '', requiredPercent: 70 }]
    );

    React.useEffect(() => {
        if (vacancy) {
            form.setFieldsValue({
                title: vacancy.title,
                direction: vacancy.direction,
                grade: vacancy.grade,
                description: vacancy.description,
                salaryFrom: vacancy.salaryFrom,
                salaryTo: vacancy.salaryTo,
                location: vacancy.location,
                isRemote: vacancy.isRemote,
                softSkills: vacancy.softSkills.join(', '),
                deadline: vacancy.deadline ? dayjs(vacancy.deadline) : undefined,
                status: vacancy.status,
            });
            setHardSkills(vacancy.hardSkills);
        } else {
            form.resetFields();
            setHardSkills([{ topicKey: '', requiredPercent: 70 }]);
        }
    }, [vacancy, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const validHardSkills = hardSkills.filter((hs) => hs.topicKey);
            if (validHardSkills.length === 0) {
                message.error('Добавьте хотя бы один hard skill');
                return;
            }
            onSubmit({
                ...values,
                hardSkills: validHardSkills,
                softSkills: values.softSkills
                    ? values.softSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : [],
                deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
            });
        } catch {
            message.error('Проверьте заполнение полей');
        }
    };

    const addHardSkill = () => {
        setHardSkills([...hardSkills, { topicKey: '', requiredPercent: 70 }]);
    };

    const removeHardSkill = (index: number) => {
        setHardSkills(hardSkills.filter((_, i) => i !== index));
    };

    const updateHardSkill = (index: number, field: keyof VacancyHardSkill, value: any) => {
        const updated = [...hardSkills];
        updated[index] = { ...updated[index], [field]: value };
        setHardSkills(updated);
    };

    // Собираем все доступные темы из дорожных карт
    const allTopics = Object.values(ROADMAPS).reduce<RoadmapNode[]>((acc, roadmap) => {
        return [...acc, ...flattenRoadmap(roadmap)];
    }, []);

    const usedTopicKeys = hardSkills.map((hs) => hs.topicKey).filter(Boolean);

    return (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Title level={5} style={{ marginBottom: 12 }}>
                <BankOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Основная информация
            </Title>

            <Form.Item
                name="title"
                label="Название вакансии"
                rules={[{ required: true, message: 'Введите название' }]}
            >
                <Input placeholder="Например: Senior Frontend Developer" />
            </Form.Item>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="direction"
                        label="Направление"
                        rules={[{ required: true, message: 'Выберите направление' }]}
                    >
                        <Select placeholder="Выберите направление">
                            {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={DIRECTION_COLORS[key as Direction]}>{label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="grade"
                        label="Грейд"
                        rules={[{ required: true, message: 'Выберите грейд' }]}
                    >
                        <Select placeholder="Выберите грейд">
                            {Object.entries(GRADE_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={GRADE_COLORS[key as Grade]}>{label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="description"
                label="Описание вакансии"
                rules={[{ required: true, message: 'Введите описание' }]}
            >
                <TextArea
                    rows={6}
                    placeholder="Опишите задачи, требования, условия работы..."
                    maxLength={3000}
                    showCount
                />
            </Form.Item>

            <Divider />

            <Title level={5} style={{ marginBottom: 12 }}>
                <StarOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Зарплата и локация
            </Title>

            <Row gutter={16}>
                <Col xs={24} sm={8}>
                    <Form.Item
                        name="salaryFrom"
                        label="Зарплата от (₽)"
                        rules={[{ required: true, message: 'Укажите минимальную зарплату' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={10000}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            parser={(value) => value?.replace(/\s/g, '') as unknown as 0}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="salaryTo" label="Зарплата до (₽)">
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={10000}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            parser={(value) => value?.replace(/\s/g, '') as unknown as 0}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="location" label="Город">
                        <Input placeholder="Москва" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="isRemote" label="Возможна удалённая работа" valuePropName="checked">
                <Switch />
            </Form.Item>

            <Divider />

            <Title level={5} style={{ marginBottom: 12 }}>
                <StarOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Hard Skills (требования)
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                Укажите требуемые темы из дорожной карты и минимальный процент уверенности
            </Text>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {hardSkills.map((hs, index) => (
                    <Card
                        key={index}
                        size="small"
                        style={{ background: '#fafafa' }}
                        bodyStyle={{ padding: 12 }}
                    >
                        <Row gutter={8} align="middle">
                            <Col flex="auto">
                                <Select
                                    placeholder="Выберите тему"
                                    style={{ width: '100%' }}
                                    value={hs.topicKey || undefined}
                                    onChange={(value) => updateHardSkill(index, 'topicKey', value)}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {allTopics
                                        .filter((t) => !usedTopicKeys.includes(t.key) || t.key === hs.topicKey)
                                        .map((topic) => (
                                            <Select.Option key={topic.key} value={topic.key}>
                                                {getTopicName(topic.key)}
                                            </Select.Option>
                                        ))}
                                </Select>
                            </Col>
                            <Col flex="120px">
                                <InputNumber
                                    min={0}
                                    max={100}
                                    value={hs.requiredPercent}
                                    onChange={(value) => updateHardSkill(index, 'requiredPercent', value || 0)}
                                    addonAfter="%"
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeHardSkill(index)}
                                    disabled={hardSkills.length === 1}
                                />
                            </Col>
                        </Row>
                    </Card>
                ))}
                <Button type="dashed" onClick={addHardSkill} block icon={<PlusOutlined />}>
                    Добавить требование
                </Button>
            </Space>

            <Divider />

            <Title level={5} style={{ marginBottom: 12 }}>
                <TeamOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Soft Skills
            </Title>

            <Form.Item
                name="softSkills"
                extra="Перечислите через запятую"
            >
                <TextArea
                    rows={2}
                    placeholder="Коммуникабельность, Работа в команде, Аналитическое мышление"
                />
            </Form.Item>

            <Divider />

            <Title level={5} style={{ marginBottom: 12 }}>
                <CalendarOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Дедлайн и статус
            </Title>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item name="deadline" label="Дедлайн приёма откликов">
                        <DatePicker style={{ width: '100%' }} placeholder="Выберите дату" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="status" label="Статус вакансии">
                        <Select>
                            {Object.entries(VACANCY_STATUS_CONFIG).map(([key, cfg]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={cfg.color} icon={cfg.icon}>
                                        {cfg.label}
                                    </Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={onCancel}>Отмена</Button>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    {vacancy ? 'Сохранить' : 'Создать'}
                </Button>
            </div>
        </Form>
    );
};

// ============================================================================
// 🎨 Карточка отклика кандидата
// ============================================================================
interface ResponseCardProps {
    response: EmployerResponse;
    onView: () => void;
    onShortlist: () => void;
    onReject: () => void;
    onSendTask: () => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({
    response,
    onView,
    onShortlist,
    onReject,
    onSendTask,
}) => {
    const statusConfig = RESPONSE_STATUS_CONFIG[response.status];

    return (
        <Card
            size="small"
            style={{
                marginBottom: 12,
                borderLeft: `4px solid ${statusConfig.color}`,
            }}
        >
            {/* Шапка */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                    flexWrap: 'wrap',
                    gap: 8,
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <UserOutlined style={{ color: '#402FFF' }} />
                        <Text strong style={{ fontSize: 15 }}>{response.candidateName}</Text>
                        <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ margin: 0 }}>
                            {statusConfig.label}
                        </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                        <Text type="secondary">{response.resumeTitle}</Text>
                        <Tag color={DIRECTION_COLORS[response.direction]} style={{ fontSize: 10, padding: '0 6px' }}>
                            {DIRECTION_LABELS[response.direction]}
                        </Tag>
                        <Tag color={GRADE_COLORS[response.grade]} style={{ fontSize: 10, padding: '0 6px' }}>
                            {GRADE_LABELS[response.grade]}
                        </Tag>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: getConfidenceColor(response.matchPercent), lineHeight: 1 }}>
                        {response.matchPercent}%
                    </div>
                    <Text type="secondary" style={{ fontSize: 10 }}>соответствие</Text>
                </div>
            </div>

            {/* Сопроводительное письмо */}
            <div
                style={{
                    padding: 10,
                    background: '#fafafa',
                    borderRadius: 6,
                    marginBottom: 12,
                    fontSize: 13,
                    lineHeight: 1.6,
                }}
            >
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                    Сопроводительное письмо:
                </Text>
                <Paragraph style={{ margin: 0, fontSize: 13 }}>{response.coverLetter}</Paragraph>
            </div>

            {/* Hard skills match */}
            <div style={{ marginBottom: 12 }}>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    Соответствие hard skills:
                </Text>
                <Space direction="vertical" style={{ width: '100%' }} size={4}>
                    {response.hardSkillsMatch.map((hs) => {
                        const meets = hs.candidatePercent >= hs.requiredPercent;
                        return (
                            <div key={hs.topicKey} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <Text style={{ flex: '0 0 160px', fontSize: 12 }} ellipsis={{ tooltip: hs.topicName }}>
                                    {hs.topicName}
                                </Text>
                                <Progress
                                    percent={hs.candidatePercent}
                                    size="small"
                                    strokeColor={getConfidenceColor(hs.candidatePercent)}
                                    style={{ flex: 1, margin: 0 }}
                                    format={(p) => <span style={{ fontSize: 10 }}>{p}%</span>}
                                />
                                <Tag
                                    color={meets ? '#52c41a' : '#f5222d'}
                                    style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                                >
                                    /{hs.requiredPercent}%
                                </Tag>
                            </div>
                        );
                    })}
                </Space>
            </div>

            {/* Soft skills match */}
            {response.softSkillsMatch.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Совпадающие soft skills:
                    </Text>
                    <Space wrap size={4}>
                        {response.softSkillsMatch.map((skill) => (
                            <Tag key={skill} color="#722ed1" style={{ fontSize: 11, padding: '2px 8px' }}>
                                {skill}
                            </Tag>
                        ))}
                    </Space>
                </div>
            )}

            {/* Комментарий */}
            {response.comment && (
                <Alert
                    message="Ваш комментарий"
                    description={response.comment}
                    type="info"
                    showIcon
                    style={{ marginBottom: 12, borderRadius: 6 }}
                />
            )}

            {/* Контакты */}
            <div style={{ marginBottom: 12, fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <MailOutlined style={{ marginRight: 4, color: '#402FFF' }} />
                    <a href={`mailto:${response.candidateEmail}`}>{response.candidateEmail}</a>
                </div>
                {response.candidateTelegram && (
                    <div>
                        <SendOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                        <Text>{response.candidateTelegram}</Text>
                    </div>
                )}
            </div>

            {/* Действия */}
            <Divider style={{ margin: '8px 0' }} />
            <Space wrap size={8}>
                {response.status === 'new' && (
                    <Button size="small" icon={<EyeOutlined />} onClick={onView}>
                        Отметить просмотренным
                    </Button>
                )}
                {(response.status === 'new' || response.status === 'viewed') && (
                    <>
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={onShortlist}
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                            В шорт-лист
                        </Button>
                        <Button
                            size="small"
                            icon={<SendOutlined />}
                            onClick={onSendTask}
                            style={{ borderColor: '#fa8c16', color: '#fa8c16' }}
                        >
                            Отправить задание
                        </Button>
                        <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={onReject}
                        >
                            Отклонить
                        </Button>
                    </>
                )}
                {response.status === 'shortlisted' && (
                    <Alert
                        message="Кандидат в шорт-листе"
                        type="success"
                        showIcon
                        style={{ padding: '4px 12px', borderRadius: 6 }}
                    />
                )}
                {response.status === 'task_sent' && (
                    <Alert
                        message="Отправлено тестовое задание"
                        type="info"
                        showIcon
                        style={{ padding: '4px 12px', borderRadius: 6 }}
                    />
                )}
                {response.status === 'rejected' && (
                    <Alert
                        message="Кандидат отклонён"
                        type="error"
                        showIcon
                        style={{ padding: '4px 12px', borderRadius: 6 }}
                    />
                )}
            </Space>
        </Card>
    );
};

// ============================================================================
// 🎨 Основной компонент страницы
// ============================================================================
const EmployerVacancies: React.FC = () => {
    const [vacancies, setVacancies] = useState<EmployerVacancy[]>(MOCK_EMPLOYER_VACANCIES);
    const [responses, setResponses] = useState<EmployerResponse[]>(MOCK_EMPLOYER_RESPONSES);
    const [selectedVacancy, setSelectedVacancy] = useState<EmployerVacancy | null>(
        MOCK_EMPLOYER_VACANCIES.length > 0 ? MOCK_EMPLOYER_VACANCIES[0] : null
    );

    // Фильтры
    const [filterStatus, setFilterStatus] = useState<EmployerVacancyStatus | 'all'>('all');
    const [filterDirection, setFilterDirection] = useState<Direction | 'all'>('all');

    // Модалки
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState<EmployerVacancy | null>(null);
    const [rejectModalResponse, setRejectModalResponse] = useState<EmployerResponse | null>(null);
    const [rejectComment, setRejectComment] = useState('');

    // ========================================================================
    // 📊 Статистика
    // ========================================================================
    const stats = {
        total: vacancies.length,
        published: vacancies.filter((v) => v.status === 'published').length,
        draft: vacancies.filter((v) => v.status === 'draft').length,
        archived: vacancies.filter((v) => v.status === 'archived').length,
        closed: vacancies.filter((v) => v.status === 'closed').length,
        totalResponses: responses.length,
        newResponses: responses.filter((r) => r.status === 'new').length,
    };

    // ========================================================================
    // 🎯 Фильтрация вакансий
    // ========================================================================
    const filteredVacancies = vacancies.filter((v) => {
        if (filterStatus !== 'all' && v.status !== filterStatus) return false;
        if (filterDirection !== 'all' && v.direction !== filterDirection) return false;
        return true;
    });

    const vacancyResponses = selectedVacancy
        ? responses.filter((r) => r.vacancyId === selectedVacancy.id)
        : [];

    // ========================================================================
    // 🎯 Действия с вакансиями
    // ========================================================================
    const handleCreate = () => {
        setEditingVacancy(null);
        setIsFormOpen(true);
    };

    const handleEdit = (vacancy: EmployerVacancy) => {
        setEditingVacancy(vacancy);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (values: any) => {
        if (editingVacancy) {
            setVacancies(
                vacancies.map((v) =>
                    v.id === editingVacancy.id
                        ? {
                            ...v,
                            ...values,
                            currency: 'RUB',
                            updatedAt: dayjs().format('YYYY-MM-DD'),
                            publishedAt: values.status === 'published' && !v.publishedAt
                                ? dayjs().format('YYYY-MM-DD')
                                : v.publishedAt,
                        }
                        : v
                )
            );
            if (selectedVacancy?.id === editingVacancy.id) {
                setSelectedVacancy({
                    ...editingVacancy,
                    ...values,
                    updatedAt: dayjs().format('YYYY-MM-DD'),
                });
            }
            message.success('Вакансия обновлена');
        } else {
            const newVacancy: EmployerVacancy = {
                id: Date.now(),
                ...values,
                currency: 'RUB',
                createdAt: dayjs().format('YYYY-MM-DD'),
                updatedAt: dayjs().format('YYYY-MM-DD'),
                publishedAt: values.status === 'published' ? dayjs().format('YYYY-MM-DD') : undefined,
                responsesCount: 0,
                viewedCount: 0,
            };
            setVacancies([newVacancy, ...vacancies]);
            setSelectedVacancy(newVacancy);
            message.success('Вакансия создана');
        }
        setIsFormOpen(false);
        setEditingVacancy(null);
    };

    const handleDelete = (vacancy: EmployerVacancy) => {
        Modal.confirm({
            title: 'Удалить вакансию?',
            content: `Вы уверены, что хотите удалить вакансию "${vacancy.title}"?`,
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                setVacancies(vacancies.filter((v) => v.id !== vacancy.id));
                setResponses(responses.filter((r) => r.vacancyId !== vacancy.id));
                if (selectedVacancy?.id === vacancy.id) {
                    setSelectedVacancy(vacancies.find((v) => v.id !== vacancy.id) || null);
                }
                message.success('Вакансия удалена');
            },
        });
    };

    const handleDuplicate = (vacancy: EmployerVacancy) => {
        const newVacancy: EmployerVacancy = {
            ...vacancy,
            id: Date.now(),
            title: `${vacancy.title} (копия)`,
            status: 'draft',
            createdAt: dayjs().format('YYYY-MM-DD'),
            updatedAt: dayjs().format('YYYY-MM-DD'),
            publishedAt: undefined,
            responsesCount: 0,
            viewedCount: 0,
        };
        setVacancies([newVacancy, ...vacancies]);
        setSelectedVacancy(newVacancy);
        message.success('Вакансия скопирована как черновик');
    };

    // ========================================================================
    // 🎯 Действия с откликами
    // ========================================================================
    const handleViewResponse = (responseId: number) => {
        setResponses(
            responses.map((r) =>
                r.id === responseId
                    ? { ...r, status: 'viewed', viewedAt: dayjs().format('YYYY-MM-DD') }
                    : r
            )
        );
        // Обновляем viewedCount вакансии
        if (selectedVacancy) {
            setVacancies(
                vacancies.map((v) =>
                    v.id === selectedVacancy.id ? { ...v, viewedCount: v.viewedCount + 1 } : v
                )
            );
        }
        message.success('Отклик отмечен как просмотренный');
    };

    const handleShortlist = (responseId: number) => {
        setResponses(
            responses.map((r) => (r.id === responseId ? { ...r, status: 'shortlisted' } : r))
        );
        message.success('Кандидат добавлен в шорт-лист');
    };

    const handleSendTask = (responseId: number) => {
        setResponses(
            responses.map((r) =>
                r.id === responseId
                    ? { ...r, status: 'task_sent', taskId: Date.now() }
                    : r
            )
        );
        message.success('Тестовое задание отправлено кандидату');
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
                    ? { ...r, status: 'rejected', comment: rejectComment.trim() || r.comment }
                    : r
            )
        );
        setRejectModalResponse(null);
        setRejectComment('');
        message.info('Кандидат отклонён');
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <BankOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                        <Title level={2} style={{ margin: 0 }}>Вакансии компании</Title>
                    </div>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Управление вакансиями и просмотр откликов кандидатов
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    size="large"
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    Создать вакансию
                </Button>
            </div>

            {/* Статистика */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Всего вакансий"
                            value={stats.total}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#402FFF' }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Опубликовано"
                            value={stats.published}
                            prefix={<PlayCircleOutlined />}
                            valueStyle={{ color: '#52c41a', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Черновики"
                            value={stats.draft}
                            prefix={<EditOutlined />}
                            valueStyle={{ color: '#8c8c8c', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="В архиве"
                            value={stats.archived}
                            prefix={<PauseCircleOutlined />}
                            valueStyle={{ color: '#faad14', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Всего откликов"
                            value={stats.totalResponses}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: '#722ed1', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Новых откликов"
                            value={stats.newResponses}
                            prefix={<Badge status="processing" />}
                            valueStyle={{ color: '#402FFF', fontSize: 20 }}
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
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Статус</Text>
                        </div>
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все статусы</Select.Option>
                            {Object.entries(VACANCY_STATUS_CONFIG).map(([key, cfg]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={cfg.color} icon={cfg.icon}>
                                        {cfg.label}
                                    </Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
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
                                    <Tag color={DIRECTION_COLORS[key as Direction]}>{label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ marginBottom: 8, visibility: 'hidden' }}>
                            <Text strong>.</Text>
                        </div>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setFilterStatus('all');
                                setFilterDirection('all');
                            }}
                        >
                            Сбросить
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Основной контент */}
            {filteredVacancies.length === 0 ? (
                <Card>
                    <Empty description="Нет вакансий, соответствующих выбранным фильтрам" />
                </Card>
            ) : (
                <Row gutter={24}>
                    {/* Левая колонка: список вакансий */}
                    <Col xs={24} lg={8}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BankOutlined style={{ color: '#402FFF' }} />
                                    <span>Список вакансий</span>
                                    <Tag color="#402FFF" style={{ marginLeft: 'auto' }}>
                                        {filteredVacancies.length}
                                    </Tag>
                                </div>
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {filteredVacancies.map((vacancy) => {
                                    const statusConfig = VACANCY_STATUS_CONFIG[vacancy.status];
                                    const deadlineStatus = getDeadlineStatus(vacancy.deadline);
                                    const vacancyResponsesCount = responses.filter(
                                        (r) => r.vacancyId === vacancy.id
                                    ).length;
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
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ margin: 0, fontSize: 11 }}>
                                                        {statusConfig.label}
                                                    </Tag>
                                                    {vacancyResponsesCount > 0 && (
                                                        <Badge
                                                            count={vacancyResponsesCount}
                                                            style={{ backgroundColor: '#722ed1' }}
                                                        />
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
                                                    {vacancy.title}
                                                </Text>
                                                <Space size={4} wrap style={{ marginBottom: 8 }}>
                                                    <Tag color={DIRECTION_COLORS[vacancy.direction]} style={{ fontSize: 11, padding: '2px 8px' }}>
                                                        {DIRECTION_LABELS[vacancy.direction]}
                                                    </Tag>
                                                    <Tag color={GRADE_COLORS[vacancy.grade]} style={{ fontSize: 11, padding: '2px 8px' }}>
                                                        {GRADE_LABELS[vacancy.grade]}
                                                    </Tag>
                                                    {vacancy.isRemote && (
                                                        <Tag color="#52c41a" icon={<GlobalOutlined />} style={{ fontSize: 11, padding: '2px 8px' }}>
                                                            Удалённо
                                                        </Tag>
                                                    )}
                                                </Space>
                                                <Text strong style={{ fontSize: 14, color: '#402FFF', display: 'block' }}>
                                                    {formatSalary(vacancy.salaryFrom, vacancy.currency)}
                                                    {vacancy.salaryTo && ` — ${formatSalary(vacancy.salaryTo, vacancy.currency)}`}
                                                </Text>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginTop: 8,
                                                    paddingTop: 8,
                                                    borderTop: '1px solid #f0f0f0',
                                                    fontSize: 12,
                                                }}
                                            >
                                                <Text type="secondary">
                                                    <EyeOutlined style={{ marginRight: 4 }} />
                                                    {vacancy.viewedCount} / {vacancy.responsesCount}
                                                </Text>
                                                {vacancy.status === 'published' && deadlineStatus.label && (
                                                    <Text style={{ color: deadlineStatus.color, fontWeight: 600 }}>
                                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                        {deadlineStatus.label}
                                                    </Text>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </Space>
                        </Card>
                    </Col>

                    {/* Правая колонка: детали вакансии и отклики */}
                    <Col xs={24} lg={16}>
                        {selectedVacancy ? (
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                        <span>{selectedVacancy.title}</span>
                                        <Tag color={VACANCY_STATUS_CONFIG[selectedVacancy.status].color} icon={VACANCY_STATUS_CONFIG[selectedVacancy.status].icon}>
                                            {VACANCY_STATUS_CONFIG[selectedVacancy.status].label}
                                        </Tag>
                                        <Tag color={DIRECTION_COLORS[selectedVacancy.direction]}>
                                            {DIRECTION_LABELS[selectedVacancy.direction]}
                                        </Tag>
                                        <Tag color={GRADE_COLORS[selectedVacancy.grade]}>
                                            {GRADE_LABELS[selectedVacancy.grade]}
                                        </Tag>
                                    </div>
                                }
                                extra={
                                    <Space>
                                        <Tooltip title="Редактировать">
                                            <Button icon={<EditOutlined />} onClick={() => handleEdit(selectedVacancy)} />
                                        </Tooltip>
                                        <Tooltip title="Дублировать">
                                            <Button icon={<CopyOutlined />} onClick={() => handleDuplicate(selectedVacancy)} />
                                        </Tooltip>
                                        <Tooltip title="Удалить">
                                            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(selectedVacancy)} />
                                        </Tooltip>
                                    </Space>
                                }
                            >
                                {/* Основная информация */}
                                <div
                                    style={{
                                        padding: 16,
                                        background: '#f5f5f5',
                                        borderRadius: 8,
                                        borderLeft: `4px solid ${DIRECTION_COLORS[selectedVacancy.direction]}`,
                                        marginBottom: 20,
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Зарплата</Text>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: '#402FFF' }}>
                                                {formatSalary(selectedVacancy.salaryFrom, selectedVacancy.currency)}
                                                {selectedVacancy.salaryTo && ` — ${formatSalary(selectedVacancy.salaryTo, selectedVacancy.currency)}`}
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Локация</Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                {selectedVacancy.isRemote && (
                                                    <Tag color="#52c41a" icon={<GlobalOutlined />} style={{ margin: 0 }}>
                                                        Удалённо
                                                    </Tag>
                                                )}
                                                {selectedVacancy.location && (
                                                    <Text>
                                                        <EnvironmentOutlined style={{ marginRight: 4, color: '#402FFF' }} />
                                                        {selectedVacancy.location}
                                                    </Text>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                {/* Описание */}
                                <div style={{ marginBottom: 20 }}>
                                    <Title level={5} style={{ marginBottom: 8, color: '#402FFF' }}>
                                        <SearchOutlined style={{ marginRight: 8 }} />
                                        Описание
                                    </Title>
                                    <Paragraph style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {selectedVacancy.description}
                                    </Paragraph>
                                </div>

                                <Divider />

                                {/* Hard Skills */}
                                <div style={{ marginBottom: 20 }}>
                                    <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                        <StarOutlined style={{ marginRight: 8 }} />
                                        Требования к hard skills
                                        <Tag style={{ marginLeft: 8 }}>
                                            Среднее: {getRequiredPercent(selectedVacancy.hardSkills)}%
                                        </Tag>
                                    </Title>
                                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                        {selectedVacancy.hardSkills.map((hs) => (
                                            <div
                                                key={hs.topicKey}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    padding: '8px 12px',
                                                    background: '#fafafa',
                                                    borderRadius: 6,
                                                }}
                                            >
                                                <Text style={{ flex: 1, fontSize: 13 }}>
                                                    {getTopicName(hs.topicKey)}
                                                </Text>
                                                <Tag color="#402FFF" style={{ margin: 0 }}>
                                                    {hs.requiredPercent}%
                                                </Tag>
                                            </div>
                                        ))}
                                    </Space>
                                </div>

                                {/* Soft Skills */}
                                {selectedVacancy.softSkills.length > 0 && (
                                    <>
                                        <Divider />
                                        <div style={{ marginBottom: 20 }}>
                                            <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                                <TeamOutlined style={{ marginRight: 8 }} />
                                                Требования к soft skills
                                            </Title>
                                            <Space wrap size={[8, 8]}>
                                                {selectedVacancy.softSkills.map((skill, idx) => (
                                                    <Tag key={idx} color="#722ed1" style={{ fontSize: 13, padding: '4px 12px' }}>
                                                        {skill}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </div>
                                    </>
                                )}

                                <Divider />

                                {/* Даты */}
                                <Descriptions column={{ xs: 1, sm: 2 }} size="small" style={{ marginBottom: 20 }}>
                                    <Descriptions.Item label="Создано">
                                        {dayjs(selectedVacancy.createdAt).format('D MMMM YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Обновлено">
                                        {dayjs(selectedVacancy.updatedAt).format('D MMMM YYYY')}
                                    </Descriptions.Item>
                                    {selectedVacancy.publishedAt && (
                                        <Descriptions.Item label="Опубликовано">
                                            {dayjs(selectedVacancy.publishedAt).format('D MMMM YYYY')}
                                        </Descriptions.Item>
                                    )}
                                    {selectedVacancy.deadline && (
                                        <Descriptions.Item label="Дедлайн">
                                            <Text strong style={{ color: getDeadlineStatus(selectedVacancy.deadline).color }}>
                                                {dayjs(selectedVacancy.deadline).format('D MMMM YYYY')}
                                            </Text>
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>

                                {/* Отклики */}
                                <Divider />
                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <InboxOutlined style={{ fontSize: 20, color: '#402FFF' }} />
                                        <Title level={4} style={{ margin: 0 }}>
                                            Отклики кандидатов
                                        </Title>
                                        <Tag color="#722ed1" style={{ marginLeft: 'auto' }}>
                                            {vacancyResponses.length}
                                        </Tag>
                                    </div>

                                    {vacancyResponses.length === 0 ? (
                                        <Empty
                                            description={
                                                <div>
                                                    <Text style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                                                        Пока нет откликов на эту вакансию
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {selectedVacancy.status === 'published'
                                                            ? 'Отклики появятся здесь, когда кандидаты откликнутся'
                                                            : 'Опубликуйте вакансию, чтобы начать принимать отклики'}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    ) : (
                                        <>
                                            {/* Сводка по статусам откликов */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: 8,
                                                    marginBottom: 16,
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                {Object.entries(RESPONSE_STATUS_CONFIG).map(([key, cfg]) => {
                                                    const count = vacancyResponses.filter((r) => r.status === key).length;
                                                    if (count === 0) return null;
                                                    return (
                                                        <Tag key={key} color={cfg.color} icon={cfg.icon}>
                                                            {cfg.label}: {count}
                                                        </Tag>
                                                    );
                                                })}
                                            </div>

                                            {/* Список откликов */}
                                            {vacancyResponses
                                                .sort((a, b) => {
                                                    // Новые — сверху
                                                    const order: Record<EmployerResponseStatus, number> = {
                                                        new: 0,
                                                        viewed: 1,
                                                        shortlisted: 2,
                                                        task_sent: 3,
                                                        rejected: 4,
                                                    };
                                                    return order[a.status] - order[b.status];
                                                })
                                                .map((response) => (
                                                    <ResponseCard
                                                        key={response.id}
                                                        response={response}
                                                        onView={() => handleViewResponse(response.id)}
                                                        onShortlist={() => handleShortlist(response.id)}
                                                        onReject={() => handleOpenRejectModal(response)}
                                                        onSendTask={() => handleSendTask(response.id)}
                                                    />
                                                ))}
                                        </>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <Card>
                                <Empty description="Выберите вакансию из списка слева или создайте новую" />
                            </Card>
                        )}
                    </Col>
                </Row>
            )}

            {/* Модалка создания/редактирования */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BankOutlined style={{ color: '#402FFF' }} />
                        <span>{editingVacancy ? 'Редактировать вакансию' : 'Создать вакансию'}</span>
                    </div>
                }
                open={isFormOpen}
                onCancel={() => {
                    setIsFormOpen(false);
                    setEditingVacancy(null);
                }}
                footer={null}
                width={800}
                style={{ top: 20 }}
            >
                <VacancyForm
                    vacancy={editingVacancy}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingVacancy(null);
                    }}
                />
            </Modal>

            {/* Модалка отклонения кандидата */}
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
                        <TextArea
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
        </div>
    );
};

export default EmployerVacancies;