import type { Invitation } from './types';

export const MOCK_INVITATIONS: Invitation[] = [
    {
        id: 1,
        vacancyId: 1,
        vacancyTitle: 'Senior Frontend Developer',
        employer: 'ООО "ТехноСофт"',
        description:
            'Иван, мы ознакомились с вашим профилем и хотели бы пригласить вас на позицию Senior Frontend Developer. ' +
            'Ваш опыт работы с React и TypeScript, а также руководство командой, полностью соответствуют нашим требованиям. ' +
            'Будем рады обсудить детали на собеседовании.',
        status: 'pending',
        createdAt: '2026-10-09',
        expiresAt: '2026-10-16',
    },
    {
        id: 2,
        vacancyId: 4,
        vacancyTitle: 'Middle Mobile Developer (React Native)',
        employer: 'Ритейл-группа "МаркетПро"',
        description:
            'Здравствуйте! Ваше резюме привлекло наше внимание. Мы ищем Middle Mobile Developer для работы над приложением ' +
            'с аудиторией более 1 млн пользователей. Ваш опыт в React Native и мобильных приложениях нам очень интересен.',
        status: 'accepted',
        resumeId: 4,
        resumeTitle: 'Mobile Developer (React Native)',
        taskId: 5,
        createdAt: '2026-10-03',
        respondedAt: '2026-10-04',
    },
    {
        id: 3,
        vacancyId: 2,
        vacancyTitle: 'Middle Backend Developer (Python)',
        employer: 'АО "Инновационные Решения"',
        description:
            'Иван, приглашаем вас рассмотреть вакансию Middle Backend Developer. ' +
            'Ваш опыт с Python и FastAPI выглядит очень перспективно для наших задач.',
        status: 'rejected',
        resumeId: 2,
        resumeTitle: 'Backend Developer (Python)',
        createdAt: '2026-10-01',
        respondedAt: '2026-10-02',
        rejectionReason: 'Спасибо за приглашение! На данный момент я сосредоточен на frontend-разработке и не готов рассматривать backend-позиции.',
    },
    {
        id: 4,
        vacancyId: 7,
        vacancyTitle: 'Junior Frontend Developer',
        employer: 'Стартап "WebFlow Labs"',
        description:
            'Привет! Мы молодой стартап и ищем талантливого junior frontend-разработчика. ' +
            'Увидели ваш профиль и думаем, что вам будет интересно у нас. Готовы обсудить условия!',
        status: 'expired',
        createdAt: '2026-09-15',
        expiresAt: '2026-09-30',
    },
    {
        id: 5,
        vacancyId: 5,
        vacancyTitle: 'Senior Data Scientist',
        employer: 'Финтех-компания "АльфаКод"',
        description:
            'Иван, ваше резюме впечатлило нашу команду. Хотели бы пригласить вас на позицию Senior Data Scientist. ' +
            'Работа с ML-моделями для предсказания кредитных рисков — это как раз то, чем вы занимаетесь.',
        status: 'pending',
        createdAt: '2026-10-10',
        expiresAt: '2026-10-17',
    },
];