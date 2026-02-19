import api from '../lib/api';

export interface Category {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface CategoryInsert {
  name: string;
  color?: string;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
}

export class CategoryService {
  static async getCategories(): Promise<{ data: Category[] | null; error: string | null }> {
    try {
      const categories = await api.getCategories();
      return { data: categories, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener categorías' };
    }
  }

  static async createCategory(categoryData: CategoryInsert): Promise<{ data: Category | null; error: string | null }> {
    try {
      const category = await api.createCategory(categoryData);
      return { data: category, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al crear categoría' };
    }
  }

  static async updateCategory(id: number, updates: CategoryUpdate): Promise<{ data: Category | null; error: string | null }> {
    try {
      const category = await api.updateCategory(id, updates);
      return { data: category, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al actualizar categoría' };
    }
  }

  static async deleteCategory(id: number): Promise<{ error: string | null }> {
    try {
      await api.deleteCategory(id);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al eliminar categoría' };
    }
  }
}
