import api from './api';

export const supabase = {
  from: (table: string) => {
    return {
      select: (columns?: string) => {
        let queryTable = table.replace('task_', '');
        return {
          eq: (field: string, value: any) => {
            return {
              order: (field: string, options?: any) => 
                api.get(`/${queryTable}`).then(res => ({ data: res.data, error: null }))
            };
          },
          order: (field: string, options?: any) => 
            api.get(`/${queryTable}`).then(res => ({ data: res.data, error: null }))
        };
      },
      insert: (data: any) => {
        const queryTable = table.replace('task_', '');
        return api.post(`/${queryTable}`, data).then(res => ({ data: res.data, error: null }));
      },
      update: (data: any) => {
        const queryTable = table.replace('task_', '');
        return api.put(`/${queryTable}`, data).then(res => ({ data: res.data, error: null }));
      },
      delete: () => {
        const queryTable = table.replace('task_', '');
        return api.delete(`/${queryTable}`).then(res => ({ data: res.data, error: null }));
      },
    };
  },
  storage: {
    from: (bucket: string) => {
      return {
        upload: async (path: string, file: File) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', path);
          const res = await api.client.post(`/upload/${bucket}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return { data: { path }, error: null };
        },
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://placeholder.com/${path}` } }),
      };
    },
  },
  auth: {
    getSession: () => api.getToken() ? Promise.resolve({ data: { session: { user: { id: 'placeholder' } } }, error: null }) : Promise.resolve({ data: null, error: null }),
    getUser: () => api.getProfile().then(res => ({ data: { user: res }, error: null })).catch(() => ({ data: null, error: null })),
    signOut: () => api.logout(),
  },
};

export default supabase;
