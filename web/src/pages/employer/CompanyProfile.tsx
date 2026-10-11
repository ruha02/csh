import {
    BankOutlined,
    CalendarOutlined,
    CloseOutlined,
    EditOutlined,
    EnvironmentOutlined,
    GithubOutlined,
    GlobalOutlined,
    LinkedinOutlined,
    MailOutlined,
    MessageOutlined,
    PhoneOutlined,
    SaveOutlined,
    SendOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    message
} from 'antd';
import React, { useState } from 'react';
import {
    MOCK_COMPANY_PROFILE,
    type CompanyIndustry,
    type CompanyProfileData,
    type CompanySize,
} from '../../mocks';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// Маппинг для отображения отраслей
const INDUSTRY_LABELS: Record<CompanyIndustry, string> = {
    it: 'Информационные технологии',
    finance: 'Финансы и банки',
    retail: 'Ритейл и e-commerce',
    manufacturing: 'Производство',
    education: 'Образование',
    healthcare: 'Здравоохранение',
    media: 'Медиа и развлечения',
    consulting: 'Консалтинг',
    other: 'Другое',
};

// Маппинг для отображения размера компании
const SIZE_LABELS: Record<CompanySize, string> = {
    '1-10': '1-10 сотрудников',
    '11-50': '11-50 сотрудников',
    '51-200': '51-200 сотрудников',
    '201-500': '201-500 сотрудников',
    '501-1000': '501-1000 сотрудников',
    '1000+': 'Более 1000 сотрудников',
};

const EmployerCompanyProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [companyData, setCompanyData] = useState<CompanyProfileData>(MOCK_COMPANY_PROFILE);

    const handleEdit = () => {
        form.setFieldsValue({
            ...companyData,
            socialLinks: companyData.socialLinks || {},
            benefits: companyData.benefits?.join('\n') || '',
            technologies: companyData.technologies?.join('\n') || '',
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        form.resetFields();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            const benefits = values.benefits
                ? values.benefits.split('\n').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const technologies = values.technologies
                ? values.technologies.split('\n').map((s: string) => s.trim()).filter(Boolean)
                : [];

            setCompanyData({
                ...values,
                benefits,
                technologies,
                socialLinks: values.socialLinks || {},
            });

            message.success('Профиль компании успешно обновлён');
            setIsEditing(false);
        } catch {
            message.error('Проверьте заполнение полей');
        }
    };

    // Режим просмотра
    if (!isEditing) {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>Профиль компании</Title>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        style={{ background: '#402FFF', borderColor: '#402FFF' }}
                    >
                        Редактировать
                    </Button>
                </div>

                <Card>
                    {/* Шапка с логотипом и названием */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
                        <Avatar
                            size={120}
                            src={companyData.logo}
                            style={{ backgroundColor: '#402FFF', fontSize: 36, fontWeight: 700 }}
                        >
                            {companyData.name.charAt(0)}
                        </Avatar>
                        <div style={{ flex: 1, minWidth: 300 }}>
                            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                                {companyData.name}
                            </Title>
                            <Space wrap>
                                <Tag color="#402FFF" icon={<BankOutlined />}>
                                    {INDUSTRY_LABELS[companyData.industry]}
                                </Tag>
                                <Tag color="#52c41a" icon={<TeamOutlined />}>
                                    {SIZE_LABELS[companyData.size]}
                                </Tag>
                                {companyData.foundedYear && (
                                    <Tag icon={<CalendarOutlined />}>
                                        Основана в {companyData.foundedYear}
                                    </Tag>
                                )}
                            </Space>
                        </div>
                    </div>

                    <Divider />

                    {/* Краткое описание */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            <MessageOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            О компании
                        </Title>
                        <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#1B1C21', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {companyData.description || 'Информация не указана'}
                        </Paragraph>
                    </div>

                    <Divider />

                    {/* Контактная информация */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            <UserOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            Контактная информация
                        </Title>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Email">
                                <MailOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                <a href={`mailto:${companyData.email}`}>{companyData.email}</a>
                            </Descriptions.Item>
                            {companyData.phone && (
                                <Descriptions.Item label="Телефон">
                                    <PhoneOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                    <a href={`tel:${companyData.phone}`}>{companyData.phone}</a>
                                </Descriptions.Item>
                            )}
                            {companyData.website && (
                                <Descriptions.Item label="Сайт">
                                    <GlobalOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                    <a href={companyData.website} target="_blank" rel="noopener noreferrer">
                                        {companyData.website}
                                    </a>
                                </Descriptions.Item>
                            )}
                            {companyData.address && (
                                <Descriptions.Item label="Адрес">
                                    <EnvironmentOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                    {companyData.address}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </div>

                    <Divider />

                    {/* Социальные сети */}
                    {(companyData.socialLinks.telegram || companyData.socialLinks.vk ||
                        companyData.socialLinks.linkedin || companyData.socialLinks.github) && (
                            <>
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 16 }}>
                                        <GlobalOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                        Социальные сети
                                    </Title>
                                    <Space wrap size="middle">
                                        {companyData.socialLinks.telegram && (
                                            <Button
                                                icon={<SendOutlined />}
                                                href={`https://t.me/${companyData.socialLinks.telegram.replace('@', '')}`}
                                                target="_blank"
                                                style={{ borderColor: '#722ed1', color: '#722ed1' }}
                                            >
                                                Telegram
                                            </Button>
                                        )}
                                        {companyData.socialLinks.vk && (
                                            <Button
                                                icon={<GlobalOutlined />}
                                                href={companyData.socialLinks.vk}
                                                target="_blank"
                                                style={{ borderColor: '#1890ff', color: '#1890ff' }}
                                            >
                                                ВКонтакте
                                            </Button>
                                        )}
                                        {companyData.socialLinks.linkedin && (
                                            <Button
                                                icon={<LinkedinOutlined />}
                                                href={companyData.socialLinks.linkedin}
                                                target="_blank"
                                                style={{ borderColor: '#0077b5', color: '#0077b5' }}
                                            >
                                                LinkedIn
                                            </Button>
                                        )}
                                        {companyData.socialLinks.github && (
                                            <Button
                                                icon={<GithubOutlined />}
                                                href={companyData.socialLinks.github}
                                                target="_blank"
                                                style={{ borderColor: '#1B1C21', color: '#1B1C21' }}
                                            >
                                                GitHub
                                            </Button>
                                        )}
                                    </Space>
                                </div>
                                <Divider />
                            </>
                        )}

                    {/* Подробное описание */}
                    {companyData.about && (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <Title level={4} style={{ marginBottom: 16 }}>
                                    <MessageOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                    Подробная информация
                                </Title>
                                <Paragraph style={{ fontSize: 14, lineHeight: 1.8, color: '#1B1C21', margin: 0, whiteSpace: 'pre-wrap' }}>
                                    {companyData.about}
                                </Paragraph>
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Преимущества */}
                    {companyData.benefits && companyData.benefits.length > 0 && (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <Title level={4} style={{ marginBottom: 16 }}>
                                    <TeamOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                    Что мы предлагаем
                                </Title>
                                <Space wrap size={[8, 12]}>
                                    {companyData.benefits.map((benefit, index) => (
                                        <Tag
                                            key={index}
                                            color="#52c41a"
                                            style={{ fontSize: 13, padding: '6px 12px' }}
                                        >
                                            {benefit}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Технологии */}
                    {companyData.technologies && companyData.technologies.length > 0 && (
                        <div>
                            <Title level={4} style={{ marginBottom: 16 }}>
                                <GlobalOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                Используемые технологии
                            </Title>
                            <Space wrap size={[8, 12]}>
                                {companyData.technologies.map((tech, index) => (
                                    <Tag
                                        key={index}
                                        color="#402FFF"
                                        style={{ fontSize: 13, padding: '6px 12px' }}
                                    >
                                        {tech}
                                    </Tag>
                                ))}
                            </Space>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // Режим редактирования
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Редактирование профиля компании</Title>
                <Space>
                    <Button icon={<CloseOutlined />} onClick={handleCancel}>
                        Отмена
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        style={{ background: '#402FFF', borderColor: '#402FFF' }}
                    >
                        Сохранить
                    </Button>
                </Space>
            </div>

            <Card>
                <Form form={form} layout="vertical">
                    {/* Основная информация */}
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <BankOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Основная информация
                    </Title>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="name"
                                label="Название компании"
                                rules={[{ required: true, message: 'Введите название компании' }]}
                            >
                                <Input placeholder='ООО "Название компании"' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="industry"
                                label="Отрасль"
                                rules={[{ required: true, message: 'Выберите отрасль' }]}
                            >
                                <Select placeholder="Выберите отрасль">
                                    {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item
                                name="size"
                                label="Размер компании"
                                rules={[{ required: true, message: 'Выберите размер' }]}
                            >
                                <Select placeholder="Выберите размер">
                                    {Object.entries(SIZE_LABELS).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="foundedYear" label="Год основания">
                        <Input type="number" min={1800} max={new Date().getFullYear()} placeholder="2015" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Краткое описание"
                        rules={[{ required: true, message: 'Введите описание компании' }]}
                        extra="Краткое описание для отображения в карточке компании"
                    >
                        <TextArea rows={3} placeholder="Расскажите о вашей компании в нескольких предложениях..." maxLength={500} showCount />
                    </Form.Item>

                    <Form.Item
                        name="logo"
                        label="URL логотипа"
                        extra="Ссылка на изображение логотипа компании"
                    >
                        <Input placeholder="https://example.com/logo.png" />
                    </Form.Item>

                    <Divider />

                    {/* Контактная информация */}
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <UserOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Контактная информация
                    </Title>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Введите email' },
                                    { type: 'email', message: 'Некорректный email' },
                                ]}
                            >
                                <Input placeholder="hr@company.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="phone" label="Телефон">
                                <Input placeholder="+7 (495) 123-45-67" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="website" label="Сайт компании">
                        <Input placeholder="https://company.com" />
                    </Form.Item>

                    <Form.Item name="address" label="Адрес">
                        <Input placeholder="г. Москва, ул. Примерная, д. 1" />
                    </Form.Item>

                    <Divider />

                    {/* Социальные сети */}
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <GlobalOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Социальные сети
                    </Title>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name={['socialLinks', 'telegram']} label="Telegram">
                                <Input placeholder="@company_hr" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name={['socialLinks', 'vk']} label="ВКонтакте">
                                <Input placeholder="https://vk.com/company" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name={['socialLinks', 'linkedin']} label="LinkedIn">
                                <Input placeholder="https://linkedin.com/company/company" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name={['socialLinks', 'github']} label="GitHub">
                                <Input placeholder="https://github.com/company" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Подробная информация */}
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <MessageOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Подробная информация
                    </Title>

                    <Form.Item
                        name="about"
                        label="О компании"
                        extra="Подробная информация о компании, истории, ценностях и миссии"
                    >
                        <TextArea rows={6} placeholder="Расскажите подробно о вашей компании..." maxLength={2000} showCount />
                    </Form.Item>

                    <Form.Item
                        name="benefits"
                        label="Что вы предлагаете сотрудникам"
                        extra="Каждое преимущество с новой строки"
                    >
                        <TextArea
                            rows={4}
                            placeholder={'Гибкий график работы\nУдалённая работа\nДМС\nОплата обучения'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="technologies"
                        label="Используемые технологии"
                        extra="Каждая технология с новой строки"
                    >
                        <TextArea
                            rows={4}
                            placeholder={'TypeScript\nReact\nNode.js\nPython\nPostgreSQL'}
                        />
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EmployerCompanyProfile;