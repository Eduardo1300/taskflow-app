interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  colorId?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  created: string;
  updated: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  backgroundColor: string;
  foregroundColor: string;
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner';
  primary?: boolean;
  selected?: boolean;
}

interface SyncSettings {
  enabled: boolean;
  calendars: string[]; // IDs of calendars to sync
  syncDirection: 'import' | 'export' | 'bidirectional';
  syncFrequency: number; // minutes
  lastSync?: Date;
  conflictResolution: 'local' | 'remote' | 'manual';
}

interface SyncResult {
  success: boolean;
  imported: number;
  exported: number;
  conflicts: number;
  errors: string[];
}

class GoogleCalendarService {
  private isAuthenticated = false;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  private redirectUri = `${window.location.origin}/auth/google/callback`;

  // Authentication
  async authenticate(): Promise<boolean> {
    try {
      const response = await this.initiateOAuth();
      if (response) {
        this.isAuthenticated = true;
        this.storeTokens(response.access_token, response.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google Calendar authentication failed:', error);
      return false;
    }
  }

  private async initiateOAuth(): Promise<any> {
    const scope = 'https://www.googleapis.com/auth/calendar';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Open popup for authentication
    const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      // Listen for auth completion
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'google-auth-success') {
          clearInterval(checkClosed);
          popup?.close();
          
          try {
            const tokenResponse = await this.exchangeCodeForTokens(event.data.code);
            resolve(tokenResponse);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('google_access_token', accessToken);
    localStorage.setItem('google_refresh_token', refreshToken);
  }

  private loadStoredTokens() {
    this.accessToken = localStorage.getItem('google_access_token');
    this.refreshToken = localStorage.getItem('google_refresh_token');
    this.isAuthenticated = !!this.accessToken;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        if (this.accessToken) {
          localStorage.setItem('google_access_token', this.accessToken);
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }

    return false;
  }

  disconnect() {
    this.isAuthenticated = false;
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
  }

  // Calendar Operations
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<any> {
    if (!this.isAuthenticated || !this.accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });

    // Try to refresh token if unauthorized
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCalendarList(): Promise<GoogleCalendarListEntry[]> {
    try {
      const data = await this.makeAuthenticatedRequest('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      return data.items || [];
    } catch (error) {
      console.error('Failed to get calendar list:', error);
      return [];
    }
  }

  async getEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<GoogleCalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      if (timeMin) {
        params.set('timeMin', timeMin.toISOString());
      }
      if (timeMax) {
        params.set('timeMax', timeMax.toISOString());
      }

      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
      const data = await this.makeAuthenticatedRequest(url);
      return data.items || [];
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  async createEvent(calendarId: string = 'primary', event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent | null> {
    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
      const data = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(event),
      });
      return data;
    } catch (error) {
      console.error('Failed to create event:', error);
      return null;
    }
  }

  async updateEvent(calendarId: string = 'primary', eventId: string, event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent | null> {
    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;
      const data = await this.makeAuthenticatedRequest(url, {
        method: 'PUT',
        body: JSON.stringify(event),
      });
      return data;
    } catch (error) {
      console.error('Failed to update event:', error);
      return null;
    }
  }

  async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<boolean> {
    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;
      await this.makeAuthenticatedRequest(url, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  }

  // Sync Operations
  getSyncSettings(): SyncSettings {
    const settings = localStorage.getItem('google_calendar_sync_settings');
    return settings ? JSON.parse(settings) : {
      enabled: false,
      calendars: [],
      syncDirection: 'bidirectional',
      syncFrequency: 15,
      conflictResolution: 'manual'
    };
  }

  saveSyncSettings(settings: SyncSettings) {
    localStorage.setItem('google_calendar_sync_settings', JSON.stringify(settings));
  }

  async performSync(): Promise<SyncResult> {
    const settings = this.getSyncSettings();
    if (!settings.enabled) {
      return { success: false, imported: 0, exported: 0, conflicts: 0, errors: ['Sync is disabled'] };
    }

    const result: SyncResult = {
      success: true,
      imported: 0,
      exported: 0,
      conflicts: 0,
      errors: []
    };

    try {
      // Get time range for sync (last month to next year)
      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 1);
      const timeMax = new Date();
      timeMax.setFullYear(timeMax.getFullYear() + 1);

      for (const calendarId of settings.calendars) {
        try {
          if (settings.syncDirection === 'import' || settings.syncDirection === 'bidirectional') {
            const imported = await this.importFromGoogleCalendar(calendarId, timeMin, timeMax);
            result.imported += imported;
          }

          if (settings.syncDirection === 'export' || settings.syncDirection === 'bidirectional') {
            const exported = await this.exportToGoogleCalendar(calendarId, timeMin, timeMax);
            result.exported += exported;
          }
        } catch (error) {
          result.errors.push(`Failed to sync calendar ${calendarId}: ${error}`);
          result.success = false;
        }
      }

      // Update last sync time
      settings.lastSync = new Date();
      this.saveSyncSettings(settings);

    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    }

    return result;
  }

  private async importFromGoogleCalendar(calendarId: string, timeMin: Date, timeMax: Date): Promise<number> {
    const events = await this.getEvents(calendarId, timeMin, timeMax);
    let imported = 0;

    // Import to TaskService (you'll need to import TaskService)
    // This is a simplified version - you'd need proper mapping
    for (const event of events) {
      try {
        // Convert Google Calendar event to Task format
        const taskData = {
          title: event.summary,
          description: event.description || '',
          due_date: event.start.dateTime || event.start.date,
          priority: 'medium' as const,
          category: 'imported',
          completed: event.status === 'cancelled' ? true : false
        };

        // Check if event already exists to avoid duplicates
        const existingEvents = JSON.parse(localStorage.getItem('google_calendar_imported_events') || '[]');
        if (!existingEvents.includes(event.id)) {
          // Import logic here - you'd call TaskService.createTask(taskData)
          console.log('Would import task:', taskData.title);
          existingEvents.push(event.id);
          localStorage.setItem('google_calendar_imported_events', JSON.stringify(existingEvents));
          imported++;
        }
      } catch (error) {
        console.error('Failed to import event:', event.id, error);
      }
    }

    return imported;
  }

  private async exportToGoogleCalendar(_calendarId: string, _timeMin: Date, _timeMax: Date): Promise<number> {
    // Get local tasks that need to be exported
    // This would integrate with your TaskService
    let exported = 0;

    try {
      // Get tasks from TaskService in the time range
      // Convert tasks to Google Calendar events
      // Create/update events in Google Calendar
      // Track exported events to avoid duplicates
    } catch (error) {
      console.error('Export failed:', error);
    }

    return exported;
  }

  // Utility methods
  convertTaskToGoogleEvent(task: any): Partial<GoogleCalendarEvent> {
    return {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: task.due_date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      colorId: task.priority === 'high' ? '11' : task.priority === 'medium' ? '5' : '1',
      reminders: {
        useDefault: true
      }
    };
  }

  convertGoogleEventToTask(event: GoogleCalendarEvent): any {
    return {
      title: event.summary,
      description: event.description || '',
      due_date: event.start.dateTime || event.start.date,
      priority: this.mapColorToPriority(event.colorId),
      category: 'imported',
      completed: event.status === 'cancelled'
    };
  }

  private mapColorToPriority(colorId?: string): 'low' | 'medium' | 'high' {
    switch (colorId) {
      case '11': return 'high'; // red
      case '5': return 'medium'; // yellow
      default: return 'low';
    }
  }

  // Initialize service
  init() {
    this.loadStoredTokens();
    
    // Set up periodic sync if enabled
    const settings = this.getSyncSettings();
    if (settings.enabled && settings.syncFrequency > 0) {
      setInterval(() => {
        this.performSync().catch(console.error);
      }, settings.syncFrequency * 60 * 1000);
    }
  }

  isConnected(): boolean {
    return this.isAuthenticated;
  }

  getLastSyncTime(): Date | null {
    const settings = this.getSyncSettings();
    return settings.lastSync ? new Date(settings.lastSync) : null;
  }
}

export const googleCalendarService = new GoogleCalendarService();
export type { GoogleCalendarEvent, GoogleCalendarListEntry, SyncSettings, SyncResult };
