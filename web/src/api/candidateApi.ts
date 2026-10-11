// web/src/api/candidateApi.ts
import api from './axios';

// --- Типы (должны соответствовать schemas/candidate.py на бэкенде) ---
export interface EducationResponse {
    id: number;
    institution: string;
    specialty: string;
    degree: string | null;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
}

export interface WorkExperienceResponse {
    id: number;
    company: string;
    position: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
}

export interface CandidateSoftSkillResponse {
    id: number;
    soft_skill_dict_id: number;
    name: string;
}

export interface CandidateSkillResponse {
    id: number;
    direction: string;
    grade: string;
    language: string;
    confidence: number | null;
}

export interface CandidateProfileResponse {
    id: number;
    user_sub: string;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    phone: string | null;
    email: string | null;
    telegram: string | null;
    about_me: string | null;
    educations: EducationResponse[];
    work_experiences: WorkExperienceResponse[];
    soft_skills: CandidateSoftSkillResponse[];
    skills: CandidateSkillResponse[];
    registered_at: string | null;
    last_active_at: string | null;
    status: string;
    is_verified: boolean;
}

// --- API Методы ---

export const candidateApi = {
    // 1. Профиль
    getProfile: async (): Promise<CandidateProfileResponse> => {
        const { data } = await api.get<CandidateProfileResponse>('/candidate/profile');
        return data;
    },

    updateProfile: async (payload: Partial<CandidateProfileResponse>): Promise<CandidateProfileResponse> => {
        const { data } = await api.put<CandidateProfileResponse>('/candidate/profile', payload);
        return data;
    },

    // 2. Навыки
    getSkills: async (): Promise<CandidateSkillResponse[]> => {
        const { data } = await api.get<CandidateSkillResponse[]>('/candidate/skills');
        return data;
    },

    createSkill: async (payload: { direction: string; grade: string; language: string }): Promise<CandidateSkillResponse> => {
        const { data } = await api.post<CandidateSkillResponse>('/candidate/skills', payload);
        return data;
    },

    deleteSkill: async (skillId: number): Promise<void> => {
        await api.delete(`/candidate/skills/${skillId}`);
    },

    // 3. Образование
    getEducations: async (): Promise<EducationResponse[]> => {
        const { data } = await api.get<EducationResponse[]>('/candidate/educations');
        return data;
    },

    createEducation: async (payload: any): Promise<EducationResponse> => {
        const { data } = await api.post<EducationResponse>('/candidate/educations', payload);
        return data;
    },

    // 4. Опыт работы
    getWorkExperiences: async (): Promise<WorkExperienceResponse[]> => {
        const { data } = await api.get<WorkExperienceResponse[]>('/candidate/work-experiences');
        return data;
    },

    createWorkExperience: async (payload: any): Promise<WorkExperienceResponse> => {
        const { data } = await api.post<WorkExperienceResponse>('/candidate/work-experiences', payload);
        return data;
    },
};