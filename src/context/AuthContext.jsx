import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      if (!userId) {
        setProfile(null);
        return null;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) console.error('Error al obtener perfil:', error.message);
      const currentUser = (await supabase.auth.getUser()).data.user;
      const metadata = currentUser?.user_metadata || {};
      const resolvedProfile = data || {
        id: userId,
        full_name: metadata.full_name || '',
        phone: metadata.phone || '',
      };
      setProfile(resolvedProfile);
      return resolvedProfile;
    } catch (err) {
      console.error(err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error al inicializar la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, fullName, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          phone: phone 
        } 
      }
    });
    if (error) throw error;

    if (data.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone,
      });

      if (profileError) console.error('Error al guardar el perfil:', profileError.message);
    }

    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const signedInProfile = await fetchProfile(data.user?.id);
    return { ...data, profile: signedInProfile };
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-clave`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ✏️ Actualización de perfil (Teléfono y/o Email)
  const updateUserProfile = async ({ fullName, phone, email }) => {
    if (!user) return;

    if (phone !== undefined || fullName !== undefined) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName ?? profile?.full_name ?? '',
          phone: phone ?? profile?.phone ?? ''
        });

      if (profileError) throw profileError;
    }

    // Actualizar los datos públicos de Auth para mantener el fallback del perfil.
    if (fullName !== undefined || phone !== undefined) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...(fullName !== undefined ? { full_name: fullName } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });
      if (metadataError) throw metadataError;
    }

    // Actualizar correo en Supabase Auth si cambió
    if (email && email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) throw authError;
    }

    // 3. Refrescar el estado local del perfil
    await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, resetPassword, updatePassword, updateUserProfile }}>
      {!loading ? children : <div style={{ padding: '40px', textAlign: 'center' }}>Cargando sesión...</div>}
    </AuthContext.Provider>
  );
}