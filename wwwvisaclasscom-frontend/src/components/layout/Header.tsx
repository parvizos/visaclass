import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, Globe, ChevronDown, User, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { onLocalAuthStateChange } from '@/lib/localAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const localUser = onLocalAuthStateChange((user) => {
        setIsAuthenticated(Boolean(user) || Boolean(token));
      });
      setIsAuthenticated(Boolean(token));
    };
    
    checkAuth();
    const unsubscribe = onLocalAuthStateChange((user) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      setIsAuthenticated(Boolean(user) || Boolean(token));
    });

    return () => unsubscribe();
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/scholarships', label: t('nav.scholarships') },
    { href: '/universities', label: t('nav.universities') },
    { href: '/programs', label: t('nav.programs') },
    { href: '/guide', label: t('nav.guide') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-bold text-primary">VISACLASS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side - Language & Auth */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'EN' : 'RU'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                🇬🇧 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ru')}>
                🇷🇺 Русский
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/dashboard?tab=profile')}>
                <User className="h-4 w-4" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/dashboard?tab=devices')}>
                <Shield className="h-4 w-4" />
                Devices
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={() => requireAuth()}>
                <FileText className="h-4 w-4" />
                Apply Now
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                {t('nav.login')}
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate('/auth?mode=signup')}>
                {t('nav.signup')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <nav className="container py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-4 border-t">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/dashboard?tab=profile'); setIsMenuOpen(false); }}>
                    Profile
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/dashboard?tab=devices'); setIsMenuOpen(false); }}>
                    Devices
                  </Button>
                  <Button size="sm" className="flex-1 bg-accent text-accent-foreground" onClick={() => { requireAuth(); setIsMenuOpen(false); }}>
                    Apply Now
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                    {t('nav.login')}
                  </Button>
                  <Button size="sm" className="flex-1 bg-accent text-accent-foreground" onClick={() => { navigate('/auth?mode=signup'); setIsMenuOpen(false); }}>
                    {t('nav.signup')}
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                🇬🇧 EN
              </Button>
              <Button
                variant={language === 'ru' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('ru')}
              >
                🇷🇺 RU
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

