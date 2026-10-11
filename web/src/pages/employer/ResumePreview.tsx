import {
    BankOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    ContactsOutlined,
    DownloadOutlined,
    EnvironmentOutlined,
    MailOutlined,
    MessageOutlined,
    PhoneOutlined,
    PrinterOutlined,
    SendOutlined,
    SolutionOutlined,
    StarOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Divider,
    Modal,
    Progress,
    Row,
    Space,
    Table,
    Tag,
    Timeline,
    Typography,
    message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React from 'react';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    RESULT_CONFIG,
    formatSalary,
    getConfidenceColor,
    type CandidateSearchResult,
} from '../../mocks';

dayjs.locale('ru');

const { Title, Text, Paragraph } = Typography;

interface EmployerResumePreviewProps {
    candidate: CandidateSearchResult;
    onClose: () => void;
}

const EmployerResumePreview: React.FC<EmployerResumePreviewProps> = ({ candidate, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        message.info('Функция экспорта в PDF будет доступна в следующем обновлении');
    };

    // Формируем таблицу hard skills для отображения
    const hardSkillsData = candidate.skills.map((skill, idx) => ({
        key: idx,
        direction: DIRECTION_LABELS[skill.direction],
        language: skill.language,
        grade: GRADE_LABELS[skill.grade],
        confidence: skill.confidence,
        directionColor: DIRECTION_COLORS[skill.direction],
        gradeColor: GRADE_COLORS[skill.grade],
    }));

    const hardSkillsColumns: ColumnsType<typeof hardSkillsData[0]> = [
        {
            title: 'Направление',
            dataIndex: 'direction',
            key: 'direction',
            render: (text: string, record) => (
                <Tag color={record.directionColor} style={{ margin: 0 }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Технология',
            dataIndex: 'language',
            key: 'language',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Грейд',
            dataIndex: 'grade',
            key: 'grade',
            render: (text: string, record) => (
                <Tag color={record.gradeColor} style={{ margin: 0 }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Уверенность',
            dataIndex: 'confidence',
            key: 'confidence',
            align: 'center',
            width: 180,
            render: (percent: number) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Progress
                        percent={percent}
                        showInfo={false}
                        size="small"
                        strokeColor={getConfidenceColor(percent)}
                        style={{ flex: 1, margin: 0 }}
                    />
                    <Text
                        strong
                        style={{
                            color: getConfidenceColor(percent),
                            fontSize: 13,
                            minWidth: 40,
                        }}
                    >
                        {percent}%
                    </Text>
                </div>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Title level={4} style={{ margin: 0 }}>
                        Резюме кандидата
                    </Title>
                    <Space>
                        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                            Печать
                        </Button>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExportPDF}
                            style={{ background: '#402FFF', borderColor: '#402FFF' }}
                        >
                            Скачать PDF
                        </Button>
                        <Button onClick={onClose}>Закрыть</Button>
                    </Space>
                </div>
            }
            open={true}
            onCancel={onClose}
            closeIcon={null}
            footer={null}
            width={900}
            style={{ top: 20 }}
        >
            <div style={{ padding: '20px 0' }} id="printable">
                <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {/* Шапка резюме */}
                    <div
                        style={{
                            textAlign: 'center',
                            marginBottom: 32,
                            paddingBottom: 24,
                            borderBottom: `3px solid ${candidate.skills[0]
                                    ? DIRECTION_COLORS[candidate.skills[0].direction]
                                    : '#402FFF'
                                }`,
                        }}
                    >
                        <Title level={1} style={{ margin: 0, color: '#1B1C21' }}>
                            {candidate.lastName} {candidate.firstName}
                            {candidate.middleName && ` ${candidate.middleName}`}
                        </Title>
                        {candidate.currentPosition && (
                            <Text
                                style={{
                                    fontSize: 18,
                                    color:
                                        candidate.skills[0]
                                            ? DIRECTION_COLORS[candidate.skills[0].direction]
                                            : '#402FFF',
                                    fontWeight: 600,
                                    marginTop: 8,
                                    display: 'block',
                                }}
                            >
                                {candidate.currentPosition}
                            </Text>
                        )}
                        {candidate.currentCompany && (
                            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginTop: 4 }}>
                                {candidate.currentCompany}
                            </Text>
                        )}
                        <div
                            style={{
                                marginTop: 12,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 8,
                                flexWrap: 'wrap',
                            }}
                        >
                            {candidate.skills.map((skill, idx) => (
                                <React.Fragment key={idx}>
                                    <Tag
                                        color={DIRECTION_COLORS[skill.direction]}
                                        style={{ fontSize: 13 }}
                                    >
                                        {DIRECTION_LABELS[skill.direction]}
                                    </Tag>
                                    <Tag color={GRADE_COLORS[skill.grade]} style={{ fontSize: 13 }}>
                                        {GRADE_LABELS[skill.grade]}
                                    </Tag>
                                </React.Fragment>
                            ))}
                        </div>
                        {candidate.salaryExpectationFrom && (
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#402FFF',
                                    fontWeight: 600,
                                    marginTop: 12,
                                    display: 'block',
                                }}
                            >
                                Ожидаемая зарплата:{' '}
                                {formatSalary(candidate.salaryExpectationFrom, candidate.currency)}
                                {candidate.salaryExpectationTo &&
                                    ` — ${formatSalary(
                                        candidate.salaryExpectationTo,
                                        candidate.currency
                                    )}`}
                            </Text>
                        )}
                    </div>

                    <Divider />

                    {/* Контакты */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <ContactsOutlined style={{ marginRight: 8 }} />
                            Контактная информация
                        </Title>
                        <Row gutter={[24, 16]}>
                            {candidate.email && (
                                <Col xs={24} sm={12} md={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <MailOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                                        <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                                    </div>
                                </Col>
                            )}
                            {candidate.phone && (
                                <Col xs={24} sm={12} md={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <PhoneOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                                        <Text>{candidate.phone}</Text>
                                    </div>
                                </Col>
                            )}
                            {candidate.telegram && (
                                <Col xs={24} sm={12} md={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <SendOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                                        <Text>{candidate.telegram}</Text>
                                    </div>
                                </Col>
                            )}
                            {candidate.location && (
                                <Col xs={24} sm={12} md={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <EnvironmentOutlined
                                            style={{ color: '#402FFF', fontSize: 18 }}
                                        />
                                        <Text>{candidate.location}</Text>
                                        {candidate.isRemoteAvailable && (
                                            <Tag
                                                color="#52c41a"
                                                style={{ marginLeft: 4, fontSize: 11 }}
                                            >
                                                Удалённо
                                            </Tag>
                                        )}
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>

                    <Divider />

                    {/* Hard-skills */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <SolutionOutlined style={{ marginRight: 8 }} />
                            Hard-skills
                        </Title>
                        <Table
                            columns={hardSkillsColumns}
                            dataSource={hardSkillsData}
                            pagination={false}
                            size="small"
                            bordered
                            style={{ borderRadius: 8 }}
                        />
                    </div>

                    <Divider />

                    {/* Soft-skills */}
                    {candidate.softSkills.length > 0 && (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                                    <StarOutlined style={{ marginRight: 8 }} />
                                    Soft-skills
                                </Title>
                                <Space wrap>
                                    {candidate.softSkills.map((skill, index) => (
                                        <Tag
                                            key={index}
                                            color="#402FFF"
                                            style={{ fontSize: 13, padding: '4px 12px' }}
                                        >
                                            {skill}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* О себе */}
                    {candidate.aboutMe && (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                                    <MessageOutlined style={{ marginRight: 8 }} />
                                    О себе
                                </Title>
                                <Paragraph
                                    style={{
                                        fontSize: 15,
                                        lineHeight: 1.8,
                                        color: '#1B1C21',
                                        textAlign: 'justify',
                                    }}
                                >
                                    {candidate.aboutMe}
                                </Paragraph>
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Опыт работы */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <SolutionOutlined style={{ marginRight: 8 }} />
                            Опыт работы
                        </Title>
                        <div
                            style={{
                                padding: 16,
                                background: '#f5f5f5',
                                borderRadius: 8,
                                borderLeft: `4px solid #402FFF`,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                }}
                            >
                                <div>
                                    {candidate.currentPosition && (
                                        <Text strong style={{ fontSize: 16, display: 'block' }}>
                                            {candidate.currentPosition}
                                        </Text>
                                    )}
                                    {candidate.currentCompany && (
                                        <Text type="secondary" style={{ fontSize: 14 }}>
                                            {candidate.currentCompany}
                                        </Text>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text strong style={{ fontSize: 20, color: '#402FFF' }}>
                                        {candidate.totalExperienceYears}{' '}
                                        {candidate.totalExperienceYears === 1
                                            ? 'год'
                                            : candidate.totalExperienceYears < 5
                                                ? 'года'
                                                : 'лет'}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 12, display: 'block' }}
                                    >
                                        общий стаж
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Образование */}
                    {candidate.education.length > 0 && (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                                    <BankOutlined style={{ marginRight: 8 }} />
                                    Образование
                                </Title>
                                <Timeline
                                    items={candidate.education.map((edu, idx) => ({
                                        key: idx,
                                        color: '#402FFF',
                                        children: (
                                            <Card
                                                size="small"
                                                style={{
                                                    background: '#F9FAFB',
                                                    borderLeft: '3px solid #402FFF',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        marginBottom: 4,
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {edu.institution}
                                                    </Text>
                                                </div>
                                                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                                                    {edu.specialty}
                                                </Text>
                                                {edu.endYear && (
                                                    <div style={{ marginTop: 4 }}>
                                                        <ClockCircleOutlined
                                                            style={{
                                                                marginRight: 6,
                                                                color: '#C8C9CA',
                                                            }}
                                                        />
                                                        <Text
                                                            style={{
                                                                color: '#6b7280',
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {edu.endYear}
                                                        </Text>
                                                    </div>
                                                )}
                                            </Card>
                                        ),
                                    }))}
                                />
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Достижения ФСП */}
                    {candidate.fspAchievements.length > 0 && (
                        <div>
                            <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                                <TrophyOutlined style={{ marginRight: 8 }} />
                                Достижения в ФСП
                            </Title>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {candidate.fspAchievements.map((achievement, index) => {
                                    const resultConfig = RESULT_CONFIG[achievement.result];
                                    return (
                                        <Card
                                            key={index}
                                            size="small"
                                            style={{
                                                background: '#fafafa',
                                                borderLeft: `3px solid ${resultConfig.color}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                    gap: 8,
                                                }}
                                            >
                                                <div>
                                                    <Text strong style={{ fontSize: 14 }}>
                                                        {achievement.eventName}
                                                    </Text>
                                                    <div>
                                                        <Text
                                                            type="secondary"
                                                            style={{ fontSize: 12 }}
                                                        >
                                                            <CalendarOutlined
                                                                style={{ marginRight: 4 }}
                                                            />
                                                            {dayjs(achievement.eventDate).format(
                                                                'D MMMM YYYY'
                                                            )}
                                                        </Text>
                                                    </div>
                                                </div>
                                                <Tag
                                                    color={resultConfig.color}
                                                    icon={resultConfig.icon}
                                                >
                                                    {resultConfig.label}
                                                </Tag>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </Space>
                        </div>
                    )}
                </Card>
            </div>
            <style>{`
                @media print {
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                    p, span, div {
                        font-size: 0.8rem !important;
                    }
                    h1, h2, h3 {
                        font-size: 0.95rem !important;
                    }
                    html, body {
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        overflow: visible !important;
                    }
                    #root,
                    .ant-modal-mask,
                    .ant-modal-header,
                    .ant-modal-footer {
                        display: none !important;
                    }
                    .ant-modal-root,
                    .ant-modal-wrap,
                    .ant-modal,
                    .ant-modal-content,
                    .ant-modal-body {
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        background: transparent !important;
                    }
                    #printable > div {
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: transparent !important;
                    }
                }
            `}</style>
        </Modal>
    );
};

export default EmployerResumePreview;