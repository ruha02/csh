import type { Resume } from './types';

export const MOCK_RESUMES: Resume[] = [
    {
        id: 1,
        title: 'Senior Frontend Developer',
        skillId: 1,
        skillName: 'TypeScript',
        direction: 'frontend',
        grade: 'middle',
        confidence: 68,
        salaryFrom: 250000,
        salaryTo: 350000,
        currency: 'RUB',
        description: 'Ищу позицию Senior Frontend Developer.',
        createdAt: '2026-09-15',
        updatedAt: '2026-10-01',
    },
    {
        id: 2,
        title: 'Backend Developer (Python)',
        skillId: 2,
        skillName: 'Python',
        direction: 'backend',
        grade: 'junior',
        confidence: 35,
        salaryFrom: 200000,
        salaryTo: 280000,
        currency: 'RUB',
        description: 'Разработка микросервисов на Python/FastAPI.',
        createdAt: '2026-08-20',
        updatedAt: '2026-09-10',
    },
];