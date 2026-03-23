import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const CTASection = () => {
  const { language } = useLanguage();
  const { requireAuth } = useRequireAuth();

  const handleApplyClick = () => {
    requireAuth();
  };

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-navy-light">
      <div className="container text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
          {language === 'en'
            ? 'Ready to Start Your Journey?'
            : 'Готовы начать свой путь?'}
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          {language === 'en'
            ? 'Join thousands of international students who have successfully started their academic journey in Turkey with our help.'
            : 'Присоединяйтесь к тысячам иностранных студентов, которые успешно начали своё обучение в Турции с нашей помощью.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8"
            onClick={handleApplyClick}
          >
            {language === 'en' ? 'Apply Now' : 'Подать заявку'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8"
            asChild
          >
            <a href="/contact">
              {language === 'en' ? 'Contact Us' : 'Связаться с нами'}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;



