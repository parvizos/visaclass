import { useParams, Link } from 'react-router-dom';
import { MapPin, GraduationCap, DollarSign, Globe, Calendar, ArrowLeft, Building2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data - would come from database
const universityData = {
  id: 1,
  name: 'Istanbul University',
  nameRu: 'Стамбульский университет',
  city: 'Istanbul',
  cityRu: 'Стамбул',
  type: 'Public',
  typeRu: 'Государственный',
  established: 1453,
  students: 70000,
  internationalStudents: 8000,
  image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop',
  description: 'Istanbul University is the oldest and one of the most prestigious universities in Turkey. Founded in 1453, it has a rich history of academic excellence and research innovation.',
  descriptionRu: 'Стамбульский университет — старейший и один из самых престижных университетов Турции. Основанный в 1453 году, он имеет богатую историю академического совершенства и инноваций в исследованиях.',
  programs: [
    { name: 'Medicine', nameRu: 'Медицина', degree: 'MD', duration: '6 years', tuition: 1500 },
    { name: 'Engineering', nameRu: 'Инженерия', degree: 'BSc', duration: '4 years', tuition: 800 },
    { name: 'Business Administration', nameRu: 'Бизнес-администрирование', degree: 'MBA', duration: '2 years', tuition: 1200 },
    { name: 'Law', nameRu: 'Право', degree: 'LLB', duration: '4 years', tuition: 900 },
    { name: 'Computer Science', nameRu: 'Информатика', degree: 'BSc', duration: '4 years', tuition: 800 },
  ],
  facilities: ['Library', 'Sports Complex', 'Research Labs', 'Student Housing', 'Medical Center'],
  facilitiesRu: ['Библиотека', 'Спортивный комплекс', 'Исследовательские лаборатории', 'Общежитие', 'Медицинский центр'],
  languages: ['Turkish', 'English'],
  languagesRu: ['Турецкий', 'Английский'],
};

const UniversityDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();

  // In real app, fetch university by ID
  const uni = universityData;

  return (
    <Layout>
      {/* Hero Image */}
      <section className="relative h-[300px] md:h-[400px]">
        <img
          src={uni.image}
          alt={language === 'en' ? uni.name : uni.nameRu}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container">
            <Link to="/universities" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              {language === 'en' ? 'Back to Universities' : 'Назад к университетам'}
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge className="bg-accent text-accent-foreground">
                {language === 'en' ? uni.type : uni.typeRu}
              </Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                #{1} {language === 'en' ? 'in Turkey' : 'в Турции'}
              </Badge>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
              {language === 'en' ? uni.name : uni.nameRu}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-primary-foreground/80">
              <MapPin className="h-5 w-5" />
              {language === 'en' ? uni.city : uni.cityRu}, Turkey
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">
                    {language === 'en' ? 'Overview' : 'Обзор'}
                  </TabsTrigger>
                  <TabsTrigger value="programs">
                    {language === 'en' ? 'Programs' : 'Программы'}
                  </TabsTrigger>
                  <TabsTrigger value="facilities">
                    {language === 'en' ? 'Facilities' : 'Услуги'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">
                        {language === 'en' ? 'About' : 'О университете'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {language === 'en' ? uni.description : uni.descriptionRu}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Calendar className="h-8 w-8 mx-auto text-accent mb-2" />
                        <div className="text-2xl font-bold text-primary">{uni.established}</div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'en' ? 'Established' : 'Основан'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <GraduationCap className="h-8 w-8 mx-auto text-accent mb-2" />
                        <div className="text-2xl font-bold text-primary">{uni.students.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'en' ? 'Students' : 'Студентов'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Globe className="h-8 w-8 mx-auto text-accent mb-2" />
                        <div className="text-2xl font-bold text-primary">{uni.internationalStudents.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'en' ? 'International' : 'Иностранных'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Building2 className="h-8 w-8 mx-auto text-accent mb-2" />
                        <div className="text-2xl font-bold text-primary">{uni.programs.length}+</div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'en' ? 'Programs' : 'Программ'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="programs">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">
                        {language === 'en' ? 'Available Programs' : 'Доступные программы'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {uni.programs.map((program, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                            <div>
                              <h4 className="font-semibold text-primary">
                                {language === 'en' ? program.name : program.nameRu}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {program.degree} • {program.duration}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-accent">${program.tuition}/year</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="facilities">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">
                        {language === 'en' ? 'Campus Facilities' : 'Услуги кампуса'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(language === 'en' ? uni.facilities : uni.facilitiesRu).map((facility, index) => (
                          <div key={index} className="p-4 border rounded-lg text-center">
                            <span className="text-muted-foreground">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-serif">
                    {language === 'en' ? 'Apply Now' : 'Подать заявку'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Tuition from' : 'Стоимость от'} $500/year
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">
                      {(language === 'en' ? uni.languages : uni.languagesRu).join(', ')}
                    </span>
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                    <Link to="/apply">
                      {language === 'en' ? 'Start Application' : 'Начать заявку'}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/contact">
                      {language === 'en' ? 'Request Info' : 'Запросить информацию'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default UniversityDetail;



