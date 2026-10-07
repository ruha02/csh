// Маппинг технических имен ролей на русские описания
export const ROLE_DESCRIPTIONS: Record<string, string> = {
    admins: 'Администраторы',
    employers: 'Работодатели',
    candidats: 'Кандидаты',
};

// Значение по умолчанию, если роль не найдена
export const DEFAULT_ROLE_DESCRIPTION = 'Гость';

// Функция для получения описания роли
export const getRoleDescription = (roleName: string): string => {
    return ROLE_DESCRIPTIONS[roleName] || DEFAULT_ROLE_DESCRIPTION;
};