import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isSuperAdmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  status: string;
  plan: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name: string; companyName: string }) => Promise<void>;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setOrganizations(res.data.organizations || []);

          const savedOrgId = localStorage.getItem('currentOrgId');
          const matchedOrg = res.data.organizations?.find((o: Organization) => o.id === savedOrgId);
          const activeOrg = matchedOrg || res.data.organizations?.[0] || null;

          setCurrentOrg(activeOrg);
          if (activeOrg) {
            localStorage.setItem('currentOrgId', activeOrg.id);
          }
        } catch (err) {
          console.error('Failed to load profile', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    const { accessToken, user, organizations, defaultOrganization } = res.data;

    setToken(accessToken);
    setUser(user);
    setOrganizations(organizations);
    setCurrentOrg(defaultOrganization);

    localStorage.setItem('token', accessToken);
    if (defaultOrganization) {
      localStorage.setItem('currentOrgId', defaultOrganization.id);
    }
  };

  const register = async (data: { email: string; password: string; name: string; companyName: string }) => {
    const res = await api.post('/auth/register', data);
    const { accessToken, user, organizations, defaultOrganization } = res.data;

    setToken(accessToken);
    setUser(user);
    setOrganizations(organizations);
    setCurrentOrg(defaultOrganization);

    localStorage.setItem('token', accessToken);
    if (defaultOrganization) {
      localStorage.setItem('currentOrgId', defaultOrganization.id);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrganizations([]);
    setCurrentOrg(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentOrgId');
  };

  const switchOrganization = (orgId: string) => {
    const target = organizations.find((o) => o.id === orgId);
    if (target) {
      setCurrentOrg(target);
      localStorage.setItem('currentOrgId', target.id);
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        organizations,
        currentOrg,
        isLoading,
        login,
        register,
        logout,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

