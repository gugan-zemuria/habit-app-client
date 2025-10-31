'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    console.log('Attempting to sign up with:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log('Sign up result:', { data: data ? 'present' : 'missing', error });
    return { data, error };
  };

  const signIn = async (email, password) => {
    console.log('Attempting to sign in with:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in result:', { data: data ? 'present' : 'missing', error });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    console.log('Attempting to sign in with Google');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    console.log('Google sign in result:', { data: data ? 'present' : 'missing', error });
    return { data, error };
  };

  const resetPassword = async (email) => {
    console.log('Attempting to reset password for:', email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    console.log('Password reset result:', { data: data ? 'present' : 'missing', error });
    return { data, error };
  };

  const updatePassword = async (newPassword) => {
    console.log('Attempting to update password');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    console.log('Password update result:', { data: data ? 'present' : 'missing', error });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const getAccessToken = async () => {
    console.log('Getting access token, session:', session ? 'present' : 'missing');
    if (!session) {
      console.log('No session available');
      return null;
    }
    console.log('Returning access token:', session.access_token ? 'present' : 'missing');
    return session.access_token;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    signOut,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};