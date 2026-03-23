import { useState } from 'react';
import { Search, Filter, GraduationCap } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const programsData = [
  { id: 1, name: 'Medicine', nameRu: 'Медицина', field: 'Health', fieldRu: 'Здравоохранение', level: 'MD', universities: 45, avgTuition: 2500 },
  { id: 2, name: 'Computer Science', nameRu: 'Информатика', field: 'Engineering', fieldRu: 'Инженерия', level: 'BSc', universities: 80, avgTuition: 1200 },
  { id: 3, name: 'Business Administration', nameRu: 'Бизнес-администрирование', field: 'Business', fieldRu: 'Бизнес', level: 'MBA', universities: 60, avgTuition: 1800 },
  { id: 4, name: 'Law', nameRu: 'Право', field: 'Law', fieldRu: 'Право', level: 'LLB', universities: 35, avgTuition: 1000 },
  { id: 5, name: 'Architecture', nameRu: 'Архитектура', field: 'Arts', fieldRu: 'Искусство', level: 'BArch', universities: 40, avgTuition: 1500 },
  { id: 6, name: 'Mechanical Engineering', nameRu: 'Машиностроение', field: 'Engineering', fieldRu: 'Инженерия', level: 'BSc', universities: 55, avgTuition: 1100 },
  { id: 7, name: 'Psychology', nameRu: 'Психология', field: 'Social Sciences', fieldRu: 'Социальные науки', level: 'BA', universities: 50, avgTuition: 900 },
  { id: 8, name: 'Dentistry', nameRu: 'Стоматология', field: 'Health', fieldRu: 'Здравоохранение', level: 'DDS', universities: 30, avgTuition: 3000 },
];

const Programs = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredPrograms = programsData.filter((program) => {
    const name = language === 'en' ? program.name : program.nameRu;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = fieldFilter === 'all' || program.field === fieldFilter;
    const matchesLevel = levelFilter === 'all' || program.level === levelFilter;
    return matchesSearch && matchesField && matchesLevel;
  });

  const fields = [...new Set(programsData.map(p => p.field))];
  const levels = [...new Set(programsData.map(p => p.level))];

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-primary py-12">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            {language === 'en' ? 'Study Programs' : 'Учебные программы'}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {language === 'en'
              ? 'Browse programs by field of study and degree level'
              : 'Просмотр программ по области обучения и уровню степени'}
          </p>
          <div className="mt-6">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8" asChild>
              <Link to="/apply">
                {language === 'en' ? 'Apply to Program' : 'Подать заявку на программу'}
              </Link>
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
                placeholder={language === 'en' ? 'Search programs...' : 'Поиск программ...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={language === 'en' ? 'Field' : 'Область'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Fields' : 'Все области'}</SelectItem>
                {fields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[160px]">
                <GraduationCap className="h-4 w-4 mr-2" />
                <SelectValue placeholder={language === 'en' ? 'Level' : 'Уровень'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Levels' : 'Все уровни'}</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-8">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">
            {language === 'en'
              ? `Showing ${filteredPrograms.length} programs`
              : `Показано ${filteredPrograms.length} программ`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{program.level}</Badge>
                    <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                      {language === 'en' ? program.field : program.fieldRu}
                    </Badge>
                  </div>
                  <CardTitle className="font-serif text-lg">
                    {language === 'en' ? program.name : program.nameRu}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{language === 'en' ? 'Universities' : 'Университетов'}:</span>
                      <span className="font-medium text-primary">{program.universities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'en' ? 'Avg. Tuition' : 'Ср. стоимость'}:</span>
                      <span className="font-medium text-accent">${program.avgTuition}/year</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1" variant="outline" size="sm">
                      {language === 'en' ? 'View Universities' : 'Смотреть университеты'}
                    </Button>
                    <Button className="flex-1" size="sm" asChild>
                      <Link to="/apply">
                        {language === 'en' ? 'Apply' : 'Подать заявку'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Programs;


