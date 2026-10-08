import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const AdminDictionaries: React.FC = () => {
    return (
        <div>
            <Title level={2}>Справочники</Title>
            <Card>
                <Paragraph>Здесь будет управление справочниками (навыки, тесты, задания).</Paragraph>
            </Card>
        </div>
    );
};

export default AdminDictionaries;