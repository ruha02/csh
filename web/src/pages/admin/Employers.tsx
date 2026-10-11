import {
    BankOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    FilterOutlined,
    GlobalOutlined,
    MailOutlined,
    PhoneOutlined,
    ReloadOutlined,
    StopOutlined,
    TeamOutlined
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
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import {
    MOCK_ADMIN_EMPLOYERS,
    type AdminEmployer,
    type AdminEmployerStatus,
    type CompanyIndustry,
    type CompanySize,
} from '../../mocks';

dayjs.locale('ru');

const { Title, Text } = Typography;
const { Search } = Input;

const STATUS_CONFIG: Record<AdminEmployerStatus, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: 'Активен', color: '#52c41a', icon: <CheckCircleOutlined /> },
    blocked: { label: 'Заблокирован', color: '#f5222d', icon: <StopOutlined /> },
    pending_verification: { label: 'На проверке', color: '#faad14', icon: <ClockCircleOutlined /> },
};

const INDUSTRY_LABELS: Record<CompanyIndustry, string> = {
    it: 'IT',
    finance: 'Финансы',
    retail: 'Ритейл',
    manufacturing: 'Производство',
    education: 'Образование',
    healthcare: 'Здравоохранение',
    media: 'Медиа',
    consulting: 'Консалтинг',
    other: 'Другое',
};

const SIZE_LABELS: Record<CompanySize, string> = {
    '1-10': '1-10',
    '11-50': '11-50',
    '51-200': '51-200',
    '201-500': '201-500',
    '501-1000': '501-1000',
    '1000+': '1000+',
};

