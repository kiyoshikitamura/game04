export type AuthNavigationReason = "session-required" | "session-expired" | "session-error";

const authMessages: Record<AuthNavigationReason, string> = {
  "session-required": "Homeを利用するにはログインが必要です。",
  "session-expired": "ログインの有効期限が切れました。もう一度ログインしてください。",
  "session-error": "ログイン状態を確認できませんでした。もう一度お試しください。",
};

export function safeInternalPath(value: string | null | undefined, fallback = "/") {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    const base = new URL("https://game04.invalid");
    const resolved = new URL(value, base);
    if (resolved.origin !== base.origin) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

export function authNavigationMessage(value: string | null | undefined) {
  return value && value in authMessages
    ? authMessages[value as AuthNavigationReason]
    : null;
}
