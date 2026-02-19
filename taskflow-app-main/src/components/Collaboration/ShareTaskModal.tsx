import { useState } from 'react';
import { X, Mail, Users, Check, AlertCircle } from 'lucide-react';
import { Task } from '../../types/database';
import { CollaborationService } from '../../services/collaborationService';

interface ShareTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskShared?: () => void;
}

const ShareTaskModal: React.FC<ShareTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onTaskShared 
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email.trim()) {
      setError('Por favor, ingresa un email');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido');
      setLoading(false);
      return;
    }

    const result = await CollaborationService.inviteCollaborator(
      task.id, 
      email.trim(), 
      permission
    );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Invitación enviada exitosamente');
      setEmail('');
      onTaskShared?.();
    }

    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setPermission('view');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Compartir Tarea
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {task.title}
            </h3>
            <p className="text-sm text-gray-600">
              Invita a alguien a colaborar en esta tarea
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <Check className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email del colaborador
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="colaborador@ejemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de acceso
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit' | 'admin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="view">Solo lectura - Puede ver la tarea</option>
              <option value="edit">Editor - Puede editar la tarea</option>
              <option value="admin">Administrador - Control total</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareTaskModal;
