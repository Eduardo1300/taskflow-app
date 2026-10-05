import type { Task } from '@/types';
import { analyticsService, type AnalyticsData } from './analyticsService';
import { calendarAnalyticsService, type CalendarMetrics, type ProductivityInsights, type CalendarHealthScore, type BurnoutRisk } from './analyticsService';

export const exportService = {
  exportAnalyticsToPDF(analyticsData: AnalyticsData, tasks: Task[]) {
    if (!analyticsData.taskStats || analyticsData.taskStats.total === 0) {
      alert('No hay suficientes datos para exportar. Crea algunas tareas primero.');
      return;
    }

    const { taskStats, priorityStats, timeStats, completionTrends, advancedInsights } = analyticsData;

    // Generate HTML content for PDF
    const htmlContent = this.generatePDFHTML({
      taskStats,
      priorityStats,
      timeStats,
      completionTrends,
      advancedInsights
    }, tasks);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para exportar a PDF.');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 500);
    };
  },

  generatePDFHTML(data: {
    taskStats: any;
    priorityStats: any;
    timeStats: any;
    completionTrends: any[];
    advancedInsights: any[];
  }, tasks: Task[]) {
    const { taskStats, priorityStats, timeStats, completionTrends, advancedInsights } = data;
    const date = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow Analytics - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
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
    .header h1 { 
      color: #6366f1; 
      font-size: 28px; 
      margin-bottom: 8px;
    }
    .header p { color: #6b7280; font-size: 14px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
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
    .metric-card { 
      background: #f9fafb; 
      border: 1px solid #e5e7eb; 
      border-radius: 12px; 
      padding: 16px; 
      text-align: center;
    }
    .metric-value { 
      font-size: 24px; 
      font-weight: 700; 
      color: #1f2937; 
      margin-bottom: 4px;
    }
    .metric-label { 
      font-size: 12px; 
      color: #6b7280; 
      text-transform: uppercase; 
      letter-spacing: 0.5px;
    }
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
    .insight-item { 
      display: flex; 
      align-items: flex-start; 
      gap: 12px; 
      margin-bottom: 12px; 
    }
    .insight-item:last-child { margin-bottom: 0; }
    .insight-icon { 
      width: 24px; 
      height: 24px; 
      background: #dcfce7; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0;
      color: #16a34a;
    }
    .insight-text { font-size: 14px; color: #374151; }
    
    .chart-container { 
      background: #fafafa; 
      border: 1px solid #e5e7eb; 
      border-radius: 12px; 
      padding: 20px; 
      margin-bottom: 20px;
    }
    .chart-title { 
      font-size: 14px; 
      font-weight: 600; 
      color: #374151; 
      margin-bottom: 16px;
    }
    .bar-chart { 
      display: flex; 
      align-items: flex-end; 
      gap: 8px; 
      height: 200px; 
      padding-bottom: 40px;
    }
    .bar-item { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: flex-end;
      min-height: 100%;
    }
    .bar { 
      width: 100%; 
      background: linear-gradient(to top, #6366f1, #8b5cf6); 
      border-radius: 4px 4px 0 0; 
      transition: height 0.3s ease;
      min-height: 4px;
    }
    .bar-label { 
      font-size: 11px; 
      color: #6b7280; 
      margin-top: 8px; 
      text-align: center;
    }
    .bar-value { 
      font-size: 12px; 
      font-weight: 600; 
      color: #1f2937; 
      margin-top: 4px;
    }
    
    .priority-bars { display: flex; flex-direction: column; gap: 16px; }
    .priority-bar { display: flex; align-items: center; gap: 12px; }
    .priority-label { width: 80px; font-size: 13px; font-weight: 500; }
    .priority-track { flex: 1; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
    .priority-fill { height: 100%; border-radius: 6px; transition: width 0.3s; }
    .priority-high { background: linear-gradient(90deg, #ef4444, #f97316); }
    .priority-medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .priority-low { background: linear-gradient(90deg, #10b981, #34d399); }
    .priority-count { width: 40px; text-align: right; font-weight: 600; font-size: 13px; }
    
    .hourly-chart { 
      display: flex; 
      align-items: flex-end; 
      gap: 4px; 
      height: 150px; 
      padding-bottom: 24px;
    }
    .hour-bar { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: flex-end;
      min-height: 100%;
    }
    .hour-fill { 
      width: 100%; 
      background: #6366f1; 
      border-radius: 2px 2px 0 0; 
      min-height: 2px;
    }
    .hour-label { 
      font-size: 9px; 
      color: #9ca3af; 
      margin-top: 4px; 
      writing-mode: vertical-rl; 
      text-orientation: mixed;
    }
    
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
      .section { page-break-inside: avoid; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 TaskFlow Analytics</h1>
      <p>Reporte de productividad generado el ${date}</p>
    </div>

    <!-- Resumen Ejecutivo -->
    <div class="section">
      <h2 class="section-title">📈 Resumen Ejecutivo</h2>
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
      <div class="metrics-grid" style="grid-template-columns: repeat(2, 1fr);">
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
      <h2 class="section-title">💡 Insights Personalizados</h2>
      <div class="insights-list">
        ${advancedInsights.map(insight => `
        <div class="insight-item">
          <div class="insight-icon">
            ${insight.type === 'positive' ? '✓' : insight.type === 'warning' ? '⚠' : insight.type === 'achievement' ? '🏆' : 'ℹ'}
          </div>
          <div>
            <strong style="color: #1f2937;">${insight.title}</strong>
            <p class="insight-text" style="margin-top: 4px;">${insight.description}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>

    <!-- Distribución por Prioridad -->
    <div class="section">
      <h2 class="section-title">🎯 Distribución por Prioridad</h2>
      <div class="chart-container">
        <div class="chart-title">Tareas por nivel de prioridad</div>
        <div class="priority-bars">
          <div class="priority-bar">
            <span class="priority-label" style="color: #ef4444;">Alta</span>
            <div class="priority-track">
              <div class="priority-fill priority-high" style="width: ${taskStats.total > 0 ? (priorityStats.high / taskStats.total * 100) : 0}%"></div>
            </div>
            <span class="priority-count">${priorityStats.high}</span>
          </div>
          <div class="priority-bar">
            <span class="priority-label" style="color: #f59e0b;">Media</span>
            <div class="priority-track">
              <div class="priority-fill priority-medium" style="width: ${taskStats.total > 0 ? (priorityStats.medium / taskStats.total * 100) : 0}%"></div>
            </div>
            <span class="priority-count">${priorityStats.medium}</span>
          </div>
          <div class="priority-bar">
            <span class="priority-label" style="color: #10b981;">Baja</span>
            <div class="priority-track">
              <div class="priority-fill priority-low" style="width: ${taskStats.total > 0 ? (priorityStats.low / taskStats.total * 100) : 0}%"></div>
            </div>
            <span class="priority-count">${priorityStats.low}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tendencia de Completación (7 días) -->
    <div class="section">
      <h2 class="section-title">📅 Tendencia de Completación (Últimos 7 días)</h2>
      <div class="chart-container">
        <div class="chart-title">Tareas completadas vs creadas por día</div>
        <div class="bar-chart">
          ${completionTrends.map(trend => {
            const maxVal = Math.max(...completionTrends.map(t => Math.max(t.completed, t.created)), 1);
            const completedHeight = (trend.completed / maxVal) * 100;
            const createdHeight = (trend.created / maxVal) * 100;
            return `
            <div class="bar-item">
              <div class="bar" style="height: ${completedHeight}%; background: linear-gradient(to top, #10b981, #34d399);"></div>
              <div class="bar" style="height: ${createdHeight}%; background: linear-gradient(to top, #6366f1, #8b5cf6); margin-top: -${completedHeight}%;"></div>
              <div class="bar-value">${trend.completed}</div>
              <div class="bar-label">${new Date(trend.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</div>
            </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; justify-content: center; gap: 16px; margin-top: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <div style="width: 12px; height: 12px; background: linear-gradient(135deg, #10b981, #34d399); border-radius: 2px;"></div>
            <span>Completadas</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <div style="width: 12px; height: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 2px;"></div>
            <span>Creadas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Distribución por Horas -->
    <div class="section">
      <h2 class="section-title">⏰ Actividad por Horas</h2>
      <div class="chart-container">
        <div class="chart-title">Horas más productivas</div>
        <div class="hourly-chart">
          ${Array.from({ length: 24 }, (_, i) => {
            const count = timeStats.hourlyDistribution[i] || 0;
            const maxVal = Math.max(...Object.values(timeStats.hourlyDistribution), 1);
            const height = (count / maxVal) * 100;
            return `
            <div class="hour-bar">
              <div class="hour-fill" style="height: ${height}%"></div>
              <div class="hour-label">${i}:00</div>
            </div>
            `;
          }).join('')}
        </div>
        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 8px;">
          Hora más productiva: ${priorityStats.mostProductiveHour}:00
        </p>
      </div>
    </div>

    <!-- Tendencias Semanales -->
    <div class="section">
      <h2 class="section-title">📊 Tendencias Semanales (4 semanas)</h2>
      <div class="chart-container">
        <div class="chart-title">Completadas por semana</div>
        <div class="bar-chart">
          ${timeStats.weeklyTrends.map((week, index) => {
            const maxVal = Math.max(...timeStats.weeklyTrends.map(w => w.completed), 1);
            const height = (week.completed / maxVal) * 100;
            return `
            <div class="bar-item">
              <div class="bar" style="height: ${height}%; background: linear-gradient(to top, #8b5cf6, #a855f7);"></div>
              <div class="bar-value">${week.completed}</div>
              <div class="bar-label">${week.week}</div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Tendencias Mensuales -->
    <div class="section">
      <h2 class="section-title">📆 Tendencias Mensuales</h2>
      <div class="chart-container">
        <div class="chart-title">Completadas por mes</div>
        <div class="bar-chart">
          ${timeStats.monthlyTrends.map((month, index) => {
            const maxVal = Math.max(...timeStats.monthlyTrends.map(m => m.completed), 1);
            const height = (month.completed / maxVal) * 100;
            return `
            <div class="bar-item">
              <div class="bar" style="height: ${height}%; background: linear-gradient(to top, #f59e0b, #fbbf24);"></div>
              <div class="bar-value">${month.completed}</div>
              <div class="bar-label">${month.month}</div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Detalle de tareas completadas -->
    <div class="section">
      <h2 class="section-title">✅ Detalle de Tareas Completadas</h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 12px 8px; text-align: left;">Título</th>
              <th style="padding: 12px 8px; text-align: left;">Prioridad</th>
              <th style="padding: 12px 8px; text-align: left;">Categoría</th>
              <th style="padding: 12px 8px; text-align: left;">Fecha Límite</th>
              <th style="padding: 12px 8px; text-align: left;">Completada</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.filter(t => t.completed).slice(0, 50).map(task => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px;">${task.title}</td>
              <td style="padding: 8px;">
                <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; 
                  ${task.priority === 'high' ? 'background: #fef2f2; color: #ef4444;' : 
                    task.priority === 'medium' ? 'background: #fffbeb; color: #f59e0b;' : 
                    'background: #f0fdf4; color: #10b981;'}"
                >${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</span>
              </td>
              <td style="padding: 8px;">${task.category || '-'}</td>
              <td style="padding: 8px;">${task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '-'}</td>
              <td style="padding: 8px;">${task.updated_at ? new Date(task.updated_at).toLocaleDateString('es-ES') : '-'}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <p>Generado por TaskFlow Analytics • ${date}</p>
      <p>Este reporte contiene datos de tu productividad personal</p>
    </div>
  </div>
</body>
</html>
    `;
  }
};