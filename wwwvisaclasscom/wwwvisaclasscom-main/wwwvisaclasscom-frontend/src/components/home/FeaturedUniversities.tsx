import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data for featured universities
const featuredUniversities = [
  {
    id: 1,
    name: 'Istanbul University',
    nameRu: 'Стамбульский университет',
    city: 'Istanbul',
    cityRu: 'Стамбул',
    type: 'Public',
    typeRu: 'Государственный',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop',
    programs: 150,
    ranking: '#1 in Turkey',
    rankingRu: '#1 в Турции',
  },
  {
    id: 2,
    name: 'Boğaziçi University',
    nameRu: 'Босфорский университет',
    city: 'Istanbul',
    cityRu: 'Стамбул',
    type: 'Public',
    typeRu: 'Государственный',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop',
    programs: 85,
    ranking: '#2 in Turkey',
    rankingRu: '#2 в Турции',
  },
  {
    id: 3,
    name: 'Middle East Technical University',
    nameRu: 'Ближневосточный технический университет',
    city: 'Ankara',
    cityRu: 'Анкара',
    type: 'Public',
    typeRu: 'Государственный',
    image: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=250&fit=crop',
    programs: 120,
    ranking: '#3 in Turkey',
    rankingRu: '#3 в Турции',
  },
  {
    id: 4,
    name: 'Koç University',
    nameRu: 'Университет Коч',
    city: 'Istanbul',
    cityRu: 'Стамбул',
    type: 'Private',
    typeRu: 'Частный',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&h=250&fit=crop',
    programs: 65,
    ranking: 'Top 500 Globally',
    rankingRu: 'Топ-500 в мире',
  },
];

const FeaturedUniversities = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
            {t('featured.title')}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredUniversities.map((uni) => (
            <Card key={uni.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={uni.image}
                  alt={language === 'en' ? uni.name : uni.nameRu}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                  {language === 'en' ? uni.type : uni.typeRu}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-serif font-semibold text-lg text-primary line-clamp-2">
                  {language === 'en' ? uni.name : uni.nameRu}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {language === 'en' ? uni.city : uni.cityRu}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-accent font-medium">
                    {language === 'en' ? uni.ranking : uni.rankingRu}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {uni.programs} {language === 'en' ? 'programs' : 'программ'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/universities">
              {t('featured.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedUniversities;


