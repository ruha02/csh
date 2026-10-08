import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const CandidateInvitations: React.FC = () => {
    return (
        <div>
            <Title level={2}>Приглашения</Title>
            <Card>
                <Paragraph>Здесь будут приглашения от работодателей.</Paragraph>
            </Card>
        </div>
    );
};

export default CandidateInvitations;