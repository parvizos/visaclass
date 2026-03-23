import { useState } from 'react';
import { Search, Filter, Award, DollarSign, GraduationCap, Users, Calendar, CheckCircle, Globe, Target, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

// Mock scholarship data
const scholarshipsData = [
  {
    id: 1,
    name: 'Türkiye Scholarships',
    nameRu: 'Стипендии Турции',
    provider: 'Government of Turkey',
    providerRu: 'Правительство Турции',
    type: 'Government',
    typeRu: 'Государственная',
    coverage: 'Full Coverage',
    coverageRu: 'Полное покрытие',
    amount: '100% tuition + $600/month',
    amountRu: '100% обучение + $600/мес',
    deadline: '2024-02-20',
    deadlineRu: '20.02.2024',
    field: 'All Fields',
    fieldRu: 'Все направления',
    level: 'Undergraduate, Graduate, PhD',
    levelRu: 'Бакалавриат, Магистратура, PhD',
    description: 'Fully funded scholarship for international students covering tuition, accommodation, health insurance, and monthly stipend.',
    descriptionRu: 'Полностью финансируемая стипендия для иностранных студентов, покрывающая обучение, проживание, страхование и ежемесячную стипендию.',
    requirements: 'Minimum 70% GPA, Strong academic record, Age limit: Under 21 for undergraduate, 30 for graduate, 35 for PhD',
    requirementsRu: 'Минимум 70% GPA, Сильная академическая успеваемость, Возрастное ограничение: До 21 года для бакалавриата, 30 для магистратуры, 35 для PhD',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop',
    featured: true
  },
  {
    id: 2,
    name: 'Koç University Merit Scholarship',
    nameRu: 'Стипендия за заслуги Университета Коч',
    provider: 'Koç University',
    providerRu: 'Университет Коч',
    type: 'University',
    typeRu: 'Университетская',
    coverage: 'Partial Coverage',
    coverageRu: 'Частичное покрытие',
    amount: '25-100% tuition waiver',
    amountRu: '25-100% скидка на обучение',
    deadline: '2024-03-15',
    deadlineRu: '15.03.2024',
    field: 'All Fields',
    fieldRu: 'Все направления',
    level: 'Undergraduate, Graduate',
    levelRu: 'Бакалавриат, Магистратура',
    description: 'Merit-based scholarship for outstanding students with excellent academic achievements.',
    descriptionRu: 'Стипендия за заслуги для выдающихся студентов с отличными академическими достижениями.',
    requirements: 'Minimum 85% GPA, Standardized test scores, Extracurricular activities',
    requirementsRu: 'Минимум 85% GPA, Результаты стандартизированных тестов, Внеучебная деятельность',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop',
    featured: true
  },
  {
    id: 3,
    name: 'Sabancı University Scholarship',
    nameRu: 'Стипендия Университета Сабанджи',
    provider: 'Sabancı University',
    providerRu: 'Университет Сабанджи',
    type: 'University',
    typeRu: 'Университетская',
    coverage: 'Partial Coverage',
    coverageRu: 'Частичное покрытие',
    amount: '25-75% tuition waiver',
    amountRu: '25-75% скидка на обучение',
    deadline: '2024-04-01',
    deadlineRu: '01.04.2024',
    field: 'Engineering, Social Sciences',
    fieldRu: 'Инженерия, Социальные науки',
    level: 'Undergraduate, Graduate',
    levelRu: 'Бакалавриат, Магистратура',
    description: 'Need-based and merit-based scholarships for talented students in specific fields.',
    descriptionRu: 'Стипендии на основе потребностей и заслуг для талантливых студентов в определенных областях.',
    requirements: 'Academic merit, Financial need demonstration, Field-specific requirements',
    requirementsRu: 'Академические заслуги, Демонстрация финансовой потребности, Специфические требования к направлению',
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400&h=250&fit=crop',
    featured: false
  },
  {
    id: 4,
    name: 'METU International Student Scholarship',
    nameRu: 'Стипендия для иностранных студентов METU',
    provider: 'Middle East Technical University',
    providerRu: 'Ближневосточный технический университет',
    type: 'University',
    typeRu: 'Университетская',
    coverage: 'Partial Coverage',
    coverageRu: 'Частичное покрытие',
    amount: '25-50% tuition waiver',
    amountRu: '25-50% скидка на обучение',
    deadline: '2024-05-01',
    deadlineRu: '01.05.2024',
    field: 'Engineering, Natural Sciences',
    fieldRu: 'Инженерия, Естественные науки',
    level: 'Undergraduate, Graduate',
    levelRu: 'Бакалавриат, Магистратура',
    description: 'Scholarships for international students in engineering and natural sciences programs.',
    descriptionRu: 'Стипендии для иностранных студентов по программам инженерии и естественных наук.',
    requirements: 'Strong science background, Minimum 80% GPA in relevant subjects',
    requirementsRu: 'Сильная база в области наук, Минимум 80% GPA по профильным предметам',
    image: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=250&fit=crop',
    featured: false
  }
];

const Scholarships = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [coverageFilter, setCoverageFilter] = useState('all');

  const filteredScholarships = scholarshipsData.filter((scholarship) => {
    const name = language === 'en' ? scholarship.name : scholarship.nameRu;
    const provider = language === 'en' ? scholarship.provider : scholarship.providerRu;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || scholarship.type === typeFilter;
    const matchesCoverage = coverageFilter === 'all' || scholarship.coverage === coverageFilter;
    return matchesSearch && matchesType && matchesCoverage;
  });

  const featuredScholarships = scholarshipsData.filter(s => s.featured);
  const regularScholarships = filteredScholarships.filter(s => !s.featured);

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            {language === 'en' ? 'Scholarships in Turkey' : 'Стипендии в Турции'}
          </h1>
          <p className="mt-4 text-white/90 text-lg max-w-2xl">
            {language === 'en'
              ? 'Discover numerous scholarship opportunities to fund your education in Turkey'
              : 'Откройте для себя многочисленные возможности стипендий для финансирования вашего образования в Турции'}
          </p>
          <div className="mt-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8" asChild>
              <Link to="/apply">
                {language === 'en' ? 'Apply for Scholarship' : 'Подать заявку на стипендию'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-2xl text-primary">500+</h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Scholarships Available' : 'Доступных стипендий'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-2xl text-primary">$50M+</h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Total Funding' : 'Общее финансирование'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-2xl text-primary">10,000+</h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Students Awarded' : 'Студентов получило'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-2xl text-primary">150+</h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Countries Eligible' : 'Стран-участниц'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={language === 'en' ? 'Search scholarships...' : 'Поиск стипендий...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={language === 'en' ? 'Type' : 'Тип'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'en' ? 'All Types' : 'Все типы'}
                </SelectItem>
                <SelectItem value="Government">
                  {language === 'en' ? 'Government' : 'Государственные'}
                </SelectItem>
                <SelectItem value="University">
                  {language === 'en' ? 'University' : 'Университетские'}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={coverageFilter} onValueChange={setCoverageFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={language === 'en' ? 'Coverage' : 'Покрытие'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'en' ? 'All Coverage' : 'Все покрытия'}
                </SelectItem>
                <SelectItem value="Full Coverage">
                  {language === 'en' ? 'Full Coverage' : 'Полное покрытие'}
                </SelectItem>
                <SelectItem value="Partial Coverage">
                  {language === 'en' ? 'Partial Coverage' : 'Частичное покрытие'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Featured Scholarships */}
      {searchQuery === '' && typeFilter === 'all' && coverageFilter === 'all' && (
        <section className="py-8">
          <div className="container">
            <h2 className="font-serif text-2xl font-bold text-primary mb-6">
              {language === 'en' ? 'Featured Scholarships' : 'Рекомендуемые стипендии'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredScholarships.map((scholarship) => (
                <Card key={scholarship.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${scholarship.image})` }}>
                    <div className="h-full bg-black/40 flex items-end">
                      <div className="p-6 text-white">
                        <Badge className="mb-2 bg-yellow-500 text-white">
                          {language === 'en' ? 'Featured' : 'Рекомендуемая'}
                        </Badge>
                        <h3 className="font-bold text-xl">
                          {language === 'en' ? scholarship.name : scholarship.nameRu}
                        </h3>
                        <p className="text-white/90">
                          {language === 'en' ? scholarship.provider : scholarship.providerRu}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">
                        {language === 'en' ? scholarship.type : scholarship.typeRu}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {language === 'en' ? scholarship.coverage : scholarship.coverageRu}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {language === 'en' ? scholarship.description : scholarship.descriptionRu}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium">
                          {language === 'en' ? 'Amount:' : 'Сумма:'}
                        </span>
                        <span className="ml-2">{language === 'en' ? scholarship.amount : scholarship.amountRu}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                        <span className="font-medium">
                          {language === 'en' ? 'Deadline:' : 'Дедлайн:'}
                        </span>
                        <span className="ml-2">{language === 'en' ? scholarship.deadline : scholarship.deadlineRu}</span>
                      </div>
                    </div>
                    <Button className="w-full" asChild>
                      <Link to="/apply">
                        {language === 'en' ? 'Apply Now' : 'Подать заявку'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Scholarships */}
      <section className="py-8">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">
            {searchQuery || typeFilter !== 'all' || coverageFilter !== 'all' 
              ? (language === 'en' ? 'Search Results' : 'Результаты поиска')
              : (language === 'en' ? 'All Scholarships' : 'Все стипендии')
            }
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchQuery || typeFilter !== 'all' || coverageFilter !== 'all' ? filteredScholarships : regularScholarships).map((scholarship) => (
              <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {language === 'en' ? scholarship.type : scholarship.typeRu}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {language === 'en' ? scholarship.coverage : scholarship.coverageRu}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {language === 'en' ? scholarship.name : scholarship.nameRu}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {language === 'en' ? scholarship.provider : scholarship.providerRu}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {language === 'en' ? scholarship.description : scholarship.descriptionRu}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span>{language === 'en' ? scholarship.amount : scholarship.amountRu}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                      <span>{language === 'en' ? 'Deadline: ' : 'Дедлайн: '}{language === 'en' ? scholarship.deadline : scholarship.deadlineRu}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                      <span>{language === 'en' ? scholarship.level : scholarship.levelRu}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm" asChild>
                    <Link to="/apply">
                      {language === 'en' ? 'Apply Now' : 'Подать заявку'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {(searchQuery || typeFilter !== 'all' || coverageFilter !== 'all' ? filteredScholarships : regularScholarships).length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {language === 'en' 
                  ? 'No scholarships found matching your criteria.' 
                  : 'Стипендий, соответствующих вашим критериям, не найдено.'}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Application Guide */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-8 text-center">
            {language === 'en' ? 'How to Apply' : 'Как подать заявку'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'en' ? 'Research' : 'Исследование'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Find scholarships that match your profile and academic goals'
                  : 'Найдите стипендии, соответствующие вашему профилю и академическим целям'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'en' ? 'Prepare Documents' : 'Подготовка документов'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Gather all required documents including transcripts and recommendation letters'
                  : 'Соберите все необходимые документы, включая транскрипты и рекомендации'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'en' ? 'Submit Application' : 'Подача заявки'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Complete and submit your application before the deadline'
                  : 'Заполните и подайте заявку до дедлайна'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'en' ? 'Wait for Result' : 'Ожидание результата'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Track your application status and prepare for interviews if required'
                  : 'Отслеживайте статус заявки и готовьтесь к интервью, если требуется'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Scholarships;
