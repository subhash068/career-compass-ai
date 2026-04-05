import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/auth/AuthContext';

interface ProfileProps {
  collapsed: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function Profile({ collapsed }: ProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const hydrateUser = () => {
      try {
        const localUserStr = localStorage.getItem('user');
        const localUser = localUserStr && localUserStr !== 'undefined' ? JSON.parse(localUserStr) : null;
        const source = authUser || localUser;
        if (!source) {
          setUser(null);
          return;
        }

        setUser({
          id: source.id?.toString() || '1',
          email: source.email || '',
          name: source.name || source.first_name || source.email?.split('@')[0] || 'User',
          role: source.role || source.currentRole || 'User',
        });
      } catch {
        setUser(null);
      }
      setLoading(false);
    };

    if (authLoading) return;
    hydrateUser();

    // Listen for auth changes
    const handleAuthChange = () => {
      hydrateUser();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [authUser, authLoading]); 

  const getInitials = (name?: string, email?: string): string => {
    if (!name?.trim()) {
      if (email) {
        const localPart = email.split('@')[0];
        return localPart.slice(0, 2).toUpperCase();
      }
      return '?';
    }
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className={cn(
        "h-16 flex items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        {!collapsed && (
          <div className="flex flex-col gap-1">
            <div className="h-4 bg-muted rounded animate-pulse w-20" />
            <div className="h-3 bg-muted rounded animate-pulse w-16" />
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn(
        "h-16 flex items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-sidebar-foreground">Guest</span>
            <span className="text-xs text-sidebar-foreground/60">Please login</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-16 flex items-center border-b border-sidebar-border px-4 cursor-pointer hover:bg-sidebar-accent/50 transition-colors",
        collapsed ? "justify-center" : "gap-3"
      )}
onClick={() => navigate('/settings')}
    >
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(user.name, user.email)}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-display font-bold text-sidebar-foreground">{user.name || user.email?.split('@')[0] || 'User'}</span>
          <span className="text-xs text-sidebar-foreground/60 capitalize">{user.role || 'User'}</span>
        </div>
      )}
    </div>
  );
}
