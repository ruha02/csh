import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CodeOutlined,
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    PlusOutlined,
    RocketOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Empty,
    Form,
    Input,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Tag,
    Tooltip,
    Tree,
    Typography,
    message,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useState } from 'react';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    GRADE_THRESHOLDS,
    MAX_ATTEMPTS,
    MOCK_SKILLS,
    MOCK_TOPIC_TESTS,
    RETAKE_PERIOD_DAYS,
    ROADMAPS,
    getConfidenceColor,
    getDayWord,
    getDaysUntilRetake,
    type RoadmapNode,
    type Skill,
    type TopicTest,
} from '../../mocks';

const { Title, Text, Paragraph } = Typography;

const calculateNodeConfidence = (node: RoadmapNode, testResults: Map<string, TopicTest>): number => {
    if (!node.children || node.children.length === 0) {
        const test = testResults.get(node.key);
        return test ? test.bestScore : 0;
    }
    const childPercents = node.children.map((child) => calculateNodeConfidence(child, testResults));
    const sum = childPercents.reduce((acc, p) => acc + p, 0);
    return Math.round(sum / childPercents.length);
};

const getTopicStatus = (test: TopicTest | undefined): 'not_started' | 'in_progress' | 'passed' | 'locked' => {
    if (!test || test.attempts === 0) return 'not_started';
    if (test.locked) return 'locked';
    if (test.passed) return 'passed';
    return 'in_progress';
};

const getGradeMatchStatus = (confidence: number, grade: Skill['grade']) => {
    const threshold = GRADE_THRESHOLDS[grade];
    if (confidence >= threshold) {
        return { label: 'Грейд подтверждён', color: '#52c41a', icon: <CheckCircleOutlined /> };
    }
    if (confidence >= threshold - 15) {
        return { label: `До подтверждения ${threshold - confidence}%`, color: '#faad14', icon: <ClockCircleOutlined /> };
    }
    return { label: 'Недостаточно для грейда', color: '#f5222d', icon: <CloseCircleOutlined /> };
};

