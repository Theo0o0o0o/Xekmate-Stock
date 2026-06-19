import { supabase } from '@/api/supabaseClient';
import { createEntityService } from '@/services/supabaseEntityService';

const userEntity = createEntityService('User');

const displayNameFromUser = (authUser) =>
  authUser?.user_metadata?.full_name ||
  authUser?.user_metadata?.name ||
  authUser?.email?.split('@')[0] ||
  '';

const ensureProfile = async (authUser) => {
  if (!authUser) return null;

  const existing = await userEntity.filter({ id: authUser.id }, 'full_name', 1);
  const fallbackProfile = {
    id: authUser.id,
    email: authUser.email,
    full_name: displayNameFromUser(authUser),
    role: 'admin',
    active: true,
  };

  if (existing[0]) {
    const needsUpdate = existing[0].role !== 'admin' || !existing[0].email || !existing[0].full_name;
    if (needsUpdate) {
      return userEntity.update(authUser.id, {
        email: existing[0].email || fallbackProfile.email,
        full_name: existing[0].full_name || fallbackProfile.full_name,
        role: 'admin',
        active: existing[0].active !== false,
      });
    }
    return { ...existing[0], role: 'admin' };
  }

  return userEntity.upsert(fallbackProfile);
};

export const userService = {
  list: (sort = 'full_name', limit = 200) =>
    userEntity.list(sort, limit),

  me: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return ensureProfile(data.user);
  },

  updateMe: async (data) => {
    const { data: authData, error } = await supabase.auth.updateUser({
      data: { full_name: data.full_name },
    });
    if (error) throw error;
    return userEntity.update(authData.user.id, data);
  },

  update: (id, data) =>
    userEntity.update(id, { ...data, role: 'admin' }),

  delete: (id) =>
    userEntity.delete(id),

  invite: async () => {
    throw new Error('Para adicionar utilizadores, envie o link de registo do sistema.');
  },

  ensureProfile,
};
