import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const EmployerCandidates: React.FC = () => {
    return (
        <div>
            <Title level={2}>Подбор кандидатов</Title>
            <Card>
                <Paragraph>Здесь будет поиск и подбор кандидатов.</Paragraph>
            </Card>
        </div>
    );
};

export default EmployerCandidates;