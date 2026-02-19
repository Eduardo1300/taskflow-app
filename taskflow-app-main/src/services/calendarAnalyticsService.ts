interface CalendarMetrics {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  overdueEvents: number;
  completionRate: number;
  averageEventsPerDay: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  collaborativeEvents: number;
  recurringEvents: number;
}

interface TimeAnalysis {
  hourlyDistribution: Record<number, number>;
  dailyDistribution: Record<string, number>;
  weeklyTrends: Record<string, number>;
  monthlyTrends: Record<string, number>;
  seasonalPatterns: Record<string, number>;
}

interface ProductivityInsights {
  peakProductivityHours: number[];
  optimalMeetingTimes: number[];
  busyDays: string[];
  freeDays: string[];
  workLifeBalance: {
    workEvents: number;
    personalEvents: number;
    ratio: number;
  };
  focusTimeBlocks: Array<{
    day: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
}

interface CalendarHealthScore {
  score: number; // 0-100
  factors: {
    eventDistribution: number;
    completionRate: number;
    timeManagement: number;
    collaboration: number;
    planning: number;
  };
  recommendations: string[];
}

interface BurnoutRisk {
  level: 'low' | 'medium' | 'high';
  score: number; // 0-100
  indicators: {
    overBooking: number;
    longDays: number;
    noBreaks: number;
    weekendWork: number;
    lateNightEvents: number;
  };
  suggestions: string[];
}

interface CalendarForecast {
  nextWeekLoad: number;
  nextMonthLoad: number;
  predictedBusyDays: Date[];
  recommendedBreaks: Date[];
  conflictRisks: Array<{
    date: Date;
    conflictCount: number;
    events: string[];
  }>;
}

class CalendarAnalyticsService {
  private events: any[] = [];
  private readonly timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Initialize with events data
  setEventsData(events: any[]): void {
    console.log(`Setting events data with timezone: ${this.timeZone}`);
    this.events = events.map(event => ({
      ...event,
      start_date: new Date(event.due_date || event.start_date),
      end_date: event.end_date ? new Date(event.end_date) : new Date(new Date(event.due_date || event.start_date).getTime() + 60 * 60 * 1000),
      completed: event.completed || false,
      priority: event.priority || 'medium',
      category: event.category || 'general'
    }));
  }

  // Basic Metrics
  async getCalendarMetrics(dateRange?: { start: Date; end: Date }): Promise<CalendarMetrics> {
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    const totalEvents = filteredEvents.length;
    const completedEvents = filteredEvents.filter(e => e.completed).length;
    const now = new Date();
    const upcomingEvents = filteredEvents.filter(e => e.start_date > now && !e.completed).length;
    const overdueEvents = filteredEvents.filter(e => e.start_date < now && !e.completed).length;
    
    const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
    
    // Calculate average events per day
    const daysInRange = dateRange ? 
      Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) :
      30;
    const averageEventsPerDay = totalEvents / daysInRange;

    // Most productive day and hour
    const timeAnalysis = await this.getTimeAnalysis(dateRange);
    const mostProductiveDay = Object.entries(timeAnalysis.dailyDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Monday';
    
    const mostProductiveHour = Object.entries(timeAnalysis.hourlyDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 9;

    // Distribution analysis
    const categoryDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    
    filteredEvents.forEach(event => {
      categoryDistribution[event.category] = (categoryDistribution[event.category] || 0) + 1;
      priorityDistribution[event.priority] = (priorityDistribution[event.priority] || 0) + 1;
    });

    // Count collaborative and recurring events
    const collaborativeEvents = filteredEvents.filter(e => e.collaborators?.length > 1 || e.attendees > 1).length;
    const recurringEvents = filteredEvents.filter(e => e.recurring_pattern_id || e.recurrence).length;

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      overdueEvents,
      completionRate: Math.round(completionRate),
      averageEventsPerDay: Math.round(averageEventsPerDay * 10) / 10,
      mostProductiveDay,
      mostProductiveHour: parseInt(mostProductiveHour.toString()),
      categoryDistribution,
      priorityDistribution,
      collaborativeEvents,
      recurringEvents
    };
  }

