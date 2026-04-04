import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, MapPin, Phone, Compass, Star, MessageSquare, Menu, X } from 'lucide-react';

const CreativeHeader = ({ navigate }: { navigate: (path: string) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Compass },
    { name: 'About', path: '/about', icon: Star },
    { name: 'Contact', path: '/contact', icon: MessageSquare },
  ];

  const scrollToSection = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-3' : 'py-5'}`}
    >
      <div className={`transition-all duration-500 ${isScrolled ? 'bg-background/80 backdrop-blur-xl shadow-2xl shadow-primary/10 border-b border-white/20' : 'bg-transparent'}`}>
        <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between relative overflow-hidden max-w-7xl mx-auto">
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{ backgroundSize: '200% 100%', animation: isScrolled ? 'shimmer 3s infinite' : 'none' }}
          />

          <div className="flex items-center gap-3 cursor-pointer group relative" onClick={() => navigate('/')}>
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent p-[2px] shadow-lg">
              <div className="h-full w-full bg-background rounded-[10px] flex items-center justify-center">
                <img src="/career-logo.png" alt="Career Compass Logo" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Career Compass
              </span>
              <span className="block text-xs text-muted-foreground -mt-1 tracking-widest uppercase">AI Powered</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 bg-muted/40 backdrop-blur-md rounded-full px-2 py-1.5 border border-border/50 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItem === item.name;
              const isActive = item.path === '/' ? window.location.pathname === '/' : window.location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.path)}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative px-5 py-2 rounded-full group transition-all duration-300"
                >
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 transition-all duration-300 ${isHovered && !isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <div className={`absolute inset-0 rounded-full blur-md bg-primary/30 transition-all duration-300 ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <span className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-foreground/70 group-hover:text-primary'}`}>
                    <Icon className={`w-4 h-4 transition-all duration-300 ${(isHovered || isActive) ? 'scale-110 rotate-6' : ''} ${isActive ? 'text-white' : ''}`} />
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="relative px-5 py-2.5 rounded-full overflow-hidden group bg-background/50 backdrop-blur-sm border border-border/60 hover:border-primary/40 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors" />
                Sign In
              </span>
            </button>

            <button
              onClick={() => navigate('/register')}
              className="relative px-6 py-2.5 rounded-full overflow-hidden group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full animate-gradient bg-[length:200%_auto]" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0.5 rounded-full bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative text-sm font-semibold text-white flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group"
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-primary relative z-10 animate-spin-once" />
            ) : (
              <Menu className="w-5 h-5 text-primary relative z-10" />
            )}
          </button>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 space-y-3">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 hover:bg-primary/10 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms`, animation: isMobileMenuOpen ? 'slideInRight 0.5s ease-out forwards' : 'none' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
            <div className="pt-3 space-y-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl border border-border hover:border-primary/50 transition-colors font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <CreativeHeader navigate={navigate} />
      <div className="h-24" />

      <main className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-primary/10 text-primary text-sm font-medium mb-6">
              <Compass className="w-4 h-4" />
              Contact Us
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Let&apos;s Talk About Your Career Goals
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Reach out for support, product questions, or partnerships. We&apos;re happy to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="rounded-2xl border bg-card/70 p-6">
              <Mail className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-muted-foreground text-sm">support@careercompass.ai</p>
            </div>
            <div className="rounded-2xl border bg-card/70 p-6">
              <Phone className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Phone</h3>
              <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
            </div>
            <div className="rounded-2xl border bg-card/70 p-6">
              <MapPin className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Location</h3>
              <p className="text-muted-foreground text-sm">Remote-first, worldwide</p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/70 p-8 text-center">
            <h2 className="text-2xl font-semibold mb-3">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Create your account and begin your personalized skill and career journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={() => navigate('/register')} className="group">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-spin-once {
          animation: spin 0.3s ease-out;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(180deg); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
