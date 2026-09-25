'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { newTutorial, type TutorialSave } from '@/domain/redesign/tutorial/state';
import { TUTORIAL_VERSION } from '@/domain/redesign/tutorial/content';

const TABLE = 'game04_tutorial_preview_states';
let connection: SupabaseClient | undefined;
function client() {
  if (connection) return connection;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (url !== 'https://lrgyllgzcdcphlbmkknc.supabase.co' || !key) throw new Error('確認環境の接続設定がありません。');
  connection = createClient(url, key, { auth: { storageKey: 'game04-tutorial-preview-auth-v1', detectSessionInUrl: false } });
  return connection;
}
let opening: Promise<TutorialSave> | undefined;
export function openTutorial(): Promise<TutorialSave> {
  // Deduplicate StrictMode mounts, including anonymous account creation.
  return opening ??= (async () => {
    const db = client();
    let { data: { session } } = await db.auth.getSession();
    if (!session) {
      const signed = await db.auth.signInAnonymously();
      if (signed.error) throw new Error('確認用データを準備できませんでした。再読み込みしてください。');
      session = signed.data.session;
    }
    if (!session) throw new Error('確認用セッションがありません。');
    const query = await db.from(TABLE).select('state').eq('user_id', session.user.id).maybeSingle();
    if (query.error) throw new Error('進行を読み込めませんでした。再読み込みしてください。');
    if (query.data) {
      const saved = query.data.state as TutorialSave;
      if (saved.schema !== TUTORIAL_VERSION) throw new Error('進行データの版が異なります。');
      return saved;
    }
    const state = newTutorial(session.user.id);
    const inserted = await db.from(TABLE).insert({ user_id: session.user.id, revision: 0, state });
    if (inserted.error) throw new Error('進行を保存できませんでした。再読み込みしてください。');
    return state;
  })().catch(error => { opening = undefined; throw error; });
}
export async function persistTutorial(before: TutorialSave, after: TutorialSave): Promise<TutorialSave> {
  if (before === after) return before;
  const query = await client().from(TABLE).update({ revision: after.revision, state: after, updated_at: new Date().toISOString() })
    .eq('user_id', before.game.userId).eq('revision', before.revision).select('state');
  if (query.error) throw new Error('保存できませんでした。もう一度お試しください。');
  if (query.data?.length !== 1) throw new Error('別の画面で進行が更新されました。再読み込みしてください。');
  opening = Promise.resolve(after);
  return after;
}
