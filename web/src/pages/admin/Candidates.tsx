import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    FilterOutlined,
    MailOutlined,
    ReloadOutlined,
    SendOutlined,
    StopOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Input,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography,
    message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    MOCK_ADMIN_CANDIDATES,
    getConfidenceColor,
    type AdminCandidate,
    type AdminCandidateStatus,
    type Direction,
    type Grade,
} from '../../mocks';

dayjs.locale('ru');

const { Title, Text } = Typography;
const { Search } = Input;

const STATUS_CONFIG: Record<AdminCandidateStatus, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: 'Активен', color: '#52c41a', icon: <CheckCircleOutlined /> },
    blocked: { label: 'Заблокирован', color: '#f5222d', icon: <StopOutlined /> },
    pending_verification: { label: 'На проверке', color: '#faad14', icon: <ClockCircleOutlined /> },
};

const AdminCandidates: React.FC = () => {
    const [candidates, setCandidates] = useState<AdminCandidate[]>(MOCK_ADMIN_CANDIDATES);
    const [selectedCandidate, setSelectedCandidate] = useState<AdminCandidate | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [blockModal, setBlockModal] = useState<AdminCandidate | null>(null);
    const [blockReason, setBlockReason] = useState('');

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<AdminCandidateStatus | 'all'>('all');
    const [filterDirection, setFilterDirection] = useState<Direction | 'all'>('all');
    const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');

    // ========================================================================
    // 📊 Статистика
    // ========================================================================
    const stats = {
        total: candidates.length,
        active: candidates.filter((c) => c.status === 'active').length,
        blocked: candidates.filter((c) => c.status === 'blocked').length,
        pending: candidates.filter((c) => c.status === 'pending_verification').length,
        verified: candidates.filter((c) => c.isVerified).length,
    };

    // ========================================================================
    // 🎯 Фильтрация
    // ========================================================================
    const filteredCandidates = candidates.filter((candidate) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const fullName = `${candidate.lastName} ${candidate.firstName}`.toLowerCase();
            const email = candidate.email.toLowerCase();
            if (!fullName.includes(query) && !email.includes(query)) return false;
        }
        if (filterStatus !== 'all' && candidate.status !== filterStatus) return false;
        if (filterDirection !== 'all') {
            const hasDirection = candidate.skills.some((s) => s.direction === filterDirection);
            if (!hasDirection) return false;
        }
        if (filterGrade !== 'all') {
            const hasGrade = candidate.skills.some((s) => s.grade === filterGrade);
            if (!hasGrade) return false;
        }
        return true;
    });

    // ========================================================================
    // 🎯 Действия
    // ========================================================================
    const handleViewDetails = (candidate: AdminCandidate) => {
        setSelectedCandidate(candidate);
        setIsDetailsOpen(true);
    };

    const handleBlock = () => {
        if (!blockModal) return;
        setCandidates((prev) =>
            prev.map((c) =>
                c.id === blockModal.id
                    ? {
                        ...c,
                        status: 'blocked',
                        blockReason: blockReason.trim() || undefined,
                        blockedAt: dayjs().format('YYYY-MM-DD'),
                    }
                    : c
            )
        );
        setBlockModal(null);
        setBlockReason('');
        message.success('Кандидат заблокирован');
    };

    const handleUnblock = (candidate: AdminCandidate) => {
        Modal.confirm({
            title: 'Разблокировать кандидата?',
            content: `${candidate.firstName} ${candidate.lastName} сможет снова пользоваться платформой.`,
            okText: 'Разблокировать',
            cancelText: 'Отмена',
            onOk() {
                setCandidates((prev) =>
                    prev.map((c) =>
                        c.id === candidate.id
                            ? { ...c, status: 'active', blockReason: undefined, blockedAt: undefined }
                            : c
                    )
                );
                message.success('Кандидат разблокирован');
            },
        });
    };

    const handleVerify = (candidate: AdminCandidate) => {
        setCandidates((prev) =>
            prev.map((c) =>
                c.id === candidate.id ? { ...c, isVerified: !c.isVerified, status: 'active' } : c
            )
        );
        message.success(candidate.isVerified ? 'Верификация отозвана' : 'Кандидат верифицирован');
    };

    // ========================================================================
    // 🎨 Таблица
    // ========================================================================
    const columns: ColumnsType<AdminCandidate> = [
        {
            title: 'Кандидат',
            key: 'name',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        size={40}
                        style={{
                            backgroundColor: '#402FFF',
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        {record.firstName.charAt(0)}
                        {record.lastName.charAt(0)}
                    </Avatar>
                    <div>
                        <Text strong style={{ display: 'block', fontSize: 13 }}>
                            {record.lastName} {record.firstName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {record.email}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Навыки',
            key: 'skills',
            render: (_, record) => (
                <Space size={4} wrap>
                    {record.skills.slice(0, 2).map((skill, idx) => (
                        <React.Fragment key={idx}>
                            <Tag
                                color={DIRECTION_COLORS[skill.direction]}
                                style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                            >
                                {DIRECTION_LABELS[skill.direction]}
                            </Tag>
                            <Tag
                                color={GRADE_COLORS[skill.grade]}
                                style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                            >
                                {GRADE_LABELS[skill.grade]}
                            </Tag>
                        </React.Fragment>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: AdminCandidateStatus) => {
                const config = STATUS_CONFIG[status];
                return (
                    <Tag color={config.color} icon={config.icon} style={{ margin: 0 }}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Верификация',
            dataIndex: 'isVerified',
            key: 'isVerified',
            width: 120,
            align: 'center',
            render: (verified: boolean) =>
                verified ? (
                    <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                        Да
                    </Tag>
                ) : (
                    <Tag color="#faad14">Нет</Tag>
                ),
        },
        {
            title: 'Активность',
            key: 'activity',
            width: 180,
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div>
                        <Text type="secondary">Тесты: </Text>
                        <Text strong>{record.totalTestsPassed}</Text>
                    </div>
                    <div>
                        <Text type="secondary">Отклики: </Text>
                        <Text strong>{record.totalResponses}</Text>
                    </div>
                    <div>
                        <Text type="secondary">Задания: </Text>
                        <Text strong>{record.totalTasks}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Последняя активность',
            dataIndex: 'lastActiveAt',
            key: 'lastActiveAt',
            width: 140,
            render: (date: string) => (
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(date).format('D MMM YYYY')}
                </Text>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Подробнее">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.isVerified ? 'Отозвать верификацию' : 'Верифицировать'}>
                        <Button
                            type="text"
                            icon={<CheckCircleOutlined />}
                            style={{ color: record.isVerified ? '#faad14' : '#52c41a' }}
                            onClick={() => handleVerify(record)}
                        />
                    </Tooltip>
                    {record.status === 'blocked' ? (
                        <Tooltip title="Разблокировать">
                            <Button
                                type="text"
                                icon={<CheckCircleOutlined />}
                                style={{ color: '#52c41a' }}
                                onClick={() => handleUnblock(record)}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Заблокировать">
                            <Button
                                type="text"
                                danger
                                icon={<StopOutlined />}
                                onClick={() => setBlockModal(record)}
                            />
                        </Tooltip>
                    )}
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
                    <UserOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>Кандидаты</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Управление пользователями с ролью «Кандидат»
                </Text>
            </div>

            {/* Статистика */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Всего кандидатов"
                            value={stats.total}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#402FFF' }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Активных"
                            value={stats.active}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Заблокировано"
                            value={stats.blocked}
                            prefix={<StopOutlined />}
                            valueStyle={{ color: '#f5222d', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="На проверке"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14', fontSize: 20 }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Верифицировано"
                            value={stats.verified}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#13c2c2', fontSize: 20 }}
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
                            placeholder="Имя или email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                        />
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
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
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
                    <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ marginBottom: 8, visibility: 'hidden' }}>
                            <Text strong>.</Text>
                        </div>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSearchQuery('');
                                setFilterStatus('all');
                                setFilterDirection('all');
                                setFilterGrade('all');
                            }}
                        >
                            Сбросить
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Таблица */}
            {filteredCandidates.length === 0 ? (
                <Card>
                    <Empty description="Нет кандидатов, соответствующих выбранным фильтрам" />
                </Card>
            ) : (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <UserOutlined style={{ color: '#402FFF' }} />
                            <span>Список кандидатов</span>
                            <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                {filteredCandidates.length}
                            </Tag>
                        </div>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={filteredCandidates}
                        rowKey="id"
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        size="middle"
                    />
                </Card>
            )}

            {/* Модалка деталей кандидата */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar
                            size={40}
                            style={{
                                backgroundColor: '#402FFF',
                                fontSize: 16,
                                fontWeight: 700,
                            }}
                        >
                            {selectedCandidate?.firstName.charAt(0)}
                            {selectedCandidate?.lastName.charAt(0)}
                        </Avatar>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {selectedCandidate?.lastName} {selectedCandidate?.firstName}
                                {selectedCandidate?.middleName && ` ${selectedCandidate.middleName}`}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {selectedCandidate?.email}
                            </Text>
                        </div>
                    </div>
                }
                open={isDetailsOpen}
                onCancel={() => setIsDetailsOpen(false)}
                footer={null}
                width={700}
            >
                {selectedCandidate && (
                    <div style={{ marginTop: 16 }}>
                        {/* Статус и верификация */}
                        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Tag
                                color={STATUS_CONFIG[selectedCandidate.status].color}
                                icon={STATUS_CONFIG[selectedCandidate.status].icon}
                            >
                                {STATUS_CONFIG[selectedCandidate.status].label}
                            </Tag>
                            {selectedCandidate.isVerified ? (
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                                    Верифицирован
                                </Tag>
                            ) : (
                                <Tag color="#faad14">Не верифицирован</Tag>
                            )}
                        </div>

                        {/* Основная информация */}
                        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Email">
                                <MailOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                {selectedCandidate.email}
                            </Descriptions.Item>
                            {selectedCandidate.phone && (
                                <Descriptions.Item label="Телефон">
                                    {selectedCandidate.phone}
                                </Descriptions.Item>
                            )}
                            {selectedCandidate.telegram && (
                                <Descriptions.Item label="Telegram">
                                    <SendOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                                    {selectedCandidate.telegram}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Регистрация">
                                {dayjs(selectedCandidate.registeredAt).format('D MMMM YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Последняя активность">
                                {dayjs(selectedCandidate.lastActiveAt).format('D MMMM YYYY')}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Навыки */}
                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Навыки
                            </Text>
                            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                {selectedCandidate.skills.map((skill, idx) => (
                                    <Card
                                        key={idx}
                                        size="small"
                                        style={{ background: '#fafafa' }}
                                        bodyStyle={{ padding: 12 }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Space size={4}>
                                                <Tag color={DIRECTION_COLORS[skill.direction]} style={{ margin: 0 }}>
                                                    {DIRECTION_LABELS[skill.direction]}
                                                </Tag>
                                                <Tag color={GRADE_COLORS[skill.grade]} style={{ margin: 0 }}>
                                                    {GRADE_LABELS[skill.grade]}
                                                </Tag>
                                                <Text strong style={{ fontSize: 13 }}>
                                                    {skill.language}
                                                </Text>
                                            </Space>
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 18,
                                                    color: getConfidenceColor(skill.confidence),
                                                }}
                                            >
                                                {skill.confidence}%
                                            </Text>
                                        </div>
                                        <Progress
                                            percent={skill.confidence}
                                            showInfo={false}
                                            strokeColor={getConfidenceColor(skill.confidence)}
                                            size="small"
                                        />
                                    </Card>
                                ))}
                            </Space>
                        </div>

                        {/* Статистика */}
                        <Divider />
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="Тестов пройдено"
                                    value={selectedCandidate.totalTestsPassed}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Откликов"
                                    value={selectedCandidate.totalResponses}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Приглашений"
                                    value={selectedCandidate.totalInvitations}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Заданий"
                                    value={selectedCandidate.totalTasks}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                        </Row>

                        {/* Причина блокировки */}
                        {selectedCandidate.status === 'blocked' && selectedCandidate.blockReason && (
                            <>
                                <Divider />
                                <Alert
                                    message="Причина блокировки"
                                    description={
                                        <div>
                                            <div>{selectedCandidate.blockReason}</div>
                                            {selectedCandidate.blockedAt && (
                                                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                                    Заблокирован: {dayjs(selectedCandidate.blockedAt).format('D MMMM YYYY')}
                                                </Text>
                                            )}
                                        </div>
                                    }
                                    type="error"
                                    showIcon
                                    style={{ marginTop: 16 }}
                                />
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Модалка блокировки */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StopOutlined style={{ color: '#f5222d' }} />
                        <span>Блокировка кандидата</span>
                    </div>
                }
                open={!!blockModal}
                onOk={handleBlock}
                onCancel={() => {
                    setBlockModal(null);
                    setBlockReason('');
                }}
                okText="Заблокировать"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
            >
                {blockModal && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={`Вы блокируете кандидата "${blockModal.firstName} ${blockModal.lastName}"`}
                            description="Кандидат не сможет пользоваться платформой до разблокировки."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Причина блокировки</Text>
                            <Tag style={{ fontSize: 11, marginLeft: 8 }}>необязательно</Tag>
                        </div>
                        <Input.TextArea
                            rows={4}
                            placeholder="Например: Нарушение правил платформы..."
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            maxLength={500}
                            showCount
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminCandidates;