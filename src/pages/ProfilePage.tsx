import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  joined_date: string;
  timezone: string;
  language: string;
}

const ProfilePage: React.FC = () => {
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

  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    setProfile({
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
  }, [user]);

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
      // Aquí iría la lógica para actualizar el perfil
      // Por ahora solo actualizamos el estado local
      setProfile({ ...editedProfile });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl ml-16 w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tu información personal y preferencias
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar Perfil
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Miembro desde {formatDate(profile.joined_date)}</span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información Básica
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Número de teléfono"
                  />
                ) : (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900 dark:text-white">
                      {profile.phone || 'No especificado'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ubicación
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Tu ubicación"
                  />
                ) : (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900 dark:text-white">
                      {profile.location || 'No especificada'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información Adicional
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Biografía
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Cuéntanos un poco sobre ti..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile.bio || 'No hay biografía disponible'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Zona horaria
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Idioma
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile.language === 'es' ? 'Español' : 
                     profile.language === 'en' ? 'English' :
                     profile.language === 'fr' ? 'Français' : 'Deutsch'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estadísticas de la Cuenta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tareas completadas</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Proyectos activos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Días racha</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;
