import React, { useState, useEffect } from 'react';
import {
  Link,
  Calendar,
  Mail,
  MessageSquare,
  Webhook,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Zap,
  Bot,
  X
} from 'lucide-react';
import { integrationService, Integration } from '../../services/integrationService';
import { aiService, AISuggestion } from '../../services/aiService';
import { triggerIntegrationNotification } from './IntegrationNotifications';

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewIntegrationModal, setShowNewIntegrationModal] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<string>('');
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [showSyncHistory, setShowSyncHistory] = useState(false);
  const [validatingWebhook, setValidatingWebhook] = useState(false);

  // Form states
  const [integrationName, setIntegrationName] = useState('');
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, any>>({});
  const [webhookValidationResult, setWebhookValidationResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const integrationsData = await integrationService.getUserIntegrations();
      setIntegrations(integrationsData);

      // Generar algunas sugerencias de ejemplo para mostrar las capacidades de IA
      const exampleSuggestions = await aiService.getAllSuggestions(
        'Reunión con el equipo de marketing',
        'Revisar estrategia Q4 y presupuesto',
        'trabajo'
      );
      setAiSuggestions(exampleSuggestions);
    } catch (err) {
      setError('Error cargando integraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    if (!integrationName.trim() || !selectedIntegrationType) {
      setError('Nombre y tipo de integración son requeridos');
      return;
    }

    setLoading(true);
    const response = await integrationService.createIntegration(
      selectedIntegrationType,
      integrationName,
      integrationConfig
    );

    if (response.success) {
      await loadData();
      setShowNewIntegrationModal(false);
      resetForm();
    } else {
      setError(response.error || 'Error creando integración');
    }
    setLoading(false);
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta integración?')) {
      return;
    }

    const response = await integrationService.deleteIntegration(id);
    if (response.success) {
      await loadData();
    } else {
      setError(response.error || 'Error eliminando integración');
    }
  };

  const handleToggleIntegration = async (id: string, currentStatus: boolean) => {
    const response = await integrationService.updateIntegration(id, {
      is_active: !currentStatus
    });
    
    if (response.success) {
      await loadData();
    } else {
      setError(response.error || 'Error actualizando integración');
    }
  };

  const handleValidateWebhook = async () => {
    if (!integrationConfig.url) {
      setWebhookValidationResult({ success: false, message: 'URL del webhook requerida' });
      return;
    }

    setValidatingWebhook(true);
    const response = await integrationService.validateWebhook(
      integrationConfig.url,
      integrationConfig.method || 'POST'
    );
    
    setValidatingWebhook(false);
    setWebhookValidationResult({
      success: response.success,
      message: response.error || '✅ Webhook validado correctamente'
    });
  };

  const handleShowSyncHistory = async (integrationId: string) => {
    setShowSyncHistory(true);
    const history = await integrationService.getSyncHistory(integrationId);
    setSyncHistory(history);
  };

  const resetForm = () => {
    setIntegrationName('');
    setSelectedIntegrationType('');
    setIntegrationConfig({});
    setError(null);
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'google_calendar': return Calendar;
      case 'outlook': return Calendar;
      case 'slack': return MessageSquare;
      case 'discord': return MessageSquare;
      case 'email': return Mail;
      case 'webhook': return Webhook;
      default: return Link;
    }
  };

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'google_calendar': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'outlook': return 'text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'slack': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'discord': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300';
      case 'email': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'webhook': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
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

  const renderConfigForm = () => {
    switch (selectedIntegrationType) {
      case 'google_calendar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instrucciones
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <p>1. Ve a <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
                <p>2. Habilita la Google Calendar API</p>
                <p>3. Crea credenciales OAuth 2.0</p>
                <p>4. Copia las credenciales aquí</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={integrationConfig.client_id || ''}
                onChange={(e) => setIntegrationConfig({
                  ...integrationConfig,
                  client_id: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="tu-client-id.googleusercontent.com"
              />
            </div>
          </div>
        );

      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={integrationConfig.webhook_url || ''}
                onChange={(e) => setIntegrationConfig({
                  ...integrationConfig,
                  webhook_url: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm text-purple-700 dark:text-purple-300">
              <p>Para obtener el webhook URL:</p>
              <p>1. Ve a tu workspace de Slack</p>
              <p>2. Configuraciones → Administrar aplicaciones</p>
              <p>3. Busca "Incoming Webhooks" y agrégalo</p>
              <p>4. Copia la URL del webhook</p>
            </div>
          </div>
        );

      case 'discord':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={integrationConfig.webhook_url || ''}
                onChange={(e) => setIntegrationConfig({
                  ...integrationConfig,
                  webhook_url: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
              <p>Para obtener el webhook URL:</p>
              <p>1. Ve a tu servidor de Discord</p>
              <p>2. Configuración del canal → Integraciones</p>
              <p>3. Crear Webhook</p>
              <p>4. Copia la URL del webhook</p>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email de destino
              </label>
              <input
                type="email"
                value={integrationConfig.recipient_email || ''}
                onChange={(e) => setIntegrationConfig({
                  ...integrationConfig,
                  recipient_email: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="tu-email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipos de notificación
              </label>
              <div className="space-y-2">
                {['task_created', 'task_completed', 'task_overdue', 'task_reminder'].map((event) => (
                  <label key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={integrationConfig.events?.includes(event) || false}
                      onChange={(e) => {
                        const currentEvents = integrationConfig.events || [];
                        const newEvents = e.target.checked
                          ? [...currentEvents, event]
                          : currentEvents.filter((ev: string) => ev !== event);
                        setIntegrationConfig({
                          ...integrationConfig,
                          events: newEvents
                        });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {event.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL del Webhook
              </label>
              <input
                type="url"
                value={integrationConfig.url || ''}
                onChange={(e) => setIntegrationConfig({
                  ...integrationConfig,
                  url: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://tu-servidor.com/webhook"
              />
              <button
                onClick={handleValidateWebhook}
                disabled={validatingWebhook || !integrationConfig.url}
                className="mt-2 text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded transition-colors"
              >
                {validatingWebhook ? 'Validando...' : 'Probar Webhook'}
              </button>
              {webhookValidationResult && (
                <div className={`mt-2 p-2 rounded text-sm ${
                  webhookValidationResult.success
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {webhookValidationResult.message}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método HTTP
              </label>
              <select
                value={integrationConfig.method || 'POST'}
                onChange={(e) => setIntegrationConfig({
                  ...integrationConfig,
                  method: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && integrations.length === 0) {
    return (
      <div className="max-w-6xl ml-16 w-full">
        <div className="text-center py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
            <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando integraciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 px-3 sm:px-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
            Integraciones & IA
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Conecta TaskFlow con tus herramientas favoritas y aprovecha la IA
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <button
            onClick={() => setShowNewIntegrationModal(true)}
            className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            Nueva Integración
          </button>
          <button
            onClick={() => triggerIntegrationNotification(
              'success',
              'Prueba de integración',
              'Las notificaciones funcionan correctamente',
              'test'
            )}
            className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <Bot className="h-4 w-4 mr-1 sm:mr-2" />
            Probar Notificaciones
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* IA Suggestions Preview */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
          <div className="flex items-center mb-3 sm:mb-4 gap-2">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Sugerencias de IA
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {aiSuggestions.slice(0, 4).map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    {suggestion.title}
                  </h4>
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {suggestion.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-purple-600 dark:text-purple-400">
            💡 La IA puede sugerir categorías, fechas y prioridades automáticamente cuando creas tareas
          </div>
        </div>
      )}

      {/* Integraciones Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Google Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Google Calendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sincroniza tus tareas</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Crea eventos automáticamente en Google Calendar cuando asignes fechas de vencimiento a tus tareas.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {integrations.some(i => i.type === 'google_calendar' && i.is_active) ? 'Conectado' : 'No conectado'}
            </span>
            {integrations.some(i => i.type === 'google_calendar' && i.is_active) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <button
                onClick={() => {
                  setSelectedIntegrationType('google_calendar');
                  setIntegrationName('Google Calendar');
                  setShowNewIntegrationModal(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Conectar
              </button>
            )}
          </div>
        </div>

        {/* Slack */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Slack</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notificaciones en tiempo real</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Recibe notificaciones en Slack cuando completes tareas, se venzan o necesites recordatorios.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {integrations.some(i => i.type === 'slack' && i.is_active) ? 'Conectado' : 'No conectado'}
            </span>
            {integrations.some(i => i.type === 'slack' && i.is_active) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <button
                onClick={() => {
                  setSelectedIntegrationType('slack');
                  setIntegrationName('Slack');
                  setShowNewIntegrationModal(true);
                }}
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Conectar
              </button>
            )}
          </div>
        </div>

        {/* Discord */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-3">
              <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Discord</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notificaciones a tu servidor</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Mantén a tu equipo informado enviando actualizaciones de tareas a tu servidor de Discord.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {integrations.some(i => i.type === 'discord' && i.is_active) ? 'Conectado' : 'No conectado'}
            </span>
            {integrations.some(i => i.type === 'discord' && i.is_active) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <button
                onClick={() => {
                  setSelectedIntegrationType('discord');
                  setIntegrationName('Discord');
                  setShowNewIntegrationModal(true);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Conectar
              </button>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resúmenes por email</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Recibe resúmenes diarios, recordatorios y notificaciones importantes directamente en tu email.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {integrations.some(i => i.type === 'email' && i.is_active) ? 'Conectado' : 'No conectado'}
            </span>
            {integrations.some(i => i.type === 'email' && i.is_active) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <button
                onClick={() => {
                  setSelectedIntegrationType('email');
                  setIntegrationName('Email');
                  setShowNewIntegrationModal(true);
                }}
                className="text-sm text-green-600 hover:text-green-700 dark:text-green-400"
              >
                Conectar
              </button>
            )}
          </div>
        </div>

        {/* Webhook */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <Webhook className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Webhook</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Integración personalizada</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Conecta TaskFlow con cualquier servicio usando webhooks. Ideal para automatizaciones personalizadas.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Personalizable</span>
            <button
              onClick={() => {
                setSelectedIntegrationType('webhook');
                setIntegrationName('Webhook Personalizado');
                setShowNewIntegrationModal(true);
              }}
              className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
            >
              Configurar
            </button>
          </div>
        </div>

        {/* IA Assistant */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
              <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">IA Assistant</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">Siempre activo</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Sugerencias inteligentes de categorías, fechas y prioridades. Análisis de productividad automático.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-600 dark:text-purple-400">✨ Incluido</span>
            <CheckCircle className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Lista de Integraciones Activas */}
      {integrations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Integraciones Configuradas
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {integrations.map((integration) => {
                const Icon = getIntegrationIcon(integration.type);
                return (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${getIntegrationColor(integration.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {integration.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {integration.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Creado: {formatDate(integration.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShowSyncHistory(integration.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Ver historial de sincronización"
                      >
                        📋 Historial
                      </button>
                      <button
                        onClick={() => handleToggleIntegration(integration.id, integration.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          integration.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {integration.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                      <button
                        onClick={() => handleDeleteIntegration(integration.id)}
                        className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                        title="Eliminar integración"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Nueva Integración */}
      {showNewIntegrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nueva Integración
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la integración
                </label>
                <input
                  type="text"
                  value={integrationName}
                  onChange={(e) => setIntegrationName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Mi Slack del trabajo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de integración
                </label>
                <select
                  value={selectedIntegrationType}
                  onChange={(e) => setSelectedIntegrationType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="google_calendar">Google Calendar</option>
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="email">Email</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>

              {renderConfigForm()}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewIntegrationModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateIntegration}
                disabled={loading || !integrationName.trim() || !selectedIntegrationType}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Integración'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync History Modal */}
      {showSyncHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Historial de Sincronización
              </h2>
              <button
                onClick={() => setShowSyncHistory(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {syncHistory && syncHistory.length > 0 ? (
                syncHistory.map((event: any, index: number) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {event.status === 'success' ? (
                            <CheckCircle size={18} className="text-green-600" />
                          ) : (
                            <AlertCircle size={18} className="text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            event.status === 'success' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {event.status === 'success' ? 'Exitoso' : 'Error'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Tipo: <span className="font-medium">{event.integration_type}</span>
                        </p>
                        {event.external_id && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            ID Externo: <span className="font-mono text-xs">{event.external_id}</span>
                          </p>
                        )}
                        {event.error_message && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Error: {event.error_message}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.synced_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.synced_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay historial de sincronización disponible
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowSyncHistory(false)}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
