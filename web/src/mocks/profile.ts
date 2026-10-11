import type { CandidateProfileData } from './types';

export const MOCK_PROFILE: CandidateProfileData = {
  lastName: 'Иванов',
  firstName: 'Иван',
  middleName: 'Иванович',
  phone: '+7 (900) 123-45-67',
  email: 'ivanov@goodgenius.ru',
  telegram: '@ivanov_dev',
  education: [
    {
      institution: 'МГТУ им. Н.Э. Баумана',
      specialty: 'Информатика и вычислительная техника',
      startYear: 2015,
      endYear: 2020,
      isCurrent: false,
      degree: 'Специалист',
    },
    {
      institution: 'Яндекс Практикум',
      specialty: 'Веб-разработчик',
      startYear: 2021,
      endYear: undefined,
      isCurrent: true,
      degree: 'Профессиональная переподготовка',
    },
  ],
  workExperience: [
    {
      startDate: '2021-03-01',
      endDate: undefined,
      isCurrent: true,
      company: 'ООО "Технологии Будущего"',
      position: 'Senior Frontend Developer',
      description: 'Разработка и поддержка веб-приложений на React. Руководство командой из 3 разработчиков. Внедрение новых технологий и оптимизация производительности.',
    },
    {
      startDate: '2019-06-01',
      endDate: '2021-02-28',
      isCurrent: false,
      company: 'АО "Инновационные Решения"',
      position: 'Middle Frontend Developer',
      description: 'Разработка пользовательских интерфейсов. Интеграция с REST API. Написание unit-тестов.',
    },
  ],
  softSkills: ['Коммуникабельность', 'Работа в команде', 'Аналитическое мышление', 'Тайм-менеджмент', 'Адаптивность'],
  aboutMe: 'Увлечённый frontend-разработчик с опытом создания высоконагруженных веб-приложений. Люблю изучать новые технологии и делиться знаниями с командой. В свободное время участвую в open-source проектах и пишу технические статьи.',
};