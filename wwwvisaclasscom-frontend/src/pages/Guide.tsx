import { BookOpen, Plane, Wallet, Home, Users, Award } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Guide = () => {
  const { language } = useLanguage();

  const sections = [
    {
      icon: BookOpen,
      title: language === 'en' ? 'Turkish Education System' : 'Система образования Турции',
      content: language === 'en'
        ? 'Turkey has over 200 universities offering world-class education. The academic year runs from September to June, with programs available in Turkish and English. Most universities follow the European Credit Transfer System (ECTS).'
        : 'В Турции более 200 университетов, предлагающих образование мирового класса. Учебный год длится с сентября по июнь, программы доступны на турецком и английском языках. Большинство университетов следуют Европейской системе перевода кредитов (ECTS).',
    },
    {
      icon: Plane,
      title: language === 'en' ? 'Visa Requirements' : 'Визовые требования',
      content: language === 'en'
        ? 'International students need a student visa to study in Turkey. Required documents include: acceptance letter, proof of financial means, health insurance, and valid passport. Processing usually takes 4-8 weeks.'
        : 'Иностранным студентам нужна студенческая виза для обучения в Турции. Необходимые документы: письмо о зачислении, подтверждение финансовых средств, медицинская страховка и действующий паспорт. Обработка обычно занимает 4-8 недель.',
    },
    {
      icon: Wallet,
      title: language === 'en' ? 'Cost of Living' : 'Стоимость жизни',
      content: language === 'en'
        ? 'Monthly expenses: Accommodation ($150-400), Food ($150-250), Transportation ($30-50), Utilities ($50-80), Entertainment ($50-100). Total average: $430-880/month depending on city and lifestyle.'
        : 'Ежемесячные расходы: Жильё ($150-400), Питание ($150-250), Транспорт ($30-50), Коммунальные услуги ($50-80), Развлечения ($50-100). Средняя сумма: $430-880/месяц в зависимости от города и образа жизни.',
    },
    {
      icon: Home,
      title: language === 'en' ? 'Accommodation Options' : 'Варианты жилья',
      content: language === 'en'
        ? 'Students can choose from: University dormitories ($50-150/month), Private dormitories ($150-300/month), Shared apartments ($200-400/month), or Private apartments ($300-600/month).'
        : 'Студенты могут выбрать: Университетские общежития ($50-150/месяц), Частные общежития ($150-300/месяц), Общие квартиры ($200-400/месяц) или Частные квартиры ($300-600/месяц).',
    },
    {
      icon: Users,
      title: language === 'en' ? 'Student Life' : 'Студенческая жизнь',
      content: language === 'en'
        ? 'Turkey offers a vibrant student life with cultural events, sports activities, and social clubs. Cities like Istanbul, Ankara, and Izmir have active international student communities with regular meetups and events.'
        : 'Турция предлагает яркую студенческую жизнь с культурными мероприятиями, спортивными занятиями и социальными клубами. Такие города как Стамбул, Анкара и Измир имеют активные сообщества иностранных студентов с регулярными встречами и мероприятиями.',
    },
    {
      icon: Award,
      title: language === 'en' ? 'Scholarships' : 'Стипендии',
      content: language === 'en'
        ? 'Türkiye Scholarships (government-funded) covers tuition, accommodation, and monthly stipend. University-specific scholarships offer 25-100% tuition waivers. Merit-based and need-based options available.'
        : 'Türkiye Scholarships (государственная) покрывает обучение, проживание и ежемесячную стипендию. Университетские стипендии предлагают скидки 25-100% на обучение. Доступны варианты на основе заслуг и нужды.',
    },
  ];

  const faqs = [
    {
      q: language === 'en' ? 'Do I need to know Turkish to study in Turkey?' : 'Нужно ли знать турецкий для обучения в Турции?',
      a: language === 'en'
        ? 'Many universities offer programs in English. However, learning basic Turkish is recommended for daily life. Some universities offer free Turkish language courses.'
        : 'Многие университеты предлагают программы на английском языке. Однако рекомендуется изучить базовый турецкий для повседневной жизни. Некоторые университеты предлагают бесплатные курсы турецкого языка.',
    },
    {
      q: language === 'en' ? 'Can I work while studying?' : 'Можно ли работать во время учёбы?',
      a: language === 'en'
        ? 'Yes, international students can work part-time (up to 24 hours/week) after obtaining a work permit. Some universities also offer on-campus employment opportunities.'
        : 'Да, иностранные студенты могут работать неполный рабочий день (до 24 часов в неделю) после получения разрешения на работу. Некоторые университеты также предлагают возможности трудоустройства на кампусе.',
    },
    {
      q: language === 'en' ? 'Is Turkey safe for international students?' : 'Безопасна ли Турция для иностранных студентов?',
      a: language === 'en'
        ? 'Turkey is generally safe for students. Major cities have low crime rates and universities provide security services. The country is welcoming to international visitors and students.'
        : 'Турция в целом безопасна для студентов. Крупные города имеют низкий уровень преступности, а университеты предоставляют услуги безопасности. Страна гостеприимна к иностранным посетителям и студентам.',
    },
    {
      q: language === 'en' ? 'How do I apply for a student visa?' : 'Как подать заявку на студенческую визу?',
      a: language === 'en'
        ? 'After receiving your acceptance letter, apply at the Turkish embassy/consulate in your country. Required documents include acceptance letter, passport, photos, financial proof, and health insurance.'
        : 'После получения письма о зачислении подайте заявку в посольстве/консульстве Турции в вашей стране. Необходимые документы включают письмо о зачислении, паспорт, фотографии, финансовые документы и медицинскую страховку.',
    },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-primary py-12">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            {language === 'en' ? 'Study in Turkey Guide' : 'Руководство по обучению в Турции'}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {language === 'en'
              ? 'Everything you need to know about studying in Turkey'
              : 'Всё, что нужно знать об обучении в Турции'}
          </p>
          <div className="mt-6">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8" asChild>
              <Link to="/apply">
                {language === 'en' ? 'Start Your Application' : 'Начать заявку'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Guide Sections */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <section.icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="font-serif">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-secondary/30">
        <div className="container max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary text-center mb-8">
            {language === 'en' ? 'Frequently Asked Questions' : 'Часто задаваемые вопросы'}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Layout>
  );
};

export default Guide;


