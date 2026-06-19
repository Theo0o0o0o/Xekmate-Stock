import { supabase } from '@/api/supabaseClient';

const ACCESS_SETTING_KEY = 'access_password_hash';
const ACCESS_UNLOCK_KEY = 'xekmate_access_password_hash';
const DEFAULT_ACCESS_PASSWORD_HASH = '519ad8418de4f18d6ebfbb02b525bb3cc3a35dede6018aeb7882ffe065fe6b5e';

export async function hashAccessPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function getAccessPasswordHash() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', ACCESS_SETTING_KEY)
    .maybeSingle();

  if (error || !data?.value) {
    return DEFAULT_ACCESS_PASSWORD_HASH;
  }

  return data.value;
}

export function isAccessUnlocked(currentHash) {
  return localStorage.getItem(ACCESS_UNLOCK_KEY) === currentHash;
}

export function unlockAccess(currentHash) {
  localStorage.setItem(ACCESS_UNLOCK_KEY, currentHash);
}

export async function verifyAccessPassword(password, currentHash) {
  const typedHash = await hashAccessPassword(password);
  return typedHash === currentHash;
}

export async function updateAccessPassword(currentPassword, newPassword) {
  const currentHash = await getAccessPasswordHash();
  const currentMatches = await verifyAccessPassword(currentPassword, currentHash);

  if (!currentMatches) {
    throw new Error('Senha atual incorreta');
  }

  const newHash = await hashAccessPassword(newPassword);
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: ACCESS_SETTING_KEY, value: newHash }, { onConflict: 'key' });

  if (error) throw error;
  unlockAccess(newHash);
  return true;
}