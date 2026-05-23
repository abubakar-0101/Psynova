'use client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Mounts the auth bootstrap on every page so a hard-refresh of any route
 * (including /dashboard/...) hydrates the user from the access token.
 * Without this, gated layouts that only read from the auth store would
 * stay stuck on a loading spinner.
 */
export function AuthBootstrap() {
  useAuth();
  return null;
}
