import type { Task } from '@/types';
import { analyticsService, type AnalyticsData } from './analyticsService';

/* ============================== Helpers ============================== */

// Todo texto que venga de los datos del usuario (título, categoría...) se escapa antes de
// meterlo en el HTML; si no, un título como <img onerror=...> se ejecutaría en el reporte.
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, ch => ESCAPES[ch]);

const CHART_HEIGHT = 140; // px

// Alturas en píxeles: los porcentajes no se resuelven dentro de flex sin altura fija,
// por eso antes todas las barras salían con el mínimo (4px).
const barHeight = (value: number, max: number) =>
  value <= 0 ? 1 : Math.max(Math.round((value / max) * CHART_HEIGHT), 4);

interface BarItem {
  label: string;
  caption: string;
  bars: { value: number; cls: string }[];
}

function renderBarChart(items: BarItem[]): string {
  const max = Math.max(...items.flatMap(item => item.bars.map(bar => bar.value)), 1);

  return `
    <div class="bar-chart">
      ${items.map(item => `
        <div class="bar-item">
          <div class="bar-group">
            ${item.bars.map(bar => `<div class="bar ${bar.cls}" style="height: ${barHeight(bar.value, max)}px"></div>`).join('')}
          </div>
          <div class="bar-value">${escapeHtml(item.caption)}</div>
          <div class="bar-label">${escapeHtml(item.label)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

const priorityPercent = (count: number, total: number) =>
  total > 0 ? Math.round((count / total) * 100) : 0;

/* ============================== Servicio ============================== */

export const exportService = {
  /**
   * Genera el HTML del reporte PDF y lo devuelve para abrirlo en una nueva pestaña.
   */
    exportAnalyticsToPDF(analyticsData: AnalyticsData, tasks: Task[]): void {
    if (!analyticsData?.taskStats || analyticsData.taskStats.total === 0) {
      alert('No hay suficientes datos para exportar. Crea algunas tareas primero.');
      return;
    }

    const htmlContent = this.generatePDFHTML(analyticsData, tasks);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para exportar a PDF.');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 500);
    };
  },

  generatePDFHTML(data: AnalyticsData, tasks: Task[]): string {
    const { taskStats, priorityStats, timeStats, completionTrends, advancedInsights } = data;

    const date = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Las tareas del store traen created_at / updated_at; las procesamos para tener fechas reales
    const completedTasks = analyticsService
      .processTasks(tasks)
      .filter(t => t.completed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const shownTasks = completedTasks.slice(0, 50);

    const dailyChart = renderBarChart(
      completionTrends.map(trend => ({
        label: trend.label,
        caption: `${trend.completed}/${trend.created}`,
        bars: [
          { value: trend.completed, cls: 'bar-completed' },
          { value: trend.created, cls: 'bar-created' }
        ]
      }))
    );

    const hourlyChart = renderBarChart(
      Array.from({ length: 24 }, (_, hour) => ({
        label: hour % 3 === 0 ? `${hour}h` : '',
        caption: '',
        bars: [{ value: timeStats.hourlyDistribution[hour] || 0, cls: 'bar-hour' }]
      }))
    );

    const weeklyChart = renderBarChart(
      timeStats.weeklyTrends.map(week => ({
        label: week.week,
        caption: String(week.completed),
        bars: [{ value: week.completed, cls: 'bar-purple' }]
      }))
    );

    const monthlyChart = renderBarChart(
      timeStats.monthlyTrends.map(month => ({
        label: month.month,
        caption: String(month.completed),
        bars: [{ value: month.completed, cls: 'bar-amber' }]
      }))
    );

    const insightIcon = (type: string) =>
      type === 'positive' ? '✓' : type === 'warning' ? '⚠' : type === 'achievement' ? '★' : 'i';

    const priorityLabels: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' };
    const priorityStyles: Record<string, string> = {
      high: 'background: #fef2f2; color: #ef4444;',
      medium: 'background: #fffbeb; color: #f59e0b;',
      low: 'background: #f0fdf4; color: #10b981;'
    };

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow Analytics - ${escapeHtml(date)}</title>
  <style>
    * {
      margin: 0; padding: 0; box-sizing: border-box;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; /* que se impriman los colores de fondo */
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      padding: 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #6366f1;
    }
    .header h1 { color: #6366f1; font-size: 28px; margin-bottom: 8px; }
    .header p { color: #6b7280; font-size: 14px; }
    .section { margin-bottom: 30px; break-inside: avoid; page-break-inside: avoid; }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .metrics-grid.two { grid-template-columns: repeat(2, 1fr); }
    .metric-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .metric-value { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-blue .metric-value { color: #3b82f6; }
    .metric-green .metric-value { color: #10b981; }
    .metric-yellow .metric-value { color: #f59e0b; }
    .metric-red .metric-value { color: #ef4444; }
    .metric-purple .metric-value { color: #8b5cf6; }

    .insights-list {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px;
    }
    .insight-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .insight-item:last-child { margin-bottom: 0; }
    .insight-icon {
      width: 24px; height: 24px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      color: #16a34a;
      font-size: 13px; font-weight: 700;
    }
    .insight-text { font-size: 14px; color: #374151; margin-top: 4px; }

    .chart-container {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .chart-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 16px; }

    .bar-chart { display: flex; align-items: flex-end; gap: 8px; }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }
    .bar-group {
      display: flex; align-items: flex-end; justify-content: center;
      gap: 3px; height: ${CHART_HEIGHT}px; width: 100%;
    }
    .bar { flex: 1; max-width: 28px; border-radius: 4px 4px 0 0; }
    .bar-completed { background: #10b981; }
    .bar-created { background: #6366f1; }
    .bar-purple { background: #8b5cf6; }
    .bar-amber { background: #f59e0b; }
    .bar-hour { background: #6366f1; max-width: none; border-radius: 2px 2px 0 0; }
    .bar-value { font-size: 12px; font-weight: 600; color: #1f2937; margin-top: 4px; min-height: 18px; }
    .bar-label { font-size: 11px; color: #6b7280; text-align: center; min-height: 16px; }

    .legend { display: flex; justify-content: center; gap: 16px; margin-top: 12px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
    .legend-dot { width: 12px; height: 12px; border-radius: 2px; }

    .priority-bars { display: flex; flex-direction: column; gap: 16px; }
    .priority-bar { display: flex; align-items: center; gap: 12px; }
    .priority-label { width: 80px; font-size: 13px; font-weight: 500; }
    .priority-track { flex: 1; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
    .priority-fill { height: 100%; border-radius: 6px; }
    .priority-high { background: linear-gradient(90deg, #ef4444, #f97316); }
    .priority-medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .priority-low { background: linear-gradient(90deg, #10b981, #34d399); }
    .priority-count { width: 40px; text-align: right; font-weight: 600; font-size: 13px; }

    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    th { padding: 12px 8px; text-align: left; }
    td { padding: 8px; }
    tbody tr { border-bottom: 1px solid #e5e7eb; break-inside: avoid; }
    .note { color: #6b7280; font-size: 12px; margin-top: 8px; }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }

    @media print {
      body { padding: 0; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TaskFlow Analytics</h1>
      <p>Reporte de productividad generado el ${escapeHtml(date)}</p>
    </div>

    <!-- Resumen ejecutivo -->
    <div class="section">
      <h2 class="section-title">Resumen Ejecutivo</h2>
      <div class="metrics-grid">
        <div class="metric-card metric-blue">
          <div class="metric-value">${taskStats.total}</div>
          <div class="metric-label">Total Tareas</div>
        </div>
        <div class="metric-card metric-green">
          <div class="metric-value">${taskStats.completed}</div>
          <div class="metric-label">Completadas</div>
        </div>
        <div class="metric-card metric-purple">
          <div class="metric-value">${taskStats.completionRate}%</div>
          <div class="metric-label">Tasa Éxito</div>
        </div>
        <div class="metric-card metric-red">
          <div class="metric-value">${taskStats.overdue}</div>
          <div class="metric-label">Vencidas</div>
        </div>
      </div>
      <div class="metrics-grid two">
        <div class="metric-card metric-yellow">
          <div class="metric-value">${priorityStats.tasksCompletedThisWeek}</div>
          <div class="metric-label">Esta Semana</div>
        </div>
        <div class="metric-card" style="background: #fef3c7; border-color: #fcd34d;">
          <div class="metric-value" style="color: #d97706;">${priorityStats.tasksCompletedThisMonth}</div>
          <div class="metric-label">Este Mes</div>
        </div>
      </div>
    </div>

    <!-- Insights -->
    <div class="section">
      <h2 class="section-title">Insights Personalizados</h2>
      <div class="insights-list">
        ${advancedInsights.map(insight => `
        <div class="insight-item">
          <div class="insight-icon">${insightIcon(insight.type)}</div>
          <div>
            <strong>${escapeHtml(insight.title)}</strong>
            <p class="insight-text">${escapeHtml(insight.description)}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>

    <!-- Prioridad -->
    <div class="section">
      <h2 class="section-title">Distribución por Prioridad</h2>
      <div class="chart-container">
        <div class="chart-title">Tareas por nivel de prioridad</div>
        <div class="priority-bars">
          <div class="priority-bar">
            <span class="priority-label" style="color: #ef4444;">Alta</span>
            <div class="priority-track"><div class="priority-fill priority-high" style="width: ${priorityPercent(priorityStats.high, taskStats.total)}%"></div></div>
            <span class="priority-count">${priorityStats.high}</span>
          </div>
          <div class="priority-bar">
            <span class="priority-label" style="color: #f59e0b;">Media</span>
            <div class="priority-track"><div class="priority-fill priority-medium" style="width: ${priorityPercent(priorityStats.medium, taskStats.total)}%"></div></div>
            <span class="priority-count">${priorityStats.medium}</span>
          </div>
          <div class="priority-bar">
            <span class="priority-label" style="color: #10b981;">Baja</span>
            <div class="priority-track"><div class="priority-fill priority-low" style="width: ${priorityPercent(priorityStats.low, taskStats.total)}%"></div></div>
            <span class="priority-count">${priorityStats.low}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tendencia 7 días -->
    <div class="section">
      <h2 class="section-title">Tendencia (Últimos 7 días)</h2>
      <div class="chart-container">
        <div class="chart-title">Tareas completadas vs creadas por día</div>
        ${dailyChart}
        <div class="legend">
          <div class="legend-item"><div class="legend-dot" style="background: #10b981;"></div><span>Completadas</span></div>
          <div class="legend-item"><div class="legend-dot" style="background: #6366f1;"></div><span>Creadas</span></div>
        </div>
      </div>
    </div>

    <!-- Horas -->
    <div class="section">
      <h2 class="section-title">Actividad por Horas</h2>
      <div class="chart-container">
        <div class="chart-title">Hora del día en que se crean las tareas</div>
        ${hourlyChart}
        ${priorityStats.tasksCompletedThisMonth > 0 || taskStats.completed > 0
          ? `<p class="note" style="text-align: center;">Hora en la que más tareas se completan: ${priorityStats.mostProductiveHour}:00</p>`
          : ''}
      </div>
    </div>

    <!-- Semanal -->
    <div class="section">
      <h2 class="section-title">Tendencias Semanales (4 semanas)</h2>
      <div class="chart-container">
        <div class="chart-title">Completadas por semana</div>
        ${weeklyChart}
      </div>
    </div>

    <!-- Mensual -->
    <div class="section">
      <h2 class="section-title">Tendencias Mensuales</h2>
      <div class="chart-container">
        <div class="chart-title">Completadas por mes</div>
        ${monthlyChart}
      </div>
    </div>

    <!-- Detalle -->
    <div class="section" style="break-inside: auto; page-break-inside: auto;">
      <h2 class="section-title">Detalle de Tareas Completadas</h2>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Prioridad</th>
            <th>Categoría</th>
            <th>Fecha Límite</th>
            <th>Completada</th>
          </tr>
        </thead>
        <tbody>
          ${shownTasks.length === 0
            ? '<tr><td colspan="5" style="text-align: center; color: #6b7280;">Aún no hay tareas completadas</td></tr>'
            : shownTasks.map(task => `
          <tr>
            <td>${escapeHtml(task.title)}</td>
            <td>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; ${priorityStyles[task.priority ?? 'low'] ?? priorityStyles.low}">${priorityLabels[task.priority ?? 'low']}</span>
            </td>
            <td>${escapeHtml(task.category || '-')}</td>
            <td>${task.dueDate ? task.dueDate.toLocaleDateString('es-ES') : '-'}</td>
            <td>${task.updatedAt.toLocaleDateString('es-ES')}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ${completedTasks.length > shownTasks.length
        ? `<p class="note">Mostrando las ${shownTasks.length} más recientes de ${completedTasks.length} tareas completadas.</p>`
        : ''}
    </div>

    <div class="footer">
      <p>Generado por TaskFlow Analytics • ${escapeHtml(date)}</p>
      <p>Este reporte contiene datos de tu productividad personal</p>
    </div>
  </div>
</body>
</html>
    `;
  }
};