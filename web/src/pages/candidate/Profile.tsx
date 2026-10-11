import {
    BankOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseOutlined,
    ContactsOutlined,
    DeleteOutlined,
    EditOutlined,
    MailOutlined,
    MessageOutlined,
    PhoneOutlined,
    PlusOutlined,
    SaveOutlined,
    SendOutlined,
    StarOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Space,
    Tag,
    Timeline,
    Typography,
    message,
} from 'antd';
import ruRU from 'antd/es/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import React, { useState } from 'react';
import {
    MOCK_PROFILE,
    formatPeriod,
    getYearWord,
    type CandidateProfileData
} from '../../mocks';

dayjs.locale('ru');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CandidateProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [profileData, setProfileData] = useState<CandidateProfileData>(MOCK_PROFILE);

    const handleEdit = () => {
        const workExperience = profileData.workExperience.map((exp) => ({
            ...exp,
            startDate: dayjs(exp.startDate),
            endDate: exp.endDate ? dayjs(exp.endDate) : undefined,
        }));
        form.setFieldsValue({
            ...profileData,
            workExperience,
            education: profileData.education,
            softSkills: profileData.softSkills.join(', '),
            aboutMe: profileData.aboutMe,
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
            setProfileData({
                ...values,
                education: values.education || [],
                softSkills: values.softSkills
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                workExperience: values.workExperience.map((exp: any) => ({
                    ...exp,
                    startDate: exp.startDate ? dayjs(exp.startDate).format('YYYY-MM-DD') : '',
                    endDate: exp.endDate ? dayjs(exp.endDate).format('YYYY-MM-DD') : undefined,
                })),
            });
            message.success('Анкета успешно обновлена');
            setIsEditing(false);
        } catch {
            message.error('Проверьте заполнение полей');
        }
    };

    const calculateTotalExperience = (): number => {
        let totalMonths = 0;
        const now = dayjs();
        profileData.workExperience.forEach((exp) => {
            const start = dayjs(exp.startDate);
            const end = exp.isCurrent || !exp.endDate ? now : dayjs(exp.endDate);
            totalMonths += end.diff(start, 'month');
        });
        return Math.floor(totalMonths / 12);
    };

    if (!isEditing) {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>Анкета кандидата</Title>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        style={{ background: '#402FFF', borderColor: '#402FFF' }}
                    >
                        Изменить
                    </Button>
                </div>
                <Card>
                    <div style={{ marginBottom: 24 }}>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            <UserOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            ФИО
                        </Title>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Фамилия"><Text strong>{profileData.lastName}</Text></Descriptions.Item>
                            <Descriptions.Item label="Имя"><Text strong>{profileData.firstName}</Text></Descriptions.Item>
                            <Descriptions.Item label="Отчество"><Text strong>{profileData.middleName}</Text></Descriptions.Item>
                        </Descriptions>
                    </div>
                    <Divider />
                    <div style={{ marginBottom: 24 }}>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            <ContactsOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            Контакты
                        </Title>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Телефон">
                                <PhoneOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                {profileData.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <MailOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                {profileData.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Telegram">
                                <SendOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                {profileData.telegram}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                    <Divider />
                    <div style={{ marginBottom: 24 }}>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            <BankOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            Образование
                        </Title>
                        {profileData.education && profileData.education.length > 0 ? (
                            <Timeline
                                items={[...profileData.education]
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
                                                <Row gutter={[16, 8]}>
                                                    <Col span={24}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Text strong style={{ fontSize: '16px', color: '#1B1C21' }}>
                                                                {edu.institution}
                                                            </Text>
                                                            {edu.isCurrent && (
                                                                <Tag color="#EC1D35" icon={<CheckCircleOutlined />} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                                    Учусь сейчас
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Text style={{ color: '#6b7280', fontSize: '14px' }}>{edu.specialty}</Text>
                                                        {edu.degree && <Tag style={{ marginLeft: 8, fontSize: '12px' }}>{edu.degree}</Tag>}
                                                    </Col>
                                                    <Col span={24}>
                                                        <ClockCircleOutlined style={{ marginRight: 6, color: '#C8C9CA' }} />
                                                        <Text style={{ color: '#6b7280', fontSize: '13px' }}>
                                                            {edu.startYear} — {edu.isCurrent || !edu.endYear ? 'по настоящее время' : edu.endYear}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ),
                                    }))}
                            />
                        ) : (
                            <Text type="secondary">Образование не указано</Text>
                        )}
                    </div>
                    <Divider />
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Title level={4} style={{ margin: 0 }}>
                                <ClockCircleOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                                Опыт работы
                            </Title>
                            <Tag color="#402FFF" style={{ fontSize: '14px', padding: '4px 12px' }}>
                                Общий стаж: {calculateTotalExperience()} {getYearWord(calculateTotalExperience())}
                            </Tag>
                        </div>
                        {profileData.workExperience.length > 0 ? (
                            <Timeline
                                items={profileData.workExperience.map((exp) => ({
                                    color: exp.isCurrent ? '#EC1D35' : '#402FFF',
                                    children: (
                                        <Card
                                            size="small"
                                            style={{
                                                background: '#F9FAFB',
                                                borderLeft: `3px solid ${exp.isCurrent ? '#EC1D35' : '#402FFF'}`,
                                            }}
                                        >
                                            <Row gutter={[16, 8]}>
                                                <Col span={24}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Text strong style={{ fontSize: '16px', color: '#1B1C21' }}>{exp.position}</Text>
                                                        {exp.isCurrent && (
                                                            <Tag color="#EC1D35" icon={<CheckCircleOutlined />} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                                Текущее место работы
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col span={24}>
                                                    <BankOutlined style={{ marginRight: 6, color: '#402FFF' }} />
                                                    <Text>{exp.company}</Text>
                                                </Col>
                                                <Col span={24}>
                                                    <ClockCircleOutlined style={{ marginRight: 6, color: '#C8C9CA' }} />
                                                    <Text style={{ color: '#6b7280', fontSize: '13px' }}>
                                                        {formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}
                                                    </Text>
                                                </Col>
                                                {exp.description && (
                                                    <Col span={24}>
                                                        <Paragraph style={{ marginTop: 8, marginBottom: 0, color: '#1B1C21', fontSize: '14px' }}>
                                                            {exp.description}
                                                        </Paragraph>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Card>
                                    ),
                                }))}
                            />
                        ) : (
                            <Text type="secondary">Опыт работы не указан</Text>
                        )}
                    </div>
                    <Divider />
                    <div>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            <StarOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            Софт-скиллы
                        </Title>
                        <Space wrap>
                            {profileData.softSkills.map((skill, index) => (
                                <Tag key={index} color="#402FFF" style={{ fontSize: '13px', padding: '4px 12px' }}>
                                    {skill}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                    <Divider />
                    <div>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            <MessageOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                            О себе
                        </Title>
                        <Paragraph style={{ fontSize: '14px', lineHeight: 1.7, color: '#1B1C21', margin: 0 }}>
                            {profileData.aboutMe || 'Информация не указана'}
                        </Paragraph>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Редактирование анкеты</Title>
                <Space>
                    <Button icon={<CloseOutlined />} onClick={handleCancel}>Отмена</Button>
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
                <Form form={form} layout="vertical" initialValues={{ workExperience: [] }}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <UserOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        ФИО
                    </Title>
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: 'Введите фамилию' }]}>
                                <Input disabled placeholder="Фамилия" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}>
                                <Input disabled placeholder="Имя" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="middleName" label="Отчество" rules={[{ required: true, message: 'Введите отчество' }]}>
                                <Input disabled placeholder="Отчество" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <BankOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Образование
                    </Title>
                    <Form.List name="education">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card key={key} size="small" style={{ marginBottom: 16, background: '#F9FAFB', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(name)}
                                                disabled={fields.length === 1}
                                            />
                                        </div>
                                        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Образование #{index + 1}</Title>
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'startYear']}
                                                    label="Год поступления"
                                                    rules={[{ required: true, message: 'Введите год поступления' }]}
                                                >
                                                    <Input type="number" min={1950} max={2030} placeholder="2015" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item {...restField} name={[name, 'isCurrent']} valuePropName="checked" style={{ marginBottom: 0 }}>
                                                    <Checkbox
                                                        style={{ marginTop: 32 }}
                                                        onChange={(e) => {
                                                            if (e.target.checked) form.setFieldValue(['education', name, 'endYear'], undefined);
                                                        }}
                                                    >
                                                        Учусь сейчас
                                                    </Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            noStyle
                                            shouldUpdate={(prev, cur) => (cur.education || [])[name]?.isCurrent !== (prev.education || [])[name]?.isCurrent}
                                        >
                                            {({ getFieldValue }) => {
                                                const isCurrent = getFieldValue(['education', name, 'isCurrent']);
                                                return !isCurrent ? (
                                                    <Row gutter={16}>
                                                        <Col xs={24} sm={12}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'endYear']}
                                                                label="Год окончания"
                                                                rules={[{ required: true, message: 'Введите год окончания' }]}
                                                            >
                                                                <Input type="number" min={1950} max={2030} placeholder="2020" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                ) : null;
                                            }}
                                        </Form.Item>
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'institution']}
                                                    label="Образовательное учреждение"
                                                    rules={[{ required: true, message: 'Введите название учебного заведения' }]}
                                                >
                                                    <Input placeholder='МГТУ им. Н.Э. Баумана' />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'specialty']}
                                                    label="Специальность"
                                                    rules={[{ required: true, message: 'Введите специальность' }]}
                                                >
                                                    <Input placeholder="Информатика и вычислительная техника" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item {...restField} name={[name, 'degree']} label="Степень / Квалификация">
                                            <Select placeholder="Выберите степень">
                                                <Select.Option value="Бакалавр">Бакалавр</Select.Option>
                                                <Select.Option value="Специалист">Специалист</Select.Option>
                                                <Select.Option value="Магистр">Магистр</Select.Option>
                                                <Select.Option value="Аспирант">Аспирант</Select.Option>
                                                <Select.Option value="Профессиональная переподготовка">Профессиональная переподготовка</Select.Option>
                                                <Select.Option value="Курсы">Курсы</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: '#402FFF', color: '#402FFF' }}>
                                    Добавить образование
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Divider />
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <ContactsOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Контакты
                    </Title>
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Введите номер телефона' }]}>
                                <Input placeholder="+7 (900) 123-45-67" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, message: 'Введите email' }, { type: 'email', message: 'Некорректный email' }]}
                            >
                                <Input placeholder="example@mail.ru" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="telegram" label="Telegram" rules={[{ required: true, message: 'Введите ссылку на Telegram' }]}>
                                <Input placeholder="@username" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <ClockCircleOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Опыт работы
                    </Title>
                    <Form.List name="workExperience">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card key={key} size="small" style={{ marginBottom: 16, background: '#F9FAFB', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} disabled={fields.length === 1} />
                                        </div>
                                        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Период работы #{index + 1}</Title>
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'startDate']}
                                                    label="Дата начала"
                                                    rules={[{ required: true, message: 'Выберите дату начала' }]}
                                                >
                                                    <DatePicker style={{ width: '100%' }} picker="month" placeholder="Месяц и год" locale={ruRU} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item {...restField} name={[name, 'isCurrent']} valuePropName="checked" style={{ marginBottom: 0 }}>
                                                    <Checkbox
                                                        style={{ marginTop: 32 }}
                                                        onChange={(e) => {
                                                            if (e.target.checked) form.setFieldValue(['workExperience', name, 'endDate'], undefined);
                                                        }}
                                                    >
                                                        По настоящее время
                                                    </Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            noStyle
                                            shouldUpdate={(prev, cur) => (cur.workExperience || [])[name]?.isCurrent !== (prev.workExperience || [])[name]?.isCurrent}
                                        >
                                            {({ getFieldValue }) => {
                                                const isCurrent = getFieldValue(['workExperience', name, 'isCurrent']);
                                                return !isCurrent ? (
                                                    <Row gutter={16}>
                                                        <Col xs={24} sm={12}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'endDate']}
                                                                label="Дата окончания"
                                                                rules={[{ required: true, message: 'Выберите дату окончания' }]}
                                                            >
                                                                <DatePicker style={{ width: '100%' }} picker="month" placeholder="Месяц и год" locale={ruRU} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                ) : null;
                                            }}
                                        </Form.Item>
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'company']}
                                                    label="Место работы"
                                                    rules={[{ required: true, message: 'Введите название компании' }]}
                                                >
                                                    <Input placeholder='ООО "Название компании"' />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'position']}
                                                    label="Должность"
                                                    rules={[{ required: true, message: 'Введите должность' }]}
                                                >
                                                    <Input placeholder="Например: Senior Developer" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'description']}
                                            label="Описание работы"
                                            rules={[{ required: true, message: 'Введите описание' }]}
                                        >
                                            <TextArea rows={3} placeholder="Опишите ваши обязанности и достижения" />
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: '#402FFF', color: '#402FFF' }}>
                                    Добавить период работы
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Divider />
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <StarOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        Софт-скиллы
                    </Title>
                    <Form.Item
                        name="softSkills"
                        label="Софт-скиллы (через запятую)"
                        rules={[{ required: true, message: 'Введите софт-скиллы' }]}
                        extra="Перечислите навыки через запятую"
                    >
                        <TextArea rows={3} placeholder="Коммуникабельность, Работа в команде, Аналитическое мышление" />
                    </Form.Item>
                    <Divider />
                    <Title level={4} style={{ marginBottom: 16 }}>
                        <MessageOutlined style={{ marginRight: 8, color: '#402FFF' }} />
                        О себе
                    </Title>
                    <Form.Item
                        name="aboutMe"
                        label="Расскажите о себе"
                        rules={[{ required: true, message: 'Напишите немного о себе' }]}
                        extra="Краткое описание вашего опыта, интересов и целей"
                    >
                        <TextArea rows={5} placeholder="Расскажите о себе, своих интересах, достижениях и профессиональных целях..." showCount maxLength={1000} />
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CandidateProfile;