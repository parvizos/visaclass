import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Settings, User, Home, Shield, Bell, Mail, Phone, MapPin, Globe, Edit2, Save, X, FileText, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDeviceSessionStats, trackDeviceAuthEvent } from '@/lib/deviceSessionTracker';
import { getCurrentUserLocal, logoutLocal, onLocalAuthStateChange, updateCurrentUserLocalProfile } from '@/lib/localAuth';
import { studentAPI } from '@/services/api';


const Dashboard = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceName, setDeviceName] = useState('');
  const [showDeviceForm, setShowDeviceForm] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    bio: '',
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState({
    loginEvents: 0,
    logoutEvents: 0,
    uniqueDevices: 0,
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'devices' || tab === 'settings') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadUser = () => {
      // Check for backend token first
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      // Also check local auth as fallback
      const localUser = getCurrentUserLocal();
      
      if (!token && !localUser) {
        navigate('/auth');
        return;
      }
      
      // If we have local user data, use it
      if (localUser) {
        setUser(localUser);
        setProfileData({
          fullName: localUser.fullName || '',
          email: localUser.email || '',
          phone: localUser.phone || '',
          country: localUser.country || '',
          bio: localUser.bio || '',
        });
      } else if (token) {
        // If only token exists, create minimal user object
        // The actual user data will be loaded from API
        setUser({ id: 'api-user', email: '', fullName: '' });
      }
      
      const storedDevices = localStorage.getItem(`devices_${localUser?.id || 'api-user'}`);
      if (storedDevices) {
        setDevices(JSON.parse(storedDevices));
      }
      setLoading(false);
    };

    const unsubscribe = onLocalAuthStateChange((current) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!current && !token) {
        navigate('/auth');
      }
    });

    loadUser();
    return unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    if (user?.id) {
      await trackDeviceAuthEvent(user.id, 'logout');
    }
    // Clear both local auth and backend token
    logoutLocal();
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    toast({
      title: language === 'en' ? 'Logged out' : 'Вы вышли',
      description: language === 'en' ? 'You have been successfully logged out.' : 'Вы успешно вышли из системы.',
    });
    navigate('/');
  };
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // Load applications from backend API
  useEffect(() => {
    const loadApplications = async () => {
      if (activeTab !== 'applications') return;
      
      setIsLoadingApplications(true);
      try {
        const response = await studentAPI.getApplications();
        if (response.success) {
          setApplications(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
        // Fallback to localStorage if API fails
        const savedApplications = localStorage.getItem('visaclass-application');
        if (savedApplications) {
          try {
            setApplications([JSON.parse(savedApplications)]);
          } catch (e) {
            setApplications([]);
          }
        }
      } finally {
        setIsLoadingApplications(false);
      }
    };

    loadApplications();
  }, [activeTab]);

  useEffect(() => {
    const loadSessionStats = async () => {
      if (!user?.id) return;
      const stats = await getDeviceSessionStats(user.id);
      setSessionStats(stats);
    };

    loadSessionStats();
  }, [user?.id]);
  const handleUpdateProfile = async () => {
    try {
      const updated = updateCurrentUserLocalProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
        country: profileData.country,
        bio: profileData.bio,
      });
      setUser(updated);

      toast({
        title: language === 'en' ? 'Profile Updated' : 'Профиль обновлен',
        description: language === 'en' ? 'Your profile has been successfully updated.' : 'Ваш профиль успешно обновлен.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Ошибка',
        description: error.message,
      });
    }
  };

  const handleAddDevice = () => {
    if (!deviceName.trim()) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Ошибка',
        description: language === 'en' ? 'Please enter a device name.' : 'Пожалуйста, введите имя устройства.',
      });
      return;
    }

    const newDevice = {
      id: Date.now().toString(),
      name: deviceName,
      type: 'laptop', // Could be dynamic
      addedDate: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU'),
      lastAccess: 'Just now',
      isCurrentDevice: devices.length === 0,
    };

    const updatedDevices = [...devices, newDevice];
    setDevices(updatedDevices);
    localStorage.setItem(`devices_${user.id}`, JSON.stringify(updatedDevices));
    setDeviceName('');
    setShowDeviceForm(false);

    toast({
      title: language === 'en' ? 'Device Added' : 'Устройство добавлено',
      description: language === 'en' ? 'Device has been registered.' : 'Устройство зарегистрировано.',
    });
  };

  const handleRemoveDevice = (deviceId: string) => {
    const updatedDevices = devices.filter(d => d.id !== deviceId);
    setDevices(updatedDevices);
    localStorage.setItem(`devices_${user.id}`, JSON.stringify(updatedDevices));

    toast({
      title: language === 'en' ? 'Device Removed' : 'Устройство удалено',
      description: language === 'en' ? 'Device has been removed.' : 'Устройство удалено.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{language === 'en' ? 'Loading...' : 'Загрузка...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">VC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{language === 'en' ? 'VISACLASS' : 'VISACLASS'}</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'en' ? 'Logout' : 'Выход'}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                {language === 'en' ? 'Menu' : 'Меню'}
              </h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>{language === 'en' ? 'My Profile' : 'Мой профиль'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                    activeTab === 'applications'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>{language === 'en' ? 'My Applications' : 'Мои заявления'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                    activeTab === 'devices'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>{language === 'en' ? 'Devices' : 'Устройства'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                    activeTab === 'settings'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>{language === 'en' ? 'Settings' : 'Настройки'}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {language === 'en' ? 'My Profile' : 'Мой профиль'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isEditing
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>{language === 'en' ? 'Cancel' : 'Отмена'}</span>
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          <span>{language === 'en' ? 'Edit' : 'Редактировать'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center mb-8 pb-8 border-b">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-6">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{profileData.fullName || 'User'}</h3>
                      <p className="text-gray-600">{profileData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'en' ? 'Full Name' : 'Полное имя'}
                      </label>
                      <Input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        disabled={!isEditing}
                        className="rounded-lg border-2 border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'en' ? 'Email' : 'Email'}
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="rounded-lg border-2 border-gray-300 bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{language === 'en' ? 'Phone' : 'Телефон'}</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder={language === 'en' ? '+1 (555) 000-0000' : '+1 (555) 000-0000'}
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="rounded-lg border-2 border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{language === 'en' ? 'Country' : 'Страна'}</span>
                      </label>
                      <Input
                        type="text"
                        placeholder={language === 'en' ? 'Select country' : 'Выберите страну'}
                        value={profileData.country}
                        onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                        disabled={!isEditing}
                        className="rounded-lg border-2 border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'en' ? 'Bio' : 'О себе'}
                      </label>
                      <textarea
                        placeholder={language === 'en' ? 'Tell us about yourself...' : 'Расскажите о себе...'}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        rows={4}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8 flex space-x-4">
                      <Button
                        onClick={handleUpdateProfile}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        <Save className="w-4 h-4" />
                        <span>{language === 'en' ? 'Save Changes' : 'Сохранить'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {language === 'en' ? 'My Applications' : 'Мои заявления'}
                    </h2>
                    <Button
                      onClick={() => navigate('/apply')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Apply Now' : 'Подать заявление'}
                    </Button>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {language === 'en' ? 'No applications yet.' : 'Заявлений пока нет.'}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {language === 'en'
                          ? 'Apply to a university to get started'
                          : 'Подайте заявление в университет'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {app.universityName || 'University Application'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {app.programName || 'Program not specified'}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Applied: {app.appliedDate || 'Recently'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                app.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : app.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {app.status === 'accepted' && (
                                  <span className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{language === 'en' ? 'Accepted' : 'Принято'}</span>
                                  </span>
                                )}
                                {app.status === 'rejected' && (
                                  <span className="flex items-center space-x-1">
                                    <XCircle className="w-4 h-4" />
                                    <span>{language === 'en' ? 'Rejected' : 'Отклонено'}</span>
                                  </span>
                                )}
                                {(app.status === 'pending' || !app.status) && (
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{language === 'en' ? 'Pending' : 'В ожидании'}</span>
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {language === 'en' ? 'Your Devices' : 'Ваши устройства'}
                    </h2>
                    <Button
                      onClick={() => setShowDeviceForm(!showDeviceForm)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    >
                      {language === 'en' ? '+ Add Device' : '+ Добавить гаджет'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm text-gray-600">Unique Devices</p>
                      <p className="text-2xl font-bold text-blue-700">{sessionStats.uniqueDevices}</p>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                      <p className="text-sm text-gray-600">Login Events</p>
                      <p className="text-2xl font-bold text-green-700">{sessionStats.loginEvents}</p>
                    </div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                      <p className="text-sm text-gray-600">Logout Events</p>
                      <p className="text-2xl font-bold text-amber-700">{sessionStats.logoutEvents}</p>
                    </div>
                  </div>

                  {/* Add Device Form */}
                  {showDeviceForm && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {language === 'en' ? 'Register New Device' : 'Зарегистрировать новое устройство'}
                      </h3>
                      <div className="flex gap-4">
                        <Input
                          type="text"
                          placeholder={language === 'en' ? 'Enter device name (e.g., My Laptop)' : 'Введите имя устройства'}
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          className="flex-1 rounded-lg border-2 border-blue-300"
                        />
                        <Button
                          onClick={handleAddDevice}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        >
                          {language === 'en' ? 'Add' : 'Добавить'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowDeviceForm(false);
                            setDeviceName('');
                          }}
                          variant="outline"
                          className="border-gray-300"
                        >
                          {language === 'en' ? 'Cancel' : 'Отмена'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Devices List */}
                  {devices.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {language === 'en' ? 'No devices registered yet.' : 'Устройства не зарегистрированы.'}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {language === 'en'
                          ? 'Add a device to get started'
                          : 'Добавьте устройство, чтобы начать'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {devices.map((device) => (
                        <div
                          key={device.id}
                          className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 flex items-center justify-between hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                              <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                <span>{device.name}</span>
                                {device.isCurrentDevice && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {language === 'en' ? 'Current' : 'Текущее'}
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {language === 'en'
                                  ? `Added: ${device.addedDate} • Last access: ${device.lastAccess}`
                                  : `Добавлено: ${device.addedDate} • Последний доступ: ${device.lastAccess}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveDevice(device.id)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            {language === 'en' ? 'Remove' : 'Удалить'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Security Info */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-8">
                  <div className="flex items-start space-x-4">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {language === 'en' ? 'Device Security' : 'Безопасность устройства'}
                      </h3>
                      <p className="text-gray-700">
                        {language === 'en'
                          ? 'Keep track of all devices accessing your account. Remove any unrecognized devices to protect your account.'
                          : 'Отслеживайте все устройства, получающие доступ к вашему аккаунту. Удаляйте неизвестные устройства для защиты.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {language === 'en' ? 'Settings' : 'Настройки'}
                </h2>
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {language === 'en' ? 'Notifications' : 'Уведомления'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {language === 'en'
                              ? 'Receive updates about your application'
                              : 'Получать обновления о вашем заявлении'}
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300" defaultChecked />
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {language === 'en' ? 'Email Updates' : 'Рассылка по email'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {language === 'en' ? 'Get news and updates via email' : 'Получайте новости по email'}
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300" defaultChecked />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {language === 'en' ? 'Two-Factor Authentication' : 'Двухфакторная аутентификация'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {language === 'en' ? 'Enhance your account security' : 'Улучшите безопасность аккаунта'}
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
