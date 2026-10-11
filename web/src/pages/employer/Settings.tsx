import {
    BellOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    DisconnectOutlined,
    DownloadOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    GithubOutlined,
    GlobalOutlined,
    GroupOutlined,
    KeyOutlined,
    LinkOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    RobotOutlined,
    SafetyCertificateOutlined,
    SaveOutlined,
    SendOutlined,
    SettingOutlined,
    TeamOutlined,
    UserAddOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useKeycloak } from '@react-keycloak/web';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Input,
    InputNumber,
    Modal,
    Radio,
    Row,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import {
    MOCK_EMPLOYER_SETTINGS,
    type EmployerSettings,
    type EmployerTeamMember,
} from '../../mocks';

dayjs.locale('ru');

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 🏷️ Константы
// ============================================================================
const TEAM_ROLE_LABELS: Record<EmployerTeamMember['role'], string> = {
    owner: 'Владелец',
    hr: 'HR-менеджер',
    hiring_manager: 'Нанимающий менеджер',
    viewer: 'Наблюдатель',
};

const TEAM_ROLE_COLORS: Record<EmployerTeamMember['role'], string> = {
    owner: '#f5222d',
    hr: '#402FFF',
    hiring_manager: '#722ed1',
    viewer: '#8c8c8c',
};

const TEAM_ROLE_DESCRIPTIONS: Record<EmployerTeamMember['role'], string> = {
    owner: 'Полный доступ, включая управление командой и настройками',
    hr: 'Просмотр откликов, управление вакансиями, общение с кандидатами',
    hiring_manager: 'Просмотр откликов по своим вакансиям, обратная связь',
    viewer: 'Только просмотр вакансий и статистики',
};

const COMPANY_VISIBILITY_OPTIONS = [
    {
        value: 'public',
        label: 'Публичный профиль',
        description: 'Любой кандидат может найти вашу компанию и откликнуться на вакансии',
        icon: <GlobalOutlined style={{ color: '#52c41a' }} />,
        color: '#52c41a',
    },
    {
        value: 'invited_only',
        label: 'Только по приглашениям',
        description: 'Кандидаты видят компанию только если вы пригласили их на вакансию',
        icon: <SendOutlined style={{ color: '#faad14' }} />,
        color: '#faad14',
    },
    {
        value: 'hidden',
        label: 'Скрытый (Инкогнито)',
        description: 'Компания не видна в поиске. Вакансии доступны только по прямым ссылкам',
        icon: <EyeInvisibleOutlined style={{ color: '#f5222d' }} />,
        color: '#f5222d',
    },
];

