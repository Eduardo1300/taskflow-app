import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Search, Mail } from 'lucide-react';
import { userService, User as UserType, TaskAssignment } from '../../services/userService';

interface TaskAssignmentsProps {
  taskId: number;
  onAssignmentsCountChange?: (count: number) => void;
}

export const TaskAssignments: React.FC<TaskAssignmentsProps> = ({
  taskId,
  onAssignmentsCountChange
}) => {
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Cargar asignaciones al montar el componente
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const taskAssignments = await userService.getTaskAssignments(taskId);
        setAssignments(taskAssignments);
        onAssignmentsCountChange?.(taskAssignments.length);
      } catch (error) {
        console.error('Error loading assignments:', error);
      }
    };

    if (taskId) {
      loadAssignments();
      
      // Suscribirse a cambios en tiempo real
      const subscription = userService.subscribeToTaskAssignments(taskId, (updatedAssignments) => {
        setAssignments(updatedAssignments);
        onAssignmentsCountChange?.(updatedAssignments.length);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [taskId, onAssignmentsCountChange]);

  // Cargar usuarios disponibles al abrir el selector
  useEffect(() => {
    if (isAddingUser) {
      const loadUsers = async () => {
        try {
          const users = await userService.getWorkspaceUsers();
          // Filtrar usuarios ya asignados
          const assignedUserIds = assignments.map(a => a.user_id);
          const availableUsers = users.filter(u => !assignedUserIds.includes(u.id));
          setAvailableUsers(availableUsers);
        } catch (error) {
          console.error('Error loading users:', error);
        }
      };

      loadUsers();
    }
  }, [isAddingUser, assignments]);

  // Buscar usuarios
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await userService.searchUsers(searchQuery);
        // Filtrar usuarios ya asignados
        const assignedUserIds = assignments.map(a => a.user_id);
        const filteredResults = results.filter(u => !assignedUserIds.includes(u.id));
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, assignments]);

  // Asignar usuario a tarea
  const handleAssignUser = async (userId: string) => {
    try {
      const assignment = await userService.assignUserToTask(taskId, userId);
      setAssignments(prev => [...prev, assignment]);
      onAssignmentsCountChange?.(assignments.length + 1);
      setIsAddingUser(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error assigning user:', error);
      alert('Error al asignar usuario. Inténtalo de nuevo.');
    }
  };

  // Quitar asignación de usuario
  const handleUnassignUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres quitar esta asignación?')) return;

    try {
      await userService.unassignUserFromTask(taskId, userId);
      setAssignments(prev => prev.filter(a => a.user_id !== userId));
      onAssignmentsCountChange?.(assignments.length - 1);
    } catch (error) {
      console.error('Error unassigning user:', error);
      alert('Error al quitar asignación. Inténtalo de nuevo.');
    }
  };

  // Obtener avatar del usuario
  const getUserAvatar = (userProfile: UserType | undefined) => {
    if (userProfile?.avatar_url) {
      return (
        <img 
          src={userProfile.avatar_url} 
          alt={userProfile.full_name}
          className="h-8 w-8 rounded-full"
        />
      );
    }

    const name = userProfile?.full_name || 'Usuario';
    const avatarUrl = userService.generateAvatarUrl(name);
    
    return (
      <img 
        src={avatarUrl} 
        alt={name}
        className="h-8 w-8 rounded-full"
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Asignados ({assignments.length})
          </h3>
        </div>

        <button
          onClick={() => setIsAddingUser(true)}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Asignar</span>
        </button>
      </div>

      {/* Lista de usuarios asignados */}
      {assignments.length > 0 ? (
        <div className="space-y-2">
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getUserAvatar(assignment.user)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {assignment.user?.full_name || 'Usuario desconocido'}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Mail className="h-3 w-3" />
                    <span>{assignment.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Botón para quitar asignación */}
              <button
                onClick={() => handleUnassignUser(assignment.user_id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Quitar asignación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay usuarios asignados</p>
          <p className="text-sm">Asigna usuarios para colaborar</p>
        </div>
      )}

      {/* Modal para agregar usuario */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Asignar usuario
              </h3>
              <button
                onClick={() => {
                  setIsAddingUser(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Resultados de búsqueda */}
            <div className="max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Buscando...
                </div>
              ) : searchQuery.trim().length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Usuarios disponibles:
                  </p>
                  {availableUsers.slice(0, 5).map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleAssignUser(user.id)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        {getUserAvatar(user)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleAssignUser(user.id)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        {getUserAvatar(user)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No se encontraron usuarios
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
