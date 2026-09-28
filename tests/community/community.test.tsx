import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render, renderHook, act, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { setGame, setRpc } from './fixtures';
import { CommunityBadges, useCommunityProfiles } from '../../src/app/components/redesign/CommunityIdentity';
import CommunityAuthenticationReminder from '../../src/app/components/redesign/CommunityAuthenticationReminder';
import { authenticationReminderKey, settleCommunityMessage, validCommunityMessage, COMMUNITY_ACTIVITY_TYPES } from '../../src/domain/redesign/community';
import { jstLoginDate } from '../../src/domain/redesign/loginBonus';
import { isVipActive } from '../../src/domain/redesign/vip';
import HomeView from '../../src/app/components/redesign/HomeView';
import { createInitialState } from '../../src/domain/redesign/masters';
afterEach(() => { cleanup(); localStorage.clear(); setRpc(async () => ({ data: [], error: null })); });
const guest = { session: { user: { id: 'guest', is_anonymous: true } } };

test('140 code points, whitespace, and independent committed message IDs', () => {
 assert(validCommunityMessage('姫'.repeat(140))); assert(validCommunityMessage('😀'.repeat(140)));
 assert(!validCommunityMessage('姫'.repeat(141))); assert(!validCommunityMessage('  '));
 const committed = { id: 'saved', content: 'a' };
 assert.deepEqual(settleCommunityMessage([{ id: 'temp', content: 'a' }, committed, { id: 'other', content: 'a' }], 'temp', committed), [{ id: 'other', content: 'a' }, committed]);
 assert(!COMMUNITY_ACTIVITY_TYPES.has('POWER_RANK_1')); assert(!COMMUNITY_ACTIVITY_TYPES.has('GUILD_CREATED')); assert(COMMUNITY_ACTIVITY_TYPES.has('SSR_EQUIPMENT'));
});
test('VIP expiry boundary and malformed dates; only authoritative authentication shows badge', () => {
 const now = Date.parse('2026-09-25T00:00:00Z');
 assert(!isVipActive(new Date(now).toISOString(), now)); assert(!isVipActive('invalid', now));
 const view = render(<CommunityBadges authenticated vipExpiresAt={new Date(now + 1).toISOString()} now={now} />);
 assert(view.getByLabelText('認証済み')); assert(view.getByLabelText('VIP有効'));
 view.rerender(<CommunityBadges authenticated={false} vipExpiresAt={new Date(now).toISOString()} now={now} />);
 assert.equal(view.queryByLabelText('認証済み'), null); assert.equal(view.queryByLabelText('VIP有効'), null);
});
test('daily reminder waits for login dialog, suppresses reload, stops after linking', async () => {
 setGame({ ...guest, showLoginBonusModal: true });
 const view = render(<CommunityAuthenticationReminder owner="guest" eligible />);
 await act(async () => { await new Promise(r => setTimeout(r, 10)); });
 assert.equal(view.queryByRole('dialog'), null); assert.equal(localStorage.getItem(authenticationReminderKey('guest')), null);
 setGame(guest); view.rerender(<CommunityAuthenticationReminder owner="guest" eligible />);
 await waitFor(() => assert(view.getByRole('dialog')));
 assert.equal(localStorage.getItem(authenticationReminderKey('guest')), jstLoginDate(Date.now()));
 setGame({ session: { user: { id: 'guest', is_anonymous: false } } });
 view.rerender(<CommunityAuthenticationReminder owner="guest" eligible />);
 assert.equal(view.queryByRole('dialog'), null);
 view.unmount(); setGame(guest);
 const reloaded = render(<CommunityAuthenticationReminder owner="guest" eligible />);
 await act(async () => { await new Promise(r => setTimeout(r, 10)); });
 assert.equal(reloaded.queryByRole('dialog'), null);
});
test('JST day boundary and previous daily key allow one new guide', async () => {
 assert.equal(jstLoginDate(Date.parse('2026-09-25T14:59:59Z')), '2026-09-25');
 assert.equal(jstLoginDate(Date.parse('2026-09-25T15:00:00Z')), '2026-09-26');
 localStorage.setItem(authenticationReminderKey('guest'), '2026-01-01'); setGame(guest);
 const view = render(<CommunityAuthenticationReminder owner="guest" eligible />);
 await waitFor(() => assert(view.getByRole('dialog')));
 fireEvent.click(view.getByText('閉じる'));
 assert.equal(view.queryByRole('dialog'), null);
 view.rerender(<CommunityAuthenticationReminder owner="guest" eligible={false} />);
 view.rerender(<CommunityAuthenticationReminder owner="guest" eligible />);
 await act(async () => { await new Promise(r => setTimeout(r, 10)); });
 assert.equal(view.queryByRole('dialog'), null);
});
test('public projection clears auth on token change and ignores late previous-owner response', async () => {
 let resolveOld: any;
 setRpc((_name: string, args: any) => args.p_user_ids[0] === 'old' ? new Promise(r => { resolveOld = r; }) : Promise.resolve({ data: [{ user_id: 'new', username: 'new', authenticated: true }], error: null }));
 const hook = renderHook(({ owner, token }) => useCommunityProfiles(owner, [owner], true, token), { initialProps: { owner: 'old', token: 'one' } });
 hook.rerender({ owner: 'new', token: 'two' });
 await waitFor(() => assert.equal(hook.result.current.new?.authenticated, true));
 await act(async () => resolveOld({ data: [{ user_id: 'old', authenticated: true }], error: null }));
 assert.equal(hook.result.current.old, undefined);
 hook.rerender({ owner: 'new', token: 'three' });
 assert.equal(hook.result.current.new, undefined);
 await waitFor(() => assert.equal(hook.result.current.new?.authenticated, true));
});
test('missing candidate keeps names but never invents verified or VIP status', async () => {
 setRpc(async (name: string) => name === 'game04_get_community_profiles' ? { error: { code: 'PGRST202' } } : { data: [{ user_id: 'a', username: '表示名', authenticated: true, vip_expires_at: '2099-01-01' }], error: null });
 const hook = renderHook(() => useCommunityProfiles('a', ['a']));
 await waitFor(() => assert.equal(hook.result.current.a?.username, '表示名'));
 assert.equal(hook.result.current.a.authenticated, false); assert.equal(hook.result.current.a.vip_expires_at, null);
});
test('real HomeView shows current author, item name, verified badge, bio and no retired rank activity', async () => {
 const now = new Date().toISOString();
 setRpc(async (name: string) => ({ data: name === 'game04_get_community_activity' ? [
  { id: 'ssr', activity_type: 'SSR_CHARACTER', actor_user_id: 'other', actor_display_name: '旧名', object_master_id: 'missing', display_payload: { item_name: '確認武将' }, created_at: now },
  { id: 'rank', activity_type: 'POWER_RANK_1', actor_display_name: '廃止表示', created_at: now },
 ] : [{ user_id: 'other', username: '新しい名前', bio: '保存された自己紹介', authenticated: true, vip_expires_at: '2099-01-01' }], error: null }));
 setGame({ ...guest, username: '自分', guildChats: [], directMessages: [], dmUnreadConversations: [], setChatChannel() {}, setShowTribeChatPanel() {}, setDmRecipientId() {} });
 const view = render(<HomeView state={createInitialState('guest')} onAction={async () => {}} onNavigate={() => {}} />);
 await waitFor(() => assert(view.getByText('SSR「確認武将」を獲得')));
 assert.equal(view.queryByText('廃止表示'), null);
 await waitFor(() => assert(view.getByText('新しい名前')));
 fireEvent.click(view.getByText('新しい名前'));
 await waitFor(() => assert(view.getByText('保存された自己紹介')));
 assert(view.getAllByLabelText('認証済み').length > 0);
});
