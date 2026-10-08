import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const EmployerCompanyProfile: React.FC = () => {
    return (
        <div>
            <Title level={2}>Профиль компании</Title>
            <Card>
                <Paragraph>Здесь будет форма редактирования профиля компании.</Paragraph>
            </Card>
        </div>
    );
};

export default EmployerCompanyProfile;