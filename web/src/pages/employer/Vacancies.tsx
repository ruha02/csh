import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const EmployerVacancies: React.FC = () => {
    return (
        <div>
            <Title level={2}>Вакансии компании</Title>
            <Card>
                <Paragraph>Здесь будет управление вакансиями компании.</Paragraph>
            </Card>
        </div>
    );
};

export default EmployerVacancies;