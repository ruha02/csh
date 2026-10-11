import {
    BankOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    ContactsOutlined,
    DownloadOutlined,
    MailOutlined,
    MessageOutlined,
    PhoneOutlined,
    PrinterOutlined,
    SendOutlined,
    SolutionOutlined,
    StarOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Divider,
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
import React from 'react';
import {
    DIRECTION_COLORS,
    GRADE_COLORS,
    GRADE_LABELS,
    MOCK_FSP_PARTICIPATIONS,
    MOCK_PROFILE,
    MOCK_TOPIC_TESTS,
    formatPeriod,
    formatSalary,
    getConfidenceColor,
    type Resume,
} from '../mocks';

dayjs.locale('ru');
const { Title, Text, Paragraph } = Typography;

interface ResumePrintProps {
    resume: Resume;
    onClose: () => void;
}

const ResumePrint: React.FC<ResumePrintProps> = ({ resume, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        message.info('Функция экспорта в PDF будет доступна в следующем обновлении');
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Title level={4} style={{ margin: 0 }}>Предварительный просмотр резюме</Title>
                    <Space>
                        <Button icon={<PrinterOutlined />} onClick={handlePrint}>Печать</Button>
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
                    <div style={{
                        textAlign: 'center',
                        marginBottom: 32,
                        paddingBottom: 24,
                        borderBottom: `3px solid ${DIRECTION_COLORS[resume.direction as keyof typeof DIRECTION_COLORS] || '#402FFF'}`,
                    }}>
                        <Title level={1} style={{ margin: 0, color: '#1B1C21' }}>
                            {MOCK_PROFILE.lastName} {MOCK_PROFILE.firstName} {MOCK_PROFILE.middleName}
                        </Title>
                        <Text style={{ fontSize: 18, color: DIRECTION_COLORS[resume.direction as keyof typeof DIRECTION_COLORS] || '#402FFF', fontWeight: 600, marginTop: 8, display: 'block' }}>
                            {resume.title}
                        </Text>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Tag color={DIRECTION_COLORS[resume.direction as keyof typeof DIRECTION_COLORS]} style={{ fontSize: 13 }}>
                                {resume.direction}
                            </Tag>
                            <Tag color={GRADE_COLORS[resume.grade]} style={{ fontSize: 13 }}>
                                {GRADE_LABELS[resume.grade]}
                            </Tag>
                            <Tag style={{ fontSize: 13 }}>Уверенность: {resume.confidence}%</Tag>
                        </div>
                        <Text style={{ fontSize: 16, color: '#402FFF', fontWeight: 600, marginTop: 12, display: 'block' }}>
                            Ожидаемая зарплата: {formatSalary(resume.salaryFrom, resume.currency)}
                            {resume.salaryTo && ` — ${formatSalary(resume.salaryTo, resume.currency)}`}
                        </Text>
                    </div>
                    <Divider />
                    {/* Контакты */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <ContactsOutlined style={{ marginRight: 8 }} />
                            Контактная информация
                        </Title>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <PhoneOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                                    <Text>{MOCK_PROFILE.phone}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MailOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                                    <Text>{MOCK_PROFILE.email}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <SendOutlined style={{ color: '#402FFF', fontSize: 18 }} />
                                    <Text>{MOCK_PROFILE.telegram}</Text>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <Divider />
                    {/* Hard-skills */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <SolutionOutlined style={{ marginRight: 8 }} />
                            Hard-skills
                        </Title>
                        {(() => {
                            const hardSkills = MOCK_TOPIC_TESTS
                                .filter((t) => t.skillId === resume.skillId && t.passed)
                                .sort((a, b) => b.bestScore - a.bestScore);
                            if (hardSkills.length === 0) {
                                return <Text type="secondary">Нет успешно пройденных тестов</Text>;
                            }
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
                    {/* Soft-skills */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <StarOutlined style={{ marginRight: 8 }} />
                            Soft-skills
                        </Title>
                        <Space wrap>
                            {MOCK_PROFILE.softSkills.map((skill, index) => (
                                <Tag key={index} color="#402FFF" style={{ fontSize: 13, padding: '4px 12px' }}>
                                    {skill}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                    <Divider />
                    {/* О себе */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <MessageOutlined style={{ marginRight: 8 }} />
                            О себе
                        </Title>
                        <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#1B1C21', textAlign: 'justify' }}>
                            {MOCK_PROFILE.aboutMe || 'Информация не указана'}
                        </Paragraph>
                    </div>
                    <Divider />
                    {/* Образование */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <BankOutlined style={{ marginRight: 8 }} />
                            Образование
                        </Title>
                        <Timeline
                            items={[...MOCK_PROFILE.education]
                                .sort((a, b) => {
                                    if (a.isCurrent && !b.isCurrent) return -1;
                                    if (!a.isCurrent && b.isCurrent) return 1;
                                    return b.startYear - a.startYear;
                                })
                                .map((edu) => ({
                                    color: edu.isCurrent ? '#EC1D35' : '#402FFF',
                                    children: (
                                        <Card
                                            size="small"
                                            style={{
                                                background: '#F9FAFB',
                                                borderLeft: `3px solid ${edu.isCurrent ? '#EC1D35' : '#402FFF'}`,
                                            }}
                                        >
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
                    {/* Опыт работы */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <SolutionOutlined style={{ marginRight: 8 }} />
                            Опыт работы
                        </Title>
                        <Timeline
                            items={MOCK_PROFILE.workExperience.map((exp) => ({
                                color: exp.isCurrent ? '#EC1D35' : '#402FFF',
                                children: (
                                    <Card
                                        size="small"
                                        style={{
                                            background: '#F9FAFB',
                                            borderLeft: `3px solid ${exp.isCurrent ? '#EC1D35' : '#402FFF'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <Text strong style={{ fontSize: 16 }}>{exp.position}</Text>
                                            {exp.isCurrent && <Tag color="#EC1D35" style={{ fontSize: 11 }}>Текущее место</Tag>}
                                        </div>
                                        <div style={{ marginBottom: 4 }}>
                                            <BankOutlined style={{ marginRight: 6, color: '#402FFF' }} />
                                            <Text>{exp.company}</Text>
                                        </div>
                                        <ClockCircleOutlined style={{ marginRight: 6, color: '#C8C9CA' }} />
                                        <Text style={{ color: '#6b7280', fontSize: 13 }}>
                                            {formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}
                                        </Text>
                                        {exp.description && (
                                            <Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 14 }}>
                                                {exp.description}
                                            </Paragraph>
                                        )}
                                    </Card>
                                ),
                            }))}
                        />
                    </div>
                    <Divider />
                    {/* Участие в ФСП */}
                    <div>
                        <Title level={3} style={{ marginBottom: 16, color: '#402FFF' }}>
                            <TrophyOutlined style={{ marginRight: 8 }} />
                            Участие в ФСП
                        </Title>
                        {MOCK_FSP_PARTICIPATIONS.length === 0 ? (
                            <Text type="secondary">Участий в мероприятиях ФСП нет</Text>
                        ) : (
                            <Timeline
                                items={MOCK_FSP_PARTICIPATIONS
                                    .sort((a, b) => dayjs(b.eventDate).diff(dayjs(a.eventDate)))
                                    .map((p) => ({
                                        color:
                                            p.result === 'first_place' ? '#faad14' :
                                                p.result === 'second_place' ? '#8c8c8c' :
                                                    p.result === 'third_place' ? '#d48806' : '#402FFF',
                                        children: (
                                            <Card
                                                size="small"
                                                style={{
                                                    background: '#F9FAFB',
                                                    borderLeft: `3px solid ${p.result === 'first_place' ? '#faad14' :
                                                            p.result === 'second_place' ? '#8c8c8c' :
                                                                p.result === 'third_place' ? '#d48806' : '#402FFF'
                                                        }`,
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                                    <Text strong style={{ fontSize: 15 }}>{p.eventName}</Text>
                                                    <Tag
                                                        color={
                                                            p.result === 'first_place' ? '#faad14' :
                                                                p.result === 'second_place' ? '#8c8c8c' :
                                                                    p.result === 'third_place' ? '#d48806' : '#402FFF'
                                                        }
                                                        style={{ fontSize: 12 }}
                                                    >
                                                        {p.result === 'first_place' ? '1 место' :
                                                            p.result === 'second_place' ? '2 место' :
                                                                p.result === 'third_place' ? '3 место' : 'Участие'}
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
          .ant-modal-container,
          #printable > div {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          #printable > div > .ant-card-body > div {
            margin: 0 !important;
            padding: 0 !important;
            visibility: visible !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            break-inside: auto !important;
            page-break-inside: auto !important;
          }
          #printable > div > .ant-card-body > div > .ant-typography,
          #printable > div > .ant-card-body > div > h1,
          #printable > div > .ant-card-body > div > h2,
          #printable > div > .ant-card-body > div > h3,
          #printable > div > .ant-card-body > div > h4 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          .ant-timeline-item-content > .ant-card,
          .ant-timeline-item-content > div[style*="borderLeft"] {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #printable .ant-card[style*="background: #F9FAFB"],
          #printable .ant-card[size="small"] {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #printable .ant-typography-paragraph,
          #printable p {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            orphans: 3 !important;
            widows: 3 !important;
          }
          #printable .ant-typography {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .ant-divider {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          .ant-timeline-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
        </Modal>
    );
};

export default ResumePrint;