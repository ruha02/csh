import React, { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Spin, Alert } from 'antd';
import api from '../api/axios';

const { Title, Paragraph } = Typography;

interface Stats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Токен автоматически добавляется через интерцептор
                const response = await api.get('/stats');
                setStats(response.data);
            } catch (err) {
                setError('Не удалось загрузить статистику');
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <Alert message={error} type="error" showIcon />;
    }

    return (
        <div>
            <Title level={2}>Рабочее место</Title>
            <Paragraph>Статистика ваших предложений</Paragraph>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} md={8}>
                    <Card title="Непрочитаных" bordered={false} style={{ background: '#EDEDED' }}>
                        <Title level={1} style={{ margin: 0, color: '#402FFF' }}>
                            {stats?.totalTasks || 0}
                        </Title>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Ожидают ответа" bordered={false} style={{ background: '#EDEDED' }}>
                        <Title level={1} style={{ margin: 0, color: '#52c41a' }}>
                            {stats?.completedTasks || 0}
                        </Title>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Отказаных" bordered={false} style={{ background: '#EDEDED' }}>
                        <Title level={1} style={{ margin: 0, color: '#EC1D35' }}>
                            {stats?.pendingTasks || 0}
                        </Title>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;