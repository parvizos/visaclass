import { Target, Users, Award, Handshake } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { language } = useLanguage();

  const values = [
    {
      icon: Target,
      title: language === 'en' ? 'Our Mission' : 'Наша миссия',
      description: language === 'en'
        ? 'To make quality Turkish education accessible to international students worldwide through personalized guidance and support.'
        : 'Сделать качественное турецкое образование доступным для иностранных студентов по всему миру через персональное сопровождение и поддержку.',
    },
    {
      icon: Users,
      title: language === 'en' ? 'Student-First' : 'Студенты прежде всего',
      description: language === 'en'
        ? 'Every decision we make is centered around helping our students achieve their educational dreams.'
        : 'Каждое наше решение направлено на помощь студентам в достижении их образовательных целей.',
    },
    {
      icon: Award,
      title: language === 'en' ? 'Excellence' : 'Превосходство',
      description: language === 'en'
        ? 'We maintain the highest standards in our services, ensuring successful applications and placements.'
        : 'Мы поддерживаем высочайшие стандарты наших услуг, обеспечивая успешные заявки и зачисления.',
    },
    {
      icon: Handshake,
      title: language === 'en' ? 'Partnership' : 'Партнёрство',
      description: language === 'en'
        ? 'Strong relationships with universities ensure our students get the best opportunities available.'
        : 'Прочные отношения с университетами обеспечивают нашим студентам лучшие доступные возможности.',
    },
  ];

  const team = [
    {
      name: 'Ahmet Yilmaz',
      role: language === 'en' ? 'Founder & CEO' : 'Основатель и CEO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    },
    {
      name: 'Elif Demir',
      role: language === 'en' ? 'Head of Admissions' : 'Глава приёмной комиссии',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    },
    {
      name: 'Mehmet Kaya',
      role: language === 'en' ? 'Student Support Manager' : 'Менеджер по поддержке студентов',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    },
    {
      name: 'Olga Petrova',
      role: language === 'en' ? 'Russian Desk Lead' : 'Координатор для русскоязычных',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-primary py-12">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            {language === 'en' ? 'About VISACLASS' : 'О компании VISACLASS'}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {language === 'en'
              ? 'Your trusted partner in Turkish education since 2015'
              : 'Ваш надёжный партнёр в турецком образовании с 2015 года'}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-6">
                {language === 'en' ? 'Our Story' : 'Наша история'}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {language === 'en'
                    ? 'VISACLASS was founded in 2015 with a simple mission: to help international students access quality education in Turkey. What started as a small consultancy has grown into a trusted partner for thousands of students worldwide.'
                    : 'VISACLASS была основана в 2015 году с простой миссией: помочь иностранным студентам получить качественное образование в Турции. То, что начиналось как небольшое консультационное агентство, выросло в надёжного партнёра для тысяч студентов по всему миру.'}
                </p>
                <p>
                  {language === 'en'
                    ? 'With partnerships spanning over 100 universities and a dedicated multilingual team, we provide end-to-end support from university selection to visa processing and arrival in Turkey.'
                    : 'Имея партнёрство с более чем 100 университетами и преданную многоязычную команду, мы обеспечиваем полную поддержку от выбора университета до оформления визы и приезда в Турцию.'}
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt="Team collaboration"
                className="rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">9+</div>
                <div className="text-sm">{language === 'en' ? 'Years Experience' : 'Лет опыта'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            {language === 'en' ? 'Our Values' : 'Наши ценности'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 mx-auto rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <value.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-primary mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12">
        <div className="container">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary text-center mb-12">
            {language === 'en' ? 'Meet Our Team' : 'Наша команда'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="pt-4 text-center">
                  <h3 className="font-semibold text-primary">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;


