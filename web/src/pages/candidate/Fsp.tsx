import {
    BarChartOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    LockOutlined,
    TeamOutlined,
    TrophyOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Card,
    Col,
    Divider,
    Empty,
    Row,
    Statistic,
    Tag,
    Timeline,
    Typography,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React from 'react';
import {
    MOCK_PARTICIPATIONS,
    PARTICIPATION_TYPE_COLORS,
    PARTICIPATION_TYPE_LABELS,
    RESULT_CONFIG,
    TEAM_ROLE_COLORS,
    TEAM_ROLE_ICONS,
    TEAM_ROLE_LABELS,
    type FspParticipation,
    type TeamRole,
} from '../../mocks';

dayjs.locale('ru');
const { Title, Text, Paragraph } = Typography;

const calculateStats = (participations: FspParticipation[]) => {
    const total = participations.length;
    const firstPlaces = participations.filter((p) => p.result === 'first_place').length;
    const secondPlaces = participations.filter((p) => p.result === 'second_place').length;
    const thirdPlaces = participations.filter((p) => p.result === 'third_place').length;
    const totalPodium = firstPlaces + secondPlaces + thirdPlaces;
    const teamCount = participations.filter((p) => p.participationType === 'team').length;

    const roleCounts: Record<string, number> = {};
    participations.forEach((p) => {
        if (p.participationType === 'team' && p.teamRole) {
            roleCounts[p.teamRole] = (roleCounts[p.teamRole] || 0) + 1;
        }
    });
    const topRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0];

    return { total, firstPlaces, secondPlaces, thirdPlaces, totalPodium, teamCount, topRole: topRole ? (topRole[0] as TeamRole) : undefined };
};

const CandidateFsp: React.FC = () => {
    const participations = MOCK_PARTICIPATIONS;
    const stats = calculateStats(participations);
    const sortedParticipations = [...participations].sort((a, b) => dayjs(b.eventDate).diff(dayjs(a.eventDate)));

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <TrophyOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>Федерация спортивного программирования</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    История ваших выступлений в соревнованиях, олимпиадах и хакатонах
                </Text>
            </div>
            <Alert
                message="Данные доступны только для чтения"
                description="Информация об участиях поступает из единой базы Федерации спортивного программирования и не может быть изменена пользователем."
                type="info"
                showIcon
                icon={<LockOutlined />}
                style={{ marginBottom: 24 }}
            />
            {participations.length === 0 ? (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div style={{ padding: '24px 0' }}>
                                <Text style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                    У вас пока нет участий в мероприятиях ФСП
                                </Text>
                                <Text type="secondary">
                                    Как только вы примете участие в олимпиаде, хакатоне или другом соревновании,
                                    информация о нём появится здесь автоматически.
                                </Text>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BarChartOutlined style={{ color: '#402FFF' }} />
                                <span>Общая статистика</span>
                            </div>
                        }
                        style={{ marginBottom: 24 }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic title="Всего участий" value={stats.total} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#402FFF' }} />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic title="Призовых мест" value={stats.totalPodium} prefix={<TrophyOutlined />} valueStyle={{ color: '#faad14' }} />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic title="🥇 Золото" value={stats.firstPlaces} valueStyle={{ color: '#faad14', fontSize: 20 }} />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic title="🥈 Серебро" value={stats.secondPlaces} valueStyle={{ color: '#8c8c8c', fontSize: 20 }} />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic title="🥉 Бронза" value={stats.thirdPlaces} valueStyle={{ color: '#d48806', fontSize: 20 }} />
                            </Col>
                            <Col xs={12} sm={8} md={4}>
                                <Statistic title="Командных" value={stats.teamCount} prefix={<TeamOutlined />} valueStyle={{ color: '#722ed1', fontSize: 20 }} />
                            </Col>
                        </Row>
                        {stats.topRole && (
                            <>
                                <Divider style={{ margin: '16px 0' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Text type="secondary">Основная роль в командах:</Text>
                                    <Tag icon={TEAM_ROLE_ICONS[stats.topRole]} color={TEAM_ROLE_COLORS[stats.topRole]} style={{ fontSize: 13, padding: '4px 12px' }}>
                                        {TEAM_ROLE_LABELS[stats.topRole]}
                                    </Tag>
                                </div>
                            </>
                        )}
                    </Card>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CalendarOutlined style={{ color: '#402FFF' }} />
                                <span>История участий</span>
                            </div>
                        }
                    >
                        <Timeline
                            items={sortedParticipations.map((participation) => {
                                const resultConfig = RESULT_CONFIG[participation.result];
                                const isTeam = participation.participationType === 'team';
                                return {
                                    color: participation.result === 'participation' ? '#402FFF' : resultConfig.color,
                                    children: (
                                        <Card
                                            size="small"
                                            style={{ background: '#F9FAFB', borderLeft: `3px solid ${resultConfig.color}`, marginBottom: 8 }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                        {resultConfig.icon}
                                                        <Text strong style={{ fontSize: 16, color: '#1B1C21' }}>{participation.eventName}</Text>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                                                        <Text style={{ color: '#6b7280', fontSize: 13 }}>
                                                            <CalendarOutlined style={{ marginRight: 4 }} />
                                                            {dayjs(participation.eventDate).format('D MMMM YYYY')}
                                                        </Text>
                                                        {participation.location && (
                                                            <Text style={{ color: '#6b7280', fontSize: 13 }}>
                                                                <EnvironmentOutlined style={{ marginRight: 4 }} />
                                                                {participation.location}
                                                            </Text>
                                                        )}
                                                    </div>
                                                </div>
                                                <Tag color={resultConfig.color} style={{ fontSize: 13, padding: '4px 12px', fontWeight: 600 }}>
                                                    {resultConfig.label}
                                                </Tag>
                                            </div>
                                            {participation.resultDetails && (
                                                <Paragraph style={{ margin: '0 0 12px 0', color: '#1B1C21', fontSize: 14, fontStyle: 'italic' }}>
                                                    {participation.resultDetails}
                                                </Paragraph>
                                            )}
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <Tag color={PARTICIPATION_TYPE_COLORS[participation.participationType]} style={{ fontSize: 12, padding: '2px 10px' }}>
                                                    {isTeam ? <TeamOutlined style={{ marginRight: 4 }} /> : <UserOutlined style={{ marginRight: 4 }} />}
                                                    {PARTICIPATION_TYPE_LABELS[participation.participationType]}
                                                </Tag>
                                                {isTeam && participation.teamName && (
                                                    <Tag color="#13c2c2" style={{ fontSize: 12, padding: '2px 10px' }}>
                                                        <TeamOutlined style={{ marginRight: 4 }} />
                                                        Команда: {participation.teamName}
                                                    </Tag>
                                                )}
                                                {isTeam && participation.teamRole && (
                                                    <Tag icon={TEAM_ROLE_ICONS[participation.teamRole]} color={TEAM_ROLE_COLORS[participation.teamRole]} style={{ fontSize: 12, padding: '2px 10px' }}>
                                                        {TEAM_ROLE_LABELS[participation.teamRole]}
                                                    </Tag>
                                                )}
                                                {participation.organizer && (
                                                    <Tag color="#8c8c8c" style={{ fontSize: 12, padding: '2px 10px' }}>{participation.organizer}</Tag>
                                                )}
                                            </div>
                                        </Card>
                                    ),
                                };
                            })}
                        />
                    </Card>
                </>
            )}
        </div>
    );
};

export default CandidateFsp;