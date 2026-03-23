import { useState } from 'react';
import { Search, MapPin, Filter, Grid3X3, List, Users, Globe, Target, TrendingUp, GraduationCap, Plane, Briefcase, Award, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

// Mock university data
const universitiesData = [
  { id: 1, name: 'Istanbul University', nameRu: 'Стамбульский университет', city: 'Istanbul', cityRu: 'Стамбул', type: 'Public', typeRu: 'Государственный', programs: 150, tuitionMin: 500, tuitionMax: 2000, language: 'Turkish/English', languageRu: 'Турецкий/Английский', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop', ranking: 1 },
  { id: 2, name: 'Boğaziçi University', nameRu: 'Босфорский университет', city: 'Istanbul', cityRu: 'Стамбул', type: 'Public', typeRu: 'Государственный', programs: 85, tuitionMin: 300, tuitionMax: 1500, language: 'English', languageRu: 'Английский', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop', ranking: 2 },
  { id: 3, name: 'Middle East Technical University', nameRu: 'Ближневосточный технический университет', city: 'Ankara', cityRu: 'Анкара', type: 'Public', typeRu: 'Государственный', programs: 120, tuitionMin: 400, tuitionMax: 1800, language: 'English', languageRu: 'Английский', image: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=250&fit=crop', ranking: 3 },
  { id: 4, name: 'Koç University', nameRu: 'Университет Коч', city: 'Istanbul', cityRu: 'Стамбул', type: 'Private', typeRu: 'Частный', programs: 65, tuitionMin: 15000, tuitionMax: 25000, language: 'English', languageRu: 'Английский', image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&h=250&fit=crop', ranking: 4 },
  { id: 5, name: 'Bilkent University', nameRu: 'Университет Бильгент', city: 'Ankara', cityRu: 'Анкара', type: 'Private', typeRu: 'Частный', programs: 70, tuitionMin: 12000, tuitionMax: 20000, language: 'English', languageRu: 'Английский', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop', ranking: 5 },
  { id: 6, name: 'Sabancı University', nameRu: 'Университет Сабанджи', city: 'Istanbul', cityRu: 'Стамбул', type: 'Private', typeRu: 'Частный', programs: 55, tuitionMin: 18000, tuitionMax: 28000, language: 'English', languageRu: 'Английский', image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400&h=250&fit=crop', ranking: 6 },
  { id: 7, name: 'Hacettepe University', nameRu: 'Университет Хаджеттепе', city: 'Ankara', cityRu: 'Анкара', type: 'Public', typeRu: 'Государственный', programs: 140, tuitionMin: 400, tuitionMax: 2000, language: 'Turkish/English', languageRu: 'Турецкий/Английский', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400&h=250&fit=crop', ranking: 7 },
  { id: 8, name: 'Ankara University', nameRu: 'Анкарский университет', city: 'Ankara', cityRu: 'Анкара', type: 'Public', typeRu: 'Государственный', programs: 130, tuitionMin: 300, tuitionMax: 1500, language: 'Turkish', languageRu: 'Турецкий', image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop', ranking: 8 },
];

const Universities = () => {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredUniversities = universitiesData.filter((uni) => {
    const name = language === 'en' ? uni.name : uni.nameRu;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || uni.city === cityFilter;
    const matchesType = typeFilter === 'all' || uni.type === typeFilter;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-primary py-12">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            {language === 'en' ? 'Turkish Universities' : 'Турецкие университеты'}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {language === 'en'
              ? 'Explore over 100 universities across Turkey'
              : 'Изучите более 100 университетов по всей Турции'}
          </p>
        </div>
      </section>

      
      {/* Statistics Buttons */}
      <section className="py-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students Placed */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-sm text-muted-foreground font-medium">
                  {language === 'en' ? 'Students Placed' : 'Студентов зачислено'}
                </div>
              </CardContent>
            </Card>

            {/* Countries Served */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground font-medium">
                  {language === 'en' ? 'Countries Served' : 'Стран обслуживаем'}
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Target className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground font-medium">
                  {language === 'en' ? 'Success Rate' : 'Успешных заявок'}
                </div>
              </CardContent>
            </Card>

            {/* Partner Universities */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">100+</div>
                <div className="text-sm text-muted-foreground font-medium">
                  {language === 'en' ? 'Partner Universities' : 'Университетов-партнеров'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">
              {language === 'en' ? 'Explore Our Services' : 'Исследуйте наши услуги'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Discover everything we offer to help you study in Turkey' 
                : 'Откройте для себя все, что мы предлагаем для помощи в обучении в Турции'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Education Button */}
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <GraduationCap className="mr-3 h-7 w-7" />
              {language === 'en' ? 'Education Programs' : 'Образовательные программы'}
            </Button>

            {/* Tour Button */}
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-10 py-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
              onClick={() => {
                // Could navigate to tour page or open tour modal
                alert(language === 'en' ? 'Virtual Tour Coming Soon!' : 'Виртуальный тур скоро будет доступен!');
              }}
            >
              <Plane className="mr-3 h-7 w-7" />
              {language === 'en' ? 'Virtual Tour' : 'Виртуальный тур'}
            </Button>

            {/* Apply Button */}
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
              asChild
            >
              <Link to="/apply">
                <FileText className="mr-3 h-7 w-7" />
                {language === 'en' ? 'Apply Now' : 'Подать заявку'}
              </Link>
            </Button>

            {/* Internship Button */}
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
              onClick={() => {
                // Could navigate to internship page
                alert(language === 'en' ? 'Internship Programs Coming Soon!' : 'Программы стажировки скоро будут доступны!');
              }}
            >
              <Briefcase className="mr-3 h-7 w-7" />
              {language === 'en' ? 'Internship Programs' : 'Программы стажировки'}
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b bg-background sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'en' ? 'Search universities...' : 'Поиск университетов...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[160px]">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder={language === 'en' ? 'City' : 'Город'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Cities' : 'Все города'}</SelectItem>
                <SelectItem value="Istanbul">{language === 'en' ? 'Istanbul' : 'Стамбул'}</SelectItem>
                <SelectItem value="Ankara">{language === 'en' ? 'Ankara' : 'Анкара'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={language === 'en' ? 'Type' : 'Тип'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Types' : 'Все типы'}</SelectItem>
                <SelectItem value="Public">{language === 'en' ? 'Public' : 'Государственный'}</SelectItem>
                <SelectItem value="Private">{language === 'en' ? 'Private' : 'Частный'}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Grid/List */}
      <section className="py-8">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">
            {language === 'en'
              ? `Showing ${filteredUniversities.length} universities`
              : `Показано ${filteredUniversities.length} университетов`}
          </p>

          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredUniversities.map((uni) => (
              <Link key={uni.id} to={`/universities/${uni.id}`}>
                <Card className={`group overflow-hidden hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
                    <img
                      src={uni.image}
                      alt={language === 'en' ? uni.name : uni.nameRu}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                      {language === 'en' ? uni.type : uni.typeRu}
                    </Badge>
                  </div>
                  <CardContent className="p-4 flex-1">
                    <h3 className="font-serif font-semibold text-lg text-primary line-clamp-2">
                      {language === 'en' ? uni.name : uni.nameRu}
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {language === 'en' ? uni.city : uni.cityRu}
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-accent font-medium">
                        #{uni.ranking} {language === 'en' ? 'in Turkey' : 'в Турции'}
                      </span>
                      <span className="text-muted-foreground">
                        {uni.programs} {language === 'en' ? 'programs' : 'программ'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      ${uni.tuitionMin.toLocaleString()} - ${uni.tuitionMax.toLocaleString()} / {language === 'en' ? 'year' : 'год'}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link to={`/universities/${uni.id}`}>
                          {language === 'en' ? 'View Details' : 'Подробнее'}
                        </Link>
                      </Button>
                      <Button size="sm" asChild className="flex-1 bg-accent hover:bg-accent/90">
                        <Link to="/apply">
                          {language === 'en' ? 'Apply' : 'Подать заявку'}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Universities;


