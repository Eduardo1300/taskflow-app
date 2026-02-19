import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Award, TrendingUp, Clock, Target, Badge } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileService, type UserProfile } from '../services/profileService';
import { StatsService, type UserStats } from '../services/statsService';
import MainLayout from '../components/Layout/MainLayout';

const ProfilePageEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    joined_date: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'es'
  });

  const [stats, setStats] = useState<UserStats>({
    tasksCompleted: 0,
    activeProjects: 0,
    streakDays: 0,
    collaborators: 0,
    totalHours: 0,
    averageCompletionRate: 0,
    totalTasks: 0
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadStats();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await ProfileService.getProfile(user.id);
      
      if (error) {
        console.error('Error loading profile:', error);
        const newProfile: UserProfile = {
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: '',
          location: '',
          bio: '',
          avatar: '',
          joined_date: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'es'
        };
        
        await ProfileService.createProfile(user.id, newProfile);
        setProfile(newProfile);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await StatsService.getUserStats(user.id);

      if (error) {
        console.error('Error loading stats:', error);
        return;
      }

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await ProfileService.updateProfile(user?.id || '', editedProfile);
      
      if (error) {
        console.error('Error updating profile:', error);
        alert('Error al guardar el perfil');
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile(editedProfile);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MainLayout currentPage="profile">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 sm:p-4 rounded-2xl shadow-xl">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tu información y estadísticas</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Edit2 className="h-5 w-5 mr-2" />
              Editar Perfil
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                <X className="h-5 w-5 mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg transition-all"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </header>

        <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/20">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover" />
                ) : (
                  <User className="h-14 w-14 sm:h-16 sm:w-16 text-white" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-3 bg-white text-purple-600 rounded-full hover:bg-gray-100 shadow-lg transition-all hover:scale-110">
                  <Camera className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="text-white text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold">{profile.name || 'Usuario'}</h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">{profile.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-blue-100">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Miembro desde {formatDate(profile.joined_date)}</span>
                </div>
                {stats.streakDays > 0 && (
                  <div className="flex items-center px-3 py-1 bg-white/20 rounded-full">
                    <Award className="h-4 w-4 mr-1.5" />
                    <span>{stats.streakDays} días de racha</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tareas Completadas', value: stats.tasksCompleted, icon: Target, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
            { label: 'Proyectos Activos', value: stats.activeProjects, icon: TrendingUp, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
            { label: 'Racha Actual', value: `${stats.streakDays}d`, icon: Award, bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
            { label: 'Tasa Éxito', value: `${stats.averageCompletionRate}%`, icon: Badge, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.text}`} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Información Personal
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre completo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{profile.name || 'No especificado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900 dark:text-white font-medium">{profile.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Número de teléfono"
                  />
                ) : (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900 dark:text-white font-medium">{profile.phone || 'No especificado'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubicación</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Tu ubicación"
                  />
                ) : (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900 dark:text-white font-medium">{profile.location || 'No especificada'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Configuración Adicional
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biografía</label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Cuéntanos sobre ti..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.bio || 'No hay biografía disponible'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zona horaria</label>
                {isEditing ? (
                  <select
                    value={editedProfile.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/New_York">Nueva York</option>
                    <option value="Europe/Madrid">Madrid</option>
                    <option value="Europe/London">Londres</option>
                    <option value="Asia/Tokyo">Tokio</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.timezone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                {isEditing ? (
                  <select
                    value={editedProfile.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile.language === 'es' ? 'Español' : profile.language === 'en' ? 'English' : profile.language === 'fr' ? 'Français' : 'Deutsch'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePageEnhanced;
