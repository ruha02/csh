import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const EmployerResponses: React.FC = () => {
    return (
        <div>
            <Title level={2}>Отклики</Title>
            <Card>
                <Paragraph>Здесь будут отклики кандидатов на вакансии.</Paragraph>
            </Card>
        </div>
    );
};

export default EmployerResponses;