import {
    BellOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    DisconnectOutlined,
    DownloadOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    GithubOutlined,
    GlobalOutlined,
    LinkOutlined,
    LockOutlined,
    MailOutlined,
    RobotOutlined,
    SafetyCertificateOutlined,
    SaveOutlined,
    SendOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useKeycloak } from '@react-keycloak/web';
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Input,
    Modal,
    Radio,
    Row,
    Space,
    Switch,
    Tag,
    Typography,
    message,
} from 'antd';
import React, { useState } from 'react';
import { MOCK_CANDIDATE_SETTINGS, type CandidateSettings } from '../../mocks';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 🎨 Компонент страницы
// ============================================================================
const CandidateSettings: React.FC = () => {
    const { keycloak } = useKeycloak();
    const firstName = keycloak.tokenParsed?.given_name || 'Пользователь';
    const lastName = keycloak.tokenParsed?.family_name || '';
    const email = keycloak.tokenParsed?.email || '';
    const username = keycloak.tokenParsed?.preferred_username || '';

    const [settings, setSettings] = useState<CandidateSettings>(MOCK_CANDIDATE_SETTINGS);
    const [activeSection, setActiveSection] = useState<string>('notifications');
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // ========================================================================
    // 💾 Сохранение
    // ========================================================================
    const handleSave = async () => {
        setIsSaving(true);
        // Имитация API-запроса
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        message.success('Настройки сохранены');
    };

    // ========================================================================
    // 🔔 Уведомления
    // ========================================================================
    const toggleChannel = (channel: keyof CandidateSettings['notifications']['channels']) => {
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

    const toggleEvent = (event: keyof CandidateSettings['notifications']['events']) => {
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
    // 🔒 Приватность
    // ========================================================================
    const setProfileVisibility = (value: CandidateSettings['privacy']['profileVisibility']) => {
        setSettings((prev) => ({
            ...prev,
            privacy: { ...prev.privacy, profileVisibility: value },
        }));
    };

    const togglePrivacy = (key: 'hideCurrentEmployer' | 'showTestResults' | 'showFspResults') => {
        setSettings((prev) => ({
            ...prev,
            privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
        }));
    };

    // ========================================================================
    // 🔗 Интеграции
    // ========================================================================
    const handleConnectIntegration = (
        platform: keyof CandidateSettings['integrations'],
        platformName: string
    ) => {
        setSettings((prev) => ({
            ...prev,
            integrations: {
                ...prev.integrations,
                [platform]: {
                    connected: true,
                    username: platform === 'github' ? 'ivanov-dev' : platform === 'telegram' ? '@ivanov_dev' : 'ivanov',
                },
            },
        }));
        message.success(`${platformName} успешно подключён`);
    };

    const handleDisconnectIntegration = (
        platform: keyof CandidateSettings['integrations'],
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
                        [platform]: { connected: false, username: undefined },
                    },
                }));
                message.info(`${platformName} отключён`);
            },
        });
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
        { key: 'privacy', icon: <LockOutlined />, label: 'Приватность' },
        { key: 'integrations', icon: <LinkOutlined />, label: 'Интеграции' },
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
                Настройте, какие уведомления и каким способом вы хотите получать
            </Text>

            {/* Каналы */}
            <Card
                title="Каналы уведомлений"
                size="small"
                style={{ marginBottom: 24 }}
            >
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
                                    <Text type="secondary" style={{ fontSize: 12 }}>{email || 'не указан'}</Text>
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
                            key: 'newVacancies' as const,
                            label: 'Новые подходящие вакансии',
                            desc: 'Когда появляются вакансии, соответствующие вашим навыкам и грейду',
                            icon: <GlobalOutlined style={{ color: '#402FFF' }} />,
                        },
                        {
                            key: 'responseViewed' as const,
                            label: 'Просмотр отклика работодателем',
                            desc: 'Когда работодатель открывает ваш отклик на вакансию',
                            icon: <EyeOutlined style={{ color: '#722ed1' }} />,
                        },
                        {
                            key: 'newTask' as const,
                            label: 'Новое тестовое задание',
                            desc: 'Когда работодатель или ИИ назначает вам тестовое задание',
                            icon: <RobotOutlined style={{ color: '#fa8c16' }} />,
                        },
                        {
                            key: 'taskFeedback' as const,
                            label: 'Обратная связь по заданию',
                            desc: 'Когда работодатель оценивает ваше тестовое задание',
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        },
                        {
                            key: 'newInvitation' as const,
                            label: 'Новое приглашение',
                            desc: 'Когда работодатель приглашает вас на вакансию',
                            icon: <SendOutlined style={{ color: '#402FFF' }} />,
                        },
                        {
                            key: 'invitationExpiring' as const,
                            label: 'Истечение срока приглашения',
                            desc: 'Напоминание за 2 дня до истечения срока приглашения',
                            icon: <BellOutlined style={{ color: '#f5222d' }} />,
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

    const renderPrivacy = () => (
        <div>
            <Title level={4} style={{ marginBottom: 8 }}>
                <LockOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Приватность
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Управляйте видимостью вашего профиля и данных для работодателей
            </Text>

            {/* Видимость профиля */}
            <Card title="Видимость профиля" size="small" style={{ marginBottom: 24 }}>
                <Radio.Group
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div
                            style={{
                                padding: '16px',
                                borderRadius: 8,
                                border: `2px solid ${settings.privacy.profileVisibility === 'all' ? '#402FFF' : '#f0f0f0'}`,
                                background: settings.privacy.profileVisibility === 'all' ? '#f0f0ff' : '#fff',
                                cursor: 'pointer',
                            }}
                            onClick={() => setProfileVisibility('all')}
                        >
                            <Radio value="all">
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                        <EyeOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                                        Виден всем работодателям
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Любой работодатель на платформе может найти ваш профиль и пригласить на вакансию
                                    </Text>
                                </div>
                            </Radio>
                        </div>
                        <div
                            style={{
                                padding: '16px',
                                borderRadius: 8,
                                border: `2px solid ${settings.privacy.profileVisibility === 'applied' ? '#402FFF' : '#f0f0f0'}`,
                                background: settings.privacy.profileVisibility === 'applied' ? '#f0f0ff' : '#fff',
                                cursor: 'pointer',
                            }}
                            onClick={() => setProfileVisibility('applied')}
                        >
                            <Radio value="applied">
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                        <SendOutlined style={{ marginRight: 6, color: '#faad14' }} />
                                        Виден только тем, кому я откликнулся
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Ваш профиль увидят только работодатели, на чьи вакансии вы отправили отклик
                                    </Text>
                                </div>
                            </Radio>
                        </div>
                        <div
                            style={{
                                padding: '16px',
                                borderRadius: 8,
                                border: `2px solid ${settings.privacy.profileVisibility === 'hidden' ? '#402FFF' : '#f0f0f0'}`,
                                background: settings.privacy.profileVisibility === 'hidden' ? '#f0f0ff' : '#fff',
                                cursor: 'pointer',
                            }}
                            onClick={() => setProfileVisibility('hidden')}
                        >
                            <Radio value="hidden">
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                        <EyeInvisibleOutlined style={{ marginRight: 6, color: '#f5222d' }} />
                                        Скрыт (Инкогнито)
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Ваш профиль не виден никому. Вы можете откликаться на вакансии, но работодатели не смогут найти вас сами
                                    </Text>
                                </div>
                            </Radio>
                        </div>
                    </Space>
                </Radio.Group>
            </Card>

            {/* Дополнительные настройки приватности */}
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
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ display: 'block' }}>
                                Скрыть текущего работодателя
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Название вашей текущей компании не будет отображаться в профиле
                            </Text>
                        </div>
                        <Switch
                            checked={settings.privacy.hideCurrentEmployer}
                            onChange={() => togglePrivacy('hideCurrentEmployer')}
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
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ display: 'block' }}>
                                Показывать результаты тестов
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Работодатели смогут видеть ваши результаты тестирования по навыкам
                            </Text>
                        </div>
                        <Switch
                            checked={settings.privacy.showTestResults}
                            onChange={() => togglePrivacy('showTestResults')}
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
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ display: 'block' }}>
                                Показывать результаты ФСП
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Работодатели смогут видеть ваши достижения в Федерации спортивного программирования
                            </Text>
                        </div>
                        <Switch
                            checked={settings.privacy.showFspResults}
                            onChange={() => togglePrivacy('showFspResults')}
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
                Подключите внешние сервисы для расширения профиля и получения уведомлений
            </Text>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* GitHub */}
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
                                <Text strong style={{ fontSize: 16, display: 'block' }}>GitHub</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    {settings.integrations.github.connected
                                        ? `Подключён как ${settings.integrations.github.username}`
                                        : 'Покажите работодателям ваш код и активность'}
                                </Text>
                            </div>
                        </div>
                        {settings.integrations.github.connected ? (
                            <Space>
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>Подключён</Tag>
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
                                <Text strong style={{ fontSize: 16, display: 'block' }}>Telegram</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    {settings.integrations.telegram.connected
                                        ? `Подключён как ${settings.integrations.telegram.username}`
                                        : 'Получайте мгновенные уведомления о вакансиях и откликах'}
                                </Text>
                            </div>
                        </div>
                        {settings.integrations.telegram.connected ? (
                            <Space>
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>Подключён</Tag>
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

                {/* Habr */}
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
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    background: '#65A3BE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    fontFamily: "'Unbounded', sans-serif",
                                }}
                            >
                                H
                            </div>
                            <div>
                                <Text strong style={{ fontSize: 16, display: 'block' }}>Habr Career</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    {settings.integrations.habr.connected
                                        ? `Подключён как ${settings.integrations.habr.username}`
                                        : 'Импортируйте данные из вашего профиля на Habr Career'}
                                </Text>
                            </div>
                        </div>
                        {settings.integrations.habr.connected ? (
                            <Space>
                                <Tag color="#52c41a" icon={<CheckCircleOutlined />}>Подключён</Tag>
                                <Button
                                    danger
                                    type="text"
                                    icon={<DisconnectOutlined />}
                                    onClick={() => handleDisconnectIntegration('habr', 'Habr Career')}
                                >
                                    Отключить
                                </Button>
                            </Space>
                        ) : (
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => handleConnectIntegration('habr', 'Habr Career')}
                                style={{ background: '#65A3BE', borderColor: '#65A3BE' }}
                            >
                                Подключить
                            </Button>
                        )}
                    </div>
                </Card>
            </Space>
        </div>
    );

    const renderAccount = () => (
        <div>
            <Title level={4} style={{ marginBottom: 8 }}>
                <UserOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                Аккаунт
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Управление учётной записью и данными
            </Text>

            {/* Информация об аккаунте */}
            <Card title="Информация об аккаунте" size="small" style={{ marginBottom: 24 }}>
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="Имя">
                        <Text strong>{firstName} {lastName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Логин">
                        <Text code>{username}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        <Text>{email || 'Не указан'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Роль">
                        <Tag color="#402FFF">Кандидат</Tag>
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
                            onClick={() => window.open('http://kc.localhost:8081/realms/csh/account', '_blank')}
                        >
                            Открыть профиль Keycloak →
                        </Button>
                    }
                />
            </Card>

            {/* Экспорт данных */}
            <Card title="Экспорт данных" size="small" style={{ marginBottom: 24 }}>
                <Paragraph style={{ marginBottom: 16 }}>
                    Вы можете скачать копию всех ваших данных: анкету, резюме, результаты тестов,
                    историю откликов и тестовых заданий.
                </Paragraph>
                <Space>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => message.info('Экспорт данных будет доступен в следующем обновлении')}
                    >
                        Скачать мои данные (JSON)
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => message.info('Экспорт в PDF будет доступен в следующем обновлении')}
                    >
                        Скачать в PDF
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
                            Удалить аккаунт
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Все ваши данные, резюме, результаты тестов и история откликов будут безвозвратно удалены
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
                    <Title level={2} style={{ margin: 0 }}>Настройки</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Управляйте уведомлениями, приватностью, интеграциями и аккаунтом
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
                                        background: activeSection === section.key ? '#402FFF' : 'transparent',
                                        borderColor: activeSection === section.key ? '#402FFF' : 'transparent',
                                        color: activeSection === section.key ? '#fff' : '#1B1C21',
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
                        {activeSection === 'privacy' && renderPrivacy()}
                        {activeSection === 'integrations' && renderIntegrations()}
                        {activeSection === 'account' && renderAccount()}

                        {/* Кнопка сохранения (для уведомлений и приватности) */}
                        {(activeSection === 'notifications' || activeSection === 'privacy') && (
                            <>
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <Button
                                        onClick={() => setSettings(MOCK_CANDIDATE_SETTINGS)}
                                    >
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
                        <span style={{ color: '#f5222d' }}>Удаление аккаунта</span>
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
                    description="Все ваши данные будут безвозвратно удалены: анкета, резюме, результаты тестов, история откликов и приглашений. Восстановить аккаунт будет невозможно."
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
        </div>
    );
};

export default CandidateSettings;