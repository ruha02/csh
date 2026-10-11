import type { CandidateSettings } from './types';

export const MOCK_CANDIDATE_SETTINGS: CandidateSettings = {
    notifications: {
        channels: {
            email: true,
            telegram: true,
            inApp: true,
        },
        events: {
            newVacancies: true,
            responseViewed: true,
            newTask: true,
            taskFeedback: true,
            newInvitation: true,
            invitationExpiring: true,
        },
    },
    privacy: {
        profileVisibility: 'all',
        hideCurrentEmployer: false,
        showTestResults: true,
        showFspResults: true,
    },
    integrations: {
        github: { connected: true, username: 'ivanov-dev' },
        telegram: { connected: true, username: '@ivanov_dev' },
        habr: { connected: false },
    },
};