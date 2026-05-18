// lib/services/api.ts

// On a real mobile device, "localhost" refers to the phone itself — not the dev PC.
// We use a relative URL in the browser (same-origin) so no IP is needed.
// On the server (SSR), we use NEXTAUTH_URL which should be set to the LAN IP.
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser: relative URLs work perfectly
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL; // server SSR: use LAN IP
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return 'http://127.0.0.1:3000'; // last-resort SSR fallback
};

// Wrap fetch with a timeout to prevent infinite loading on slow mobile connections
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

const BASE_URL = getBaseUrl();

export const api = {
  get: async (url: string, tags?: string[]) => {
    const res = await fetchWithTimeout(`${BASE_URL}/api${url}`, {
      next: { tags },
      cache: tags ? 'force-cache' : 'no-store',
    } as RequestInit);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API Error (${res.status})`);
    return data.data;
  },

  post: async (url: string, body: any) => {
    const res = await fetchWithTimeout(`${BASE_URL}/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API Error (${res.status})`);
    return data.data;
  },

  put: async (url: string, body: any) => {
    const res = await fetchWithTimeout(`${BASE_URL}/api${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API Error (${res.status})`);
    return data.data;
  },

  delete: async (url: string) => {
    const res = await fetchWithTimeout(`${BASE_URL}/api${url}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API Error (${res.status})`);
    return data.data;
  },

  patch: async (url: string, body: any) => {
    const res = await fetchWithTimeout(`${BASE_URL}/api${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API Error (${res.status})`);
    return data.data;
  },
};
