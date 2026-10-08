import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const CandidateTests: React.FC = () => {
    return (
        <div>
            <Title level={2}>Тесты</Title>
            <Card>
                <Paragraph>Здесь будет список доступных тестов и результаты.</Paragraph>
            </Card>
        </div>
    );
};

export default CandidateTests;