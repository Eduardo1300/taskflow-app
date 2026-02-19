// Note: Supabase will be used for real-time subscriptions in production
console.log('Event Collaboration Service initialized with Supabase support');

export interface EventCollaborator {
  id: string;
  event_id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  user_avatar?: string;
  role: 'organizer' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  invited_at: Date;
  responded_at?: Date;
  permissions: {
    can_edit: boolean;
    can_invite: boolean;
    can_delete: boolean;
  };
}

export interface CollaborativeEvent {
  id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  location?: string;
  is_public: boolean;
  organizer_id: string;
  organizer_name?: string;
  organizer_email?: string;
  collaborators: EventCollaborator[];
  max_attendees?: number;
  requires_approval: boolean;
  allow_guest_list_visibility: boolean;
  created_at: Date;
  updated_at: Date;
  recurring_pattern_id?: string;
}

export interface EventInvitation {
  id: string;
  event_id: string;
  event_title: string;
  event_start_date: Date;
  inviter_id: string;
  inviter_name: string;
  inviter_email: string;
  invitee_email: string;
  role: 'editor' | 'viewer';
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  sent_at: Date;
  expires_at?: Date;
}

export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: Date;
  updated_at?: Date;
  parent_comment_id?: string;
  replies?: EventComment[];
}

export interface EventActivity {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  action: 'created' | 'updated' | 'invited' | 'joined' | 'left' | 'commented' | 'rsvp_changed';
  details?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

class EventCollaborationService {
  // Mock data for demonstration - in production this would use Supabase
  private mockEvents: CollaborativeEvent[] = [];
  private mockInvitations: EventInvitation[] = [];
  private mockComments: EventComment[] = [];
  private mockActivities: EventActivity[] = [];

  // Event Management
  async createCollaborativeEvent(eventData: Omit<CollaborativeEvent, 'id' | 'created_at' | 'updated_at' | 'collaborators'>): Promise<CollaborativeEvent | null> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      const event: CollaborativeEvent = {
        ...eventData,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date(),
        collaborators: [{
          id: Date.now().toString(),
          event_id: '',
          user_id: currentUser.id,
          user_email: currentUser.email,
          user_name: currentUser.name,
          role: 'organizer',
          status: 'accepted',
          invited_at: new Date(),
          permissions: {
            can_edit: true,
            can_invite: true,
            can_delete: true
          }
        }]
      };

      event.collaborators[0].event_id = event.id;
      this.mockEvents.push(event);

      // Log activity
      await this.logActivity(event.id, currentUser.id, 'created', 'Event created');

