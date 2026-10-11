import {
    BookOutlined,
    CheckCircleOutlined,
    CodeOutlined,
    DatabaseOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    StarOutlined,
    StopOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Empty,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import {
    DIRECTION_LABELS,
    MOCK_ADMIN_DIRECTIONS,
    MOCK_ADMIN_GRADES,
    MOCK_ADMIN_SOFT_SKILLS,
    MOCK_ADMIN_TOPICS,
    type AdminDirection,
    type AdminGrade,
    type AdminSoftSkill,
    type AdminTopic,
    type Direction
} from '../../mocks';

const { Title, Text } = Typography;
const { Search } = Input;

type TabKey = 'directions' | 'grades' | 'topics' | 'softSkills';

const AdminDictionaries: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('directions');

    // Состояния данных
    const [directions, setDirections] = useState<AdminDirection[]>(MOCK_ADMIN_DIRECTIONS);
    const [grades] = useState<AdminGrade[]>(MOCK_ADMIN_GRADES);
    const [topics, setTopics] = useState<AdminTopic[]>(MOCK_ADMIN_TOPICS);
    const [softSkills, setSoftSkills] = useState<AdminSoftSkill[]>(MOCK_ADMIN_SOFT_SKILLS);

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDirection, setFilterDirection] = useState<Direction | 'all'>('all');

    // Модалки
    const [directionModal, setDirectionModal] = useState<AdminDirection | null>(null);
    const [topicModal, setTopicModal] = useState<AdminTopic | null>(null);
    const [softSkillModal, setSoftSkillModal] = useState<AdminSoftSkill | null>(null);

    // ========================================================================
    // 🎯 Действия — Направления
    // ========================================================================
    const handleSaveDirection = (values: any) => {
        if (directionModal) {
            setDirections((prev) =>
                prev.map((d) => (d.key === directionModal.key ? { ...d, ...values } : d))
            );
            message.success('Направление обновлено');
        } else {
            const newDirection: AdminDirection = {
                key: values.key as Direction,
                ...values,
                topicsCount: 0,
            };
            setDirections([...directions, newDirection]);
            message.success('Направление добавлено');
        }
        setDirectionModal(null);
    };

    const handleToggleDirection = (key: Direction) => {
        setDirections((prev) =>
            prev.map((d) => (d.key === key ? { ...d, isActive: !d.isActive } : d))
        );
        message.success('Статус направления изменён');
    };

    // ========================================================================
    // 🎯 Действия — Темы
    // ========================================================================
    const handleSaveTopic = (values: any) => {
        if (topicModal) {
            setTopics((prev) =>
                prev.map((t) => (t.key === topicModal.key ? { ...t, ...values } : t))
            );
            message.success('Тема обновлена');
        } else {
            const newTopic: AdminTopic = {
                key: `topic-${Date.now()}`,
                ...values,
                testsCount: 0,
                avgScore: 0,
                isActive: true,
            };
            setTopics([...topics, newTopic]);
            message.success('Тема добавлена');
        }
        setTopicModal(null);
    };

    const handleToggleTopic = (key: string) => {
        setTopics((prev) =>
            prev.map((t) => (t.key === key ? { ...t, isActive: !t.isActive } : t))
        );
        message.success('Статус темы изменён');
    };

    const handleDeleteTopic = (key: string) => {
        Modal.confirm({
            title: 'Удалить тему?',
            content: 'Все связанные тесты и результаты будут удалены.',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                setTopics((prev) => prev.filter((t) => t.key !== key));
                message.success('Тема удалена');
            },
        });
    };

    // ========================================================================
    // 🎯 Действия — Soft Skills
    // ========================================================================
    const handleSaveSoftSkill = (values: any) => {
        if (softSkillModal) {
            setSoftSkills((prev) =>
                prev.map((s) => (s.id === softSkillModal.id ? { ...s, ...values } : s))
            );
            message.success('Навык обновлён');
        } else {
            const newSkill: AdminSoftSkill = {
                id: Date.now(),
                ...values,
                usageCount: 0,
                isActive: true,
            };
            setSoftSkills([...softSkills, newSkill]);
            message.success('Навык добавлён');
        }
        setSoftSkillModal(null);
    };

    const handleToggleSoftSkill = (id: number) => {
        setSoftSkills((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
        );
        message.success('Статус навыка изменён');
    };

    const handleDeleteSoftSkill = (id: number) => {
        Modal.confirm({
            title: 'Удалить навык?',
            content: 'Навык будет удалён из справочника.',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                setSoftSkills((prev) => prev.filter((s) => s.id !== id));
                message.success('Навык удалён');
            },
        });
    };

    // ========================================================================
    // 🎨 Фильтрация тем
    // ========================================================================
    const filteredTopics = topics.filter((topic) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!topic.title.toLowerCase().includes(query)) return false;
        }
        if (filterDirection !== 'all' && topic.direction !== filterDirection) return false;
        return true;
    });

    // ========================================================================
    // 🎨 Таблицы
    // ========================================================================
    const directionsColumns: ColumnsType<AdminDirection> = [
        {
            title: 'Название',
            dataIndex: 'label',
            key: 'label',
            render: (text: string, record) => (
                <Tag color={record.color} style={{ fontSize: 13, padding: '4px 12px' }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Тем',
            dataIndex: 'topicsCount',
            key: 'topicsCount',
            width: 100,
            align: 'center',
        },
        {
            title: 'Статус',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center',
            render: (active: boolean) =>
                active ? (
                    <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                        Активно
                    </Tag>
                ) : (
                    <Tag color="#f5222d" icon={<StopOutlined />}>
                        Неактивно
                    </Tag>
                ),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setDirectionModal(record)}
                    />
                    <Switch
                        size="small"
                        checked={record.isActive}
                        onChange={() => handleToggleDirection(record.key)}
                    />
                </Space>
            ),
        },
    ];

    const gradesColumns: ColumnsType<AdminGrade> = [
        {
            title: 'Название',
            dataIndex: 'label',
            key: 'label',
            render: (text: string, record) => (
                <Tag color={record.color} style={{ fontSize: 13, padding: '4px 12px' }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Порог подтверждения (%)',
            dataIndex: 'threshold',
            key: 'threshold',
            width: 180,
            align: 'center',
            render: (threshold: number) => (
                <Text strong style={{ fontSize: 16, color: '#402FFF' }}>
                    {threshold}%
                </Text>
            ),
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
        },
    ];

    const topicsColumns: ColumnsType<AdminTopic> = [
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Направление',
            dataIndex: 'direction',
            key: 'direction',
            width: 140,
            render: (direction: Direction) => (
                <Tag color={directions.find((d) => d.key === direction)?.color || '#402FFF'}>
                    {DIRECTION_LABELS[direction]}
                </Tag>
            ),
        },
        {
            title: 'Тестов пройдено',
            dataIndex: 'testsCount',
            key: 'testsCount',
            width: 140,
            align: 'center',
        },
        {
            title: 'Средний балл',
            dataIndex: 'avgScore',
            key: 'avgScore',
            width: 120,
            align: 'center',
            render: (score: number) => (
                <Text strong style={{ color: score >= 70 ? '#52c41a' : score >= 50 ? '#faad14' : '#f5222d' }}>
                    {score}%
                </Text>
            ),
        },
        {
            title: 'Статус',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center',
            render: (active: boolean) =>
                active ? (
                    <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                        Активно
                    </Tag>
                ) : (
                    <Tag color="#f5222d" icon={<StopOutlined />}>
                        Неактивно
                    </Tag>
                ),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setTopicModal(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTopic(record.key)}
                    />
                    <Switch
                        size="small"
                        checked={record.isActive}
                        onChange={() => handleToggleTopic(record.key)}
                    />
                </Space>
            ),
        },
    ];

    const softSkillsColumns: ColumnsType<AdminSoftSkill> = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Категория',
            dataIndex: 'category',
            key: 'category',
            width: 160,
            render: (category: string) => <Tag color="#722ed1">{category}</Tag>,
        },
        {
            title: 'Использований',
            dataIndex: 'usageCount',
            key: 'usageCount',
            width: 140,
            align: 'center',
            sorter: (a, b) => a.usageCount - b.usageCount,
        },
        {
            title: 'Статус',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center',
            render: (active: boolean) =>
                active ? (
                    <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                        Активно
                    </Tag>
                ) : (
                    <Tag color="#f5222d" icon={<StopOutlined />}>
                        Неактивно
                    </Tag>
                ),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setSoftSkillModal(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteSoftSkill(record.id)}
                    />
                    <Switch
                        size="small"
                        checked={record.isActive}
                        onChange={() => handleToggleSoftSkill(record.id)}
                    />
                </Space>
            ),
        },
    ];

    // ========================================================================
    // 🎨 Рендер
    // ========================================================================
    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <DatabaseOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>Справочники</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Управление справочниками системы: направления, грейды, темы тестов, soft skills
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
                    type={activeTab === 'directions' ? 'primary' : 'text'}
                    onClick={() => setActiveTab('directions')}
                    icon={<CodeOutlined />}
                    style={
                        activeTab === 'directions'
                            ? { background: '#402FFF', borderColor: '#402FFF' }
                            : {}
                    }
                >
                    Направления
                </Button>
                <Button
                    type={activeTab === 'grades' ? 'primary' : 'text'}
                    onClick={() => setActiveTab('grades')}
                    icon={<StarOutlined />}
                    style={
                        activeTab === 'grades'
                            ? { background: '#402FFF', borderColor: '#402FFF' }
                            : {}
                    }
                >
                    Грейды
                </Button>
                <Button
                    type={activeTab === 'topics' ? 'primary' : 'text'}
                    onClick={() => setActiveTab('topics')}
                    icon={<BookOutlined />}
                    style={
                        activeTab === 'topics'
                            ? { background: '#402FFF', borderColor: '#402FFF' }
                            : {}
                    }
                >
                    Темы тестов
                </Button>
                <Button
                    type={activeTab === 'softSkills' ? 'primary' : 'text'}
                    onClick={() => setActiveTab('softSkills')}
                    icon={<StarOutlined />}
                    style={
                        activeTab === 'softSkills'
                            ? { background: '#402FFF', borderColor: '#402FFF' }
                            : {}
                    }
                >
                    Soft Skills
                </Button>
            </div>

            {/* ================================================================== */}
            {/* ВКЛАДКА: НАПРАВЛЕНИЯ                                                */}
            {/* ================================================================== */}
            {activeTab === 'directions' && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CodeOutlined style={{ color: '#402FFF' }} />
                            <span>Направления разработки</span>
                            <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                {directions.length}
                            </Tag>
                        </div>
                    }
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setDirectionModal({} as AdminDirection)}
                            style={{ background: '#402FFF', borderColor: '#402FFF' }}
                        >
                            Добавить направление
                        </Button>
                    }
                >
                    <Table
                        columns={directionsColumns}
                        dataSource={directions}
                        rowKey="key"
                        pagination={false}
                        size="middle"
                    />
                </Card>
            )}

            {/* ================================================================== */}
            {/* ВКЛАДКА: ГРЕЙДЫ                                                     */}
            {/* ================================================================== */}
            {activeTab === 'grades' && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <StarOutlined style={{ color: '#402FFF' }} />
                            <span>Грейды специалистов</span>
                            <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                {grades.length}
                            </Tag>
                        </div>
                    }
                >
                    <Table
                        columns={gradesColumns}
                        dataSource={grades}
                        rowKey="key"
                        pagination={false}
                        size="middle"
                    />
                </Card>
            )}

            {/* ================================================================== */}
            {/* ВКЛАДКА: ТЕМЫ ТЕСТОВ                                                */}
            {/* ================================================================== */}
            {activeTab === 'topics' && (
                <>
                    {/* Фильтры */}
                    <Card style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <SearchOutlined style={{ color: '#402FFF' }} />
                            <Text strong>Фильтры</Text>
                        </div>
                        <Row gutter={16} align="bottom">
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Поиск</Text>
                                </div>
                                <Search
                                    placeholder="Название темы"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    allowClear
                                />
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
                                            {label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <div style={{ marginBottom: 8, visibility: 'hidden' }}>
                                    <Text strong>.</Text>
                                </div>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterDirection('all');
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Таблица */}
                    {filteredTopics.length === 0 ? (
                        <Card>
                            <Empty description="Нет тем, соответствующих выбранным фильтрам" />
                        </Card>
                    ) : (
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BookOutlined style={{ color: '#402FFF' }} />
                                    <span>Темы тестов</span>
                                    <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                        {filteredTopics.length}
                                    </Tag>
                                </div>
                            }
                            extra={
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setTopicModal({} as AdminTopic)}
                                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                                >
                                    Добавить тему
                                </Button>
                            }
                        >
                            <Table
                                columns={topicsColumns}
                                dataSource={filteredTopics}
                                rowKey="key"
                                pagination={{ pageSize: 15, showSizeChanger: true }}
                                size="middle"
                            />
                        </Card>
                    )}
                </>
            )}

            {/* ================================================================== */}
            {/* ВКЛАДКА: SOFT SKILLS                                                */}
            {/* ================================================================== */}
            {activeTab === 'softSkills' && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <StarOutlined style={{ color: '#402FFF' }} />
                            <span>Soft Skills</span>
                            <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                {softSkills.length}
                            </Tag>
                        </div>
                    }
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setSoftSkillModal({} as AdminSoftSkill)}
                            style={{ background: '#402FFF', borderColor: '#402FFF' }}
                        >
                            Добавить навык
                        </Button>
                    }
                >
                    <Table
                        columns={softSkillsColumns}
                        dataSource={softSkills}
                        rowKey="id"
                        pagination={{ pageSize: 15, showSizeChanger: true }}
                        size="middle"
                    />
                </Card>
            )}

            {/* ================================================================== */}
            {/* Модалка направления                                                 */}
            {/* ================================================================== */}
            <Modal
                title={directionModal?.key ? 'Редактировать направление' : 'Добавить направление'}
                open={!!directionModal}
                onCancel={() => setDirectionModal(null)}
                footer={null}
            >
                <DirectionForm
                    direction={directionModal}
                    onSubmit={handleSaveDirection}
                    onCancel={() => setDirectionModal(null)}
                />
            </Modal>

            {/* ================================================================== */}
            {/* Модалка темы                                                        */}
            {/* ================================================================== */}
            <Modal
                title={topicModal?.key ? 'Редактировать тему' : 'Добавить тему'}
                open={!!topicModal}
                onCancel={() => setTopicModal(null)}
                footer={null}
                width={600}
            >
                <TopicForm
                    topic={topicModal}
                    directions={directions}
                    onSubmit={handleSaveTopic}
                    onCancel={() => setTopicModal(null)}
                />
            </Modal>

            {/* ================================================================== */}
            {/* Модалка soft skill                                                  */}
            {/* ================================================================== */}
            <Modal
                title={softSkillModal?.id ? 'Редактировать навык' : 'Добавить навык'}
                open={!!softSkillModal}
                onCancel={() => setSoftSkillModal(null)}
                footer={null}
            >
                <SoftSkillForm
                    softSkill={softSkillModal}
                    onSubmit={handleSaveSoftSkill}
                    onCancel={() => setSoftSkillModal(null)}
                />
            </Modal>
        </div>
    );
};

