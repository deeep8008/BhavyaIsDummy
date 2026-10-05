import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  {
    id: 'user_default_1',
    name: 'Enterprise Planner',
    email: 'planner@forecastiq.com',
    password: 'Password123!',
    role: 'Supply Chain Analytics',
    department: 'Demand Forecasting',
    createdAt: new Date().toISOString()
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup'

  // Initialize from localStorage
  useEffect(() => {
    try {
      // Ensure user database exists
      const existingUsers = localStorage.getItem('forecastiq_users_db');
      if (!existingUsers) {
        localStorage.setItem('forecastiq_users_db', JSON.stringify(DEFAULT_USERS));
      }

      // Check for saved session
      const savedUser = localStorage.getItem('forecastiq_active_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // By default, set the active user to the demo planner so the app stays functional out of the box,
        // or user can sign out/in as needed.
        const defaultUser = DEFAULT_USERS[0];
        setUser(defaultUser);
        localStorage.setItem('forecastiq_active_user', JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error('Error initializing auth state from localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const getUsersDatabase = () => {
    try {
      const data = localStorage.getItem('forecastiq_users_db');
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  };

  const saveUsersDatabase = (users) => {
    localStorage.setItem('forecastiq_users_db', JSON.stringify(users));
  };

  const signIn = async ({ email, password, remember = true }) => {
    // Basic client validation
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getUsersDatabase();
    const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      throw new Error('No account found with this email address.');
    }

    if (foundUser.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const authenticatedUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role || 'Enterprise Analyst',
      department: foundUser.department || 'Planning'
    };

    setUser(authenticatedUser);
    if (remember) {
      localStorage.setItem('forecastiq_active_user', JSON.stringify(authenticatedUser));
    }
    closeAuthModal();
    return authenticatedUser;
  };

  const signUp = async ({ name, email, password, role = 'Enterprise Planner', department = 'Operations' }) => {
    if (!name || !email || !password) {
      throw new Error('All required fields must be filled.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getUsersDatabase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: role.trim() || 'Enterprise Analyst',
      department: department.trim() || 'Demand Planning',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsersDatabase(users);

    const authenticatedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department
    };

    setUser(authenticatedUser);
    localStorage.setItem('forecastiq_active_user', JSON.stringify(authenticatedUser));
    closeAuthModal();
    return authenticatedUser;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('forecastiq_active_user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalMode,
    setAuthModalMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