const AdminEmployers: React.FC = () => {
    const [employers, setEmployers] = useState<AdminEmployer[]>(MOCK_ADMIN_EMPLOYERS);
    const [selectedEmployer, setSelectedEmployer] = useState<AdminEmployer | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [blockModal, setBlockModal] = useState<AdminEmployer | null>(null);
    const [blockReason, setBlockReason] = useState('');

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<AdminEmployerStatus | 'all'>('all');
    const [filterIndustry, setFilterIndustry] = useState<CompanyIndustry | 'all'>('all');
    const [filterSize, setFilterSize] = useState<CompanySize | 'all'>('all');

    // ========================================================================
    // 📊 Статистика
    // ========================================================================
    const stats = {
        total: employers.length,
        active: employers.filter((e) => e.status === 'active').length,
        blocked: employers.filter((e) => e.status === 'blocked').length,
        pending: employers.filter((e) => e.status === 'pending_verification').length,
        verified: employers.filter((e) => e.isVerified).length,
        totalVacancies: employers.reduce((sum, e) => sum + e.totalVacancies, 0),
    };

    // ========================================================================
    // 🎯 Фильтрация
    // ========================================================================
    const filteredEmployers = employers.filter((employer) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!employer.companyName.toLowerCase().includes(query) && !employer.email.toLowerCase().includes(query)) {
                return false;
            }
        }
        if (filterStatus !== 'all' && employer.status !== filterStatus) return false;
        if (filterIndustry !== 'all' && employer.industry !== filterIndustry) return false;
        if (filterSize !== 'all' && employer.size !== filterSize) return false;
        return true;
    });

    // ========================================================================
    // 🎯 Действия
    // ========================================================================
    const handleViewDetails = (employer: AdminEmployer) => {
        setSelectedEmployer(employer);
        setIsDetailsOpen(true);
    };

    const handleBlock = () => {
        if (!blockModal) return;
        setEmployers((prev) =>
            prev.map((e) =>
                e.id === blockModal.id
                    ? {
                        ...e,
                        status: 'blocked',
                        blockReason: blockReason.trim() || undefined,
                        blockedAt: dayjs().format('YYYY-MM-DD'),
                    }
                    : e
            )
        );
        setBlockModal(null);
        setBlockReason('');
        message.success('Работодатель заблокирован');
    };

    const handleUnblock = (employer: AdminEmployer) => {
        Modal.confirm({
            title: 'Разблокировать работодателя?',
            content: `Компания "${employer.companyName}" сможет снова публиковать вакансии.`,
            okText: 'Разблокировать',
            cancelText: 'Отмена',
            onOk() {
                setEmployers((prev) =>
                    prev.map((e) =>
                        e.id === employer.id
                            ? { ...e, status: 'active', blockReason: undefined, blockedAt: undefined }
                            : e
                    )
                );
                message.success('Работодатель разблокирован');
            },
        });
    };

    const handleVerify = (employer: AdminEmployer) => {
        setEmployers((prev) =>
            prev.map((e) =>
                e.id === employer.id ? { ...e, isVerified: !e.isVerified, status: 'active' } : e
            )
        );
        message.success(employer.isVerified ? 'Верификация отозвана' : 'Работодатель верифицирован');
    };

    // ========================================================================
    // 🎨 Таблица
    // ========================================================================
    const columns: ColumnsType<AdminEmployer> = [
        {
            title: 'Компания',
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
                        {record.companyName.charAt(0)}
                    </Avatar>
                    <div>
                        <Text strong style={{ display: 'block', fontSize: 13 }}>
                            {record.companyName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {record.email}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Отрасль',
            dataIndex: 'industry',
            key: 'industry',
            width: 120,
            render: (industry: CompanyIndustry) => (
                <Tag color="#402FFF" style={{ margin: 0 }}>
                    {INDUSTRY_LABELS[industry]}
                </Tag>
            ),
        },
        {
            title: 'Размер',
            dataIndex: 'size',
            key: 'size',
            width: 100,
            render: (size: CompanySize) => (
                <Text style={{ fontSize: 12 }}>{SIZE_LABELS[size]} чел.</Text>
            ),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: AdminEmployerStatus) => {
                const config = STATUS_CONFIG[status];
                return (
                    <Tag color={config.color} icon={config.icon} style={{ margin: 0 }}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Вакансии',
            key: 'vacancies',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <Text strong style={{ fontSize: 14 }}>
                        {record.publishedVacancies}
                    </Text>
                    <Text type="secondary"> / {record.totalVacancies}</Text>
                </div>
            ),
        },
        {
            title: 'Активность',
            key: 'activity',
            width: 150,
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div>
                        <Text type="secondary">Откликов: </Text>
                        <Text strong>{record.totalResponses}</Text>
                    </div>
                    <div>
                        <Text type="secondary">Заданий: </Text>
                        <Text strong>{record.totalTasks}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Команда',
            dataIndex: 'teamSize',
            key: 'teamSize',
            width: 80,
            align: 'center',
            render: (size: number) => (
                <Tooltip title="Количество сотрудников в аккаунте">
                    <Tag icon={<TeamOutlined />} style={{ margin: 0 }}>
                        {size}
                    </Tag>
                </Tooltip>
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
                    <TeamOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>Работодатели</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Управление компаниями и их аккаунтами
                </Text>
            </div>

            {/* Статистика */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Всего работодателей"
                            value={stats.total}
                            prefix={<TeamOutlined />}
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
                    <Col xs={12} sm={8} md={4}>
                        <Statistic
                            title="Всего вакансий"
                            value={stats.totalVacancies}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#722ed1', fontSize: 20 }}
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
                            placeholder="Название или email"
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
                            <Text strong>Отрасль</Text>
                        </div>
                        <Select
                            value={filterIndustry}
                            onChange={setFilterIndustry}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все отрасли</Select.Option>
                            {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    {label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Размер</Text>
                        </div>
                        <Select
                            value={filterSize}
                            onChange={setFilterSize}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все размеры</Select.Option>
                            {Object.entries(SIZE_LABELS).map(([key, label]) => (
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
                                setFilterIndustry('all');
                                setFilterSize('all');
                            }}
                        >
                            Сбросить
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Таблица */}
            {filteredEmployers.length === 0 ? (
                <Card>
                    <Empty description="Нет работодателей, соответствующих выбранным фильтрам" />
                </Card>
            ) : (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TeamOutlined style={{ color: '#402FFF' }} />
                            <span>Список работодателей</span>
                            <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                {filteredEmployers.length}
                            </Tag>
                        </div>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={filteredEmployers}
                        rowKey="id"
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        size="middle"
                    />
                </Card>
            )}

            {/* Модалка деталей работодателя */}
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
                            {selectedEmployer?.companyName.charAt(0)}
                        </Avatar>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {selectedEmployer?.companyName}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {selectedEmployer?.email}
                            </Text>
                        </div>
                    </div>
                }
                open={isDetailsOpen}
                onCancel={() => setIsDetailsOpen(false)}
                footer={null}
                width={700}
            >
                {selectedEmployer && (
                    <div style={{ marginTop: 16 }}>
                        {/* Статус и верификация */}
                        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Tag
                                color={STATUS_CONFIG[selectedEmployer.status].color}
                                icon={STATUS_CONFIG[selectedEmployer.status].icon}
                            >
                                {STATUS_CONFIG[selectedEmployer.status].label}
                            </Tag>
                            {selectedEmployer.isVerified ? (
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                                    Верифицирован
                                </Tag>
                            ) : (
                                <Tag color="#faad14">Не верифицирован</Tag>
                            )}
                            <Tag color="#402FFF">{INDUSTRY_LABELS[selectedEmployer.industry]}</Tag>
                            <Tag>{SIZE_LABELS[selectedEmployer.size]} сотрудников</Tag>
                        </div>

                        {/* Основная информация */}
                        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Email">
                                <MailOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                {selectedEmployer.email}
                            </Descriptions.Item>
                            {selectedEmployer.phone && (
                                <Descriptions.Item label="Телефон">
                                    <PhoneOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                    {selectedEmployer.phone}
                                </Descriptions.Item>
                            )}
                            {selectedEmployer.website && (
                                <Descriptions.Item label="Сайт">
                                    <GlobalOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                    <a href={selectedEmployer.website} target="_blank" rel="noopener noreferrer">
                                        {selectedEmployer.website}
                                    </a>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Регистрация">
                                {dayjs(selectedEmployer.registeredAt).format('D MMMM YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Последняя активность">
                                {dayjs(selectedEmployer.lastActiveAt).format('D MMMM YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Команда">
                                <TeamOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                {selectedEmployer.teamSize} сотрудников
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Статистика */}
                        <Divider />
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="Всего вакансий"
                                    value={selectedEmployer.totalVacancies}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Опубликовано"
                                    value={selectedEmployer.publishedVacancies}
                                    valueStyle={{ fontSize: 20, color: '#52c41a' }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Откликов"
                                    value={selectedEmployer.totalResponses}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Заданий"
                                    value={selectedEmployer.totalTasks}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                        </Row>

                        {/* Причина блокировки */}
                        {selectedEmployer.status === 'blocked' && selectedEmployer.blockReason && (
                            <>
                                <Divider />
                                <Alert
                                    message="Причина блокировки"
                                    description={
                                        <div>
                                            <div>{selectedEmployer.blockReason}</div>
                                            {selectedEmployer.blockedAt && (
                                                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                                    Заблокирован: {dayjs(selectedEmployer.blockedAt).format('D MMMM YYYY')}
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
                        <span>Блокировка работодателя</span>
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
                            message={`Вы блокируете компанию "${blockModal.companyName}"`}
                            description="Компания не сможет публиковать вакансии и общаться с кандидатами до разблокировки."
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
                            placeholder="Например: Нарушение правил публикации вакансий..."
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

export default AdminEmployers;