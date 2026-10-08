import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const CandidateSkills: React.FC = () => {
    return (
        <div>
            <Title level={2}>Мои навыки</Title>
            <Card>
                <Paragraph>Здесь будет управление навыками кандидата.</Paragraph>
            </Card>
        </div>
    );
};

export default CandidateSkills;