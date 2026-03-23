import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const testimonials = [
  {
    id: 1,
    name: 'Maria Petrova',
    nameRu: 'Мария Петрова',
    country: 'Russia',
    countryRu: 'Россия',
    university: 'Istanbul University',
    universityRu: 'Стамбульский университет',
    program: 'Medicine',
    programRu: 'Медицина',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    quote: 'VISACLASS made my dream of studying medicine in Turkey come true. The support was incredible from application to arrival!',
    quoteRu: 'VISACLASS помогли осуществить мою мечту учиться медицине в Турции. Поддержка была невероятной от подачи заявки до приезда!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    nameRu: 'Ахмед Хасан',
    country: 'Egypt',
    countryRu: 'Египет',
    university: 'Boğaziçi University',
    universityRu: 'Босфорский университет',
    program: 'Engineering',
    programRu: 'Инженерия',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    quote: 'The team guided me through every step. Now I am studying at one of the top universities in Turkey!',
    quoteRu: 'Команда провела меня через каждый шаг. Теперь я учусь в одном из лучших университетов Турции!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Anna Kowalski',
    nameRu: 'Анна Ковальски',
    country: 'Poland',
    countryRu: 'Польша',
    university: 'Koç University',
    universityRu: 'Университет Коч',
    program: 'Business Administration',
    programRu: 'Бизнес-администрирование',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    quote: 'Professional service and constant communication. They helped me secure a scholarship too!',
    quoteRu: 'Профессиональный сервис и постоянная связь. Они также помогли мне получить стипендию!',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 bg-primary/5">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative overflow-hidden">
              <div className="absolute top-4 right-4 text-accent/20">
                <Quote className="h-12 w-12" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={language === 'en' ? testimonial.name : testimonial.nameRu}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-primary">
                      {language === 'en' ? testimonial.name : testimonial.nameRu}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? testimonial.country : testimonial.countryRu}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-sm text-foreground/80 italic mb-4">
                  "{language === 'en' ? testimonial.quote : testimonial.quoteRu}"
                </p>

                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <span className="font-medium text-accent">
                    {language === 'en' ? testimonial.university : testimonial.universityRu}
                  </span>
                  {' • '}
                  {language === 'en' ? testimonial.program : testimonial.programRu}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


