import { GraduationCap, Wallet, Globe2, Briefcase } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WhyTurkeySection = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: GraduationCap,
      title: t('why.quality'),
      description: t('why.qualityDesc'),
    },
    {
      icon: Wallet,
      title: t('why.affordable'),
      description: t('why.affordableDesc'),
    },
    {
      icon: Globe2,
      title: t('why.culture'),
      description: t('why.cultureDesc'),
    },
    {
      icon: Briefcase,
      title: t('why.career'),
      description: t('why.careerDesc'),
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
            {t('why.title')}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('why.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border bg-card hover:border-accent hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-lg bg-primary/5 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                <benefit.icon className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold text-primary">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTurkeySection;


