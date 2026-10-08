import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const AdminEmployers: React.FC = () => {
    return (
        <div>
            <Title level={2}>Работодатели</Title>
            <Card>
                <Paragraph>Здесь будет управление работодателями системы.</Paragraph>
            </Card>
        </div>
    );
};

export default AdminEmployers;