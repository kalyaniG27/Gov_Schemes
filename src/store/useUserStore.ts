import { create } from 'zustand';
import { User, Application } from '../types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  saveScheme: (schemeId: string) => void;
  removeSavedScheme: (schemeId: string) => void;
  addApplication: (application: Application) => void;
  updateApplication: (applicationId: string, updates: Partial<Application>) => void;
}

// Mock user data for demonstration
const mockUser: User = {
  id: 'user-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  age: 28,
  gender: 'Male',
  location: 'Delhi',
  category: 'General',
  income: 450000,
  education: 'Graduate',
  employmentStatus: 'Employed',
  aadhaarNumber: 'XXXX-XXXX-XXXX',
  savedSchemes: ['scheme-1', 'scheme-3'],
  applications: [
    {
      id: 'app-1',
      schemeId: 'scheme-1',
      status: 'submitted',
      submissionDate: '2023-06-15',
      documents: [
        {
          id: 'doc-1',
          type: 'Aadhaar Card',
          fileName: 'aadhaar.pdf',
          fileUrl: '#',
          uploadDate: '2023-06-14',
          verified: true,
        },
      ],
      notes: '',
    }
  ],
};

const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, always succeed with mock user
      set({ user: mockUser, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: 'Invalid email or password', loading: false });
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser: User = {
        ...mockUser,
        ...userData,
        id: `user-${Date.now()}`,
        savedSchemes: [],
        applications: [],
      };
      
      set({ user: newUser, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: 'Registration failed', loading: false });
    }
  },
  
  updateProfile: async (userData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        user: state.user ? { ...state.user, ...userData } : null,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Profile update failed', loading: false });
    }
  },
  
  saveScheme: (schemeId) => {
    set(state => {
      if (!state.user) return state;
      
      return {
        user: {
          ...state.user,
          savedSchemes: [...state.user.savedSchemes, schemeId],
        },
      };
    });
  },
  
  removeSavedScheme: (schemeId) => {
    set(state => {
      if (!state.user) return state;
      
      return {
        user: {
          ...state.user,
          savedSchemes: state.user.savedSchemes.filter(id => id !== schemeId),
        },
      };
    });
  },
  
  addApplication: (application) => {
    set(state => {
      if (!state.user) return state;
      
      return {
        user: {
          ...state.user,
          applications: [...state.user.applications, application],
        },
      };
    });
  },
  
  updateApplication: (applicationId, updates) => {
    set(state => {
      if (!state.user) return state;
      
      return {
        user: {
          ...state.user,
          applications: state.user.applications.map(app => 
            app.id === applicationId ? { ...app, ...updates } : app
          ),
        },
      };
    });
  },
}));

export default useUserStore;