      return event;
    } catch (error) {
      console.error('Error creating collaborative event:', error);
      return null;
    }
  }

  async getCollaborativeEvent(eventId: string): Promise<CollaborativeEvent | null> {
    return this.mockEvents.find(e => e.id === eventId) || null;
  }

  async getUserCollaborativeEvents(): Promise<CollaborativeEvent[]> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    return this.mockEvents.filter(event => 
      event.collaborators.some(c => 
        c.user_id === currentUser.id && c.status === 'accepted'
      )
    );
  }

  async updateCollaborativeEvent(eventId: string, updates: Partial<CollaborativeEvent>): Promise<CollaborativeEvent | null> {
    const eventIndex = this.mockEvents.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    // Check permissions
    const canEdit = await this.canUserEditEvent(eventId);
    if (!canEdit) return null;

    this.mockEvents[eventIndex] = {
      ...this.mockEvents[eventIndex],
      ...updates,
      updated_at: new Date()
    };

    // Log activity
    await this.logActivity(eventId, currentUser.id, 'updated', 'Event updated');

    return this.mockEvents[eventIndex];
  }

  // Collaboration Management
  async addCollaborator(eventId: string, collaboratorData: Omit<EventCollaborator, 'id' | 'event_id' | 'invited_at' | 'responded_at'>): Promise<EventCollaborator | null> {
    try {
      const event = await this.getCollaborativeEvent(eventId);
      if (!event) return null;

      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const canInvite = await this.canUserInviteToEvent(eventId);
      if (!canInvite) return null;

      const collaborator: EventCollaborator = {
        ...collaboratorData,
        id: Date.now().toString(),
        event_id: eventId,
        invited_at: new Date()
      };

      event.collaborators.push(collaborator);

      // Log activity
      await this.logActivity(eventId, currentUser.id, 'invited', `Invited ${collaboratorData.user_email}`);

      return collaborator;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      return null;
    }
  }

  async updateCollaboratorRole(eventId: string, collaboratorId: string, role: EventCollaborator['role'], permissions: EventCollaborator['permissions']): Promise<boolean> {
    try {
      const event = await this.getCollaborativeEvent(eventId);
      if (!event) return false;

      const collaboratorIndex = event.collaborators.findIndex(c => c.id === collaboratorId);
      if (collaboratorIndex === -1) return false;

      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;

      const canEdit = await this.canUserEditEvent(eventId);
      if (!canEdit) return false;

      event.collaborators[collaboratorIndex].role = role;
      event.collaborators[collaboratorIndex].permissions = permissions;

      // Log activity
      await this.logActivity(eventId, currentUser.id, 'updated', `Changed role to ${role}`);

      return true;
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      return false;
    }
  }

  async removeCollaborator(eventId: string, collaboratorId: string): Promise<boolean> {
    try {
      const event = await this.getCollaborativeEvent(eventId);
      if (!event) return false;

      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;

      const canEdit = await this.canUserEditEvent(eventId);
      if (!canEdit) return false;

      const collaboratorIndex = event.collaborators.findIndex(c => c.id === collaboratorId);
      if (collaboratorIndex === -1) return false;

      event.collaborators.splice(collaboratorIndex, 1);

      // Log activity
      await this.logActivity(eventId, currentUser.id, 'updated', 'Removed collaborator');

      return true;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      return false;
    }
  }

  async respondToInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<boolean> {
    try {
      const invitation = this.mockInvitations.find(i => i.id === invitationId);
      if (!invitation) return false;

      invitation.status = response;

      // Update collaborator status
      const event = await this.getCollaborativeEvent(invitation.event_id);
      if (event) {
        const collaborator = event.collaborators.find(c => c.user_email === invitation.invitee_email);
        if (collaborator) {
          collaborator.status = response;
          collaborator.responded_at = new Date();
        }
      }

      // Log activity
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        await this.logActivity(invitation.event_id, currentUser.id, 'rsvp_changed', `RSVP: ${response}`);
      }

      return true;
    } catch (error) {
      console.error('Error responding to invitation:', error);
      return false;
    }
  }

  // Invitations
  async sendInvitation(eventId: string, inviteeEmail: string, role: 'editor' | 'viewer', message?: string): Promise<EventInvitation | null> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const event = await this.getCollaborativeEvent(eventId);
      if (!event) return null;

      const canInvite = await this.canUserInviteToEvent(eventId);
      if (!canInvite) return null;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days

      const invitation: EventInvitation = {
        id: Date.now().toString(),
        event_id: eventId,
        event_title: event.title,
        event_start_date: event.start_date,
        inviter_id: currentUser.id,
        inviter_name: currentUser.name,
        inviter_email: currentUser.email,
        invitee_email: inviteeEmail,
        role,
        message,
        status: 'pending',
        sent_at: new Date(),
        expires_at: expiresAt
      };

      this.mockInvitations.push(invitation);

      // Add as pending collaborator
      await this.addCollaborator(eventId, {
        user_id: '',
        user_email: inviteeEmail,
        role,
        status: 'pending',
        permissions: {
          can_edit: role === 'editor',
          can_invite: false,
          can_delete: false
        }
      });

      // Send notification
      this.sendInvitationNotification(invitation);

      return invitation;
    } catch (error) {
      console.error('Error sending invitation:', error);
      return null;
    }
  }

  async getUserInvitations(): Promise<EventInvitation[]> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    return this.mockInvitations.filter(i => 
      i.invitee_email === currentUser.email && i.status === 'pending'
    );
  }

  private sendInvitationNotification(invitation: EventInvitation): void {
    // Mock notification - in production would use email service
    console.log('📧 Invitation sent:', {
      to: invitation.invitee_email,
      subject: `You're invited to ${invitation.event_title}`,
      from: invitation.inviter_email
    });
  }

  // Comments and Discussion
  async addComment(eventId: string, content: string, parentCommentId?: string): Promise<EventComment | null> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const comment: EventComment = {
        id: Date.now().toString(),
        event_id: eventId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar,
        content,
        created_at: new Date(),
        parent_comment_id: parentCommentId,
        replies: []
      };

      this.mockComments.push(comment);

      // Log activity
      await this.logActivity(eventId, currentUser.id, 'commented', 'Added a comment');

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  async getEventComments(eventId: string): Promise<EventComment[]> {
    const eventComments = this.mockComments.filter(c => c.event_id === eventId);
    
    // Organize comments with replies
    const comments: EventComment[] = [];
    const commentMap = new Map<string, EventComment>();

    eventComments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);

      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies!.push(comment);
        }
      } else {
        comments.push(comment);
      }
    });

    return comments;
  }

  // Activity Logging
  private async logActivity(eventId: string, userId: string, action: EventActivity['action'], details?: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return;

      const activity: EventActivity = {
        id: Date.now().toString(),
        event_id: eventId,
        user_id: userId,
        user_name: currentUser.name,
        action,
        details,
        metadata,
        created_at: new Date()
      };

      this.mockActivities.push(activity);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getEventActivity(eventId: string): Promise<EventActivity[]> {
    return this.mockActivities
      .filter(a => a.event_id === eventId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 50);
  }

  // Permissions and Access Control
  async getUserEventPermissions(eventId: string): Promise<EventCollaborator['permissions'] | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const event = await this.getCollaborativeEvent(eventId);
    if (!event) return null;

    const collaborator = event.collaborators.find(c => 
      c.user_id === currentUser.id && c.status === 'accepted'
    );

    return collaborator?.permissions || null;
  }

  async canUserEditEvent(eventId: string): Promise<boolean> {
    const permissions = await this.getUserEventPermissions(eventId);
    return permissions?.can_edit || false;
  }

  async canUserInviteToEvent(eventId: string): Promise<boolean> {
    const permissions = await this.getUserEventPermissions(eventId);
    return permissions?.can_invite || false;
  }

  async canUserDeleteEvent(eventId: string): Promise<boolean> {
    const permissions = await this.getUserEventPermissions(eventId);
    return permissions?.can_delete || false;
  }

  // Utility methods
  private getCurrentUser(): { id: string; email: string; name: string; avatar?: string } | null {
    // Mock current user - in production would get from auth context
    return {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    };
  }

  // Real-time functionality (mock)
  subscribeToEventUpdates(eventId: string, callback: (payload: any) => void): () => void {
    // Mock subscription - in production would use Supabase real-time
    console.log(`Subscribed to event updates: ${eventId}`);
    
    // Simulate some updates for demonstration
    setTimeout(() => callback({ event: 'update', data: { eventId } }), 1000);
    
    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribed from event updates: ${eventId}`);
    };
  }

  subscribeToUserInvitations(callback: (payload: any) => void): () => void {
    // Mock subscription - in production would use Supabase real-time
    console.log('Subscribed to user invitations');
    
    // Simulate some invitations for demonstration
    setTimeout(() => callback({ event: 'invitation', data: { userId: 'user-123' } }), 2000);
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribed from user invitations');
    };
  }

  // Statistics and Analytics
  async getCollaborationStats(eventId: string): Promise<{
    total_collaborators: number;
    pending_invitations: number;
    accepted_collaborators: number;
    total_comments: number;
    total_activities: number;
    response_rate: number;
  }> {
    const event = await this.getCollaborativeEvent(eventId);
    if (!event) {
      return {
        total_collaborators: 0,
        pending_invitations: 0,
        accepted_collaborators: 0,
        total_comments: 0,
        total_activities: 0,
        response_rate: 0
      };
    }

    const totalCollaborators = event.collaborators.length;
    const pendingInvitations = event.collaborators.filter(c => c.status === 'pending').length;
    const acceptedCollaborators = event.collaborators.filter(c => c.status === 'accepted').length;
    const totalComments = this.mockComments.filter(c => c.event_id === eventId).length;
    const totalActivities = this.mockActivities.filter(a => a.event_id === eventId).length;
    const responseRate = totalCollaborators > 0 ? (acceptedCollaborators / totalCollaborators) * 100 : 0;

    return {
      total_collaborators: totalCollaborators,
      pending_invitations: pendingInvitations,
      accepted_collaborators: acceptedCollaborators,
      total_comments: totalComments,
      total_activities: totalActivities,
      response_rate: Math.round(responseRate)
    };
  }
}

export const eventCollaborationService = new EventCollaborationService();
