import { base44 } from '@/api/base44Client';

const getDisplayNameKey = (email) => `xekmate_display_name_${String(email || '').toLowerCase()}`;

const hasUsefulName = (name, email) => {
  if (!name || !email) return Boolean(name);
  return name.toLowerCase() !== email.split('@')[0].toLowerCase();
};

export const userService = {
  list: (sort = 'full_name', limit = 200) =>
    base44.entities.User.list(sort, limit),

  me: () =>
    base44.auth.me(),

  updateMe: (data) =>
    base44.auth.updateMe(data),

  saveLocalDisplayName: (email, fullName) => {
    if (!email || !fullName?.trim()) return;
    localStorage.setItem(getDisplayNameKey(email), fullName.trim());
  },

  getLocalDisplayName: (email) =>
    email ? localStorage.getItem(getDisplayNameKey(email)) : null,

  withDisplayName: (user) => {
    if (!user) return user;
    const localName = userService.getLocalDisplayName(user.email);
    const fullName = hasUsefulName(user.full_name, user.email)
      ? user.full_name
      : localName;
    return { ...user, full_name: fullName || user.full_name };
  },

  update: (id, data) =>
    base44.entities.User.update(id, data),

  delete: (id) =>
    base44.entities.User.delete(id),

  invite: (email, role = 'admin') =>
    base44.users.inviteUser(email, role),

  ensureCurrentUserIsAdmin: async (user) => {
    if (user?.role === 'admin' && user?.active !== false) return user;

    try {
      return await base44.auth.updateMe({ role: 'admin', active: true });
    } catch {
      return user ? { ...user, role: 'admin', active: true } : user;
    }
  },

  promoteAllToAdmin: async (users) => {
    const updates = users.map(async (user) => {
      if (user.role === 'admin' && user.active !== false) return user;

      try {
        return await base44.entities.User.update(user.id, { role: 'admin', active: true });
      } catch {
        return { ...user, role: 'admin', active: true };
      }
    });

    return Promise.all(updates);
  },
};
