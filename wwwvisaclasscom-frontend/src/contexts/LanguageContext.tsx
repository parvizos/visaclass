import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.scholarships': 'Scholarships',
    'nav.universities': 'Universities',
    'nav.programs': 'Programs',
    'nav.guide': 'Study Guide',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.login': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.title': 'Your Gateway to Turkish Universities',
    'hero.subtitle': 'Discover world-class education in Turkey. We help international students apply to over 100 universities with personalized guidance and support.',
    'hero.cta': 'Explore Universities',
    'hero.cta2': 'Start Application',
    
    // Stats
    'stats.universities': 'Partner Universities',
    'stats.students': 'Students Placed',
    'stats.countries': 'Countries Served',
    'stats.success': 'Success Rate',
    
    // Featured
    'featured.title': 'Featured Universities',
    'featured.subtitle': 'Explore top-ranked Turkish universities offering world-class education',
    'featured.viewAll': 'View All Universities',
    
    // Why Turkey
    'why.title': 'Why Study in Turkey?',
    'why.subtitle': 'Discover the advantages of pursuing your education in Turkey',
    'why.quality': 'Quality Education',
    'why.qualityDesc': 'Internationally accredited programs with modern facilities and experienced faculty',
    'why.affordable': 'Affordable Living',
    'why.affordableDesc': 'Low cost of living compared to Europe and North America with high quality of life',
    'why.culture': 'Rich Culture',
    'why.cultureDesc': 'Experience a unique blend of Eastern and Western cultures in a beautiful country',
    'why.career': 'Career Opportunities',
    'why.careerDesc': 'Access to growing job markets and international career prospects',
    
    // Testimonials
    'testimonials.title': 'Student Success Stories',
    'testimonials.subtitle': 'Hear from students who achieved their dreams with our help',
    
    // Footer
    'footer.description': 'Helping international students achieve their dreams of studying in Turkey since 2015.',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved.',
    
    // Common
    'common.learnMore': 'Learn More',
    'common.applyNow': 'Apply Now',
    'common.viewDetails': 'View Details',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.scholarships': 'Стипендии',
    'nav.universities': 'Университеты',
    'nav.programs': 'Программы',
    'nav.guide': 'Гид по обучению',
    'nav.about': 'О нас',
    'nav.contact': 'Контакты',
    'nav.login': 'Войти',
    'nav.signup': 'Регистрация',
    'nav.dashboard': 'Кабинет',
    'nav.logout': 'Выйти',
    
    // Hero
    'hero.title': 'Ваш путь в турецкие университеты',
    'hero.subtitle': 'Откройте для себя образование мирового класса в Турции. Мы помогаем иностранным студентам подавать заявки в более чем 100 университетов с персональной поддержкой.',
    'hero.cta': 'Изучить университеты',
    'hero.cta2': 'Начать заявку',
    
    // Stats
    'stats.universities': 'Университетов-партнеров',
    'stats.students': 'Студентов зачислено',
    'stats.countries': 'Стран обслуживаем',
    'stats.success': 'Успешных заявок',
    
    // Featured
    'featured.title': 'Рекомендуемые университеты',
    'featured.subtitle': 'Изучите ведущие турецкие университеты с образованием мирового уровня',
    'featured.viewAll': 'Все университеты',
    
    // Why Turkey
    'why.title': 'Почему Турция?',
    'why.subtitle': 'Узнайте преимущества обучения в Турции',
    'why.quality': 'Качественное образование',
    'why.qualityDesc': 'Международно аккредитованные программы с современным оборудованием и опытными преподавателями',
    'why.affordable': 'Доступная жизнь',
    'why.affordableDesc': 'Низкая стоимость жизни по сравнению с Европой и Северной Америкой',
    'why.culture': 'Богатая культура',
    'why.cultureDesc': 'Уникальное сочетание восточной и западной культур в красивой стране',
    'why.career': 'Карьерные возможности',
    'why.careerDesc': 'Доступ к растущим рынкам труда и международным карьерным перспективам',
    
    // Testimonials
    'testimonials.title': 'Истории успеха студентов',
    'testimonials.subtitle': 'Узнайте от студентов, которые осуществили свои мечты с нашей помощью',
    
    // Footer
    'footer.description': 'Помогаем иностранным студентам осуществить мечту об обучении в Турции с 2015 года.',
    'footer.quickLinks': 'Быстрые ссылки',
    'footer.contact': 'Связаться с нами',
    'footer.followUs': 'Мы в соцсетях',
    'footer.rights': 'Все права защищены.',
    
    // Common
    'common.learnMore': 'Узнать больше',
    'common.applyNow': 'Подать заявку',
    'common.viewDetails': 'Подробнее',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.loading': 'Загрузка...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('visaclass-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('visaclass-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};




