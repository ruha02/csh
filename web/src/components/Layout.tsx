import React from 'react';
import { Layout, Menu, Typography, Button, Avatar, Tag } from 'antd';
import { LogoutOutlined, UserOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
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

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Главная' },
        { key: '/settings', icon: <SettingOutlined />, label: 'Настройки' },
    ];

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
                {/* Логотип и название */}
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
                    items={menuItems}
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

            {/* Контентная область */}
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