  // Time Analysis
  async getTimeAnalysis(dateRange?: { start: Date; end: Date }): Promise<TimeAnalysis> {
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    const hourlyDistribution: Record<number, number> = {};
    const dailyDistribution: Record<string, number> = {};
    const weeklyTrends: Record<string, number> = {};
    const monthlyTrends: Record<string, number> = {};
    const seasonalPatterns: Record<string, number> = {};

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

    filteredEvents.forEach(event => {
      const date = new Date(event.start_date);
      
      // Hourly distribution
      const hour = date.getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      
      // Daily distribution
      const dayName = dayNames[date.getDay()];
      dailyDistribution[dayName] = (dailyDistribution[dayName] || 0) + 1;
      
      // Weekly trends (by week number)
      const weekNumber = this.getWeekNumber(date);
      weeklyTrends[`Week ${weekNumber}`] = (weeklyTrends[`Week ${weekNumber}`] || 0) + 1;
      
      // Monthly trends
      const monthName = monthNames[date.getMonth()];
      monthlyTrends[monthName] = (monthlyTrends[monthName] || 0) + 1;
      
      // Seasonal patterns
      const season = this.getSeason(date);
      seasonalPatterns[season] = (seasonalPatterns[season] || 0) + 1;
    });

    return {
      hourlyDistribution,
      dailyDistribution,
      weeklyTrends,
      monthlyTrends,
      seasonalPatterns
    };
  }

  // Productivity Insights
  async getProductivityInsights(dateRange?: { start: Date; end: Date }): Promise<ProductivityInsights> {
    const timeAnalysis = await this.getTimeAnalysis(dateRange);
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    // Peak productivity hours (top 3 hours with most completed events)
    const completedEvents = filteredEvents.filter(e => e.completed);
    const hourlyCompleted: Record<number, number> = {};
    
    completedEvents.forEach(event => {
      const hour = new Date(event.start_date).getHours();
      hourlyCompleted[hour] = (hourlyCompleted[hour] || 0) + 1;
    });
    
    const peakProductivityHours = Object.entries(hourlyCompleted)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Optimal meeting times (9-11 AM and 2-4 PM typically)
    const meetingHours = [9, 10, 11, 14, 15, 16];
    const optimalMeetingTimes = meetingHours.filter(hour => 
      (hourlyCompleted[hour] || 0) > (hourlyCompleted[hour - 1] || 0) + (hourlyCompleted[hour + 1] || 0)
    );

    // Busy and free days
    const dailyEventCounts = Object.entries(timeAnalysis.dailyDistribution);
    const averageDailyEvents = Object.values(timeAnalysis.dailyDistribution).reduce((a, b) => a + b, 0) / 7;
    
    const busyDays = dailyEventCounts
      .filter(([, count]) => count > averageDailyEvents * 1.2)
      .map(([day]) => day);
    
    const freeDays = dailyEventCounts
      .filter(([, count]) => count < averageDailyEvents * 0.5)
      .map(([day]) => day);

    // Work-life balance
    const workEvents = filteredEvents.filter(e => 
      ['work', 'meeting', 'business', 'office'].includes(e.category?.toLowerCase())
    ).length;
    
    const personalEvents = filteredEvents.filter(e => 
      ['personal', 'family', 'health', 'hobby', 'social'].includes(e.category?.toLowerCase())
    ).length;
    
    const workLifeBalance = {
      workEvents,
      personalEvents,
      ratio: personalEvents > 0 ? Math.round((workEvents / personalEvents) * 100) / 100 : workEvents
    };

    // Focus time blocks (periods with no events)
    const focusTimeBlocks = this.findFocusTimeBlocks(filteredEvents);

    return {
      peakProductivityHours,
      optimalMeetingTimes: optimalMeetingTimes.length > 0 ? optimalMeetingTimes : [9, 10, 14, 15],
      busyDays,
      freeDays,
      workLifeBalance,
      focusTimeBlocks
    };
  }

