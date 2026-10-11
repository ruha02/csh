import {
    BarChartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CodeOutlined,
    ExperimentOutlined,
    LockOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useKeycloak } from '@react-keycloak/web';
import {
    Button,
    Card,
    Col,
    Empty,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import TestRunner from '../../components/TestRunner';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    MAX_ATTEMPTS,
    MOCK_SKILLS,
    MOCK_TOPIC_TESTS,
    RETAKE_PERIOD_DAYS,
    getConfidenceColor,
    getDayWord,
    getDaysUntilRetake,
    type Skill,
    type TestStatus,
    type TopicTest,
} from '../../mocks';

dayjs.locale('ru');
const { Title, Text } = Typography;

const getTestStatus = (test: TopicTest): TestStatus => {
    if (test.attempts === 0) return 'not_started';
    if (test.locked) return 'locked';
    if (test.passed) return 'passed';
    return 'in_progress';
};

const getStatusConfig = (status: TestStatus) => {
    switch (status) {
        case 'passed': return { label: 'Пройден', color: '#52c41a', icon: <CheckCircleOutlined /> };
        case 'in_progress': return { label: 'В процессе', color: '#faad14', icon: <ClockCircleOutlined /> };
        case 'locked': return { label: 'Не доступен', color: '#f5222d', icon: <LockOutlined /> };
        case 'not_started': return { label: 'Не начат', color: '#402FFF', icon: <PlayCircleOutlined /> };
        default: return { label: 'Доступен', color: '#52c41a', icon: <CheckCircleOutlined /> };
    }
};

