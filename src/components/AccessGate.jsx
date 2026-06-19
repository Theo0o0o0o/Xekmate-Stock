import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import {
  getAccessPasswordHash,
  isAccessUnlocked,
  unlockAccess,
  verifyAccessPassword,
} from '@/services/appAccessService';

export default function AccessGate({ children }) {
  const [requiredHash, setRequiredHash] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const loadPassword = async () => {
      const hash = await getAccessPasswordHash();
      setRequiredHash(hash);
      setAllowed(isAccessUnlocked(hash));
      setLoading(false);
    };

    loadPassword();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setChecking(true);

    try {
      const valid = await verifyAccessPassword(password, requiredHash);
      if (!valid) {
        setError('Senha de acesso incorreta');
        return;
      }

      unlockAccess(requiredHash);
      setAllowed(true);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (allowed) return children;

  return (
    <AuthLayout
      icon={Lock}
      title="Acesso interno"
      subtitle="Introduza a senha de acesso para continuar"
      footer={null}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="site-password">Senha de acesso</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="site-password"
              type="password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-10 h-12"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={checking}>
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              A validar...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}