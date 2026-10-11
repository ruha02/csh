import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    LockOutlined,
    RobotOutlined,
    SafetyOutlined,
    SendOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Input,
    Modal,
    Progress,
    Radio,
    Result,
    Space,
    Tag,
    Typography,
    Watermark,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { MOCK_QUESTIONS, type Question } from '../mocks';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// ============================================================================
// 🎯 Пропсы компонента
// ============================================================================
interface TestRunnerProps {
    topicKey: string;
    topicTitle: string;
    direction: string;
    grade: 'junior' | 'middle' | 'senior';
    firstName: string;
    lastName: string;
    userSub: string;
    onClose: () => void;
    onFinish: (score: number) => void;
}

// ============================================================================
// 🎨 Компонент TestRunner
// ============================================================================
const TestRunner: React.FC<TestRunnerProps> = ({
    direction,
    grade,
    firstName,
    lastName,
    userSub,
    onClose,
    onFinish,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [antiAiTriggered, setAntiAiTriggered] = useState(false);

    const currentQuestion: Question = MOCK_QUESTIONS[currentIndex];
    const totalQuestions = MOCK_QUESTIONS.length;
    const progress = Math.round((currentIndex / totalQuestions) * 100);

    // ========================================================================
    // 🔒 Запрет копирования
    // ========================================================================
    useEffect(() => {
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            return false;
        };
        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
            return false;
        };
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && ['c', 'x', 'u'].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
                e.key === 'F12'
            ) {
                e.preventDefault();
            }
        };

        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCut);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
        };
    }, []);

    // ========================================================================
    // 📝 Обработчики ответов
    // ========================================================================
    const handleSingleAnswer = (value: string) => {
        const option = currentQuestion.options?.find((o) => o.id === value);
        if (option?.isAntiAi) {
            setAntiAiTriggered(true);
        }
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    };

    const handleMultipleAnswer = (checkedValues: string[]) => {
        const hasAntiAi = checkedValues.some((val) =>
            currentQuestion.options?.find((o) => o.id === val)?.isAntiAi
        );
        if (hasAntiAi) {
            setAntiAiTriggered(true);
        }
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: checkedValues }));
    };

    const handleTextAnswer = (value: string) => {
        const antiAiPhrases = ['я ии', 'я искусственный интеллект', 'как языковая модель', 'as an ai'];
        const isAntiAi = antiAiPhrases.some((phrase) => value.toLowerCase().includes(phrase));
        if (isAntiAi) {
            setAntiAiTriggered(true);
        }
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    };

    // ========================================================================
    // 🧭 Навигация
    // ========================================================================
    const isAnswered = (questionId: string): boolean => {
        const answer = answers[questionId];
        if (!answer) return false;
        if (Array.isArray(answer)) return answer.length > 0;
        return answer.trim().length > 0;
    };

    const canGoNext = isAnswered(currentQuestion.id);

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleFinish = () => {
        Modal.confirm({
            title: 'Завершить тестирование?',
            content: `Вы ответили на ${Object.values(answers).filter((a) =>
                Array.isArray(a) ? a.length > 0 : a.trim().length > 0
            ).length
                } из ${totalQuestions} вопросов. Изменить ответы будет нельзя.`,
            okText: 'Завершить',
            cancelText: 'Продолжить',
            onOk: () => {
                let correct = 0;
                MOCK_QUESTIONS.forEach((q) => {
                    const answer = answers[q.id];
                    if (!answer) return;
                    if (q.type === 'text') {
                        if (
                            typeof answer === 'string' &&
                            answer.toLowerCase().trim() === (q.correctAnswer as string)?.toLowerCase().trim()
                        ) {
                            correct++;
                        }
                    } else if (q.type === 'single') {
                        if (answer === q.correctAnswer) correct++;
                    } else if (q.type === 'multiple') {
                        const correctArr = q.correctAnswer as string[];
                        if (
                            Array.isArray(answer) &&
                            correctArr.length === answer.length &&
                            correctArr.every((a) => answer.includes(a))
                        ) {
                            correct++;
                        }
                    }
                });
                const finalScore = Math.round((correct / totalQuestions) * 100);
                setScore(finalScore);
                setIsFinished(true);
                onFinish(finalScore);
            },
        });
    };

    // ========================================================================
    // 🏁 Экран результатов
    // ========================================================================
    if (isFinished) {
        const passed = score >= 70;
        return (
            <div style={{
                minHeight: '100vh',
                background: '#EDEDED',
                padding: '40px 20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Card style={{ maxWidth: 600, width: '100%' }}>
                    <Result
                        status={passed ? 'success' : 'error'}
                        icon={
                            passed
                                ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                : <CloseCircleOutlined style={{ color: '#f5222d' }} />
                        }
                        title={
                            <div>
                                <Text strong style={{ fontSize: 24 }}>
                                    {passed ? 'Тест пройден!' : 'Тест не пройден'}
                                </Text>
                                {antiAiTriggered && (
                                    <Alert
                                        message="Обнаружена попытка использования ИИ"
                                        description="В ваших ответах зафиксированы признаки использования искусственного интеллекта. Результат может быть аннулирован модератором."
                                        type="warning"
                                        showIcon
                                        icon={<RobotOutlined />}
                                        style={{ marginTop: 16 }}
                                    />
                                )}
                            </div>
                        }
                        subTitle={
                            <div style={{ fontSize: 16 }}>
                                Правильных ответов: <Text strong>{score}%</Text> из 100%
                                <br />
                                Порог прохождения: <Text strong>70%</Text>
                            </div>
                        }
                        extra={[
                            <Button
                                key="close"
                                type="primary"
                                size="large"
                                onClick={onClose}
                                style={{ background: '#402FFF', borderColor: '#402FFF' }}
                            >
                                Вернуться к навыкам
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // ========================================================================
    // 📝 Экран тестирования
    // ========================================================================
    return (
        <Watermark
            content={[`${lastName}`, `${firstName}`].concat(userSub.split('-'))}
            font={{
                color: 'rgba(0, 0, 0, 0.05)',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'monospace',
            }}
            rotate={-22}
            gap={[5, 5]}
            width={100}
            height={200}
            zIndex={1000}
            offset={[50, 50]}
        >
            <div style={{
                minHeight: '100vh',
                background: '#EDEDED',
                padding: '24px 20px',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Шапка с прогрессом */}
                <Card style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Вопрос {currentIndex + 1} из {totalQuestions}
                            </Text>
                            {/* Текст вопроса */}
                            <div style={{ marginBottom: 24 }}>
                                {(() => {
                                    const attentionIndex = currentQuestion.text.indexOf('ВНИМАНИЕ:');
                                    if (attentionIndex !== -1) {
                                        const mainText = currentQuestion.text.substring(0, attentionIndex).trim();
                                        const attentionText = currentQuestion.text.substring(attentionIndex + 'ВНИМАНИЕ:'.length).trim();
                                        return (
                                            <>
                                                <div style={{
                                                    fontSize: 18,
                                                    fontWeight: 600,
                                                    color: '#1B1C21',
                                                    marginBottom: 16,
                                                    lineHeight: 1.5,
                                                }}>
                                                    {mainText}
                                                </div>
                                                <Alert
                                                    message={
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <RobotOutlined style={{ fontSize: 18, color: '#EC1D35' }} />
                                                        </div>
                                                    }
                                                    description={<Text style={{ fontSize: 14, lineHeight: 1.6 }}>{attentionText}</Text>}
                                                    type="warning"
                                                    showIcon={false}
                                                    style={{
                                                        border: '2px solid #EC1D35',
                                                        background: '#fff2f0',
                                                        borderRadius: 8,
                                                        padding: '12px 16px',
                                                    }}
                                                />
                                            </>
                                        );
                                    }
                                    return (
                                        <div style={{
                                            fontSize: 18,
                                            fontWeight: 600,
                                            color: '#1B1C21',
                                            lineHeight: 1.5,
                                        }}>
                                            {currentQuestion.text}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <Button
                            type="text"
                            danger
                            onClick={() => {
                                Modal.confirm({
                                    title: 'Прервать тестирование?',
                                    content: 'Все ответы будут потеряны. Вы сможете пройти тест повторно через 30 дней.',
                                    okText: 'Прервать',
                                    okType: 'danger',
                                    cancelText: 'Продолжить',
                                    onOk: onClose,
                                });
                            }}
                        >
                            Прервать тест
                        </Button>
                    </div>
                    <Progress percent={progress} strokeColor="#402FFF" showInfo={false} size="small" />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Tag color="#402FFF">{direction}</Tag>
                        <Tag>{grade}</Tag>
                        <Tag icon={<SafetyOutlined />} color="green">Защита от копирования активна</Tag>
                        {antiAiTriggered && (
                            <Tag icon={<RobotOutlined />} color="red">Обнаружен ИИ</Tag>
                        )}
                    </div>
                </Card>

                {/* Предупреждение о запрете копирования */}
                <Alert
                    message="Внимание!"
                    description={
                        <div>
                            <Paragraph style={{ marginBottom: 4 }}>
                                <LockOutlined style={{ marginRight: 8, color: '#f5222d' }} />
                                <Text strong>Копирование, выделение текста и контекстное меню запрещены.</Text>
                            </Paragraph>
                            <Paragraph style={{ marginBottom: 0, fontSize: 12 }}>
                                Любые попытки использования внешних источников или ИИ будут зафиксированы.
                            </Paragraph>
                        </div>
                    }
                    type="warning"
                    showIcon={false}
                    style={{ marginBottom: 24 }}
                />

                {/* Карточка вопроса */}
                <Card>
                    <div style={{ marginBottom: 16 }}>
                        <Tag
                            color={
                                currentQuestion.type === 'single' ? '#402FFF' :
                                    currentQuestion.type === 'multiple' ? '#722ed1' : '#fa8c16'
                            }
                            style={{ fontSize: 12, padding: '4px 12px' }}
                        >
                            {currentQuestion.type === 'single' && 'Один правильный ответ'}
                            {currentQuestion.type === 'multiple' && 'Несколько правильных ответов'}
                            {currentQuestion.type === 'text' && 'Текстовый ответ'}
                        </Tag>
                    </div>

                    {currentQuestion.type === 'single' && currentQuestion.options && (
                        <Radio.Group
                            onChange={(e) => handleSingleAnswer(e.target.value)}
                            value={answers[currentQuestion.id] as string}
                            style={{ width: '100%' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {currentQuestion.options.map((option) => (
                                    <Card
                                        key={option.id}
                                        size="small"
                                        hoverable
                                        style={{
                                            border: answers[currentQuestion.id] === option.id ? '2px solid #402FFF' : '1px solid #d9d9d9',
                                            background: option.isAntiAi ? '#fff2f0' : '#fff',
                                        }}
                                    >
                                        <Radio value={option.id} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Text>{option.text}</Text>
                                                {option.isAntiAi && (
                                                    <Tag icon={<RobotOutlined />} color="red" style={{ fontSize: 10, padding: '0 6px' }}>
                                                        Анти-ИИ
                                                    </Tag>
                                                )}
                                            </div>
                                        </Radio>
                                    </Card>
                                ))}
                            </Space>
                        </Radio.Group>
                    )}

                    {currentQuestion.type === 'multiple' && currentQuestion.options && (
                        <Checkbox.Group
                            onChange={(values) => handleMultipleAnswer(values as string[])}
                            value={answers[currentQuestion.id] as string[]}
                            style={{ width: '100%' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                {currentQuestion.options.map((option) => (
                                    <Card
                                        key={option.id}
                                        size="small"
                                        hoverable
                                        style={{
                                            border: (answers[currentQuestion.id] as string[])?.includes(option.id)
                                                ? '2px solid #722ed1'
                                                : '1px solid #d9d9d9',
                                            background: option.isAntiAi ? '#fff2f0' : '#fff',
                                        }}
                                    >
                                        <Checkbox value={option.id} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Text>{option.text}</Text>
                                            </div>
                                        </Checkbox>
                                    </Card>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    )}

                    {currentQuestion.type === 'text' && (
                        <TextArea
                            rows={4}
                            placeholder="Введите ваш ответ..."
                            value={(answers[currentQuestion.id] as string) || ''}
                            onChange={(e) => handleTextAnswer(e.target.value)}
                            style={{ fontSize: 14 }}
                            maxLength={500}
                            showCount
                        />
                    )}
                </Card>

                {/* Навигация */}
                <div style={{
                    marginTop: 24,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Button onClick={handlePrev} disabled={currentIndex === 0} size="large">
                        ← Назад
                    </Button>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {MOCK_QUESTIONS.map((q, idx) => (
                            <div
                                key={q.id}
                                onClick={() => setCurrentIndex(idx)}
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background:
                                        idx === currentIndex ? '#402FFF' :
                                            isAnswered(q.id) ? '#52c41a' : '#d9d9d9',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                title={`Вопрос ${idx + 1}${isAnswered(q.id) ? ' ✓' : ''}`}
                            />
                        ))}
                    </div>
                    <Button
                        type="primary"
                        onClick={handleNext}
                        disabled={!canGoNext}
                        size="large"
                        icon={currentIndex === totalQuestions - 1 ? <SendOutlined /> : undefined}
                        style={{ background: '#402FFF', borderColor: '#402FFF' }}
                    >
                        {currentIndex === totalQuestions - 1 ? 'Завершить' : 'Далее →'}
                    </Button>
                </div>
            </div>
        </Watermark>
    );
};

export default TestRunner;