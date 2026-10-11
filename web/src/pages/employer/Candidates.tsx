import {
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CodeOutlined,
    EnvironmentOutlined,
    FilterOutlined,
    GlobalOutlined,
    MailOutlined,
    ReloadOutlined,
    SearchOutlined,
    SendOutlined,
    TeamOutlined,
    TrophyOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    Col,
    Descriptions,
    Divider,
    Empty,
    Input,
    Modal,
    Progress,
    Row,
    Select,
    Slider,
    Space,
    Table,
    Tag,
    Timeline,
    Typography,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    GRADE_ORDER,
    MOCK_CANDIDATES_SEARCH,
    MOCK_EMPLOYER_VACANCIES,
    RESULT_CONFIG,
    formatSalary,
    getConfidenceColor,
    type CandidateSearchResult,
    type Direction,
    type EmployerVacancy,
    type Grade,
    type VacancyHardSkill,
} from '../../mocks';

dayjs.locale('ru');

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ============================================================================
// 🧮 Вспомогательные функции
// ============================================================================
const getDaysSinceActive = (lastActiveAt: string): number => {
    return Math.max(0, dayjs().diff(dayjs(lastActiveAt), 'day'));
};

const getActivityStatus = (lastActiveAt: string): { label: string; color: string } => {
    const days = getDaysSinceActive(lastActiveAt);
    if (days === 0) return { label: 'Сегодня', color: '#52c41a' };
    if (days === 1) return { label: 'Вчера', color: '#52c41a' };
    if (days <= 3) return { label: `${days} дня назад`, color: '#faad14' };
    if (days <= 7) return { label: `${days} дней назад`, color: '#faad14' };
    return { label: `${days} дней назад`, color: '#f5222d' };
};

// Получение названия темы по topicKey
const getTopicName = (topicKey: string): string => {
    const topicNames: Record<string, string> = {
        'html-semantics': 'Семантическая HTML-верстка',
        'html-forms': 'HTML-формы и валидация',
        'html-a11y': 'Доступность (a11y)',
        'css-flexbox': 'Flexbox',
        'css-grid': 'CSS Grid',
        'css-animations': 'CSS-анимации',
        'css-responsive': 'Адаптивная верстка',
        'js-es6': 'ES6+ синтаксис',
        'js-dom': 'Работа с DOM',
        'js-async': 'Async/Await и Promises',
        'js-modules': 'Модули и сборка',
        'react-components': 'Компоненты и JSX',
        'react-hooks': 'React Hooks',
        'react-state': 'State Management',
        'react-routing': 'React Router',
        'ts-types': 'Типы и интерфейсы',
        'ts-generics': 'Дженерики',
        'ts-utility': 'Utility Types',
        'git': 'Git и GitHub',
        'webpack': 'Webpack/Vite',
        'testing': 'Jest и React Testing Library',
        'performance': 'Оптимизация производительности',
        'python': 'Python (FastAPI)',
        'nodejs': 'Node.js (Express)',
        'go': 'Go (Gin)',
        'sql': 'SQL (PostgreSQL)',
        'nosql': 'NoSQL (MongoDB)',
        'orm': 'ORM (SQLAlchemy)',
        'rest': 'REST API',
        'graphql': 'GraphQL',
        'websocket': 'WebSocket',
        'auth': 'Аутентификация (JWT)',
        'patterns': 'Паттерны проектирования',
        'microservices': 'Микросервисы',
        'cqrs': 'CQRS и Event Sourcing',
    };
    return topicNames[topicKey] || topicKey;
};

// Проверка, подходит ли кандидат под вакансию (с учётом грейда и hard skills)
const isCandidateMatchingVacancy = (
    candidate: CandidateSearchResult,
    vacancy: EmployerVacancy
): boolean => {
    const candidateSkill = candidate.skills.find((s) => s.direction === vacancy.direction);
    if (!candidateSkill) return false;

    const candidateGradeLevel = GRADE_ORDER[candidateSkill.grade];
    const vacancyGradeLevel = GRADE_ORDER[vacancy.grade];
    if (candidateGradeLevel < vacancyGradeLevel) return false;

    if (candidateGradeLevel > vacancyGradeLevel) return true;

    return vacancy.hardSkills.every((hs: VacancyHardSkill) => {
        const topicTest = candidate.topicTests?.find((t) => t.topicKey === hs.topicKey);
        const candidatePercent = topicTest ? topicTest.bestScore : 0;
        return candidatePercent >= hs.requiredPercent;
    });
};

