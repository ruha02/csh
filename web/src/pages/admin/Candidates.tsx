import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const AdminCandidates: React.FC = () => {
    return (
        <div>
            <Title level={2}>Кандидаты</Title>
            <Card>
                <Paragraph>Здесь будет управление кандидатами системы.</Paragraph>
            </Card>
        </div>
    );
};

export default AdminCandidates;