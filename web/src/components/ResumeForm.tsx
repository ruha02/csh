import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Typography,
} from 'antd';
import React, { useEffect } from 'react';
import {
    DIRECTION_LABELS,
    GRADE_LABELS,
    MOCK_SKILLS,
    type Resume,
} from '../mocks';

const { Title } = Typography;
const { TextArea } = Input;

interface ResumeFormProps {
    resume: Resume | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ resume, onSubmit, onCancel }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (resume) {
            form.setFieldsValue({
                title: resume.title,
                skillId: resume.skillId,
                salaryFrom: resume.salaryFrom,
                salaryTo: resume.salaryTo,
                description: resume.description,
            });
        } else {
            form.resetFields();
        }
    }, [resume, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const selectedSkill = MOCK_SKILLS.find((s) => s.id === values.skillId);
            onSubmit({
                ...values,
                skillName: selectedSkill?.language || '',
                direction: selectedSkill?.direction || '',
                grade: selectedSkill?.grade || 'junior',
                confidence: selectedSkill?.confidence || 0,
                currency: 'RUB',
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        {resume ? 'Редактировать резюме' : 'Создать резюме'}
                    </Title>
                </div>
            }
            open={true}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" icon={<CloseOutlined />} onClick={onCancel}>
                    Отмена
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    style={{ background: '#402FFF', borderColor: '#402FFF' }}
                >
                    {resume ? 'Сохранить' : 'Создать'}
                </Button>,
            ]}
            width={600}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item
                    name="title"
                    label="Название резюме"
                    rules={[{ required: true, message: 'Введите название резюме' }]}
                    extra="Например: Senior Frontend Developer"
                >
                    <Input placeholder="Введите название позиции" />
                </Form.Item>
                <Form.Item
                    name="skillId"
                    label="Навык (компетенция)"
                    rules={[{ required: true, message: 'Выберите навык' }]}
                    extra="Грейд и уверенность будут взяты из раздела Навыки"
                >
                    <Select placeholder="Выберите навык">
                        {MOCK_SKILLS.map((skill) => (
                            <Select.Option key={skill.id} value={skill.id}>
                                <Space>
                                    <Typography.Text>{DIRECTION_LABELS[skill.direction]}</Typography.Text>
                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                        ({skill.language}, {GRADE_LABELS[skill.grade]}, {skill.confidence}%)
                                    </Typography.Text>
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Ожидаемая зарплата (рубли)" required extra="Укажите вилку от и до">
                    <Space direction="horizontal" style={{ width: '100%' }} size="middle">
                        <Form.Item
                            name="salaryFrom"
                            label="От"
                            rules={[{ required: true, message: 'Введите минимальную зарплату' }]}
                            style={{ marginBottom: 0, flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={10000}
                                placeholder="От"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                parser={(value) => value?.replace(/\s/g, '') as unknown as 0}
                            />
                        </Form.Item>
                        <Typography.Text style={{ fontSize: 16, color: '#8c8c8c' }}>—</Typography.Text>
                        <Form.Item name="salaryTo" label="До" style={{ marginBottom: 0, flex: 1 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={10000}
                                placeholder="До"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                parser={(value) => value?.replace(/\s/g, '') as unknown as 0}
                            />
                        </Form.Item>
                    </Space>
                </Form.Item>
                <Form.Item name="description" label="Описание / Цели" extra="Кратко опишите ваши цели и ожидания">
                    <TextArea rows={4} placeholder="Расскажите о ваших профессиональных целях..." maxLength={500} showCount />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ResumeForm;