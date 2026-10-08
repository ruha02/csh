import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const CandidateTasks: React.FC = () => {
    return (
        <div>
            <Title level={2}>Тестовые задания</Title>
            <Card>
                <Paragraph>Здесь будут тестовые задания от работодателей.</Paragraph>
            </Card>
        </div>
    );
};

export default CandidateTasks;