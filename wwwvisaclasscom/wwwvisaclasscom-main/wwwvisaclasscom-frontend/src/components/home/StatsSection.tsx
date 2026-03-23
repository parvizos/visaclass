import { GraduationCap, Users, Globe, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: GraduationCap, value: '100+', label: t('stats.universities') },
    { icon: Users, value: '5,000+', label: t('stats.students') },
    { icon: Globe, value: '50+', label: t('stats.countries') },
    { icon: Award, value: '95%', label: t('stats.success') },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                <stat.icon className="h-7 w-7 text-accent" />
              </div>
              <div className="font-serif text-3xl md:text-4xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;


