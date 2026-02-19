import api from '../lib/api';

export interface Comment {
  id: string;
  task_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateCommentData {
  task_id: number;
  content: string;
}

class CommentService {
  private comments: Map<number, Comment[]> = new Map();

  async getCommentsByTask(taskId: number): Promise<Comment[]> {
    return this.comments.get(taskId) || [];
  }

  async createComment(commentData: CreateCommentData): Promise<Comment> {
    const comment: Comment = {
      id: crypto.randomUUID(),
      task_id: commentData.task_id,
      user_id: '',
      content: commentData.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existing = this.comments.get(commentData.task_id) || [];
    existing.unshift(comment);
    this.comments.set(commentData.task_id, existing);

    return comment;
  }

  async updateComment(commentId: string, content: string): Promise<Comment | null> {
    for (const [taskId, comments] of this.comments.entries()) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.content = content;
        comment.updated_at = new Date().toISOString();
        return comment;
      }
    }
    return null;
  }

  async deleteComment(commentId: string): Promise<void> {
    for (const [taskId, comments] of this.comments.entries()) {
      const index = comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments.splice(index, 1);
        this.comments.set(taskId, comments);
        return;
      }
    }
  }

  subscribeToTaskComments(callback: any): void {
    console.log('[CommentService] Subscribed to comments');
  }
}

export const commentService = new CommentService();