// Расчёт процента соответствия кандидата вакансии
const calculateMatchPercent = (
    candidate: CandidateSearchResult,
    vacancy: EmployerVacancy
): number => {
    const candidateSkill = candidate.skills.find((s) => s.direction === vacancy.direction);
    if (!candidateSkill) return 0;

    const candidateGradeLevel = GRADE_ORDER[candidateSkill.grade];
    const vacancyGradeLevel = GRADE_ORDER[vacancy.grade];

    if (candidateGradeLevel < vacancyGradeLevel) return 0;
    if (candidateGradeLevel > vacancyGradeLevel) return 100;

    if (vacancy.hardSkills.length === 0) return 100;

    let totalRequired = 0;
    let totalMatched = 0;

    vacancy.hardSkills.forEach((hs: VacancyHardSkill) => {
        totalRequired += hs.requiredPercent;
        const topicTest = candidate.topicTests?.find((t) => t.topicKey === hs.topicKey);
        const candidatePercent = topicTest ? topicTest.bestScore : 0;
        totalMatched += Math.min(candidatePercent, hs.requiredPercent);
    });

    return totalRequired > 0 ? Math.round((totalMatched / totalRequired) * 100) : 0;
};

// ============================================================================
// 🎨 Карточка кандидата
// ============================================================================
interface CandidateCardProps {
    candidate: CandidateSearchResult;
    onClick: () => void;
    isSelected: boolean;
    matchPercent?: number;
    showMatch?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
    candidate,
    onClick,
    isSelected,
    matchPercent,
    showMatch,
}) => {
    const activityStatus = getActivityStatus(candidate.lastActiveAt);
    const topSkill = candidate.skills[0];

    return (
        <Card
            size="small"
            hoverable
            onClick={onClick}
            style={{
                border: isSelected ? '2px solid #402FFF' : '1px solid #d9d9d9',
                borderLeft: `4px solid ${topSkill ? DIRECTION_COLORS[topSkill.direction] : '#d9d9d9'}`,
                cursor: 'pointer',
                marginBottom: 12,
                position: 'relative',
            }}
        >
            {/* Шапка */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <Avatar
                    size={48}
                    style={{ backgroundColor: '#402FFF', fontSize: 18, fontWeight: 700 }}
                >
                    {candidate.firstName.charAt(0)}
                    {candidate.lastName.charAt(0)}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 15 }}>
                            {candidate.lastName} {candidate.firstName}
                        </Text>
                        {candidate.isLookingForJob && (
                            <Badge
                                status="processing"
                                text={<Text style={{ fontSize: 11 }}>Ищет работу</Text>}
                            />
                        )}
                    </div>
                    {candidate.currentPosition && (
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                            {candidate.currentPosition}
                            {candidate.currentCompany && ` • ${candidate.currentCompany}`}
                        </Text>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: activityStatus.color, fontWeight: 600 }}>
                        {activityStatus.label}
                    </div>
                </div>
            </div>

            {/* Навыки */}
            {topSkill && (
                <div style={{ marginBottom: 12 }}>
                    <Space size={4} wrap>
                        <Tag
                            color={DIRECTION_COLORS[topSkill.direction]}
                            style={{ fontSize: 11, padding: '2px 8px' }}
                        >
                            {DIRECTION_LABELS[topSkill.direction]}
                        </Tag>
                        <Tag
                            color={GRADE_COLORS[topSkill.grade]}
                            style={{ fontSize: 11, padding: '2px 8px' }}
                        >
                            {GRADE_LABELS[topSkill.grade]}
                        </Tag>
                        <Tag style={{ fontSize: 11, padding: '2px 8px' }}>{topSkill.language}</Tag>
                    </Space>
                </div>
            )}

            {/* Процент соответствия (если показываем) */}
            {showMatch && matchPercent !== undefined && (
                <div
                    style={{
                        padding: '8px 12px',
                        background: '#f5f5f5',
                        borderRadius: 6,
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <Text style={{ fontSize: 12, flex: 1 }}>Соответствие:</Text>
                    <Text
                        strong
                        style={{
                            fontSize: 16,
                            color: getConfidenceColor(matchPercent),
                        }}
                    >
                        {matchPercent}%
                    </Text>
                </div>
            )}

            {/* Зарплата и локация */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                }}
            >
                <div>
                    {candidate.salaryExpectationFrom && (
                        <Text strong style={{ color: '#402FFF', fontSize: 13 }}>
                            {formatSalary(candidate.salaryExpectationFrom, candidate.currency)}
                            {candidate.salaryExpectationTo &&
                                ` — ${formatSalary(candidate.salaryExpectationTo, candidate.currency)}`}
                        </Text>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {candidate.location && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            <EnvironmentOutlined style={{ marginRight: 2 }} />
                            {candidate.location}
                        </Text>
                    )}
                    {candidate.isRemoteAvailable && (
                        <Tag
                            color="#52c41a"
                            icon={<GlobalOutlined />}
                            style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                        >
                            Удалённо
                        </Tag>
                    )}
                </div>
            </div>
        </Card>
    );
};

// ============================================================================
// 🎨 Основной компонент страницы
// ============================================================================
const EmployerCandidates: React.FC = () => {
    const [candidates] = useState<CandidateSearchResult[]>(MOCK_CANDIDATES_SEARCH);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateSearchResult | null>(
        MOCK_CANDIDATES_SEARCH.length > 0 ? MOCK_CANDIDATES_SEARCH[0] : null
    );

    // Фильтры
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDirection, setFilterDirection] = useState<Direction | 'all'>('all');
    const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');
    const [filterSalaryRange, setFilterSalaryRange] = useState<[number, number]>([0, 1000000]);
    const [filterRemote, setFilterRemote] = useState<boolean | null>(null);
    const [filterLookingForJob, setFilterLookingForJob] = useState<boolean | null>(null);

    // Фильтры по вакансиям
    const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null);
    const [onlyMatching, setOnlyMatching] = useState(false);

    // Модалка приглашения
    const [inviteModalCandidate, setInviteModalCandidate] =
        useState<CandidateSearchResult | null>(null);
    const [invitationVacancyId, setInvitationVacancyId] = useState<number | null>(null);
    const [invitationMessage, setInvitationMessage] = useState('');

    // ========================================================================
    // 🎯 Фильтрация
    // ========================================================================
    const filteredCandidates = candidates.filter((candidate) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const fullName = `${candidate.lastName} ${candidate.firstName}`.toLowerCase();
            if (!fullName.includes(query)) return false;
        }

        if (filterDirection !== 'all') {
            const hasDirection = candidate.skills.some((s) => s.direction === filterDirection);
            if (!hasDirection) return false;
        }

        if (filterGrade !== 'all') {
            const filterGradeLevel = GRADE_ORDER[filterGrade];
            const hasGrade = candidate.skills.some(
                (s) => GRADE_ORDER[s.grade] >= filterGradeLevel
            );
            if (!hasGrade) return false;
        }

        if (candidate.salaryExpectationFrom) {
            if (candidate.salaryExpectationFrom > filterSalaryRange[1]) return false;
            if (
                candidate.salaryExpectationTo &&
                candidate.salaryExpectationTo < filterSalaryRange[0]
            )
                return false;
        }

        if (filterRemote !== null && candidate.isRemoteAvailable !== filterRemote) return false;

        if (filterLookingForJob !== null && candidate.isLookingForJob !== filterLookingForJob)
            return false;

        if (onlyMatching && selectedVacancyId) {
            const vacancy = MOCK_EMPLOYER_VACANCIES.find((v) => v.id === selectedVacancyId);
            if (vacancy && !isCandidateMatchingVacancy(candidate, vacancy)) {
                return false;
            }
        }

        return true;
    });

    // ========================================================================
    // 🎯 Действия
    // ========================================================================
    const handleInvite = (candidate: CandidateSearchResult) => {
        setInviteModalCandidate(candidate);
        setInvitationVacancyId(selectedVacancyId);
        setInvitationMessage('');
    };

    const handleSendInvitation = () => {
        if (!inviteModalCandidate || !invitationVacancyId) {
            message.error('Выберите вакансию');
            return;
        }

        message.success(
            `Приглашение отправлено кандидату ${inviteModalCandidate.firstName} ${inviteModalCandidate.lastName}`
        );
        setInviteModalCandidate(null);
        setInvitationVacancyId(null);
        setInvitationMessage('');
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterDirection('all');
        setFilterGrade('all');
        setFilterSalaryRange([0, 1000000]);
        setFilterRemote(null);
        setFilterLookingForJob(null);
        setSelectedVacancyId(null);
        setOnlyMatching(false);
    };

    // ========================================================================
    // 🎨 Рендер таблицы сравнения hard skills
    // ========================================================================
    const renderHardSkillsTable = () => {
        if (!selectedCandidate || !selectedVacancyId) return null;

        const vacancy = MOCK_EMPLOYER_VACANCIES.find((v) => v.id === selectedVacancyId);
        if (!vacancy) return null;

        const candidateSkill = selectedCandidate.skills.find(
            (s) => s.direction === vacancy.direction
        );
        if (!candidateSkill) return null;

        const candidateGradeLevel = GRADE_ORDER[candidateSkill.grade];
        const vacancyGradeLevel = GRADE_ORDER[vacancy.grade];

        // Если грейд кандидата ниже — показываем предупреждение
        if (candidateGradeLevel < vacancyGradeLevel) {
            return (
                <Alert
                    message="Грейд кандидата ниже требуемого"
                    description={
                        <span>
                            Требуется: <Text strong>{GRADE_LABELS[vacancy.grade]}</Text>
                            <br />
                            У кандидата: <Text strong>{GRADE_LABELS[candidateSkill.grade]}</Text>
                        </span>
                    }
                    type="error"
                    showIcon
                    style={{ borderRadius: 8 }}
                />
            );
        }

        // Если грейд кандидата выше — все навыки автоматически засчитаны
        if (candidateGradeLevel > vacancyGradeLevel) {
            return (
                <Alert
                    message={
                        <span>
                            Грейд кандидата <Text strong>{GRADE_LABELS[candidateSkill.grade]}</Text>{' '}
                            выше требуемого <Text strong>{GRADE_LABELS[vacancy.grade]}</Text>. Все
                            навыки автоматически засчитаны на 100%.
                        </span>
                    }
                    type="success"
                    showIcon
                    style={{ borderRadius: 8 }}
                />
            );
        }

        // Формируем данные для таблицы
        const tableData = vacancy.hardSkills.map((hs: VacancyHardSkill) => {
            const topicTest = selectedCandidate.topicTests?.find(
                (t) => t.topicKey === hs.topicKey
            );
            const candidatePercent = topicTest ? topicTest.bestScore : 0;
            const meetsRequirement = candidatePercent >= hs.requiredPercent;

            return {
                key: hs.topicKey,
                topicName: getTopicName(hs.topicKey),
                requiredPercent: hs.requiredPercent,
                candidatePercent,
                meetsRequirement,
            };
        });

        const columns: ColumnsType<typeof tableData[0]> = [
            {
                title: 'Тема',
                dataIndex: 'topicName',
                key: 'topicName',
                render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>,
            },
            {
                title: 'Требуется',
                dataIndex: 'requiredPercent',
                key: 'requiredPercent',
                align: 'center',
                width: 100,
                render: (percent: number) => (
                    <Tag color="#402FFF" style={{ margin: 0 }}>
                        {percent}%
                    </Tag>
                ),
            },
            {
                title: 'У кандидата',
                dataIndex: 'candidatePercent',
                key: 'candidatePercent',
                align: 'center',
                width: 120,
                render: (percent: number) => (
                    <Text strong style={{ color: getConfidenceColor(percent), fontSize: 14 }}>
                        {percent}%
                    </Text>
                ),
            },
            {
                title: 'Статус',
                key: 'status',
                align: 'center',
                width: 140,
                render: (_, record) =>
                    record.meetsRequirement ? (
                        <Tag
                            color="#52c41a"
                            icon={<CheckCircleOutlined />}
                            style={{ fontSize: 11, padding: '2px 8px', margin: 0 }}
                        >
                            Соответствует
                        </Tag>
                    ) : (
                        <Tag
                            color="#f5222d"
                            icon={<CloseCircleOutlined />}
                            style={{ fontSize: 11, padding: '2px 8px', margin: 0 }}
                        >
                            Не хватает {record.requiredPercent - record.candidatePercent}%
                        </Tag>
                    ),
            },
        ];

        return (
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="small"
                bordered
                style={{ borderRadius: 8 }}
            />
        );
    };

    // ========================================================================
    // 🎨 Рендер
    // ========================================================================
    const selectedVacancy = selectedVacancyId
        ? MOCK_EMPLOYER_VACANCIES.find((v) => v.id === selectedVacancyId)
        : null;

    return (
        <div>
            {/* Заголовок */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <SearchOutlined style={{ fontSize: 32, color: '#402FFF' }} />
                    <Title level={2} style={{ margin: 0 }}>
                        Подбор кандидатов
                    </Title>
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Поиск и просмотр профилей кандидатов для ваших вакансий
                </Text>
            </div>

            {/* Фильтры */}
            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <FilterOutlined style={{ color: '#402FFF' }} />
                    <Text strong>Фильтры</Text>
                </div>

                {/* Фильтры по вакансиям */}
                <div
                    style={{
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        marginBottom: 16,
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12} md={10}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Выберите вакансию</Text>
                            </div>
                            <Select
                                placeholder="Выберите вакансию для фильтрации"
                                style={{ width: '100%' }}
                                value={selectedVacancyId}
                                onChange={(value) => {
                                    setSelectedVacancyId(value);
                                    if (value) setOnlyMatching(true);
                                }}
                                allowClear
                                onClear={() => {
                                    setSelectedVacancyId(null);
                                    setOnlyMatching(false);
                                }}
                            >
                                {MOCK_EMPLOYER_VACANCIES.filter((v) => v.status === 'published').map(
                                    (vacancy) => (
                                        <Select.Option key={vacancy.id} value={vacancy.id}>
                                            <Space>
                                                <Text strong>{vacancy.title}</Text>
                                                <Tag
                                                    color={DIRECTION_COLORS[vacancy.direction]}
                                                    style={{ fontSize: 10, padding: '0 6px' }}
                                                >
                                                    {DIRECTION_LABELS[vacancy.direction]}
                                                </Tag>
                                                <Tag
                                                    color={GRADE_COLORS[vacancy.grade]}
                                                    style={{ fontSize: 10, padding: '0 6px' }}
                                                >
                                                    {GRADE_LABELS[vacancy.grade]}
                                                </Tag>
                                            </Space>
                                        </Select.Option>
                                    )
                                )}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ marginBottom: 8, visibility: 'hidden' }}>
                                <Text strong>.</Text>
                            </div>
                            <Checkbox
                                checked={onlyMatching}
                                onChange={(e) => setOnlyMatching(e.target.checked)}
                                disabled={!selectedVacancyId}
                                style={{ fontSize: 14 }}
                            >
                                <Text strong>Только подходящие под вакансию</Text>
                            </Checkbox>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                                Показывать кандидатов, соответствующих требованиям вакансии
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Основные фильтры */}
                <Row gutter={16} align="bottom">
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Поиск</Text>
                        </div>
                        <Search
                            placeholder="Имя кандидата"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Направление</Text>
                        </div>
                        <Select
                            value={filterDirection}
                            onChange={setFilterDirection}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все направления</Select.Option>
                            {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    {label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Грейд (от)</Text>
                        </div>
                        <Select
                            value={filterGrade}
                            onChange={setFilterGrade}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все грейды</Select.Option>
                            {Object.entries(GRADE_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    {label} и выше
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Удалённая работа</Text>
                        </div>
                        <Select
                            value={filterRemote === null ? 'all' : filterRemote ? 'yes' : 'no'}
                            onChange={(value) =>
                                setFilterRemote(value === 'all' ? null : value === 'yes')
                            }
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Любая</Select.Option>
                            <Select.Option value="yes">Только удалённо</Select.Option>
                            <Select.Option value="no">Только в офисе</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Ищет работу</Text>
                        </div>
                        <Select
                            value={
                                filterLookingForJob === null
                                    ? 'all'
                                    : filterLookingForJob
                                        ? 'yes'
                                        : 'no'
                            }
                            onChange={(value) =>
                                setFilterLookingForJob(value === 'all' ? null : value === 'yes')
                            }
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="all">Все</Select.Option>
                            <Select.Option value="yes">Только ищущие</Select.Option>
                            <Select.Option value="no">Не ищущие</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col xs={24} md={18}>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Зарплатные ожидания (₽)</Text>
                        </div>
                        <Slider
                            range
                            min={0}
                            max={1000000}
                            step={10000}
                            value={filterSalaryRange}
                            onChange={(value) =>
                                setFilterSalaryRange(value as [number, number])
                            }
                            marks={{
                                0: '0',
                                250000: '250к',
                                500000: '500к',
                                750000: '750к',
                                1000000: '1M',
                            }}
                        />
                    </Col>
                    <Col
                        xs={24}
                        md={6}
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                    >
                        <Button icon={<ReloadOutlined />} onClick={handleResetFilters} block>
                            Сбросить фильтры
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Основной контент */}
            {filteredCandidates.length === 0 ? (
                <Card>
                    <Empty description="Нет кандидатов, соответствующих выбранным фильтрам" />
                </Card>
            ) : (
                <Row gutter={24}>
                    {/* Левая колонка: список кандидатов */}
                    <Col xs={24} lg={8}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <UserOutlined style={{ color: '#402FFF' }} />
                                    <span>Кандидаты</span>
                                    <Tag color="#402FFF" style={{ marginLeft: 'auto' }}>
                                        {filteredCandidates.length}
                                    </Tag>
                                </div>
                            }
                        >
                            {filteredCandidates.map((candidate) => {
                                const matchPercent =
                                    selectedVacancy
                                        ? calculateMatchPercent(candidate, selectedVacancy)
                                        : undefined;
                                return (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onClick={() => setSelectedCandidate(candidate)}
                                        isSelected={selectedCandidate?.id === candidate.id}
                                        matchPercent={matchPercent}
                                        showMatch={!!selectedVacancy}
                                    />
                                );
                            })}
                        </Card>
                    </Col>

                    {/* Правая колонка: детали кандидата */}
                    <Col xs={24} lg={16}>
                        {selectedCandidate ? (
                            <Card
                                title={
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Avatar
                                            size={40}
                                            style={{
                                                backgroundColor: '#402FFF',
                                                fontSize: 16,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {selectedCandidate.firstName.charAt(0)}
                                            {selectedCandidate.lastName.charAt(0)}
                                        </Avatar>
                                        <span>
                                            {selectedCandidate.lastName} {selectedCandidate.firstName}
                                            {selectedCandidate.middleName &&
                                                ` ${selectedCandidate.middleName}`}
                                        </span>
                                        {selectedCandidate.isLookingForJob && (
                                            <Badge status="processing" text="Ищет работу" />
                                        )}
                                    </div>
                                }
                                extra={
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={() => handleInvite(selectedCandidate)}
                                        style={{
                                            background: '#402FFF',
                                            borderColor: '#402FFF',
                                        }}
                                    >
                                        Пригласить
                                    </Button>
                                }
                            >
                                {/* Основная информация */}
                                <div
                                    style={{
                                        padding: 16,
                                        background: '#f5f5f5',
                                        borderRadius: 8,
                                        borderLeft: `4px solid ${selectedCandidate.skills[0]
                                            ? DIRECTION_COLORS[selectedCandidate.skills[0].direction]
                                            : '#402FFF'
                                            }`,
                                        marginBottom: 20,
                                    }}
                                >
                                    {selectedCandidate.currentPosition && (
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {selectedCandidate.currentPosition}
                                            </Text>
                                            {selectedCandidate.currentCompany && (
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 14, marginLeft: 8 }}
                                                >
                                                    • {selectedCandidate.currentCompany}
                                                </Text>
                                            )}
                                        </div>
                                    )}
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Опыт работы
                                            </Text>
                                            <div style={{ fontSize: 16, fontWeight: 600 }}>
                                                {selectedCandidate.totalExperienceYears}{' '}
                                                {selectedCandidate.totalExperienceYears === 1
                                                    ? 'год'
                                                    : selectedCandidate.totalExperienceYears < 5
                                                        ? 'года'
                                                        : 'лет'}
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Зарплатные ожидания
                                            </Text>
                                            <div
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    color: '#402FFF',
                                                }}
                                            >
                                                {selectedCandidate.salaryExpectationFrom
                                                    ? `${formatSalary(
                                                        selectedCandidate.salaryExpectationFrom,
                                                        selectedCandidate.currency
                                                    )}${selectedCandidate.salaryExpectationTo
                                                        ? ` — ${formatSalary(
                                                            selectedCandidate.salaryExpectationTo,
                                                            selectedCandidate.currency
                                                        )}`
                                                        : ''
                                                    }`
                                                    : 'Не указаны'}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                <Divider />

                                {/* Навыки */}
                                <div style={{ marginBottom: 20 }}>
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        {selectedCandidate.skills.map((skill, index) => (
                                            <Card
                                                key={index}
                                                size="small"
                                                style={{ background: '#fafafa' }}
                                                bodyStyle={{ padding: 12 }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    <Space size={4}>
                                                        <Tag
                                                            color={DIRECTION_COLORS[skill.direction]}
                                                            style={{ margin: 0 }}
                                                        >
                                                            {DIRECTION_LABELS[skill.direction]}
                                                        </Tag>
                                                        <Tag
                                                            color={GRADE_COLORS[skill.grade]}
                                                            style={{ margin: 0 }}
                                                        >
                                                            {GRADE_LABELS[skill.grade]}
                                                        </Tag>
                                                        <Text strong style={{ fontSize: 13 }}>
                                                            {skill.language}
                                                        </Text>
                                                    </Space>
                                                    <Text
                                                        strong
                                                        style={{
                                                            fontSize: 18,
                                                            color: getConfidenceColor(skill.confidence),
                                                        }}
                                                    >
                                                        {skill.confidence}%
                                                    </Text>
                                                </div>
                                                <Progress
                                                    percent={skill.confidence}
                                                    showInfo={false}
                                                    strokeColor={getConfidenceColor(skill.confidence)}
                                                    size="small"
                                                />
                                            </Card>
                                        ))}
                                    </Space>
                                </div>

                                <Divider />
                                {/* Сравнение hard skills (если выбрана вакансия) */}
                                {selectedVacancy && (
                                    <>
                                        <div style={{ marginBottom: 20 }}>
                                            <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                                <CodeOutlined style={{ marginRight: 8 }} />
                                                Сравнение hard skills с вакансией
                                                <Tag
                                                    color="#402FFF"
                                                    style={{ marginLeft: 8, fontSize: 11 }}
                                                >
                                                    {selectedVacancy.title}
                                                </Tag>
                                            </Title>
                                            {renderHardSkillsTable()}
                                        </div>
                                        <Divider />
                                    </>
                                )}

                                {/* Контакты */}
                                <div style={{ marginBottom: 20 }}>
                                    <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                        <MailOutlined style={{ marginRight: 8 }} />
                                        Контакты
                                    </Title>
                                    <Descriptions column={1} size="small" bordered>
                                        {selectedCandidate.email && (
                                            <Descriptions.Item label="Email">
                                                <MailOutlined
                                                    style={{ marginRight: 8, color: '#402FFF' }}
                                                />
                                                <a href={`mailto:${selectedCandidate.email}`}>
                                                    {selectedCandidate.email}
                                                </a>
                                            </Descriptions.Item>
                                        )}
                                        {selectedCandidate.telegram && (
                                            <Descriptions.Item label="Telegram">
                                                <SendOutlined
                                                    style={{ marginRight: 8, color: '#722ed1' }}
                                                />
                                                {selectedCandidate.telegram}
                                            </Descriptions.Item>
                                        )}
                                        {selectedCandidate.location && (
                                            <Descriptions.Item label="Локация">
                                                <EnvironmentOutlined
                                                    style={{ marginRight: 8, color: '#402FFF' }}
                                                />
                                                {selectedCandidate.location}
                                                {selectedCandidate.isRemoteAvailable && (
                                                    <Tag
                                                        color="#52c41a"
                                                        icon={<GlobalOutlined />}
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        Доступна удалённая работа
                                                    </Tag>
                                                )}
                                            </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="Последняя активность">
                                            <ClockCircleOutlined
                                                style={{ marginRight: 8, color: '#402FFF' }}
                                            />
                                            <Text
                                                style={{
                                                    color: getActivityStatus(
                                                        selectedCandidate.lastActiveAt
                                                    ).color,
                                                }}
                                            >
                                                {getActivityStatus(selectedCandidate.lastActiveAt).label}
                                            </Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>

                                <Divider />

                                {/* О себе */}
                                {selectedCandidate.aboutMe && (
                                    <>
                                        <div style={{ marginBottom: 20 }}>
                                            <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                                <UserOutlined style={{ marginRight: 8 }} />
                                                О себе
                                            </Title>
                                            <Paragraph
                                                style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}
                                            >
                                                {selectedCandidate.aboutMe}
                                            </Paragraph>
                                        </div>
                                        <Divider />
                                    </>
                                )}



                                {/* Soft Skills */}
                                {selectedCandidate.softSkills.length > 0 && (
                                    <>
                                        <div style={{ marginBottom: 20 }}>
                                            <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                                <TeamOutlined style={{ marginRight: 8 }} />
                                                Soft Skills
                                            </Title>
                                            <Space wrap size={[8, 8]}>
                                                {selectedCandidate.softSkills.map((skill, _index) => (
                                                    <Tag
                                                        key={_index}
                                                        color="#722ed1"
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

                                {/* Образование */}
                                {selectedCandidate.education.length > 0 && (
                                    <>
                                        <div style={{ marginBottom: 20 }}>
                                            <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                                <BankOutlined style={{ marginRight: 8 }} />
                                                Образование
                                            </Title>
                                            <Timeline
                                                items={selectedCandidate.education.map((edu, index) => ({
                                                    color: '#402FFF',
                                                    children: (
                                                        <div key={index}>
                                                            <Text strong style={{ fontSize: 14 }}>
                                                                {edu.institution}
                                                            </Text>
                                                            <div style={{ fontSize: 13, color: '#6b7280' }}>
                                                                {edu.specialty}
                                                            </div>
                                                            {edu.endYear && (
                                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                                                    {edu.endYear}
                                                                </Text>
                                                            )}
                                                        </div>
                                                    ),
                                                }))}
                                            />
                                        </div>
                                        <Divider />
                                    </>
                                )}

                                {/* Достижения ФСП */}
                                {selectedCandidate.fspAchievements.length > 0 && (
                                    <div>
                                        <Title level={5} style={{ marginBottom: 12, color: '#402FFF' }}>
                                            <TrophyOutlined style={{ marginRight: 8 }} />
                                            Достижения в ФСП
                                        </Title>
                                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                            {selectedCandidate.fspAchievements.map((achievement, index) => {
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
                                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                                        <CalendarOutlined style={{ marginRight: 4 }} />
                                                                        {dayjs(achievement.eventDate).format('D MMMM YYYY')}
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                            <Tag color={resultConfig.color} icon={resultConfig.icon}>
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
                        ) : (
                            <Card>
                                <Empty description="Выберите кандидата из списка слева" />
                            </Card>
                        )}
                    </Col>
                </Row>
            )}

            {/* Модалка приглашения */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SendOutlined style={{ color: '#402FFF' }} />
                        <span>Пригласить кандидата</span>
                    </div>
                }
                open={!!inviteModalCandidate}
                onOk={handleSendInvitation}
                onCancel={() => {
                    setInviteModalCandidate(null);
                    setInvitationVacancyId(null);
                    setInvitationMessage('');
                }}
                okText="Отправить приглашение"
                cancelText="Отмена"
                okButtonProps={{
                    style: { background: '#402FFF', borderColor: '#402FFF' },
                }}
                width={600}
            >
                {inviteModalCandidate && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={`Приглашение кандидату ${inviteModalCandidate.firstName} ${inviteModalCandidate.lastName}`}
                            description="Выберите вакансию и напишите сопроводительное сообщение"
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Выберите вакансию *</Text>
                            </div>
                            <Select
                                placeholder="Выберите вакансию"
                                style={{ width: '100%' }}
                                value={invitationVacancyId}
                                onChange={setInvitationVacancyId}
                            >
                                {MOCK_EMPLOYER_VACANCIES.filter((v) => v.status === 'published').map(
                                    (vacancy) => (
                                        <Select.Option key={vacancy.id} value={vacancy.id}>
                                            <Space>
                                                <Text strong>{vacancy.title}</Text>
                                                <Tag
                                                    color={DIRECTION_COLORS[vacancy.direction]}
                                                    style={{ fontSize: 11 }}
                                                >
                                                    {DIRECTION_LABELS[vacancy.direction]}
                                                </Tag>
                                                <Tag
                                                    color={GRADE_COLORS[vacancy.grade]}
                                                    style={{ fontSize: 11 }}
                                                >
                                                    {GRADE_LABELS[vacancy.grade]}
                                                </Tag>
                                            </Space>
                                        </Select.Option>
                                    )
                                )}
                            </Select>
                        </div>

                        <div>
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Сопроводительное сообщение</Text>
                                <Tag style={{ fontSize: 11, marginLeft: 8 }}>необязательно</Tag>
                            </div>
                            <Input.TextArea
                                rows={5}
                                placeholder="Здравствуйте! Мы ознакомились с вашим профилем и хотели бы пригласить вас на вакансию..."
                                value={invitationMessage}
                                onChange={(e) => setInvitationMessage(e.target.value)}
                                maxLength={1000}
                                showCount
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployerCandidates;