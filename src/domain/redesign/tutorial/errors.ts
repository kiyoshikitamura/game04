/** Current API preserves the PostgreSQL message but not SQLSTATE. Match only
 * the verified username index, never an arbitrary unique violation or substring. */
export const DUPLICATE_TUTORIAL_NAME = 'duplicate key value violates unique constraint "users_username_normalized_uidx"';
export function tutorialFailure(error: unknown, nameStep: boolean) {
  const message = error instanceof Error ? error.message : '';
  if (nameStep && message === DUPLICATE_TUTORIAL_NAME) return { duplicate: true, message: '' };
  if (message === '名前は1〜8文字で入力してください。') return { duplicate: false, message };
  if (message === '進行が更新されています。再読み込みしてください。') return { duplicate: false, message };
  return { duplicate: false, message: '保存を確認できませんでした。通信状態を確認して、もう一度お試しください。' };
}
