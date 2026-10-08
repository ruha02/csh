import { useKeycloak } from '@react-keycloak/web';
import { Result, Spin } from 'antd';
import React from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
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
    const hasRole = allowedRoles.some(role => roles.includes(role));

    if (!hasRole) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="Извините, у вас нет доступа к этой странице"
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;