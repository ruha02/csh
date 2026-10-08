import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const CandidateVacancies: React.FC = () => {
    return (
        <div>
            <Title level={2}>Вакансии</Title>
            <Card>
                <Paragraph>Здесь будет список доступных вакансий.</Paragraph>
            </Card>
        </div>
    );
};

export default CandidateVacancies;