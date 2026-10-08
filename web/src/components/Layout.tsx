import {
    BankOutlined,
    CheckSquareOutlined,
    DatabaseOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    InboxOutlined,
    LogoutOutlined,
    MailOutlined,
    SearchOutlined,
    SettingOutlined,
    StarOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useKeycloak } from '@react-keycloak/web';
import { Avatar, Button, Layout, Menu, Tag, Typography } from 'antd';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getRoleDescription } from '../constants/roles';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { keycloak, initialized } = useKeycloak();

    const firstName = keycloak.tokenParsed?.given_name || 'Пользователь';
    const lastName = keycloak.tokenParsed?.family_name || '';
    const roles: string[] = keycloak.tokenParsed?.realm_access?.roles || [];
    const primaryRole = roles[0] || '';
    const roleDescription = getRoleDescription(primaryRole);
    const lastNameInitial = lastName ? `${lastName.charAt(0)}.` : '';
    const displayName = `${firstName} ${lastNameInitial}`.trim();

    const handleLogout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    // Меню в зависимости от роли
    const getMenuItems = () => {
        if (roles.includes('candidats')) {
            return [
                { key: '/candidate/profile', icon: <FileTextOutlined />, label: 'Анкета' },
                { key: '/candidate/skills', icon: <StarOutlined />, label: 'Навыки' },
                { key: '/candidate/tests', icon: <ExperimentOutlined />, label: 'Тесты' },
                { key: '/candidate/tasks', icon: <CheckSquareOutlined />, label: 'Задания' },
                { key: '/candidate/vacancies', icon: <BankOutlined />, label: 'Вакансии' },
                { key: '/candidate/invitations', icon: <MailOutlined />, label: 'Приглашения' },
                { key: '/candidate/settings', icon: <SettingOutlined />, label: 'Настройки' },
            ];
        }

        if (roles.includes('employers')) {
            return [
                { key: '/employer/company-profile', icon: <TeamOutlined />, label: 'Профиль компании' },
                { key: '/employer/vacancies', icon: <BankOutlined />, label: 'Вакансии' },
                { key: '/employer/candidates', icon: <SearchOutlined />, label: 'Подбор кандидатов' },
                { key: '/employer/responses', icon: <InboxOutlined />, label: 'Отклики' },
                { key: '/employer/settings', icon: <SettingOutlined />, label: 'Настройки' },
            ];
        }

        if (roles.includes('admins')) {
            return [
                { key: '/admin/candidates', icon: <UserOutlined />, label: 'Кандидаты' },
                { key: '/admin/employers', icon: <TeamOutlined />, label: 'Работодатели' },
                { key: '/admin/dictionaries', icon: <DatabaseOutlined />, label: 'Справочники' },
            ];
        }

        return [];
    };

    if (!initialized) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#1B1C21'
            }}>
                <div style={{ color: '#EDEDED', fontSize: '18px' }}>Загрузка системы...</div>
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        background: '#EC1D35',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontFamily: "'Unbounded', sans-serif"
                    }}>
                        CSH
                    </div>
                    <Title level={4} style={{ color: '#EDEDED', margin: 0 }}>
                        Cyber Sport Hunter
                    </Title>
                </div>

                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    onClick={({ key }) => navigate(key)}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        background: 'transparent',
                        borderBottom: 'none'
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ color: '#EDEDED', fontWeight: 700, fontSize: '14px' }}>
                            {displayName}
                        </Text>
                        <Tag color="#402FFF" style={{ margin: 0, marginTop: '2px', fontSize: '11px' }}>
                            {roleDescription}
                        </Tag>
                    </div>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#402FFF' }} />
                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        Выход
                    </Button>
                </div>
            </Header>

            <Content style={{
                padding: '24px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 8,
                    minHeight: 'calc(100vh - 184px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                <Text style={{ color: '#C8C9CA', fontFamily: "'JetBrains Mono', monospace" }}>
                    © Good Genius 2026
                </Text>
            </Footer>
        </Layout>
    );
};

export default AppLayout;