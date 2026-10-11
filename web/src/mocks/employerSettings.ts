import type { EmployerSettings } from './types';

export const MOCK_EMPLOYER_SETTINGS: EmployerSettings = {
    notifications: {
        channels: {
            email: true,
            telegram: true,
            inApp: true,
        },
        events: {
            newResponse: true,
            responseViewedByCandidate: false,
            taskSubmitted: true,
            candidateShortlisted: true,
            invitationExpiring: true,
            vacancyDeadlineSoon: true,
            newCandidateMatch: true,
        },
    },
    vacancyDefaults: {
        defaultDeadlineDays: 30,
        defaultFormat: 'hybrid',
        autoArchiveOnClose: true,
        showSalary: true,
    },
    privacy: {
        companyVisibility: 'public',
        showContactEmail: true,
        showContactPhone: false,
        showRejectionReasons: true,
        allowAiTaskGeneration: true,
    },
    integrations: {
        telegram: { connected: true, username: '@technosoft_hr' },
        headhunter: { connected: true, accountName: 'ТехноСофт' },
        habrCareer: { connected: false },
        github: { connected: true, orgName: 'technosoft' },
    },
    team: [
        {
            id: 1,
            name: 'Петр Петров',
            email: 'employer@goodgenius.ru',
            role: 'owner',
            joinedAt: '2025-01-15',
        },
        {
            id: 2,
            name: 'Анна Сидорова',
            email: 'anna.sidorova@technosoft.example.com',
            role: 'hr',
            joinedAt: '2025-03-10',
        },
        {
            id: 3,
            name: 'Дмитрий Волков',
            email: 'dmitry.volkov@technosoft.example.com',
            role: 'hiring_manager',
            joinedAt: '2025-06-22',
        },
        {
            id: 4,
            name: 'Елена Козлова',
            email: 'elena.kozlova@technosoft.example.com',
            role: 'viewer',
            joinedAt: '2026-09-01',
        },
    ],
};