  // Calendar Health Score
  async getCalendarHealthScore(dateRange?: { start: Date; end: Date }): Promise<CalendarHealthScore> {
    const metrics = await this.getCalendarMetrics(dateRange);
    const insights = await this.getProductivityInsights(dateRange);
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    // Calculate individual factors (0-100)
    const eventDistribution = this.calculateEventDistributionScore(insights);
    const completionRate = metrics.completionRate;
    const timeManagement = this.calculateTimeManagementScore(filteredEvents);
    const collaboration = this.calculateCollaborationScore(metrics);
    const planning = this.calculatePlanningScore(filteredEvents);
    
    // Overall score (weighted average)
    const weights = {
      eventDistribution: 0.2,
      completionRate: 0.3,
      timeManagement: 0.25,
      collaboration: 0.15,
      planning: 0.1
    };
    
    const score = Math.round(
      eventDistribution * weights.eventDistribution +
      completionRate * weights.completionRate +
      timeManagement * weights.timeManagement +
      collaboration * weights.collaboration +
      planning * weights.planning
    );

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (eventDistribution < 70) {
      recommendations.push("Distribute events more evenly throughout the week");
    }
    if (completionRate < 80) {
      recommendations.push("Focus on completing scheduled events and tasks");
    }
    if (timeManagement < 70) {
      recommendations.push("Consider shorter meetings and buffer time between events");
    }
    if (collaboration < 60) {
      recommendations.push("Increase collaboration with team members and stakeholders");
    }
    if (planning < 70) {
      recommendations.push("Plan events further in advance and use recurring patterns");
    }

    return {
      score,
      factors: {
        eventDistribution: Math.round(eventDistribution),
        completionRate: Math.round(completionRate),
        timeManagement: Math.round(timeManagement),
        collaboration: Math.round(collaboration),
        planning: Math.round(planning)
      },
      recommendations
    };
  }

  // Burnout Risk Assessment
  async getBurnoutRisk(dateRange?: { start: Date; end: Date }): Promise<BurnoutRisk> {
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    // Calculate burnout indicators
    const overBooking = this.calculateOverBookingScore(filteredEvents);
    const longDays = this.calculateLongDaysScore(filteredEvents);
    const noBreaks = this.calculateNoBreaksScore(filteredEvents);
    const weekendWork = this.calculateWeekendWorkScore(filteredEvents);
    const lateNightEvents = this.calculateLateNightEventsScore(filteredEvents);
    
    // Calculate overall risk score
    const riskScore = Math.round(
      (overBooking + longDays + noBreaks + weekendWork + lateNightEvents) / 5
    );
    
    let level: 'low' | 'medium' | 'high';
    if (riskScore < 30) level = 'low';
    else if (riskScore < 70) level = 'medium';
    else level = 'high';
    
    // Generate suggestions
    const suggestions: string[] = [];
    
    if (overBooking > 70) {
      suggestions.push("Reduce the number of events per day and add buffer time");
    }
    if (longDays > 70) {
      suggestions.push("Limit daily work hours and avoid back-to-back meetings");
    }
    if (noBreaks > 70) {
      suggestions.push("Schedule regular breaks between events");
    }
    if (weekendWork > 50) {
      suggestions.push("Minimize work-related events on weekends");
    }
    if (lateNightEvents > 50) {
      suggestions.push("Avoid scheduling events after 8 PM");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("Your calendar looks well-balanced! Keep up the good work.");
    }

    return {
      level,
      score: riskScore,
      indicators: {
        overBooking: Math.round(overBooking),
        longDays: Math.round(longDays),
        noBreaks: Math.round(noBreaks),
        weekendWork: Math.round(weekendWork),
        lateNightEvents: Math.round(lateNightEvents)
      },
      suggestions
    };
  }

  // Calendar Forecast
  async getCalendarForecast(): Promise<CalendarForecast> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const nextWeekEvents = this.events.filter(e => 
      new Date(e.start_date) >= now && new Date(e.start_date) <= nextWeek
    );
    
    const nextMonthEvents = this.events.filter(e => 
      new Date(e.start_date) >= now && new Date(e.start_date) <= nextMonth
    );
    
    // Calculate load scores (0-100)
    const nextWeekLoad = Math.min(100, (nextWeekEvents.length / 7) * 10);
    const nextMonthLoad = Math.min(100, (nextMonthEvents.length / 30) * 5);
    
    // Predict busy days (days with more than average events)
    const dailyEventCounts = new Map<string, number>();
    nextMonthEvents.forEach(event => {
      const dateKey = new Date(event.start_date).toDateString();
      dailyEventCounts.set(dateKey, (dailyEventCounts.get(dateKey) || 0) + 1);
    });
    
    const averageDailyEvents = Array.from(dailyEventCounts.values())
      .reduce((a, b) => a + b, 0) / dailyEventCounts.size;
    
    const predictedBusyDays = Array.from(dailyEventCounts.entries())
      .filter(([, count]) => count > averageDailyEvents * 1.5)
      .map(([dateString]) => new Date(dateString));
    
    // Recommend breaks (days with no events)
    const allDates = this.generateDateRange(now, nextMonth);
    const recommendedBreaks = allDates.filter(date => 
      !dailyEventCounts.has(date.toDateString())
    ).slice(0, 5); // Top 5 free days
    
