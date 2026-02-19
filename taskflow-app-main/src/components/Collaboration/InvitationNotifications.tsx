import { useState, useEffect } from 'react';
import { Bell, Check, X, Users, Clock } from 'lucide-react';
import { CollaborationService } from '../../services/collaborationService';
import { CollaborationInvitation, Task } from '../../types/database';

interface InvitationNotificationsProps {
  onInvitationUpdate?: () => void;
}

interface InvitationWithDetails extends CollaborationInvitation {
  task: Task;
  inviter: any;
}

const InvitationNotifications: React.FC<InvitationNotificationsProps> = ({ 
  onInvitationUpdate 
}) => {
  const [invitations, setInvitations] = useState<InvitationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    const result = await CollaborationService.getPendingInvitations();
    if (result.data) {
      setInvitations(result.data);
    }
    setLoading(false);
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    const result = await CollaborationService.acceptInvitation(invitationId);
    if (result.success) {
      await loadInvitations();
      onInvitationUpdate?.();
    }
  };

  const handleDeclineInvitation = async (invitationId: number) => {
    const result = await CollaborationService.declineInvitation(invitationId);
    if (result.success) {
      await loadInvitations();
      onInvitationUpdate?.();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
      >
        <Bell className="h-6 w-6" />
        {invitations.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {invitations.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                Invitaciones de Colaboración
              </h3>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {invitations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No tienes invitaciones pendientes</p>
              </div>
            ) : (
              <div className="space-y-0">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          {invitation.inviter?.full_name || invitation.inviter?.email} 
                          te invitó a colaborar en:
                        </p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {invitation.task?.title}
                        </p>
                        {invitation.task?.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {invitation.task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(invitation.created_at)}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {invitation.permission === 'view' && 'Solo lectura'}
                          {invitation.permission === 'edit' && 'Editor'}
                          {invitation.permission === 'admin' && 'Administrador'}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptInvitation(invitation.id)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Check className="h-4 w-4" />
                          <span>Aceptar</span>
                        </button>
                        <button
                          onClick={() => handleDeclineInvitation(invitation.id)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          <X className="h-4 w-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showNotifications && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default InvitationNotifications;
