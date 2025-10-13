import { API_BASE_URL } from '../config';

function notifyAuthChanged() {
  try {
    window.dispatchEvent(new Event('auth:changed'));
  } catch {}
}

function handleUnauthorized(status: number) {
  if (status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Notify app to update UI/auth state without forcing full reload
    notifyAuthChanged();
  }
}

function withAuth(init?: RequestInit): RequestInit {
  const token = localStorage.getItem('access_token');
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  };
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...withAuth(init),
    method: 'GET',
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...withAuth(init),
    method: 'POST',
    body: JSON.stringify(body),
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...withAuth(init),
    method: 'PUT',
    body: JSON.stringify(body),
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string, init?: RequestInit): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...withAuth(init),
    method: 'DELETE',
  });
  handleUnauthorized(res.status);
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
}