    // Identify conflict risks
    const conflictRisks = this.identifyConflictRisks(nextMonthEvents);

    return {
      nextWeekLoad: Math.round(nextWeekLoad),
      nextMonthLoad: Math.round(nextMonthLoad),
      predictedBusyDays,
      recommendedBreaks,
      conflictRisks
    };
  }

  // Helper methods
  private filterEventsByDateRange(dateRange?: { start: Date; end: Date }): any[] {
    if (!dateRange) {
      return this.events;
    }
    
    return this.events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= dateRange.start && eventDate <= dateRange.end;
    });
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getSeason(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  private findFocusTimeBlocks(events: any[]): Array<{
    day: string;
    startTime: string;
    endTime: string;
    duration: number;
  }> {
    // Simplified implementation - find 2+ hour gaps between events
    const blocks: Array<{
      day: string;
      startTime: string;
      endTime: string;
      duration: number;
    }> = [];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Group events by day
    const eventsByDay = new Map<string, any[]>();
    events.forEach(event => {
      const day = new Date(event.start_date).getDay();
      const dayName = dayNames[day];
      if (!eventsByDay.has(dayName)) {
        eventsByDay.set(dayName, []);
      }
      eventsByDay.get(dayName)!.push(event);
    });
    
    // Find gaps for each day
    eventsByDay.forEach((dayEvents, dayName) => {
      const sortedEvents = dayEvents.sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      
      for (let i = 0; i < sortedEvents.length - 1; i++) {
        const endTime = new Date(sortedEvents[i].end_date || sortedEvents[i].start_date);
        const nextStartTime = new Date(sortedEvents[i + 1].start_date);
        const gapDuration = (nextStartTime.getTime() - endTime.getTime()) / (1000 * 60 * 60); // hours
        
        if (gapDuration >= 2) {
          blocks.push({
            day: dayName,
            startTime: endTime.toTimeString().slice(0, 5),
            endTime: nextStartTime.toTimeString().slice(0, 5),
            duration: Math.round(gapDuration * 10) / 10
          });
        }
      }
    });
    
    return blocks.slice(0, 10); // Return top 10 focus blocks
  }

  private calculateEventDistributionScore(insights: ProductivityInsights): number {
    // Score based on how evenly events are distributed
    const busyDaysPenalty = insights.busyDays.length * 10;
    const freeDaysBonus = insights.freeDays.length * 5;
    return Math.max(0, Math.min(100, 80 - busyDaysPenalty + freeDaysBonus));
  }

  private calculateTimeManagementScore(events: any[]): number {
    // Score based on event duration and spacing
    const shortEvents = events.filter(e => {
      const duration = (new Date(e.end_date).getTime() - new Date(e.start_date).getTime()) / (1000 * 60);
      return duration <= 60; // 1 hour or less
    }).length;
    
    const longEvents = events.filter(e => {
      const duration = (new Date(e.end_date).getTime() - new Date(e.start_date).getTime()) / (1000 * 60);
      return duration > 180; // more than 3 hours
    }).length;
    
    const shortEventBonus = (shortEvents / events.length) * 40;
    const longEventPenalty = (longEvents / events.length) * 30;
    
    return Math.max(0, Math.min(100, 60 + shortEventBonus - longEventPenalty));
  }

  private calculateCollaborationScore(metrics: CalendarMetrics): number {
    const collaborationRate = metrics.totalEvents > 0 ? 
      (metrics.collaborativeEvents / metrics.totalEvents) * 100 : 0;
    return Math.min(100, collaborationRate * 2); // Max score at 50% collaborative events
  }

  private calculatePlanningScore(events: any[]): number {
    const now = new Date();
    const advancePlannedEvents = events.filter(e => {
      const eventDate = new Date(e.start_date);
      const createdDate = new Date(e.created_at || now);
      const advanceDays = (eventDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return advanceDays >= 1; // Planned at least 1 day in advance
    }).length;
    
    return events.length > 0 ? (advancePlannedEvents / events.length) * 100 : 100;
  }

  private calculateOverBookingScore(events: any[]): number {
    // Calculate days with more than 8 events
    const dailyEventCounts = new Map<string, number>();
    events.forEach(event => {
      const dateKey = new Date(event.start_date).toDateString();
      dailyEventCounts.set(dateKey, (dailyEventCounts.get(dateKey) || 0) + 1);
    });
    
    const overBookedDays = Array.from(dailyEventCounts.values())
      .filter(count => count > 8).length;
    
    const totalDays = dailyEventCounts.size;
    return totalDays > 0 ? (overBookedDays / totalDays) * 100 : 0;
  }

  private calculateLongDaysScore(events: any[]): number {
    // Calculate days with events spanning more than 10 hours
    const dailySpans = new Map<string, { earliest: Date; latest: Date }>();
    
    events.forEach(event => {
      const dateKey = new Date(event.start_date).toDateString();
      const startTime = new Date(event.start_date);
      const endTime = new Date(event.end_date || event.start_date);
      
      if (!dailySpans.has(dateKey)) {
        dailySpans.set(dateKey, { earliest: startTime, latest: endTime });
      } else {
        const span = dailySpans.get(dateKey)!;
        if (startTime < span.earliest) span.earliest = startTime;
        if (endTime > span.latest) span.latest = endTime;
      }
    });
    
    const longDays = Array.from(dailySpans.values()).filter(span => {
      const duration = (span.latest.getTime() - span.earliest.getTime()) / (1000 * 60 * 60);
      return duration > 10;
    }).length;
    
    return dailySpans.size > 0 ? (longDays / dailySpans.size) * 100 : 0;
  }

  private calculateNoBreaksScore(events: any[]): number {
    // Calculate percentage of back-to-back events
    let backToBackCount = 0;
    let totalGaps = 0;
    
    const sortedEvents = events.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const endTime = new Date(sortedEvents[i].end_date || sortedEvents[i].start_date);
      const nextStartTime = new Date(sortedEvents[i + 1].start_date);
      const gap = (nextStartTime.getTime() - endTime.getTime()) / (1000 * 60); // minutes
      
      totalGaps++;
      if (gap < 15) { // Less than 15 minutes between events
        backToBackCount++;
      }
    }
    
    return totalGaps > 0 ? (backToBackCount / totalGaps) * 100 : 0;
  }

  private calculateWeekendWorkScore(events: any[]): number {
    const weekendEvents = events.filter(event => {
      const day = new Date(event.start_date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;
    
    return events.length > 0 ? (weekendEvents / events.length) * 100 : 0;
  }

  private calculateLateNightEventsScore(events: any[]): number {
    const lateNightEvents = events.filter(event => {
      const hour = new Date(event.start_date).getHours();
      return hour >= 20 || hour <= 6; // After 8 PM or before 6 AM
    }).length;
    
    return events.length > 0 ? (lateNightEvents / events.length) * 100 : 0;
  }

  private generateDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  private identifyConflictRisks(events: any[]): Array<{
    date: Date;
    conflictCount: number;
    events: string[];
  }> {
    const conflicts: Array<{
      date: Date;
      conflictCount: number;
      events: string[];
    }> = [];
    
    // Group events by day
    const eventsByDay = new Map<string, any[]>();
    events.forEach(event => {
      const dateKey = new Date(event.start_date).toDateString();
      if (!eventsByDay.has(dateKey)) {
        eventsByDay.set(dateKey, []);
      }
      eventsByDay.get(dateKey)!.push(event);
    });
    
    // Check for overlapping events on each day
    eventsByDay.forEach((dayEvents, dateString) => {
      let conflictCount = 0;
      const conflictedEvents: string[] = [];
      
      for (let i = 0; i < dayEvents.length; i++) {
        for (let j = i + 1; j < dayEvents.length; j++) {
          const event1 = dayEvents[i];
          const event2 = dayEvents[j];
          
          const start1 = new Date(event1.start_date);
          const end1 = new Date(event1.end_date || event1.start_date);
          const start2 = new Date(event2.start_date);
          const end2 = new Date(event2.end_date || event2.start_date);
          
          // Check for overlap
          if (start1 < end2 && start2 < end1) {
            conflictCount++;
            if (!conflictedEvents.includes(event1.title)) {
              conflictedEvents.push(event1.title);
            }
            if (!conflictedEvents.includes(event2.title)) {
              conflictedEvents.push(event2.title);
            }
          }
        }
      }
      
      if (conflictCount > 0) {
        conflicts.push({
          date: new Date(dateString),
          conflictCount,
          events: conflictedEvents
        });
      }
    });
    
    return conflicts.sort((a, b) => b.conflictCount - a.conflictCount).slice(0, 5);
  }
}

export const calendarAnalyticsService = new CalendarAnalyticsService();
export type {
  CalendarMetrics,
  TimeAnalysis,
  ProductivityInsights,
  CalendarHealthScore,
  BurnoutRisk,
  CalendarForecast
};
