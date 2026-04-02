import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import { User, CreditCard, Bell, Shield, Palette, Download, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { profileApi } from '@/api/profile.api';
import { authApi } from '@/api/auth.api';
import { Textarea } from '@/components/ui/textarea';

import type { ProfileResponse, ProfileUpdate, ProfileBasicInfo } from '@/types/profile';

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useApp();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [formData, setFormData] = useState<ProfileUpdate>({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    experience_years: 0,
    bio: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    weekly: true,
    achievements: true,
  });
  const [privacyVisible, setPrivacyVisible] = useState(true);

  const handleFieldChange = useCallback((field: keyof ProfileUpdate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const profileData = await profileApi.getProfile();
      setProfile(profileData);
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        location: profileData.location || '',
        experience_years: profileData.experience_years || 0,
        bio: profileData.bio || '',
        phone: profileData.phone || '',
        github_url: profileData.github_url || '',
        linkedin_url: profileData.linkedin_url || '',
        portfolio_url: profileData.portfolio_url || '',
      });
      setIsDirty(false);
      setUser({
        id: profileData.id || 1,
        email: profileData.email || '',
        name: profileData.name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.email?.split('@')[0] || 'User',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile fetch error:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Failed to load profile. <button onClick={fetchProfile} className="text-primary hover:underline">Retry</button></p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;

    if (!formData.first_name?.trim() && !formData.last_name?.trim()) {
      toast.error('Please enter at least a first or last name');
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = await profileApi.updateProfile(formData);
      setUser({
        id: 1,
        email: updatedProfile.email || '',
        name: updatedProfile.name || `${updatedProfile.first_name || ''} ${updatedProfile.last_name || ''}`.trim() || updatedProfile.email?.split('@')[0] || 'User',
        first_name: updatedProfile.first_name || '',
        last_name: updatedProfile.last_name || ''
      });
      setProfile(updatedProfile);
      setIsDirty(false);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to save profile');
      console.error('Profile save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsSave = () => {
    toast.success('Notification preferences saved!');
  };

  const handlePrivacySave = () => {
    toast.success('Privacy settings saved!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold font-display">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="profile" className="flex h-[calc(100vh-12rem)] w-full gap-6">
          <TabsList className="w-64 flex-shrink-0 border-r bg-background sticky top-0 h-full flex-col p-3 space-y-2">
            <TabsTrigger value="profile" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50 h-12 data-[state=active]:shadow-sm"><User className="w-5 h-5 shrink-0" />Profile</TabsTrigger>
            <TabsTrigger value="subscription" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50 h-12 data-[state=active]:shadow-sm"><CreditCard className="w-5 h-5 shrink-0" />Subscription</TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50 h-12 data-[state=active]:shadow-sm"><Bell className="w-5 h-5 shrink-0" />Notifications</TabsTrigger>
            <TabsTrigger value="privacy" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50 h-12 data-[state=active]:shadow-sm"><Shield className="w-5 h-5 shrink-0" />Privacy</TabsTrigger>
            <TabsTrigger value="appearance" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50 h-12 data-[state=active]:shadow-sm"><Palette className="w-5 h-5 shrink-0" />Appearance</TabsTrigger>
            <TabsTrigger value="data" className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50 h-12 data-[state=active]:shadow-sm"><Download className="w-5 h-5 shrink-0" />Data &amp; Export</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 min-w-0 overflow-y-auto">
            <TabsContent value="profile" className="mt-0 p-0 relative h-full flex-1">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={formData.first_name || ''} 
                          onChange={(e) => handleFieldChange('first_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={formData.last_name || ''} 
                          onChange={(e) => handleFieldChange('last_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input 
                          id="phone" 
                          placeholder="+1 (555) 123-4567" 
                          value={formData.phone || ''} 
                          onChange={(e) => handleFieldChange('phone' as keyof ProfileUpdate, e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          placeholder="e.g. San Francisco, CA" 
                          value={formData.location || ''} 
                          onChange={(e) => handleFieldChange('location', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Select 
                          value={formData.experience_years?.toString() || '0'} 
                          onValueChange={(value) => handleFieldChange('experience_years', parseInt(value) || 0)}
                        >
                          <SelectTrigger id="experience">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 31}, (_, i) => i).map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num === 0 ? 'Less than 1' : num === 30 ? '30+' : `${num} years`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          placeholder="Tell us about yourself and your career goals..." 
                          value={formData.bio || ''} 
                          onChange={(e) => handleFieldChange('bio', e.target.value)}
                          rows={4} 
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    <h3 className="text-lg font-medium tracking-tight">Social Links</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="github_url">GitHub URL</Label>
                        <Input 
                          id="github_url" 
                          placeholder="https://github.com/username" 
                          value={formData.github_url || ''} 
                          onChange={(e) => handleFieldChange('github_url', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input 
                          id="linkedin_url" 
                          placeholder="https://linkedin.com/in/username" 
                          value={formData.linkedin_url || ''} 
                          onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="portfolio_url">Portfolio URL</Label>
                        <Input 
                          id="portfolio_url" 
                          placeholder="https://yourportfolio.com" 
                          value={formData.portfolio_url || ''} 
                          onChange={(e) => handleFieldChange('portfolio_url', e.target.value)}
                        />
                      </div>
                    </div>
                    {isDirty && (
                      <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Manage your subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Premium features coming soon. Current plan: Free</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>Configure how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Progress Report</p>
                      <p className="text-sm text-muted-foreground">Get a summary of your profile progress</p>
                    </div>
                    <Switch 
                      checked={notifications.weekly}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weekly: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Achievement Alerts</p>
                      <p className="text-sm text-muted-foreground">Celebrate milestones</p>
                    </div>
                    <Switch 
                      checked={notifications.achievements}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, achievements: checked }))}
                    />
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" onClick={handleNotificationsSave} size="sm">
                      Save Notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Privacy</CardTitle>
                  </div>
                  <CardDescription>Control your privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                    </div>
                    <Switch checked={privacyVisible} onCheckedChange={setPrivacyVisible} />
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" onClick={handlePrivacySave} size="sm">
                      Save Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Appearance</CardTitle>
                  </div>
                  <CardDescription>Customize the look and feel of your interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={toggleDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Data & Export</CardTitle>
                  </div>
                  <CardDescription>Export your data or manage account deletion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          const result = await authApi.requestPrivacy('export');
                          toast.success(result.message);
                        } catch (error) {
                          toast.error('Failed to request data export');
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={async () => {
                        if (confirm('Are you sure you want to request account deletion? This cannot be undone.')) {
                          try {
                            const result = await authApi.requestPrivacy('delete');
                            toast.success(result.message);
                          } catch (error) {
                            toast.error('Failed to request account deletion');
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
