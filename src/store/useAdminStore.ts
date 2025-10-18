import { create } from 'zustand';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
}

interface AdminState {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginAdmin: (username: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
  checkAdminAuth: () => boolean;
}

// Mock admin users for demonstration
const mockAdmins = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@govschemes.gov.in',
    password: 'admin123', // In production, this would be hashed
    role: 'super_admin' as const,
    permissions: ['create_scheme', 'edit_scheme', 'delete_scheme', 'view_analytics', 'manage_users']
  },
  {
    id: 'admin-2',
    username: 'moderator',
    email: 'moderator@govschemes.gov.in',
    password: 'mod123',
    role: 'moderator' as const,
    permissions: ['create_scheme', 'edit_scheme', 'view_analytics']
  }
];

const useAdminStore = create<AdminState>((set, get) => ({
  admin: null,
  isAdminAuthenticated: false,
  loading: false,
  error: null,

  loginAdmin: async (username, password) => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find admin user
      const adminUser = mockAdmins.find(
        admin => admin.username === username && admin.password === password
      );
      
      if (!adminUser) {
        throw new Error('Invalid username or password');
      }
      
      // Create admin session
      const { password: _, ...adminData } = adminUser;
      
      set({ 
        admin: adminData,
        isAdminAuthenticated: true, 
        loading: false 
      });
      
      // Store in localStorage for persistence
      localStorage.setItem('admin_session', JSON.stringify(adminData));
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        loading: false 
      });
    }
  },

  logoutAdmin: () => {
    set({ 
      admin: null, 
      isAdminAuthenticated: false,
      error: null 
    });
    localStorage.removeItem('admin_session');
  },

  checkAdminAuth: () => {
    const { isAdminAuthenticated } = get();
    
    if (isAdminAuthenticated) {
      return true;
    }
    
    // Check localStorage for existing session
    const storedSession = localStorage.getItem('admin_session');
    if (storedSession) {
      try {
        const adminData = JSON.parse(storedSession);
        set({ 
          admin: adminData,
          isAdminAuthenticated: true 
        });
        return true;
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }
    
    return false;
  }
}));

export default useAdminStore;