import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const CandidateSettings: React.FC = () => {
    return (
        <div>
            <Title level={2}>Настройки</Title>
            <Card>
                <Paragraph>Здесь будут настройки профиля кандидата.</Paragraph>
            </Card>
        </div>
    );
};

export default CandidateSettings;