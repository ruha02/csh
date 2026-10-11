import {
    BankOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    ContactsOutlined,
    DeleteOutlined,
    EditOutlined,
    MailOutlined,
    MessageOutlined,
    PhoneOutlined,
    PlusOutlined,
    PrinterOutlined,
    SendOutlined,
    SolutionOutlined,
    StarOutlined,
    TrophyOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Modal,
    Row,
    Space,
    Tag,
    Timeline,
    Typography,
    message,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import ResumeForm from '../../components/ResumeForm';
import ResumePrint from '../../components/ResumePrint';
import {
    DIRECTION_COLORS,
    GRADE_COLORS,
    GRADE_LABELS,
    MOCK_FSP_PARTICIPATIONS,
    MOCK_PROFILE,
    MOCK_RESUMES,
    MOCK_TOPIC_TESTS,
    formatPeriod,
    formatSalary,
    getConfidenceColor,
    type Resume,
} from '../../mocks';

dayjs.locale('ru');
const { Title, Text, Paragraph } = Typography;

const CandidateResumeList: React.FC = () => {
    const [resumes, setResumes] = useState<Resume[]>(MOCK_RESUMES);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(MOCK_RESUMES.length > 0 ? MOCK_RESUMES[0] : null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingResume, setEditingResume] = useState<Resume | null>(null);
    const [printResume, setPrintResume] = useState<Resume | null>(null);

    const handleCreate = () => { setEditingResume(null); setIsFormVisible(true); };
    const handleEdit = (resume: Resume) => { setEditingResume(resume); setIsFormVisible(true); };
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Удалить резюме?',
            content: 'Вы уверены, что хотите удалить это резюме?',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                setResumes(resumes.filter((r) => r.id !== id));
                if (selectedResume?.id === id) setSelectedResume(null);
                message.success('Резюме удалено');
            },
        });
    };
    const handlePrint = (resume: Resume) => setPrintResume(resume);
    const handleFormSubmit = (values: any) => {
        if (editingResume) {
            const updated = resumes.map((r) =>
                r.id === editingResume.id ? { ...r, ...values, updatedAt: new Date().toISOString().split('T')[0] } : r
            );
            setResumes(updated);
            if (selectedResume?.id === editingResume.id) setSelectedResume({ ...selectedResume, ...values });
            message.success('Резюме обновлено');
        } else {
            const newResume: Resume = {
                id: Date.now(),
                ...values,
                currency: 'RUB',
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
            };
            setResumes([...resumes, newResume]);
            setSelectedResume(newResume);
            message.success('Резюме создано');
        }
        setIsFormVisible(false);
        setEditingResume(null);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <Title level={2} style={{ margin: 0 }}>Мои резюме</Title>
                <Space>
                    {selectedResume && (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => handleEdit(selectedResume)}>Редактировать</Button>
                            <Button type="primary" icon={<PrinterOutlined />} onClick={() => handlePrint(selectedResume)} style={{ background: '#402FFF', borderColor: '#402FFF' }}>Печать</Button>
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(selectedResume.id)}>Удалить</Button>
                        </>
                    )}
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ background: '#402FFF', borderColor: '#402FFF' }}>Создать резюме</Button>
                </Space>
            </div>
            {resumes.length === 0 ? (
                <Card>
                    <Empty
                        description={
                            <div>
                                <Text style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>У вас пока нет резюме</Text>
                                <Text type="secondary">Создайте первое резюме, чтобы откликаться на вакансии</Text>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <Row gutter={24}>
                    <Col xs={24} lg={8}>
                        <Card title="Список резюме" style={{ marginBottom: 24 }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {resumes.map((resume) => (
                                    <Card
                                        key={resume.id}
                                        size="small"
                                        hoverable
                                        onClick={() => setSelectedResume(resume)}
                                        style={{
                                            border: selectedResume?.id === resume.id ? '2px solid #402FFF' : '1px solid #d9d9d9',
                                            borderLeft: `4px solid ${DIRECTION_COLORS[resume.direction as keyof typeof DIRECTION_COLORS] || '#d9d9d9'}`,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>{resume.title}</Text>
                                            <Space size={4} wrap>
                                                <Tag color={DIRECTION_COLORS[resume.direction as keyof typeof DIRECTION_COLORS]}>{resume.direction}</Tag>
                                                <Tag color={GRADE_COLORS[resume.grade]}>{GRADE_LABELS[resume.grade]}</Tag>
                                                <Tag>{resume.skillName}</Tag>
                                            </Space>
                                        </div>
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <Text style={{ fontSize: 12 }}>Уверенность в грейде</Text>
                                                <Text strong style={{ fontSize: 12, color: '#402FFF' }}>{resume.confidence}%</Text>
                                            </div>
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                <span style={{ marginRight: 4, fontWeight: 600 }}>₽</span>Ожидаемая зарплата:
                                            </Text>
                                            <div>
                                                <Text strong style={{ fontSize: 14, color: '#402FFF' }}>
                                                    {formatSalary(resume.salaryFrom, resume.currency)}
                                                    {resume.salaryTo && ` — ${formatSalary(resume.salaryTo, resume.currency)}`}
                                                </Text>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>Обновлено: {resume.updatedAt}</Text>
                                        </div>
                                    </Card>
                                ))}
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={24} lg={16}>
                        {selectedResume ? (
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                        <span>Резюме: {selectedResume.title}</span>
                                        <Tag color={DIRECTION_COLORS[selectedResume.direction as keyof typeof DIRECTION_COLORS]}>{selectedResume.direction}</Tag>
                                        <Tag color={GRADE_COLORS[selectedResume.grade]}>{GRADE_LABELS[selectedResume.grade]}</Tag>
                                        <Tag>Уверенность: {selectedResume.confidence}%</Tag>
                                    </div>
                                }
                            >
                                <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, borderLeft: `4px solid ${DIRECTION_COLORS[selectedResume.direction as keyof typeof DIRECTION_COLORS] || '#402FFF'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                        <div>
                                            <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>{selectedResume.title}</Text>
                                            <Text type="secondary" style={{ fontSize: 13 }}>{selectedResume.skillName} • {selectedResume.direction}</Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: '#402FFF', lineHeight: 1 }}>{selectedResume.confidence}%</div>
                                            <Text type="secondary" style={{ fontSize: 11 }}>уверенность в грейде</Text>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong style={{ fontSize: 16, color: '#402FFF' }}>
                                            {formatSalary(selectedResume.salaryFrom, selectedResume.currency)}
                                            {selectedResume.salaryTo && ` — ${formatSalary(selectedResume.salaryTo, selectedResume.currency)}`}
                                        </Text>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><UserOutlined style={{ marginRight: 8 }} />ФИО</Title>
                                    <Text strong style={{ fontSize: 18 }}>{MOCK_PROFILE.lastName} {MOCK_PROFILE.firstName} {MOCK_PROFILE.middleName}</Text>
                                </div>
                                <Divider />
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><ContactsOutlined style={{ marginRight: 8 }} />Контакты</Title>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={8}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PhoneOutlined style={{ color: '#402FFF' }} /><Text>{MOCK_PROFILE.phone}</Text></div></Col>
                                        <Col xs={24} sm={8}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MailOutlined style={{ color: '#402FFF' }} /><Text>{MOCK_PROFILE.email}</Text></div></Col>
                                        <Col xs={24} sm={8}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SendOutlined style={{ color: '#402FFF' }} /><Text>{MOCK_PROFILE.telegram}</Text></div></Col>
                                    </Row>
                                </div>
                                <Divider />
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><SolutionOutlined style={{ marginRight: 8 }} />Hard-skills</Title>
                                    {(() => {
                                        const hardSkills = MOCK_TOPIC_TESTS
                                            .filter((t) => t.skillId === selectedResume.skillId && t.passed)
                                            .sort((a, b) => b.bestScore - a.bestScore);
                                        if (hardSkills.length === 0) return <Text type="secondary">Нет успешно пройденных тестов</Text>;
                                        return (
                                            <Space wrap>
                                                {hardSkills.map((skill, index) => (
                                                    <Tag key={index} color={getConfidenceColor(skill.bestScore)} style={{ fontSize: 13, padding: '4px 12px' }}>
                                                        <Text strong>{skill.testName}</Text>
                                                        <Text style={{ marginLeft: 8, opacity: 0.9 }}>({skill.bestScore}%)</Text>
                                                    </Tag>
                                                ))}
                                            </Space>
                                        );
                                    })()}
                                </div>
                                <Divider />
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><StarOutlined style={{ marginRight: 8 }} />Soft-skills</Title>
                                    <Space wrap>
                                        {MOCK_PROFILE.softSkills.map((skill, index) => (
                                            <Tag key={index} color="#402FFF" style={{ fontSize: 13, padding: '4px 12px' }}>{skill}</Tag>
                                        ))}
                                    </Space>
                                </div>
                                <Divider />
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><MessageOutlined style={{ marginRight: 8 }} />О себе</Title>
                                    <Paragraph style={{ fontSize: 14, lineHeight: 1.7, color: '#1B1C21', margin: 0 }}>{MOCK_PROFILE.aboutMe || 'Информация не указана'}</Paragraph>
                                </div>
                                <Divider />
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><BankOutlined style={{ marginRight: 8 }} />Образование</Title>
                                    <Timeline
                                        items={[...MOCK_PROFILE.education]
                                            .sort((a, b) => {
                                                if (a.isCurrent && !b.isCurrent) return -1;
                                                if (!a.isCurrent && b.isCurrent) return 1;
                                                return b.startYear - a.startYear;
                                            })
                                            .map((edu, idx) => ({
                                                color: edu.isCurrent ? '#EC1D35' : '#402FFF',
                                                children: (
                                                    <Card key={idx} size="small" style={{ background: '#F9FAFB', borderLeft: `3px solid ${edu.isCurrent ? '#EC1D35' : '#402FFF'}` }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                            <Text strong style={{ fontSize: 16 }}>{edu.institution}</Text>
                                                            {edu.isCurrent && <Tag color="#EC1D35" style={{ fontSize: 11 }}>Учусь сейчас</Tag>}
                                                            {edu.degree && <Tag style={{ fontSize: 12 }}>{edu.degree}</Tag>}
                                                        </div>
                                                        <Text style={{ color: '#6b7280', fontSize: 14 }}>{edu.specialty}</Text>
                                                        <div style={{ marginTop: 4 }}>
                                                            <ClockCircleOutlined style={{ marginRight: 6, color: '#C8C9CA' }} />
                                                            <Text style={{ color: '#6b7280', fontSize: 13 }}>
                                                                {edu.startYear} — {edu.isCurrent || !edu.endYear ? 'по настоящее время' : edu.endYear}
                                                            </Text>
                                                        </div>
                                                    </Card>
                                                ),
                                            }))}
                                    />
                                </div>
                                <Divider />
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><SolutionOutlined style={{ marginRight: 8 }} />Опыт работы</Title>
                                    <Timeline
                                        items={MOCK_PROFILE.workExperience.map((exp, idx) => ({
                                            key: idx,
                                            color: exp.isCurrent ? '#EC1D35' : '#402FFF',
                                            children: (
                                                <Card size="small" style={{ background: '#F9FAFB', borderLeft: `3px solid ${exp.isCurrent ? '#EC1D35' : '#402FFF'}` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                        <Text strong style={{ fontSize: 16 }}>{exp.position}</Text>
                                                        {exp.isCurrent && <Tag color="#EC1D35" style={{ fontSize: 11 }}>Текущее место</Tag>}
                                                    </div>
                                                    <div style={{ marginBottom: 4 }}><BankOutlined style={{ marginRight: 6, color: '#402FFF' }} /><Text>{exp.company}</Text></div>
                                                    <ClockCircleOutlined style={{ marginRight: 6, color: '#C8C9CA' }} />
                                                    <Text style={{ color: '#6b7280', fontSize: 13 }}>{formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}</Text>
                                                    {exp.description && <Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 14 }}>{exp.description}</Paragraph>}
                                                </Card>
                                            ),
                                        }))}
                                    />
                                </div>
                                <Divider />
                                <div>
                                    <Title level={4} style={{ marginBottom: 16, color: '#402FFF' }}><TrophyOutlined style={{ marginRight: 8 }} />Участие в ФСП</Title>
                                    {MOCK_FSP_PARTICIPATIONS.length === 0 ? (
                                        <Text type="secondary">Участий в мероприятиях ФСП нет</Text>
                                    ) : (
                                        <Timeline
                                            items={MOCK_FSP_PARTICIPATIONS
                                                .sort((a, b) => dayjs(b.eventDate).diff(dayjs(a.eventDate)))
                                                .map((p, idx) => ({
                                                    key: idx,
                                                    color: p.result === 'first_place' ? '#faad14' : p.result === 'second_place' ? '#8c8c8c' : p.result === 'third_place' ? '#d48806' : '#402FFF',
                                                    children: (
                                                        <Card size="small" style={{ background: '#F9FAFB', borderLeft: `3px solid ${p.result === 'first_place' ? '#faad14' : p.result === 'second_place' ? '#8c8c8c' : p.result === 'third_place' ? '#d48806' : '#402FFF'}` }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                                                <Text strong style={{ fontSize: 15 }}>{p.eventName}</Text>
                                                                <Tag color={p.result === 'first_place' ? '#faad14' : p.result === 'second_place' ? '#8c8c8c' : p.result === 'third_place' ? '#d48806' : '#402FFF'} style={{ fontSize: 12 }}>
                                                                    {p.result === 'first_place' ? '1 место' : p.result === 'second_place' ? '2 место' : p.result === 'third_place' ? '3 место' : 'Участие'}
                                                                </Tag>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                                                <Tag color={p.participationType === 'team' ? '#722ed1' : '#402FFF'} style={{ fontSize: 11 }}>
                                                                    {p.participationType === 'team' ? 'Командное' : 'Одиночное'}
                                                                </Tag>
                                                                {p.teamName && <Tag color="#13c2c2" style={{ fontSize: 11 }}>Команда: {p.teamName}</Tag>}
                                                                {p.teamRole && <Tag style={{ fontSize: 11 }}>{p.teamRole}</Tag>}
                                                            </div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                                {dayjs(p.eventDate).format('D MMMM YYYY')}
                                                                {p.location && ` • ${p.location}`}
                                                            </Text>
                                                        </Card>
                                                    ),
                                                }))}
                                        />
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <Card><Empty description={<span>Выберите резюме из списка слева или создайте новое</span>} /></Card>
                        )}
                    </Col>
                </Row>
            )}
            {isFormVisible && <ResumeForm resume={editingResume} onSubmit={handleFormSubmit} onCancel={() => { setIsFormVisible(false); setEditingResume(null); }} />}
            {printResume && <ResumePrint resume={printResume} onClose={() => setPrintResume(null)} />}
        </div>
    );
};

export default CandidateResumeList;