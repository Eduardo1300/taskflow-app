import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { Task } from '../types';
import { AnalyticsData } from './analyticsService';

export interface ExportOptions {
  includeCompleted?: boolean;
  includeDescription?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  priorities?: string[];
}

class ExportService {
  
  /**
   * Exportar tareas a PDF
   */
  async exportTasksToPDF(tasks: Task[], options: ExportOptions = {}): Promise<void> {
    const filteredTasks = this.filterTasks(tasks, options);
    
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Configuración del documento
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    
    // Header del documento
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TaskFlow - Reporte de Tareas', margin, 25);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, margin, 35);
    doc.text(`Total de tareas: ${filteredTasks.length}`, margin, 42);
    
    // Estadísticas rápidas
    const completedTasks = filteredTasks.filter(t => t.completed).length;
    const pendingTasks = filteredTasks.length - completedTasks;
    
    doc.text(`Completadas: ${completedTasks}`, margin, 49);
    doc.text(`Pendientes: ${pendingTasks}`, margin + 60, 49);
    
    // Preparar datos para la tabla
    const tableData = filteredTasks.map(task => {
      const row = [
        task.title,
        task.completed ? '✓' : '○',
        task.priority || 'Media',
        task.category || 'Sin categoría',
        task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '-',
        task.tags?.join(', ') || '-'
      ];
      
      if (options.includeDescription) {
        row.push(task.description || '-');
      }
      
      return row;
    });
    
    // Headers de la tabla
    const headers = [
      'Título',
      'Estado', 
      'Prioridad',
      'Categoría',
      'Vencimiento',
      'Etiquetas'
    ];
    
    if (options.includeDescription) {
      headers.push('Descripción');
    }
    
    // Crear tabla
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 60,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Azul
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Título
        1: { cellWidth: 15, halign: 'center' }, // Estado
        2: { cellWidth: 20 }, // Prioridad
        3: { cellWidth: 25 }, // Categoría
        4: { cellWidth: 25 }, // Vencimiento
        5: { cellWidth: 'auto' }, // Etiquetas
      },
      didParseCell: (data) => {
        // Colorear filas según prioridad
        if (data.section === 'body' && data.column.index === 2) {
          const priority = data.cell.raw as string;
          if (priority === 'Alta') {
            data.cell.styles.textColor = [239, 68, 68]; // Rojo
          } else if (priority === 'Media') {
            data.cell.styles.textColor = [245, 158, 11]; // Amarillo
          } else if (priority === 'Baja') {
            data.cell.styles.textColor = [34, 197, 94]; // Verde
          }
        }
      }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      'Generado por TaskFlow - Sistema de Gestión de Tareas',
      pageWidth / 2,
      doc.internal.pageSize.height - 15,
      { align: 'center' }
    );
    
    // Descargar el PDF
    const fileName = `taskflow-tareas-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
  
  /**
   * Exportar tareas a CSV
   */
  exportTasksToCSV(tasks: Task[], options: ExportOptions = {}): void {
    const filteredTasks = this.filterTasks(tasks, options);
    
    // Preparar datos para CSV
    const csvData = filteredTasks.map(task => ({
      'Título': task.title,
      'Descripción': options.includeDescription ? (task.description || '') : undefined,
      'Estado': task.completed ? 'Completada' : 'Pendiente',
      'Prioridad': task.priority || 'Media',
      'Categoría': task.category || 'Sin categoría',
      'Etiquetas': task.tags?.join('; ') || '',
      'Fecha de vencimiento': task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '',
      'Fecha de creación': new Date(task.created_at).toLocaleDateString('es-ES'),
      'Usuario': task.user_id
    }));
    
    // Remover campos undefined
    const cleanData = csvData.map(row => {
      const cleanRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanRow[key] = value;
        }
      });
      return cleanRow;
    });
    
    // Convertir a CSV
    const csv = Papa.unparse(cleanData, {
      delimiter: ',',
      header: true
    });
    
    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileName = `taskflow-tareas-${new Date().toISOString().split('T')[0]}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }
  
  /**
   * Exportar analytics a PDF
   */
  async exportAnalyticsToPDF(analyticsData: AnalyticsData, chartElement?: HTMLElement): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TaskFlow - Reporte de Analytics', margin, 25);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${analyticsData.lastUpdated.toLocaleDateString('es-ES')}`, margin, 35);
    
    let currentY = 50;
    
    // Estadísticas generales
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estadísticas Generales', margin, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const stats = [
      [`Total de tareas: ${analyticsData.taskStats.total}`],
      [`Tareas completadas: ${analyticsData.taskStats.completed}`],
      [`Tareas pendientes: ${analyticsData.taskStats.pending}`],
      [`Tareas vencidas: ${analyticsData.taskStats.overdue}`],
      [`Tasa de finalización: ${analyticsData.taskStats.completionRate}%`]
    ];
    
    autoTable(doc, {
      body: stats,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
      theme: 'plain'
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Productividad
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Métricas de Productividad', margin, currentY);
    currentY += 10;
    
    const productivityStats = [
      ['Tareas completadas hoy', analyticsData.productivityStats.tasksCompletedToday.toString()],
      ['Tareas completadas esta semana', analyticsData.productivityStats.tasksCompletedThisWeek.toString()],
      ['Tareas completadas este mes', analyticsData.productivityStats.tasksCompletedThisMonth.toString()],
      ['Tiempo promedio de finalización', `${analyticsData.productivityStats.averageCompletionTime.toFixed(1)} días`],
      ['Día más productivo', analyticsData.productivityStats.mostProductiveDay],
      ['Racha actual', `${analyticsData.productivityStats.currentStreak} días`]
    ];
    
    autoTable(doc, {
      head: [['Métrica', 'Valor']],
      body: productivityStats,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Distribución por categorías
    if (analyticsData.categoryStats.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribución por Categorías', margin, currentY);
      currentY += 10;
      
      const categoryData = analyticsData.categoryStats.map(cat => [
        cat.name,
        cat.total.toString(),
        cat.completed.toString(),
        `${cat.percentage}%`
      ]);
      
      autoTable(doc, {
        head: [['Categoría', 'Total', 'Completadas', 'Porcentaje']],
        body: categoryData,
        startY: currentY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Capturar gráfico si se proporciona
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Verificar si necesitamos una nueva página
        if (currentY + imgHeight > doc.internal.pageSize.height - 30) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      'Generado por TaskFlow - Sistema de Gestión de Tareas',
      pageWidth / 2,
      doc.internal.pageSize.height - 15,
      { align: 'center' }
    );
    
    // Descargar
    const fileName = `taskflow-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
  
  /**
   * Exportar datos raw de analytics como JSON
   */
  exportAnalyticsToJSON(analyticsData: AnalyticsData): void {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    const fileName = `taskflow-analytics-raw-${new Date().toISOString().split('T')[0]}.json`;
    
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }
  
  /**
   * Filtrar tareas según opciones
   */
  private filterTasks(tasks: Task[], options: ExportOptions): Task[] {
    let filtered = [...tasks];
    
    // Filtrar por estado completado
    if (options.includeCompleted === false) {
      filtered = filtered.filter(task => !task.completed);
    }
    
    // Filtrar por rango de fechas
    if (options.dateRange) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= options.dateRange!.start && taskDate <= options.dateRange!.end;
      });
    }
    
    // Filtrar por categorías
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(task => 
        options.categories!.includes(task.category || '')
      );
    }
    
    // Filtrar por prioridades
    if (options.priorities && options.priorities.length > 0) {
      filtered = filtered.filter(task => 
        options.priorities!.includes(task.priority || 'medium')
      );
    }
    
    return filtered;
  }
  
  /**
   * Generar reporte completo (PDF + CSV)
   */
  async generateCompleteReport(tasks: Task[], analyticsData: AnalyticsData, chartElement?: HTMLElement): Promise<void> {
    try {
      // Exportar tareas a PDF
      await this.exportTasksToPDF(tasks, { includeDescription: true });
      
      // Exportar tareas a CSV
      this.exportTasksToCSV(tasks, { includeDescription: true });
      
      // Exportar analytics a PDF
      await this.exportAnalyticsToPDF(analyticsData, chartElement);
      
      // Exportar analytics raw
      this.exportAnalyticsToJSON(analyticsData);
      
      console.log('✅ Reporte completo generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando reporte completo:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