// ============================================================================
// 🎨 Формы
// ============================================================================
interface DirectionFormProps {
    direction: AdminDirection | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const DirectionForm: React.FC<DirectionFormProps> = ({ direction, onSubmit, onCancel }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (direction?.key) {
            form.setFieldsValue(direction);
        } else {
            form.resetFields();
        }
    }, [direction, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
                name="key"
                label="Ключ (уникальный идентификатор)"
                rules={[{ required: true, message: 'Введите ключ' }]}
            >
                <Input disabled={!!direction?.key} placeholder="frontend" />
            </Form.Item>
            <Form.Item
                name="label"
                label="Название"
                rules={[{ required: true, message: 'Введите название' }]}
            >
                <Input placeholder="Frontend" />
            </Form.Item>
            <Form.Item
                name="color"
                label="Цвет"
                rules={[{ required: true, message: 'Введите цвет' }]}
            >
                <Input placeholder="#402FFF" />
            </Form.Item>
            <Form.Item
                name="description"
                label="Описание"
                rules={[{ required: true, message: 'Введите описание' }]}
            >
                <Input.TextArea rows={3} placeholder="Описание направления..." />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={onCancel}>Отмена</Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    Сохранить
                </Button>
            </div>
        </Form>
    );
};

interface TopicFormProps {
    topic: AdminTopic | null;
    directions: AdminDirection[];
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const TopicForm: React.FC<TopicFormProps> = ({ topic, directions, onSubmit, onCancel }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (topic?.key) {
            form.setFieldsValue(topic);
        } else {
            form.resetFields();
        }
    }, [topic, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
                name="title"
                label="Название темы"
                rules={[{ required: true, message: 'Введите название' }]}
            >
                <Input placeholder="React Hooks" />
            </Form.Item>
            <Form.Item
                name="direction"
                label="Направление"
                rules={[{ required: true, message: 'Выберите направление' }]}
            >
                <Select placeholder="Выберите направление">
                    {directions.map((d) => (
                        <Select.Option key={d.key} value={d.key}>
                            <Tag color={d.color}>{d.label}</Tag>
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name="parentKey" label="Родительская тема (опционально)">
                <Input placeholder="react" />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={onCancel}>Отмена</Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    Сохранить
                </Button>
            </div>
        </Form>
    );
};

interface SoftSkillFormProps {
    softSkill: AdminSoftSkill | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const SoftSkillForm: React.FC<SoftSkillFormProps> = ({ softSkill, onSubmit, onCancel }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (softSkill?.id) {
            form.setFieldsValue(softSkill);
        } else {
            form.resetFields();
        }
    }, [softSkill, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
                name="name"
                label="Название навыка"
                rules={[{ required: true, message: 'Введите название' }]}
            >
                <Input placeholder="Коммуникабельность" />
            </Form.Item>
            <Form.Item
                name="category"
                label="Категория"
                rules={[{ required: true, message: 'Введите категорию' }]}
            >
                <Select placeholder="Выберите категорию">
                    <Select.Option value="Межличностные">Межличностные</Select.Option>
                    <Select.Option value="Когнитивные">Когнитивные</Select.Option>
                    <Select.Option value="Организационные">Организационные</Select.Option>
                    <Select.Option value="Личностные">Личностные</Select.Option>
                    <Select.Option value="Управленческие">Управленческие</Select.Option>
                </Select>
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={onCancel}>Отмена</Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    Сохранить
                </Button>
            </div>
        </Form>
    );
};

export default AdminDictionaries;