// ============================================================================
// 🎨 Компонент страницы
// ============================================================================
const EmployerSettings: React.FC = () => {
    const { keycloak } = useKeycloak();
    const firstName = keycloak.tokenParsed?.given_name || 'Пользователь';
    const lastName = keycloak.tokenParsed?.family_name || '';
    const email = keycloak.tokenParsed?.email || '';
    const username = keycloak.tokenParsed?.preferred_username || '';

    const [settings, setSettings] = useState<EmployerSettings>(MOCK_EMPLOYER_SETTINGS);
    const [activeSection, setActiveSection] = useState<string>('notifications');
    const [isSaving, setIsSaving] = useState(false);

    // Модалки
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<EmployerTeamMember['role']>('viewer');
    const [removeMemberModal, setRemoveMemberModal] = useState<EmployerTeamMember | null>(null);

    // ========================================================================
    // 💾 Сохранение
    // ========================================================================
    const handleSave = async () => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        message.success('Настройки сохранены');
    };

    // ========================================================================
    // 🔔 Уведомления
    // ========================================================================
    const toggleChannel = (channel: keyof EmployerSettings['notifications']['channels']) => {
        setSettings((prev) => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                channels: {
                    ...prev.notifications.channels,
                    [channel]: !prev.notifications.channels[channel],
                },
            },
        }));
    };

    const toggleEvent = (event: keyof EmployerSettings['notifications']['events']) => {
        setSettings((prev) => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                events: {
                    ...prev.notifications.events,
                    [event]: !prev.notifications.events[event],
                },
            },
        }));
    };

    // ========================================================================
    // 💼 Вакансии (настройки по умолчанию)
    // ========================================================================
    const updateVacancyDefault = <K extends keyof EmployerSettings['vacancyDefaults']>(
        key: K,
        value: EmployerSettings['vacancyDefaults'][K]
    ) => {
        setSettings((prev) => ({
            ...prev,
            vacancyDefaults: { ...prev.vacancyDefaults, [key]: value },
        }));
    };

    // ========================================================================
    // 🔒 Приватность
    // ========================================================================
    const setCompanyVisibility = (value: EmployerSettings['privacy']['companyVisibility']) => {
        setSettings((prev) => ({
            ...prev,
            privacy: { ...prev.privacy, companyVisibility: value },
        }));
    };

    const togglePrivacy = (
        key:
            | 'showContactEmail'
            | 'showContactPhone'
            | 'showRejectionReasons'
            | 'allowAiTaskGeneration'
    ) => {
        setSettings((prev) => ({
            ...prev,
            privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
        }));
    };

    // ========================================================================
    // 🔗 Интеграции
    // ========================================================================
    const handleConnectIntegration = (
        platform: keyof EmployerSettings['integrations'],
        platformName: string
    ) => {
        const defaults: Record<string, string> = {
            telegram: '@technosoft_hr',
            headhunter: 'ТехноСофт',
            habrCareer: 'technosoft',
            github: 'technosoft',
        };
        setSettings((prev) => ({
            ...prev,
            integrations: {
                ...prev.integrations,
                [platform]: {
                    connected: true,
                    [platform === 'telegram'
                        ? 'username'
                        : platform === 'github'
                            ? 'orgName'
                            : 'accountName']: defaults[platform] || 'connected',
                } as any,
            },
        }));
        message.success(`${platformName} успешно подключён`);
    };

    const handleDisconnectIntegration = (
        platform: keyof EmployerSettings['integrations'],
        platformName: string
    ) => {
        Modal.confirm({
            title: `Отключить ${platformName}?`,
            content: `Вы уверены, что хотите отключить интеграцию с ${platformName}?`,
            okText: 'Отключить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                setSettings((prev) => ({
                    ...prev,
                    integrations: {
                        ...prev.integrations,
                        [platform]: { connected: false } as any,
                    },
                }));
                message.info(`${platformName} отключён`);
            },
        });
    };

    // ========================================================================
    // 👥 Команда
    // ========================================================================
    const handleInviteMember = () => {
        if (!inviteEmail.trim()) {
            message.error('Введите email');
            return;
        }
        const newMember: EmployerTeamMember = {
            id: Date.now(),
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            role: inviteRole,
            joinedAt: dayjs().format('YYYY-MM-DD'),
        };
        setSettings((prev) => ({
            ...prev,
            team: [...prev.team, newMember],
        }));
        setInviteModalOpen(false);
        setInviteEmail('');
        setInviteRole('viewer');
        message.success(`Приглашение отправлено на ${inviteEmail}`);
    };

    const handleRemoveMember = () => {
        if (!removeMemberModal) return;
        setSettings((prev) => ({
            ...prev,
            team: prev.team.filter((m) => m.id !== removeMemberModal.id),
        }));
        setRemoveMemberModal(null);
        message.success('Сотрудник удалён из команды');
    };

    const handleChangeRole = (memberId: number, newRole: EmployerTeamMember['role']) => {
        setSettings((prev) => ({
            ...prev,
            team: prev.team.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
        }));
        message.success('Роль обновлена');
    };

    // ========================================================================
    // 🗑️ Удаление аккаунта
    // ========================================================================
    const handleDeleteAccount = () => {
        if (deleteConfirmText !== 'УДАЛИТЬ') {
            message.error('Введите "УДАЛИТЬ" для подтверждения');
            return;
        }
        message.error('Функция удаления аккаунта будет доступна в следующем обновлении');
        setDeleteModalOpen(false);
        setDeleteConfirmText('');
    };

    // ========================================================================
    // 📋 Навигация
    // ========================================================================
    const sections = [
        { key: 'notifications', icon: <BellOutlined />, label: 'Уведомления' },
        { key: 'vacancies', icon: <SettingOutlined />, label: 'Вакансии' },
        { key: 'privacy', icon: <LockOutlined />, label: 'Приватность' },
        { key: 'integrations', icon: <LinkOutlined />, label: 'Интеграции' },
        { key: 'team', icon: <TeamOutlined />, label: 'Команда' },
        { key: 'account', icon: <UserOutlined />, label: 'Аккаунт' },
    ];

    // ========================================================================
    // 🎨 Рендер секций
    // ========================================================================
    const renderNotifications = () => (
        <div>
            <Title level={4} style={{ marginBottom: 8 }}>
                <BellOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Уведомления
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Настройте, какие события и каким способом вы хотите получать
            </Text>

            {/* Каналы */}
            <Card title="Каналы уведомлений" size="small" style={{ marginBottom: 24 }}>
                <Row gutter={[24, 16]}>
                    <Col xs={24} sm={8}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: settings.notifications.channels.email ? '#f6ffed' : '#fafafa',
                                borderRadius: 8,
                                border: `1px solid ${settings.notifications.channels.email ? '#b7eb8f' : '#f0f0f0'}`,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MailOutlined style={{ fontSize: 18, color: '#402FFF' }} />
                                <div>
                                    <Text strong style={{ display: 'block' }}>Email</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {email || 'не указан'}
                                    </Text>
                                </div>
                            </div>
                            <Switch
                                checked={settings.notifications.channels.email}
                                onChange={() => toggleChannel('email')}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: settings.notifications.channels.telegram ? '#f6ffed' : '#fafafa',
                                borderRadius: 8,
                                border: `1px solid ${settings.notifications.channels.telegram ? '#b7eb8f' : '#f0f0f0'}`,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <SendOutlined style={{ fontSize: 18, color: '#722ed1' }} />
                                <div>
                                    <Text strong style={{ display: 'block' }}>Telegram</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {settings.integrations.telegram.connected
                                            ? settings.integrations.telegram.username
                                            : 'не подключён'}
                                    </Text>
                                </div>
                            </div>
                            <Switch
                                checked={settings.notifications.channels.telegram}
                                onChange={() => toggleChannel('telegram')}
                                disabled={!settings.integrations.telegram.connected}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: settings.notifications.channels.inApp ? '#f6ffed' : '#fafafa',
                                borderRadius: 8,
                                border: `1px solid ${settings.notifications.channels.inApp ? '#b7eb8f' : '#f0f0f0'}`,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <GlobalOutlined style={{ fontSize: 18, color: '#fa8c16' }} />
                                <div>
                                    <Text strong style={{ display: 'block' }}>В приложении</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Push-уведомления</Text>
                                </div>
                            </div>
                            <Switch
                                checked={settings.notifications.channels.inApp}
                                onChange={() => toggleChannel('inApp')}
                            />
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* События */}
            <Card title="Оповещать о событиях" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {[
                        {
                            key: 'newResponse' as const,
                            label: 'Новый отклик на вакансию',
                            desc: 'Когда кандидат откликается на вашу вакансию',
                            icon: <SendOutlined style={{ color: '#402FFF' }} />,
                        },
                        {
                            key: 'taskSubmitted' as const,
                            label: 'Кандидат сдал тестовое задание',
                            desc: 'Когда кандидат загружает решение тестового задания',
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        },
                        {
                            key: 'candidateShortlisted' as const,
                            label: 'Кандидат в шорт-листе',
                            desc: 'Напоминание о кандидатах в шорт-листе без дальнейших действий',
                            icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
                        },
                        {
                            key: 'invitationExpiring' as const,
                            label: 'Приглашение скоро истечёт',
                            desc: 'Напоминание за 2 дня до истечения срока приглашения кандидату',
                            icon: <BellOutlined style={{ color: '#f5222d' }} />,
                        },
                        {
                            key: 'vacancyDeadlineSoon' as const,
                            label: 'Дедлайн вакансии скоро',
                            desc: 'Напоминание за 3 дня до окончания приёма откликов',
                            icon: <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
                        },
                        {
                            key: 'newCandidateMatch' as const,
                            label: 'Найден подходящий кандидат',
                            desc: 'Когда в системе появляется кандидат, соответствующий вашим вакансиям',
                            icon: <UserOutlined style={{ color: '#722ed1' }} />,
                        },
                        {
                            key: 'responseViewedByCandidate' as const,
                            label: 'Кандидат прочитал сообщение',
                            desc: 'Когда кандидат открывает ваше сообщение в чате',
                            icon: <EyeOutlined style={{ color: '#13c2c2' }} />,
                        },
                    ].map((item) => (
                        <div
                            key={item.key}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: settings.notifications.events[item.key] ? '#fafafa' : '#fff',
                                borderRadius: 8,
                                border: '1px solid #f0f0f0',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                {item.icon}
                                <div>
                                    <Text strong style={{ display: 'block' }}>{item.label}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                                </div>
                            </div>
                            <Switch
                                checked={settings.notifications.events[item.key]}
                                onChange={() => toggleEvent(item.key)}
                            />
                        </div>
                    ))}
                </Space>
            </Card>
        </div>
    );

    const renderVacancies = () => (
        <div>
            <Title level={4} style={{ marginBottom: 8 }}>
                <SettingOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Настройки вакансий
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Параметры по умолчанию для новых вакансий
            </Text>

            <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* Дедлайн по умолчанию */}
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            Дедлайн приёма откликов по умолчанию
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                            Будет автоматически подставляться при создании новой вакансии
                        </Text>
                        <Space align="center">
                            <InputNumber
                                min={1}
                                max={365}
                                value={settings.vacancyDefaults.defaultDeadlineDays}
                                onChange={(value) =>
                                    updateVacancyDefault('defaultDeadlineDays', value || 30)
                                }
                                style={{ width: 120 }}
                                addonAfter="дней"
                            />
                            <Tag color="#402FFF">
                                {dayjs().add(settings.vacancyDefaults.defaultDeadlineDays, 'day').format('D MMM')}
                            </Tag>
                        </Space>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Формат работы по умолчанию */}
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            Формат работы по умолчанию
                        </Text>
                        <Radio.Group
                            value={settings.vacancyDefaults.defaultFormat}
                            onChange={(e) => updateVacancyDefault('defaultFormat', e.target.value)}
                        >
                            <Space>
                                <Radio.Button value="remote">
                                    <GlobalOutlined /> Удалённо
                                </Radio.Button>
                                <Radio.Button value="office">В офисе</Radio.Button>
                                <Radio.Button value="hybrid">Гибрид</Radio.Button>
                            </Space>
                        </Radio.Group>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Показывать зарплату */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ display: 'block' }}>
                                Показывать зарплату в вакансиях
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Кандидаты будут видеть вилку зарплат в карточке вакансии
                            </Text>
                        </div>
                        <Switch
                            checked={settings.vacancyDefaults.showSalary}
                            onChange={(value) => updateVacancyDefault('showSalary', value)}
                        />
                    </div>

                    {/* Автоархивация */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ display: 'block' }}>
                                Автоархивация закрытых вакансий
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                После закрытия вакансии она автоматически перемещается в архив через 7 дней
                            </Text>
                        </div>
                        <Switch
                            checked={settings.vacancyDefaults.autoArchiveOnClose}
                            onChange={(value) => updateVacancyDefault('autoArchiveOnClose', value)}
                        />
                    </div>
                </Space>
            </Card>
        </div>
    );

    const renderPrivacy = () => (
        <div>
            <Title level={4} style={{ marginBottom: 8 }}>
                <LockOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Приватность
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Управляйте видимостью компании и взаимодействием с кандидатами
            </Text>

            {/* Видимость компании */}
            <Card title="Видимость компании" size="small" style={{ marginBottom: 24 }}>
                <Radio.Group
                    value={settings.privacy.companyVisibility}
                    onChange={(e) => setCompanyVisibility(e.target.value as EmployerSettings['privacy']['companyVisibility'])}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {COMPANY_VISIBILITY_OPTIONS.map((option) => (
                            <div
                                key={option.value}
                                style={{
                                    padding: '16px',
                                    borderRadius: 8,
                                    border: `2px solid ${settings.privacy.companyVisibility === option.value
                                        ? '#402FFF'
                                        : '#f0f0f0'
                                        }`,
                                    background:
                                        settings.privacy.companyVisibility === option.value
                                            ? '#f0f0ff'
                                            : '#fff',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setCompanyVisibility(option.value as EmployerSettings['privacy']['companyVisibility'])}
                            >
                                <Radio value={option.value}>
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                            {option.icon}
                                            <span style={{ marginLeft: 8 }}>{option.label}</span>
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 13, marginLeft: 30 }}>
                                            {option.description}
                                        </Text>
                                    </div>
                                </Radio>
                            </div>
                        ))}
                    </Space>
                </Radio.Group>
            </Card>

            {/* Дополнительные настройки */}
            <Card title="Дополнительные настройки" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <MailOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                            <div>
                                <Text strong style={{ display: 'block' }}>
                                    Показывать email компании
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Email будет виден кандидатам в карточке компании
                                </Text>
                            </div>
                        </div>
                        <Switch
                            checked={settings.privacy.showContactEmail}
                            onChange={() => togglePrivacy('showContactEmail')}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <PhoneOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                            <div>
                                <Text strong style={{ display: 'block' }}>
                                    Показывать телефон компании
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Телефон будет виден кандидатам в карточке компании
                                </Text>
                            </div>
                        </div>
                        <Switch
                            checked={settings.privacy.showContactPhone}
                            onChange={() => togglePrivacy('showContactPhone')}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <CloseCircleOutlined style={{ color: '#f5222d', fontSize: 18 }} />
                            <div>
                                <Text strong style={{ display: 'block' }}>
                                    Показывать причину отклонения кандидатам
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Кандидаты будут видеть, почему их отклик был отклонён
                                </Text>
                            </div>
                        </div>
                        <Switch
                            checked={settings.privacy.showRejectionReasons}
                            onChange={() => togglePrivacy('showRejectionReasons')}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <RobotOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                            <div>
                                <Text strong style={{ display: 'block' }}>
                                    Разрешить ИИ генерировать задания
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    ИИ будет автоматически создавать тестовые задания для откликнувшихся кандидатов
                                </Text>
                            </div>
                        </div>
                        <Switch
                            checked={settings.privacy.allowAiTaskGeneration}
                            onChange={() => togglePrivacy('allowAiTaskGeneration')}
                        />
                    </div>
                </Space>
            </Card>
        </div>
    );

    const renderIntegrations = () => (
        <div>
            <Title level={4} style={{ marginBottom: 8 }}>
                <LinkOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Интеграции
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Подключите внешние сервисы для расширения возможностей подбора
            </Text>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Telegram */}
                <Card size="small">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <SendOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                            <div>
                                <Text strong style={{ fontSize: 16, display: 'block' }}>
                                    Telegram
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    {settings.integrations.telegram.connected
                                        ? `Подключён как ${settings.integrations.telegram.username}`
                                        : 'Получайте уведомления об откликах и отправляйте сообщения кандидатам'}
                                </Text>
                            </div>
                        </div>
                        {settings.integrations.telegram.connected ? (
                            <Space>
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                                    Подключён
                                </Tag>
                                <Button
                                    danger
                                    type="text"
                                    icon={<DisconnectOutlined />}
                                    onClick={() => handleDisconnectIntegration('telegram', 'Telegram')}
                                >
                                    Отключить
                                </Button>
                            </Space>
                        ) : (
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => handleConnectIntegration('telegram', 'Telegram')}
                                style={{ background: '#722ed1', borderColor: '#722ed1' }}
                            >
                                Подключить
                            </Button>
                        )}
                    </div>
                </Card>

                {/* HeadHunter */}
                <Card size="small">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: '#D6001C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    fontFamily: "'Unbounded', sans-serif",
                                }}
                            >
                                hh
                            </div>
                            <div>
                                <Text strong style={{ fontSize: 16, display: 'block' }}>
                                    HeadHunter (hh.ru)
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    {settings.integrations.headhunter.connected
                                        ? `Аккаунт: ${settings.integrations.headhunter.accountName}`
                                        : 'Импортируйте вакансии и отклики с hh.ru'}
                                </Text>
                            </div>
                        </div>
                        {settings.integrations.headhunter.connected ? (
                            <Space>
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                                    Подключён
                                </Tag>
                                <Button
                                    danger
                                    type="text"
                                    icon={<DisconnectOutlined />}
                                    onClick={() => handleDisconnectIntegration('headhunter', 'HeadHunter')}
                                >
                                    Отключить
                                </Button>
                            </Space>
                        ) : (
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => handleConnectIntegration('headhunter', 'HeadHunter')}
                                style={{ background: '#D6001C', borderColor: '#D6001C' }}
                            >
                                Подключить
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Habr Career */}
                <Card size="small">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: '#65A3BE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    fontFamily: "'Unbounded', sans-serif",
                                }}
                            >
                                H
                            </div>
                            <div>
                                <Text strong style={{ fontSize: 16, display: 'block' }}>
                                    Habr Career
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    {settings.integrations.habrCareer.connected
                                        ? `Аккаунт: ${settings.integrations.habrCareer.accountName}`
                                        : 'Публикуйте вакансии на Habr Career напрямую из системы'}
                                </Text>
                            </div>
                        </div>
                        {settings.integrations.habrCareer.connected ? (
                            <Space>
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                                    Подключён
                                </Tag>
                                <Button
                                    danger
                                    type="text"
                                    icon={<DisconnectOutlined />}
                                    onClick={() => handleDisconnectIntegration('habrCareer', 'Habr Career')}
                                >
                                    Отключить
                                </Button>
                            </Space>
                        ) : (
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => handleConnectIntegration('habrCareer', 'Habr Career')}
                                style={{ background: '#65A3BE', borderColor: '#65A3BE' }}
                            >
                                Подключить
                            </Button>
                        )}
                    </div>
                </Card>

                {/* GitHub Organization */}
                <Card size="small">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <GithubOutlined style={{ fontSize: 32, color: '#1B1C21' }} />
                            <div>
                                <Text strong style={{ fontSize: 16, display: 'block' }}>
                                    GitHub Organization
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    {settings.integrations.github.connected
                                        ? `Организация: ${settings.integrations.github.orgName}`
                                        : 'Покажите кандидатам ваши open-source проекты'}
                                </Text>
                            </div>
                        </div>
                        {settings.integrations.github.connected ? (
                            <Space>
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                                    Подключён
                                </Tag>
                                <Button
                                    danger
                                    type="text"
                                    icon={<DisconnectOutlined />}
                                    onClick={() => handleDisconnectIntegration('github', 'GitHub')}
                                >
                                    Отключить
                                </Button>
                            </Space>
                        ) : (
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => handleConnectIntegration('github', 'GitHub')}
                                style={{ background: '#1B1C21', borderColor: '#1B1C21' }}
                            >
                                Подключить
                            </Button>
                        )}
                    </div>
                </Card>
            </Space>
        </div>
    );

    const renderTeam = () => {
        const columns: ColumnsType<EmployerTeamMember> = [
            {
                title: 'Сотрудник',
                key: 'name',
                render: (_, record) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar
                            size={36}
                            style={{
                                backgroundColor: TEAM_ROLE_COLORS[record.role],
                                fontSize: 14,
                                fontWeight: 700,
                            }}
                        >
                            {record.name
                                .split(' ')
                                .map((n) => n.charAt(0))
                                .join('')}
                        </Avatar>
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 13 }}>
                                {record.name}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.email}
                            </Text>
                        </div>
                    </div>
                ),
            },
            {
                title: 'Роль',
                key: 'role',
                width: 220,
                render: (_, record) => (
                    <Select
                        value={record.role}
                        onChange={(value) => handleChangeRole(record.id, value)}
                        disabled={record.role === 'owner'}
                        style={{ width: '100%' }}
                    >
                        {Object.entries(TEAM_ROLE_LABELS).map(([key, label]) => (
                            <Select.Option key={key} value={key}>
                                <div>
                                    <Tag
                                        color={TEAM_ROLE_COLORS[key as EmployerTeamMember['role']]}
                                        style={{ fontSize: 11, margin: 0 }}
                                    >
                                        {label}
                                    </Tag>
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                ),
            },
            {
                title: 'Присоединился',
                dataIndex: 'joinedAt',
                key: 'joinedAt',
                width: 140,
                render: (date: string) => (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(date).format('D MMM YYYY')}
                    </Text>
                ),
            },
            {
                title: '',
                key: 'actions',
                width: 60,
                align: 'center',
                render: (_, record) =>
                    record.role !== 'owner' ? (
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => setRemoveMemberModal(record)}
                        />
                    ) : (
                        <Tag color="#f5222d" style={{ fontSize: 10, margin: 0 }}>
                            Владелец
                        </Tag>
                    ),
            },
        ];

        return (
            <div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    <div>
                        <Title level={4} style={{ margin: 0 }}>
                            <TeamOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            Команда
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setInviteModalOpen(true)}
                        style={{ background: '#402FFF', borderColor: '#402FFF' }}
                    >
                        Пригласить сотрудника
                    </Button>
                </div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    Управляйте доступом сотрудников к системе подбора
                </Text>

                {/* Описание ролей */}
                <Card size="small" style={{ marginBottom: 24 }}>
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <KeyOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Роли и права доступа
                    </Title>
                    <Row gutter={[16, 12]}>
                        {Object.entries(TEAM_ROLE_DESCRIPTIONS).map(([key, desc]) => (
                            <Col xs={24} sm={12} key={key}>
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        background: '#fafafa',
                                        borderRadius: 8,
                                        borderLeft: `3px solid ${TEAM_ROLE_COLORS[key as EmployerTeamMember['role']]}`,
                                    }}
                                >
                                    <Tag
                                        color={TEAM_ROLE_COLORS[key as EmployerTeamMember['role']]}
                                        style={{ fontSize: 12, marginBottom: 4 }}
                                    >
                                        {TEAM_ROLE_LABELS[key as EmployerTeamMember['role']]}
                                    </Tag>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{desc}</div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Card>

                {/* Таблица сотрудников */}
                <Card
                    size="small"
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <GroupOutlined style={{ color: '#402FFF' }} />
                            <span>Сотрудники</span>
                            <Tag color="#402FFF" style={{ marginLeft: 8 }}>
                                {settings.team.length}
                            </Tag>
                        </div>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={settings.team}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                    />
                </Card>
            </div>
        );
    };

    const renderAccount = () => (
        <div>
            <Title level={4} style={{ marginBottom: 8 }}>
                <UserOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Аккаунт
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Управление учётной записью и данными компании
            </Text>

            {/* Информация об аккаунте */}
            <Card title="Информация об аккаунте" size="small" style={{ marginBottom: 24 }}>
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="Имя">
                        <Text strong>
                            {firstName} {lastName}
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Логин">
                        <Text code>{username}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        <Text>{email || 'Не указан'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Роль">
                        <Tag color="#EC1D35">Работодатель</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Авторизация">
                        <Tag color="#52c41a" icon={<SafetyCertificateOutlined />}>
                            Keycloak SSO
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
                <Alert
                    message="Данные аккаунта управляются через единую систему авторизации"
                    description="Для изменения имени, email или пароля перейдите в профиль Keycloak."
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                    action={
                        <Button
                            size="small"
                            type="link"
                            onClick={() =>
                                window.open('http://kc.localhost:8081/realms/csh/account', '_blank')
                            }
                        >
                            Открыть профиль Keycloak →
                        </Button>
                    }
                />
            </Card>

            {/* Экспорт данных */}
            <Card title="Экспорт данных" size="small" style={{ marginBottom: 24 }}>
                <Paragraph style={{ marginBottom: 16 }}>
                    Вы можете скачать копию всех данных компании: профиль, вакансии, отклики
                    кандидатов, историю переписок и тестовых заданий.
                </Paragraph>
                <Space>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() =>
                            message.info('Экспорт данных будет доступен в следующем обновлении')
                        }
                    >
                        Скачать данные компании (JSON)
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() =>
                            message.info('Экспорт в PDF будет доступен в следующем обновлении')
                        }
                    >
                        Отчёт по вакансиям (PDF)
                    </Button>
                </Space>
            </Card>

            {/* Опасная зона */}
            <Card
                title={
                    <Text type="danger" strong>
                        <CloseCircleOutlined style={{ marginRight: 8 }} />
                        Опасная зона
                    </Text>
                }
                size="small"
                style={{ borderColor: '#ffccc7' }}
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
                    <div>
                        <Text strong style={{ display: 'block', color: '#f5222d' }}>
                            Удалить аккаунт компании
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Все вакансии, отклики, данные команды и профиля будут безвозвратно удалены
                        </Text>
                    </div>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        Удалить аккаунт
                    </Button>
                </div>
            </Card>
        </div>
    );

    // ========================================================================
    // 🎨 Основной рендер
    // ========================================================================
    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <SettingOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>
                        Настройки
                    </Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Управляйте уведомлениями, вакансиями, приватностью, интеграциями и командой
                </Text>
            </div>

            <Row gutter={24}>
                {/* Левая навигация */}
                <Col xs={24} md={6}>
                    <Card size="small" style={{ position: 'sticky', top: 24 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size={4}>
                            {sections.map((section) => (
                                <Button
                                    key={section.key}
                                    type={activeSection === section.key ? 'primary' : 'text'}
                                    icon={section.icon}
                                    onClick={() => setActiveSection(section.key)}
                                    block
                                    style={{
                                        justifyContent: 'flex-start',
                                        height: 44,
                                        background:
                                            activeSection === section.key ? '#402FFF' : 'transparent',
                                        borderColor:
                                            activeSection === section.key ? '#402FFF' : 'transparent',
                                        color:
                                            activeSection === section.key ? '#fff' : '#1B1C21',
                                    }}
                                >
                                    {section.label}
                                </Button>
                            ))}
                        </Space>
                    </Card>
                </Col>

                {/* Правая часть: контент */}
                <Col xs={24} md={18}>
                    <Card>
                        {activeSection === 'notifications' && renderNotifications()}
                        {activeSection === 'vacancies' && renderVacancies()}
                        {activeSection === 'privacy' && renderPrivacy()}
                        {activeSection === 'integrations' && renderIntegrations()}
                        {activeSection === 'team' && renderTeam()}
                        {activeSection === 'account' && renderAccount()}

                        {/* Кнопка сохранения */}
                        {(activeSection === 'notifications' ||
                            activeSection === 'vacancies' ||
                            activeSection === 'privacy') && (
                                <>
                                    <Divider />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                        <Button onClick={() => setSettings(MOCK_EMPLOYER_SETTINGS)}>
                                            Сбросить
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            loading={isSaving}
                                            onClick={handleSave}
                                            style={{ background: '#402FFF', borderColor: '#402FFF' }}
                                        >
                                            Сохранить настройки
                                        </Button>
                                    </div>
                                </>
                            )}
                    </Card>
                </Col>
            </Row>

            {/* Модалка удаления аккаунта */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DeleteOutlined style={{ color: '#f5222d' }} />
                        <span style={{ color: '#f5222d' }}>Удаление аккаунта компании</span>
                    </div>
                }
                open={deleteModalOpen}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmText('');
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setDeleteModalOpen(false);
                            setDeleteConfirmText('');
                        }}
                    >
                        Отмена
                    </Button>,
                    <Button
                        key="delete"
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'УДАЛИТЬ'}
                    >
                        Удалить навсегда
                    </Button>,
                ]}
            >
                <Alert
                    message="Это действие необратимо!"
                    description="Все данные компании будут безвозвратно удалены: профиль, вакансии, отклики, история переписок и тестовых заданий, данные команды. Восстановить аккаунт будет невозможно."
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    Для подтверждения введите слово <Text code style={{ color: '#f5222d' }}>УДАЛИТЬ</Text>:
                </Text>
                <Input
                    placeholder="УДАЛИТЬ"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    status={deleteConfirmText && deleteConfirmText !== 'УДАЛИТЬ' ? 'error' : undefined}
                />
            </Modal>

            {/* Модалка приглашения сотрудника */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserAddOutlined style={{ color: '#402FFF' }} />
                        <span>Пригласить сотрудника</span>
                    </div>
                }
                open={inviteModalOpen}
                onOk={handleInviteMember}
                onCancel={() => {
                    setInviteModalOpen(false);
                    setInviteEmail('');
                    setInviteRole('viewer');
                }}
                okText="Отправить приглашение"
                cancelText="Отмена"
                okButtonProps={{ style: { background: '#402FFF', borderColor: '#402FFF' } }}
            >
                <div style={{ marginTop: 16 }}>
                    <Alert
                        message="Сотрудник получит приглашение на email"
                        description="После регистрации он сможет войти в систему с назначенной ролью."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Email сотрудника *</Text>
                        </div>
                        <Input
                            placeholder="employee@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            prefix={<MailOutlined style={{ color: '#C8C9CA' }} />}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Роль *</Text>
                        </div>
                        <Select
                            value={inviteRole}
                            onChange={setInviteRole}
                            style={{ width: '100%' }}
                        >
                            {Object.entries(TEAM_ROLE_LABELS)
                                .filter(([key]) => key !== 'owner')
                                .map(([key, label]) => (
                                    <Select.Option key={key} value={key}>
                                        <div>
                                            <Tag
                                                color={TEAM_ROLE_COLORS[key as EmployerTeamMember['role']]}
                                                style={{ fontSize: 11, marginRight: 8 }}
                                            >
                                                {label}
                                            </Tag>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {TEAM_ROLE_DESCRIPTIONS[key as EmployerTeamMember['role']]}
                                            </Text>
                                        </div>
                                    </Select.Option>
                                ))}
                        </Select>
                    </div>
                </div>
            </Modal>

            {/* Модалка удаления сотрудника */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DeleteOutlined style={{ color: '#f5222d' }} />
                        <span>Удалить сотрудника из команды</span>
                    </div>
                }
                open={!!removeMemberModal}
                onOk={handleRemoveMember}
                onCancel={() => setRemoveMemberModal(null)}
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
            >
                {removeMemberModal && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={`Вы удаляете ${removeMemberModal.name} из команды`}
                            description="Сотрудник потеряет доступ к системе. Все его действия в журнале останутся."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Имя">
                                {removeMemberModal.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {removeMemberModal.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Роль">
                                <Tag color={TEAM_ROLE_COLORS[removeMemberModal.role]}>
                                    {TEAM_ROLE_LABELS[removeMemberModal.role]}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployerSettings;