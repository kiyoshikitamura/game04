/** Retry only the read-only Auth check. Never replay a gameplay mutation here. */
export class AuthCheckError extends Error {
  constructor(public status: number) { super(status === 401 ? 'ログインし直してください。' : '認証の確認が一時的にできません。少し待って、もう一度お試しください。'); }
}
export async function authenticatedUser(origin: string, key: string, authorization: string, deps = {
  fetch: globalThis.fetch,
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  log: (value: Record<string, unknown>) => console.warn(JSON.stringify(value)),
}): Promise<{id: string}> {
  const requestUrl = `${origin}/auth/v1/user`;
  for (let attempt = 0; attempt < 3; attempt++) {
    let retry = false;
    try {
      const response = await deps.fetch(requestUrl, {headers: {apikey: key, Authorization: authorization}, redirect: 'manual', signal: AbortSignal.timeout(4000)});
      const contentType = response.headers.get('content-type') || '';
      const location = response.headers.get('location');
      let redirectPath: string | null = null;
      if (location) { try { const u = new URL(location, requestUrl); redirectPath = u.origin + u.pathname; } catch { redirectPath = 'invalid'; } }
      if (response.ok && contentType.toLowerCase().includes('application/json')) {
        const user = await response.json().catch(() => null);
        if (user && typeof user.id === 'string') return {id: user.id};
        retry = true;
      } else {
        retry = response.status === 429 || response.status >= 500 || response.ok;
      }
      deps.log({event: 'game04_auth_upstream_failure', requestUrl, status: response.status, contentType, redirectTo: redirectPath, attempt: attempt + 1});
      if (!retry) throw new AuthCheckError(response.status === 401 || response.status === 403 ? 401 : 503);
    } catch (error) {
      if (error instanceof AuthCheckError) throw error;
      deps.log({event: 'game04_auth_upstream_transport_failure', requestUrl, attempt: attempt + 1});
      retry = true;
    }
    if (retry && attempt < 2) await deps.sleep(200 * (attempt + 1));
  }
  throw new AuthCheckError(503);
}
