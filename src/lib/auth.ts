import { User, Workspace, AuthState } from '@/types/auth';

class AuthManager {
  private authState: AuthState = {
    user: null,
    workspace: null,
    isLoading: false,
    isAuthenticated: false
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Only initialize if we're in the browser (client-side)
    if (typeof window === 'undefined') return;
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('auth_user');
    const savedWorkspace = localStorage.getItem('current_workspace');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const workspace = savedWorkspace ? JSON.parse(savedWorkspace) : null;
        
        this.authState = {
          user,
          workspace,
          isLoading: false,
          isAuthenticated: true
        };
        this.notifyListeners();
      } catch (error) {
        console.error('Failed to parse saved auth data:', error);
        this.clearAuth();
      }
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.authState }));
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  async login(email: string, _password: string): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      // Simulate API call - in real app, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, create a mock user
      const user: User = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create default workspace
      const workspace: Workspace = {
        id: 'workspace_' + Date.now(),
        name: `${user.name}'s Workspace`,
        ownerId: user.id,
        members: [{
          id: 'member_' + Date.now(),
          userId: user.id,
          workspaceId: 'workspace_' + Date.now(),
          role: 'owner',
          joinedAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.authState = {
        user,
        workspace,
        isLoading: false,
        isAuthenticated: true
      };

      // Save to localStorage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('current_workspace', JSON.stringify(workspace));
      }

      this.notifyListeners();
      return { success: true };
    } catch {
      this.authState.isLoading = false;
      this.notifyListeners();
      return { success: false, error: 'Login failed' };
    }
  }

  async register(email: string, _password: string, name: string): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: User = {
        id: 'user_' + Date.now(),
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const workspace: Workspace = {
        id: 'workspace_' + Date.now(),
        name: `${user.name}'s Workspace`,
        ownerId: user.id,
        members: [{
          id: 'member_' + Date.now(),
          userId: user.id,
          workspaceId: 'workspace_' + Date.now(),
          role: 'owner',
          joinedAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.authState = {
        user,
        workspace,
        isLoading: false,
        isAuthenticated: true
      };

      // Save to localStorage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('current_workspace', JSON.stringify(workspace));
      }

      this.notifyListeners();
      return { success: true };
    } catch {
      this.authState.isLoading = false;
      this.notifyListeners();
      return { success: false, error: 'Registration failed' };
    }
  }

  logout() {
    this.clearAuth();
  }

  private clearAuth() {
    this.authState = {
      user: null,
      workspace: null,
      isLoading: false,
      isAuthenticated: false
    };
    
    // Clear localStorage (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('current_workspace');
    }
    this.notifyListeners();
  }
}

export const authManager = new AuthManager();