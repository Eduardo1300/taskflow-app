export interface EmailPreferences {
  id?: string;
  user_id: string;
  email: string;
  task_created: boolean;
  task_completed: boolean;
  task_overdue: boolean;
  task_reminder: boolean;
  created_at?: string;
  updated_at?: string;
}

export class EmailPreferencesService {
  static async getEmailPreferences(): Promise<EmailPreferences | null> {
    const stored = localStorage.getItem('emailPreferences');
    return stored ? JSON.parse(stored) : null;
  }

  static async updateEmailPreferences(prefs: Partial<EmailPreferences>): Promise<EmailPreferences | null> {
    const current = await this.getEmailPreferences();
    const updated = { ...current, ...prefs } as EmailPreferences;
    localStorage.setItem('emailPreferences', JSON.stringify(updated));
    return updated;
  }

  static async shouldSendEmailForEvent(event: string): Promise<{ should: boolean; email: string | null }> {
    const prefs = await this.getEmailPreferences();
    if (!prefs) {
      return { should: false, email: null };
    }
    return { should: prefs.task_created, email: prefs.email };
  }

  static async saveEmailPreferences(email: string, prefs: Partial<EmailPreferences>): Promise<{ success: boolean }> {
    await this.updateEmailPreferences({ ...prefs, email });
    return { success: true };
  }
}
