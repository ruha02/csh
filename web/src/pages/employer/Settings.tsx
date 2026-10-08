import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const EmployerSettings: React.FC = () => {
    return (
        <div>
            <Title level={2}>Настройки</Title>
            <Card>
                <Paragraph>Здесь будут настройки профиля работодателя.</Paragraph>
            </Card>
        </div>
    );
};

export default EmployerSettings;