import { browser, building } from '$app/environment';
import type { LeaderboardUsers } from '$lib/models/api.js';
import { fetchLeaderboard } from '$lib/http';

export function load({ fetch }) {
    const users = !building && browser ? fetchLeaderboard(fetch) : ([] as LeaderboardUsers);
    return { users };
}
