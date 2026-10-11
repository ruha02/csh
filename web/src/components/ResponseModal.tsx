import { SendOutlined } from '@ant-design/icons';
import {
    Alert,
    Form,
    Input,
    Modal,
    Select,
    Tag,
    Typography,
    message
} from 'antd';
import React, { useEffect } from 'react';
import {
    DIRECTION_COLORS,
    DIRECTION_LABELS,
    GRADE_COLORS,
    GRADE_LABELS,
    MOCK_RESUMES,
    type Vacancy
} from '../mocks';

const { Text } = Typography;
const { TextArea } = Input;

interface ResponseModalProps {
    vacancy: Vacancy;
    open: boolean;
    onSubmit: (values: { resumeId: number; coverLetter: string }) => void;
    onCancel: () => void;
}

const ResponseModal: React.FC<ResponseModalProps> = ({
    vacancy,
    open,
    onSubmit,
    onCancel,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            // Автоматически выбираем наиболее подходящее резюме (по направлению)
            const matchingResume = MOCK_RESUMES.find(
                (r) => r.direction === vacancy.direction
            );
            if (matchingResume) {
                form.setFieldsValue({ resumeId: matchingResume.id });
            } else if (MOCK_RESUMES.length > 0) {
                form.setFieldsValue({ resumeId: MOCK_RESUMES[0].id });
            }
        }
    }, [open, vacancy, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
            message.success('Отклик успешно отправлен!');
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const selectedResumeId = Form.useWatch('resumeId', form);
    const selectedResume = MOCK_RESUMES.find((r) => r.id === selectedResumeId);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SendOutlined style={{ color: '#402FFF' }} />
                    <span>Отклик на вакансию</span>
                </div>
            }
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            okText="Отправить отклик"
            cancelText="Отмена"
            okButtonProps={{
                style: { background: '#402FFF', borderColor: '#402FFF' },
            }}
            width={640}
        >
            <div style={{ marginTop: 16 }}>
                {/* Информация о вакансии */}
                <div
                    style={{
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        borderLeft: `4px solid ${DIRECTION_COLORS[vacancy.direction]}`,
                        marginBottom: 20,
                    }}
                >
                    // Найдите блок с "vacancy.title" и замените на:
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                        {DIRECTION_LABELS[vacancy.direction]} • {GRADE_LABELS[vacancy.grade]}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {vacancy.employer}
                        </Text>
                        <Tag color={DIRECTION_COLORS[vacancy.direction]} style={{ fontSize: 11 }}>
                            {DIRECTION_LABELS[vacancy.direction]}
                        </Tag>
                        <Tag color={GRADE_COLORS[vacancy.grade]} style={{ fontSize: 11 }}>
                            {GRADE_LABELS[vacancy.grade]}
                        </Tag>
                    </div>
                </div>

                <Form form={form} layout="vertical">
                    {/* Выбор резюме */}
                    <Form.Item
                        name="resumeId"
                        label={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text strong>Выберите резюме *</Text>
                                <Tag color="#402FFF" style={{ fontSize: 11, margin: 0 }}>
                                    {MOCK_RESUMES.length} {MOCK_RESUMES.length === 1 ? 'резюме' : 'резюме'}
                                </Tag>
                            </div>
                        }
                        rules={[{ required: true, message: 'Выберите резюме для отклика' }]}
                        extra="Отклик будет отправлен от имени выбранного резюме"
                    >
                        <Select placeholder="Выберите резюме" size="large">
                            {MOCK_RESUMES.map((resume) => {
                                const isMatching = resume.direction === vacancy.direction;
                                return (
                                    <Select.Option key={resume.id} value={resume.id}>
                                        <div style={{ padding: '4px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <Text strong>{resume.title}</Text>
                                                {isMatching && (
                                                    <Tag color="#52c41a" style={{ fontSize: 10, padding: '0 6px', margin: 0 }}>
                                                        Подходящее
                                                    </Tag>
                                                )}
                                            </div>
                                            <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <Tag
                                                    color={DIRECTION_COLORS[resume.direction as keyof typeof DIRECTION_COLORS]}
                                                    style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                                                >
                                                    {DIRECTION_LABELS[resume.direction as keyof typeof DIRECTION_LABELS]}
                                                </Tag>
                                                <Tag
                                                    color={GRADE_COLORS[resume.grade]}
                                                    style={{ fontSize: 10, padding: '0 6px', margin: 0 }}
                                                >
                                                    {GRADE_LABELS[resume.grade]}
                                                </Tag>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    Уверенность: {resume.confidence}%
                                                </Text>
                                            </div>
                                        </div>
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    {/* Превью выбранного резюме */}
                    {selectedResume && (
                        <Alert
                            message={
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                        Предпросмотр резюме
                                    </Text>
                                    <div style={{ fontSize: 13 }}>
                                        <div>
                                            <Text type="secondary">Направление:</Text>{' '}
                                            <Text strong>
                                                {DIRECTION_LABELS[selectedResume.direction as keyof typeof DIRECTION_LABELS]}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text type="secondary">Грейд:</Text>{' '}
                                            <Text strong>{GRADE_LABELS[selectedResume.grade]}</Text>
                                        </div>
                                        <div>
                                            <Text type="secondary">Ожидаемая ЗП:</Text>{' '}
                                            <Text strong style={{ color: '#402FFF' }}>
                                                {selectedResume.salaryFrom.toLocaleString('ru-RU')} ₽
                                                {selectedResume.salaryTo &&
                                                    ` — ${selectedResume.salaryTo.toLocaleString('ru-RU')} ₽`}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            }
                            type="info"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />
                    )}

                    {/* Сопроводительное письмо */}
                    <Form.Item
                        name="coverLetter"
                        label={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text strong>Сопроводительное письмо</Text>
                                <Tag style={{ fontSize: 11, margin: 0 }}>необязательно</Tag>
                            </div>
                        }
                        extra="Расскажите работодателю, почему вы подходите на эту позицию"
                    >
                        <TextArea
                            rows={5}
                            placeholder="Здравствуйте! Меня заинтересовала ваша вакансия..."
                            maxLength={1000}
                            showCount
                        />
                    </Form.Item>

                    <Alert
                        message="После отправки вы сможете отслеживать статус отклика в этом разделе"
                        type="info"
                        showIcon
                        style={{ marginTop: 8 }}
                    />
                </Form>
            </div>
        </Modal>
    );
};

export default ResponseModal;