const CandidateTests: React.FC = () => {
    const { keycloak } = useKeycloak();
    const firstName = keycloak.tokenParsed?.given_name || 'Пользователь';
    const lastName = keycloak.tokenParsed?.family_name || '';
    const userSub = keycloak.tokenParsed?.sub || 'error';

    const [skills] = useState<Skill[]>(MOCK_SKILLS);
    const [topicTests, setTopicTests] = useState<TopicTest[]>(MOCK_TOPIC_TESTS);
    const [selectedSkillId, setSelectedSkillId] = useState<number | null>(MOCK_SKILLS.length > 0 ? MOCK_SKILLS[0].id : null);
    const [filterStatus, setFilterStatus] = useState<TestStatus | 'all'>('all');
    const [isTestActive, setIsTestActive] = useState(false);
    const [currentTest, setCurrentTest] = useState<TopicTest | null>(null);

    const selectedSkill = skills.find((s) => s.id === selectedSkillId);
    const skillTests = topicTests.filter((t) => t.skillId === selectedSkillId);
    const filteredTests = skillTests.filter((test) => filterStatus === 'all' || getTestStatus(test) === filterStatus);

    const stats = {
        total: skillTests.length,
        passed: skillTests.filter((t) => t.passed).length,
        inProgress: skillTests.filter((t) => !t.passed && t.attempts > 0 && !t.locked).length,
        locked: skillTests.filter((t) => t.locked).length,
        notStarted: skillTests.filter((t) => t.attempts === 0).length,
        avgBestScore: skillTests.filter((t) => t.attempts > 0).length > 0
            ? Math.round(skillTests.filter((t) => t.attempts > 0).reduce((sum, t) => sum + t.bestScore, 0) / skillTests.filter((t) => t.attempts > 0).length)
            : 0,
    };

    const handleStartTest = (test: TopicTest) => {
        setCurrentTest(test);
        setIsTestActive(true);
    };

    const handleTestFinish = (score: number) => {
        if (!currentTest || !selectedSkill) return;
        const now = dayjs();
        const newAttempts = currentTest.attempts + 1;
        const newBestScore = Math.max(currentTest.bestScore, score);
        const isLocked = newAttempts >= MAX_ATTEMPTS;
        const nextAttemptDate = isLocked ? now.add(RETAKE_PERIOD_DAYS, 'day').format('YYYY-MM-DD') : undefined;
        const updatedTest: TopicTest = {
            ...currentTest,
            bestScore: newBestScore,
            lastScore: score,
            attempts: newAttempts,
            passed: newBestScore >= 70,
            lastAttemptDate: now.format('YYYY-MM-DD'),
            nextAttemptDate,
            locked: isLocked,
        };
        setTopicTests((prev) => prev.map((t) =>
            t.topicKey === currentTest.topicKey && t.skillId === currentTest.skillId ? updatedTest : t
        ));
        setIsTestActive(false);
        setCurrentTest(null);
    };

    const handleTestClose = () => {
        setIsTestActive(false);
        setCurrentTest(null);
    };

    const columns: ColumnsType<TopicTest> = [
        { title: 'Тема', dataIndex: 'testName', key: 'testName', render: (text: string) => <Text strong>{text}</Text> },
        {
            title: 'Статус',
            key: 'status',
            render: (_, record) => {
                const config = getStatusConfig(getTestStatus(record));
                return <Tag icon={config.icon} color={config.color} style={{ fontSize: 12, padding: '2px 10px' }}>{config.label}</Tag>;
            },
        },
        {
            title: 'Попытки',
            key: 'attempts',
            align: 'center',
            render: (_, record) => (<Text><Text strong>{record.attempts}</Text><Text type="secondary">/{MAX_ATTEMPTS}</Text></Text>),
        },
        {
            title: 'Лучший результат',
            key: 'bestScore',
            align: 'center',
            render: (_, record) => record.attempts === 0
                ? <Text type="secondary">—</Text>
                : <Text strong style={{ color: getConfidenceColor(record.bestScore), fontSize: 16 }}>{record.bestScore}%</Text>,
        },
        {
            title: 'Последняя попытка',
            key: 'lastAttempt',
            render: (_, record) => record.attempts === 0
                ? <Text type="secondary">—</Text>
                : (
                    <div>
                        <div><Text style={{ color: getConfidenceColor(record.lastScore) }}>{record.lastScore}%</Text></div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(record.lastAttemptDate).format('D MMM YYYY')}</Text>
                    </div>
                ),
        },
        {
            title: 'Действие',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                const status = getTestStatus(record);
                if (status === 'locked') {
                    const days = getDaysUntilRetake(record.nextAttemptDate);
                    const unlockDate = record.nextAttemptDate ? dayjs(record.nextAttemptDate).format('D MMMM YYYY') : '';
                    return (
                        <Tooltip title={`Доступен после ${unlockDate} (через ${days} ${getDayWord(days)})`}>
                            <Button disabled icon={<LockOutlined />}>Не доступен</Button>
                        </Tooltip>
                    );
                }
                if (status === 'passed') {
                    return (
                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleStartTest(record)} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                            Улучшить
                        </Button>
                    );
                }
                return (
                    <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleStartTest(record)} style={{ background: '#402FFF', borderColor: '#402FFF' }}>
                        {record.attempts === 0 ? 'Пройти' : 'Пересдать'}
                    </Button>
                );
            },
        },
    ];

    if (isTestActive && currentTest && selectedSkill) {
        return (
            <TestRunner
                topicKey={currentTest.topicKey}
                topicTitle={currentTest.testName}
                direction={DIRECTION_LABELS[selectedSkill.direction]}
                grade={selectedSkill.grade}
                firstName={firstName}
                lastName={lastName}
                userSub={userSub}
                onClose={handleTestClose}
                onFinish={handleTestFinish}
            />
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <ExperimentOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>Тесты</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Тестирование по конечным темам дорожной карты. По каждой теме доступно {MAX_ATTEMPTS} попытки,
                    засчитывается лучший результат. После исчерпания попыток тест блокируется на {RETAKE_PERIOD_DAYS} дней.
                </Text>
            </div>
            <Card style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8 }}><Text strong>Выберите компетенцию</Text></div>
                <Select value={selectedSkillId} onChange={setSelectedSkillId} style={{ width: '100%', maxWidth: 400 }} size="large">
                    {skills.map((skill) => (
                        <Select.Option key={skill.id} value={skill.id}>
                            <Space>
                                <CodeOutlined style={{ color: DIRECTION_COLORS[skill.direction] }} />
                                <Text strong>{skill.language}</Text>
                                <Tag color={DIRECTION_COLORS[skill.direction]} style={{ fontSize: 11, padding: '0 6px' }}>{DIRECTION_LABELS[skill.direction]}</Tag>
                                <Tag color={GRADE_COLORS[skill.grade]} style={{ fontSize: 11, padding: '0 6px' }}>{GRADE_LABELS[skill.grade]}</Tag>
                            </Space>
                        </Select.Option>
                    ))}
                </Select>
            </Card>
            {selectedSkill && (
                <>
                    <Card style={{ marginBottom: 24 }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={8} md={4}><Statistic title="Всего тем" value={stats.total} prefix={<CodeOutlined />} valueStyle={{ color: '#402FFF' }} /></Col>
                            <Col xs={12} sm={8} md={4}><Statistic title="Пройдено" value={stats.passed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
                            <Col xs={12} sm={8} md={4}><Statistic title="В процессе" value={stats.inProgress} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Col>
                            <Col xs={12} sm={8} md={4}><Statistic title="Заблокировано" value={stats.locked} prefix={<LockOutlined />} valueStyle={{ color: '#f5222d' }} /></Col>
                            <Col xs={12} sm={8} md={4}><Statistic title="Не начато" value={stats.notStarted} prefix={<PlayCircleOutlined />} valueStyle={{ color: '#8c8c8c' }} /></Col>
                            <Col xs={12} sm={8} md={4}><Statistic title="Средний балл" value={stats.avgBestScore} suffix="%" prefix={<BarChartOutlined />} valueStyle={{ color: getConfidenceColor(stats.avgBestScore) }} /></Col>
                        </Row>
                    </Card>
                    <Card style={{ marginBottom: 24 }}>
                        <Row gutter={16} align="bottom">
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ marginBottom: 8 }}><Text strong>Статус</Text></div>
                                <Select value={filterStatus} onChange={setFilterStatus} style={{ width: '100%' }}>
                                    <Select.Option value="all">Все статусы</Select.Option>
                                    <Select.Option value="passed">Пройдено</Select.Option>
                                    <Select.Option value="in_progress">В процессе</Select.Option>
                                    <Select.Option value="locked">Заблокировано</Select.Option>
                                    <Select.Option value="not_started">Не начато</Select.Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <div style={{ marginBottom: 8, visibility: 'hidden' }}><Text strong>.</Text></div>
                                <Button icon={<ReloadOutlined />} onClick={() => setFilterStatus('all')}>Сбросить фильтр</Button>
                            </Col>
                        </Row>
                    </Card>
                    {filteredTests.length === 0 ? (
                        <Card><Empty description="Нет тестов, соответствующих выбранному фильтру" /></Card>
                    ) : (
                        <Card>
                            <Table columns={columns} dataSource={filteredTests} rowKey={(record) => `${record.skillId}-${record.topicKey}`} pagination={false} size="middle" />
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default CandidateTests;