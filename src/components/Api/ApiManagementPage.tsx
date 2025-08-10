import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Globe,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Code,
  Book
} from 'lucide-react';
import { apiService, ApiKey, WebhookConfig } from '../../services/apiService';

const ApiManagementPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewApiKeyModal, setShowNewApiKeyModal] = useState(false);
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [showApiDocumentation, setShowApiDocumentation] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Form states
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<('read' | 'write' | 'delete')[]>(['read']);
  const [newApiKeyRateLimit, setNewApiKeyRateLimit] = useState(60);

  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<('task.created' | 'task.updated' | 'task.deleted' | 'task.completed')[]>(['task.created']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [apiKeysResponse, webhooksResponse] = await Promise.all([
        apiService.getUserApiKeys(),
        apiService.getUserWebhooks()
      ]);

      if (apiKeysResponse.success && apiKeysResponse.data) {
        setApiKeys(apiKeysResponse.data);
      }

      if (webhooksResponse.success && webhooksResponse.data) {
        setWebhooks(webhooksResponse.data);
      }
    } catch (err) {
      setError('Error cargando datos de la API');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      setError('El nombre de la API key es requerido');
      return;
    }

    setLoading(true);
    const response = await apiService.createApiKey(
      newApiKeyName,
      newApiKeyPermissions,
      newApiKeyRateLimit
    );

    if (response.success) {
      await loadData();
      setShowNewApiKeyModal(false);
      setNewApiKeyName('');
      setNewApiKeyPermissions(['read']);
      setNewApiKeyRateLimit(60);
    } else {
      setError(response.error || 'Error creando API key');
    }
    setLoading(false);
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres revocar esta API key?')) {
      return;
    }

    const response = await apiService.revokeApiKey(keyId);
    if (response.success) {
      await loadData();
    } else {
      setError(response.error || 'Error revocando API key');
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      setError('La URL del webhook es requerida');
      return;
    }

    setLoading(true);
    const response = await apiService.createWebhook(newWebhookUrl, newWebhookEvents);

    if (response.success) {
      await loadData();
      setShowNewWebhookModal(false);
      setNewWebhookUrl('');
      setNewWebhookEvents(['task.created']);
    } else {
      setError(response.error || 'Error creando webhook');
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Aquí podrías mostrar una notificación de éxito
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••••••••••••••••••••••••••••••••••••••••••';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'read': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'write': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading && apiKeys.length === 0) {
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando configuración de API...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Globe className="h-6 w-6 mr-2" />
            API REST
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona el acceso programático a tus tareas
          </p>
        </div>
        <button
          onClick={() => setShowApiDocumentation(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Book className="h-4 w-4 mr-2" />
          Documentación
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
            </div>
            <button
              onClick={() => setShowNewApiKeyModal(true)}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nueva API Key
            </button>
          </div>
        </div>

        <div className="p-6">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes API keys creadas</p>
              <button
                onClick={() => setShowNewApiKeyModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primera API Key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white mr-3">
                          {apiKey.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          apiKey.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {apiKey.is_active ? 'Activa' : 'Revocada'}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="ml-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          <span>{apiKey.rate_limit} req/min</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Creada: {formatDate(apiKey.created_at)}</span>
                        </div>
                        {apiKey.last_used_at && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Último uso: {formatDate(apiKey.last_used_at)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((permission) => (
                          <span
                            key={permission}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>

                    {apiKey.is_active && (
                      <button
                        onClick={() => handleRevokeApiKey(apiKey.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                        title="Revocar API Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhooks</h3>
            </div>
            <button
              onClick={() => setShowNewWebhookModal(true)}
              className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Webhook
            </button>
          </div>
        </div>

        <div className="p-6">
          {webhooks.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes webhooks configurados</p>
              <button
                onClick={() => setShowNewWebhookModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer Webhook
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 text-gray-400 mr-2" />
                      <code className="text-sm font-mono text-gray-600 dark:text-gray-300">
                        {webhook.url}
                      </code>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      webhook.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {webhook.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {event}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Creado: {formatDate(webhook.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Nueva API Key */}
      {showNewApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nueva API Key
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Mi aplicación móvil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Permisos
                </label>
                <div className="space-y-2">
                  {['read', 'write', 'delete'].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newApiKeyPermissions.includes(permission as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewApiKeyPermissions([...newApiKeyPermissions, permission as any]);
                          } else {
                            setNewApiKeyPermissions(newApiKeyPermissions.filter(p => p !== permission));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {permission}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Límite de velocidad (requests/minuto)
                </label>
                <input
                  type="number"
                  value={newApiKeyRateLimit}
                  onChange={(e) => setNewApiKeyRateLimit(parseInt(e.target.value) || 60)}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewApiKeyModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateApiKey}
                disabled={loading || !newApiKeyName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Creando...' : 'Crear API Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Nuevo Webhook */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nuevo Webhook
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL del Webhook
                </label>
                <input
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://tu-servidor.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Eventos
                </label>
                <div className="space-y-2">
                  {['task.created', 'task.updated', 'task.deleted', 'task.completed'].map((event) => (
                    <label key={event} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newWebhookEvents.includes(event as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhookEvents([...newWebhookEvents, event as any]);
                          } else {
                            setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== event));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {event}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewWebhookModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateWebhook}
                disabled={loading || !newWebhookUrl.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Documentación */}
      {showApiDocumentation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Code className="h-6 w-6 mr-2" />
                Documentación de la API
              </h3>
              <button
                onClick={() => setShowApiDocumentation(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Cerrar</span>
                ✕
              </button>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h4>Autenticación</h4>
              <p>Incluye tu API key en el header de cada request:</p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
{`X-API-Key: tu_api_key_aqui`}
              </pre>

              <h4>Endpoints Disponibles</h4>
              
              <h5>GET /api/v1/tasks</h5>
              <p>Obtiene todas las tareas del usuario.</p>
              <p><strong>Parámetros de consulta:</strong></p>
              <ul>
                <li><code>page</code> (opcional): Número de página (default: 1)</li>
                <li><code>limit</code> (opcional): Elementos por página (default: 20)</li>
                <li><code>status</code> (opcional): 'completed' | 'pending'</li>
                <li><code>category</code> (opcional): Filtrar por categoría</li>
                <li><code>priority</code> (opcional): 'low' | 'medium' | 'high'</li>
              </ul>

              <h5>POST /api/v1/tasks</h5>
              <p>Crea una nueva tarea.</p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
{`{
  "title": "Título de la tarea",
  "description": "Descripción opcional",
  "priority": "medium",
  "due_date": "2025-08-15T10:00:00Z",
  "category": "trabajo",
  "tags": ["importante", "urgente"]
}`}
              </pre>

              <h5>PUT /api/v1/tasks/:id</h5>
              <p>Actualiza una tarea existente.</p>

              <h5>DELETE /api/v1/tasks/:id</h5>
              <p>Elimina una tarea.</p>

              <h4>Webhooks</h4>
              <p>Configura webhooks para recibir notificaciones automáticas cuando ocurran eventos en tus tareas.</p>
              <p><strong>Eventos disponibles:</strong></p>
              <ul>
                <li><code>task.created</code>: Cuando se crea una nueva tarea</li>
                <li><code>task.updated</code>: Cuando se actualiza una tarea</li>
                <li><code>task.completed</code>: Cuando se marca una tarea como completada</li>
                <li><code>task.deleted</code>: Cuando se elimina una tarea</li>
              </ul>

              <h4>Límites de Velocidad</h4>
              <p>Cada API key tiene un límite de requests por minuto configurable. Cuando superes el límite, recibirás un error 429.</p>

              <h4>Códigos de Respuesta</h4>
              <ul>
                <li><code>200</code>: Éxito</li>
                <li><code>201</code>: Recurso creado</li>
                <li><code>400</code>: Petición inválida</li>
                <li><code>401</code>: API key inválida</li>
                <li><code>403</code>: Sin permisos</li>
                <li><code>404</code>: Recurso no encontrado</li>
                <li><code>429</code>: Límite de velocidad excedido</li>
                <li><code>500</code>: Error del servidor</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiManagementPage;
