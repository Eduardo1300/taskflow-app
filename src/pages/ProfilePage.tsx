import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import SidebarEnhanced from '../components/Layout/SidebarEnhanced';
import { 
  Camera, 
  Mail, 
  MapPin, 
  Calendar,
  Save,
  Edit3
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const profileData = {
    name: 'Eduardo González',
    email: 'eduardo@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Madrid, España',
    bio: 'Desarrollador apasionado por la productividad y la tecnología.',
    avatar: '/api/placeholder/150/150'
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Aquí iría la lógica para guardar los cambios
    console.log('Guardando datos del perfil:', profileData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <SidebarEnhanced activeSection={activeSection} onSectionChange={handleSectionChange} isCollapsed={false} />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header showUserMenu={true} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Mi Perfil
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona tu información personal y preferencias de cuenta
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img
                        src={profileData.avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                      />
                      <button className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {profileData.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Miembro Premium
                    </p>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        {profileData.email}
                      </div>
                      <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        {profileData.location}
                      </div>
                      <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        Miembro desde Enero 2024
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            156
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Tareas completadas
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            23
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Proyectos
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            4.8
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Productividad
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-600">
                    <nav className="flex space-x-8 px-6">
                      <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium text-sm">
                        Información Personal
                      </button>
                      <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm">
                        Seguridad
                      </button>
                      <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm">
                        Notificaciones
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Información Personal
                      </h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancelar' : 'Editar'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ubicación
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Biografía
                        </label>
                        <textarea
                          rows={4}
                          value={profileData.bio}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