const CandidateSkills: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [form] = Form.useForm();
    const [topicTests, setTopicTests] = useState<TopicTest[]>(MOCK_TOPIC_TESTS);

    const testResultsMap = React.useMemo(() => {
        const map = new Map<string, TopicTest>();
        topicTests.forEach((t) => map.set(t.topicKey, t));
        return map;
    }, [topicTests]);

    React.useEffect(() => {
        const updatedSkills = skills.map((skill) => {
            const roadmap = ROADMAPS[skill.direction];
            const confidence = calculateNodeConfidence({ key: 'root', title: 'root', children: roadmap }, testResultsMap);
            return { ...skill, confidence };
        });
        setSkills(updatedSkills);
        if (selectedSkill) {
            const updated = updatedSkills.find((s) => s.id === selectedSkill.id);
            if (updated) setSelectedSkill(updated);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testResultsMap]);

    const handleAddSkill = () => {
        setEditingSkill(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditSkill = (skill: Skill) => {
        setEditingSkill(skill);
        form.setFieldsValue({ direction: skill.direction, grade: skill.grade, language: skill.language });
        setIsModalOpen(true);
    };

    const handleDeleteSkill = (id: number) => {
        Modal.confirm({
            title: 'Удалить навык?',
            content: 'Вы уверены, что хотите удалить этот навык? Результаты тестов будут потеряны.',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                setSkills(skills.filter((s) => s.id !== id));
                setTopicTests(topicTests.filter((t) => t.skillId !== id));
                if (selectedSkill?.id === id) setSelectedSkill(null);
                message.success('Навык удален');
            },
        });
    };

    const handleSaveSkill = async () => {
        try {
            const values = await form.validateFields();
            if (editingSkill) {
                setSkills(skills.map((s) => (s.id === editingSkill.id ? { ...s, ...values } : s)));
                if (selectedSkill?.id === editingSkill.id) setSelectedSkill({ ...selectedSkill, ...values });
                message.success('Навык обновлен');
            } else {
                const newSkill: Skill = { id: Date.now(), ...values, confidence: 0 };
                setSkills([...skills, newSkill]);
                message.success('Навык добавлен');
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const getTestStats = (skillId: number) => {
        const skillTopicTests = topicTests.filter((t) => t.skillId === skillId);
        let passed = 0, inProgress = 0, locked = 0;
        skillTopicTests.forEach((test) => {
            const status = getTopicStatus(test);
            if (status === 'passed') passed++;
            else if (status === 'in_progress') inProgress++;
            else if (status === 'locked') locked++;
        });
        return { total: skillTopicTests.length, passed, inProgress, locked };
    };

    const convertRoadmapToTreeData = (nodes: RoadmapNode[], skillId: number): DataNode[] => {
        return nodes.map((node) => {
            const isLeaf = !node.children || node.children.length === 0;
            const test = isLeaf ? testResultsMap.get(node.key) : undefined;
            const percent = calculateNodeConfidence(node, testResultsMap);
            const color = getConfidenceColor(percent);
            const status = isLeaf ? getTopicStatus(test) : undefined;

            if (!isLeaf) {
                return {
                    key: node.key,
                    title: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, alignItems: 'center', padding: '2px 0' }}>
                            <Text strong style={{ fontSize: 14 }}>{node.title}</Text>
                            <Progress percent={percent} size="small" strokeColor={color} style={{ margin: 0 }} format={(p) => <span style={{ fontSize: 11 }}>{p}%</span>} />
                        </div>
                    ),
                    children: convertRoadmapToTreeData(node.children!, skillId),
                    isLeaf: false,
                };
            }

            const StatusIcon = () => {
                if (status === 'passed') return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />;
                if (status === 'in_progress') return <ClockCircleOutlined style={{ color: '#faad14', fontSize: 14 }} />;
                if (status === 'locked') return <LockOutlined style={{ color: '#f5222d', fontSize: 14 }} />;
                return <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 14 }} />;
            };

            return {
                key: node.key,
                title: (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, alignItems: 'center', padding: '2px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <StatusIcon />
                            <Text style={{ color: status === 'passed' ? '#52c41a' : '#1B1C21', fontSize: 13 }}>{node.title}</Text>
                            {test && (
                                <Tooltip title={`Попыток: ${test.attempts}/${MAX_ATTEMPTS}${test.lastAttemptDate ? `, последняя: ${test.lastAttemptDate}` : ''}`}>
                                    <Tag color={test.attempts === 0 ? 'default' : test.passed ? 'success' : 'warning'} style={{ fontSize: 10, padding: '0 6px', margin: 0 }}>
                                        {test.attempts}/{MAX_ATTEMPTS}
                                    </Tag>
                                </Tooltip>
                            )}
                            {test?.locked && test.nextAttemptDate && (
                                <Tooltip title={`Доступно через ${getDaysUntilRetake(test.nextAttemptDate)} ${getDayWord(getDaysUntilRetake(test.nextAttemptDate))}`}>
                                    <Tag color="error" icon={<CalendarOutlined />} style={{ fontSize: 10, padding: '0 6px', margin: 0 }}>
                                        {getDaysUntilRetake(test.nextAttemptDate)} {getDayWord(getDaysUntilRetake(test.nextAttemptDate))}
                                    </Tag>
                                </Tooltip>
                            )}
                        </div>
                        <Progress percent={percent} size="small" strokeColor={color} style={{ margin: 0 }} format={(p) => <span style={{ fontSize: 11 }}>{p}%</span>} />
                    </div>
                ),
                isLeaf: true,
            };
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Мои навыки</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSkill} style={{ background: '#402FFF', borderColor: '#402FFF' }}>
                    Добавить навык
                </Button>
            </div>
            <Row gutter={24}>
                <Col xs={24} lg={8}>
                    <Card title="Список навыков" style={{ marginBottom: 24 }}>
                        {skills.length === 0 ? (
                            <Empty description="Нет добавленных навыков" />
                        ) : (
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {skills.map((skill) => {
                                    const gradeStatus = getGradeMatchStatus(skill.confidence, skill.grade);
                                    return (
                                        <Card
                                            key={skill.id}
                                            size="small"
                                            hoverable
                                            onClick={() => setSelectedSkill(skill)}
                                            style={{ border: selectedSkill?.id === skill.id ? '2px solid #402FFF' : '1px solid #d9d9d9', cursor: 'pointer' }}
                                            actions={[
                                                <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); handleEditSkill(skill); }} />,
                                                <DeleteOutlined key="delete" onClick={(e) => { e.stopPropagation(); handleDeleteSkill(skill.id); }} style={{ color: '#ff4d4f' }} />,
                                            ]}
                                        >
                                            <div style={{ marginBottom: 12 }}>
                                                <Tag color={DIRECTION_COLORS[skill.direction]} style={{ fontSize: 14, padding: '4px 12px' }}>{DIRECTION_LABELS[skill.direction]}</Tag>
                                                <Tag color={GRADE_COLORS[skill.grade]} style={{ fontSize: 12, padding: '2px 8px' }}>{GRADE_LABELS[skill.grade]}</Tag>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <CodeOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                                <Text strong>{skill.language}</Text>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <Text style={{ fontSize: 12 }}>Уверенность в грейде</Text>
                                                    <Text strong style={{ fontSize: 12, color: gradeStatus.color }}>{skill.confidence}%</Text>
                                                </div>
                                                <Progress percent={skill.confidence} strokeColor={getConfidenceColor(skill.confidence)} size="small" showInfo={false} />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: gradeStatus.color }}>
                                                    {gradeStatus.icon}
                                                    <Text style={{ fontSize: 11, color: gradeStatus.color }}>{gradeStatus.label}</Text>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </Space>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    {selectedSkill ? (
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                    <RocketOutlined style={{ color: '#402FFF', fontSize: 24 }} />
                                    <span>Дорожная карта развития</span>
                                    <Tag color={DIRECTION_COLORS[selectedSkill.direction]}>{DIRECTION_LABELS[selectedSkill.direction]}</Tag>
                                    <Tag color={GRADE_COLORS[selectedSkill.grade]}>{GRADE_LABELS[selectedSkill.grade]}</Tag>
                                </div>
                            }
                        >
                            {(() => {
                                const gradeStatus = getGradeMatchStatus(selectedSkill.confidence, selectedSkill.grade);
                                const threshold = GRADE_THRESHOLDS[selectedSkill.grade];
                                return (
                                    <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, borderLeft: `4px solid ${gradeStatus.color}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div>
                                                <Text strong style={{ fontSize: 16 }}>Уверенность в грейде «{GRADE_LABELS[selectedSkill.grade]}»</Text>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                    {gradeStatus.icon}
                                                    <Text style={{ color: gradeStatus.color, fontSize: 13 }}>{gradeStatus.label}</Text>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 32, fontWeight: 700, color: gradeStatus.color, lineHeight: 1 }}>{selectedSkill.confidence}%</div>
                                                <Text type="secondary" style={{ fontSize: 11 }}>порог: {threshold}%</Text>
                                            </div>
                                        </div>
                                        <Progress percent={selectedSkill.confidence} strokeColor={getConfidenceColor(selectedSkill.confidence)} size={['100%', 12]} showInfo={false} />
                                    </div>
                                );
                            })()}
                            {(() => {
                                const stats = getTestStats(selectedSkill.id);
                                return (
                                    <Row gutter={16} style={{ marginBottom: 24 }}>
                                        <Col xs={12} sm={6}>
                                            <Card size="small" style={{ textAlign: 'center', background: '#f5f5f5' }}>
                                                <div style={{ fontSize: 24, fontWeight: 700, color: '#402FFF' }}>{stats.total}</div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>Всего тем</Text>
                                            </Card>
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
                                                <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{stats.passed}</div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>Пройдено</Text>
                                            </Card>
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <Card size="small" style={{ textAlign: 'center', background: '#fffbe6' }}>
                                                <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14' }}>{stats.inProgress}</div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>В процессе</Text>
                                            </Card>
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <Card size="small" style={{ textAlign: 'center', background: '#fff1f0' }}>
                                                <div style={{ fontSize: 24, fontWeight: 700, color: '#f5222d' }}>{stats.locked}</div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>Заблокировано</Text>
                                            </Card>
                                        </Col>
                                    </Row>
                                );
                            })()}
                            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 24 }}>
                                <Paragraph style={{ margin: 0, fontSize: 13 }}>
                                    💡 <Text type="secondary">
                                        По каждой теме дорожной карты можно сдать тест. Доступно <Text strong>{MAX_ATTEMPTS} попытки</Text>,
                                        засчитывается <Text strong>лучший результат</Text>. После исчерпания попыток тест блокируется на{' '}
                                        <Text strong>{RETAKE_PERIOD_DAYS} дней</Text>. Перейдите в раздел <Text strong>"Тесты"</Text> для прохождения.
                                    </Text>
                                </Paragraph>
                            </div>
                            <Title level={4} style={{ marginBottom: 16 }}>
                                <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                Что нужно знать и уметь
                            </Title>
                            <Tree
                                showLine
                                defaultExpandAll
                                treeData={convertRoadmapToTreeData(ROADMAPS[selectedSkill.direction], selectedSkill.id)}
                                style={{ fontSize: 14 }}
                                blockNode
                            />
                        </Card>
                    ) : (
                        <Card>
                            <Empty description={<span>Выберите навык из списка слева, чтобы увидеть дорожную карту развития</span>} />
                        </Card>
                    )}
                </Col>
            </Row>
            <Modal
                title={editingSkill ? 'Редактировать навык' : 'Добавить навык'}
                open={isModalOpen}
                onOk={handleSaveSkill}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
                okText={editingSkill ? 'Сохранить' : 'Добавить'}
                cancelText="Отмена"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="direction" label="Направление" rules={[{ required: true, message: 'Выберите направление' }]}>
                        <Select placeholder="Выберите направление">
                            {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={DIRECTION_COLORS[key as Skill['direction']]}>{label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="grade" label="Уровень (грейд)" rules={[{ required: true, message: 'Выберите уровень' }]}>
                        <Select placeholder="Выберите уровень">
                            {Object.entries(GRADE_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={GRADE_COLORS[key as Skill['grade']]}>{label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="language" label="Язык программирования / Технология" rules={[{ required: true, message: 'Введите язык или технологию' }]}>
                        <Input placeholder="Например: TypeScript, Python, Go" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CandidateSkills;