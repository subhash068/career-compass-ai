import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ProfileResponse } from '@/types/profile';

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

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.getProfile(token);
        const profileData = response.data as any;
        if (profileData && !profileData.error) {
          setUser({
            id: profileData.id?.toString() || '1',
            email: profileData.email || '',
            name: profileData.name || profileData.first_name || profileData.email?.split('@')[0] || 'User',
            role: profileData.role || profileData.currentRole || 'User'
          });
        } else {
          console.warn('Invalid profile response:', profileData);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Listen for auth changes
    const handleAuthChange = () => {
      fetchProfile();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []); 

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
