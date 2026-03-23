import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedUniversities from '@/components/home/FeaturedUniversities';
import WhyTurkeySection from '@/components/home/WhyTurkeySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';
import { Button } from '@/components/ui/button';
import { GraduationCap, Plane, Briefcase, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { language } = useLanguage();

  return (
    <Layout>
      <HeroSection />
      
      {/* Action Buttons Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              {language === 'en' ? 'Start Your Journey' : 'Начните свое путешествие'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Choose your path to studying in Turkey with our comprehensive programs' 
                : 'Выберите свой путь к обучению в Турции с нашими комплексными программами'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {/* Education Button */}
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[220px]"
              onClick={() => window.location.href = '/universities'}
            >
              <GraduationCap className="mr-3 h-7 w-7" />
              {language === 'en' ? 'Education Programs' : 'Образовательные программы'}
            </Button>

            {/* Tour Button */}
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-12 py-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[220px]"
              onClick={() => {
                alert(language === 'en' ? 'Virtual Tour Coming Soon!' : 'Виртуальный тур скоро будет доступен!');
              }}
            >
              <Plane className="mr-3 h-7 w-7" />
              {language === 'en' ? 'Virtual Tour' : 'Виртуальный тур'}
            </Button>

            {/* Internship Button */}
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-12 py-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[220px]"
              onClick={() => {
                alert(language === 'en' ? 'Internship Programs Coming Soon!' : 'Программы стажировки скоро будут доступны!');
              }}
            >
              <Briefcase className="mr-3 h-7 w-7" />
              {language === 'en' ? 'Internship Programs' : 'Программы стажировки'}
            </Button>
          </div>
        </div>
      </section>

      <StatsSection />
      <FeaturedUniversities />
      <WhyTurkeySection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;


