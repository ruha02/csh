import { useKeycloak } from '@react-keycloak/web';
import { Spin } from 'antd';
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleRedirect: React.FC = () => {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#EDEDED'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    const roles: string[] = keycloak.tokenParsed?.realm_access?.roles || [];

    // Определяем первый маршрут в зависимости от роли
    if (roles.includes('candidats')) {
        return <Navigate to="/candidate/profile" replace />;
    }

    if (roles.includes('employers')) {
        return <Navigate to="/employer/company-profile" replace />;
    }

    if (roles.includes('admins')) {
        return <Navigate to="/admin/candidates" replace />;
    }

    // Если роль не определена, показываем ошибку
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#EDEDED'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ color: '#EC1D35' }}>Роль не определена</h2>
                <p>Обратитесь к администратору системы</p>
            </div>
        </div>
    );
};

export default RoleRedirect;