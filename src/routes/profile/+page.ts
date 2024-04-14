import { browser, building } from '$app/environment';
import { fetchLeaderboard } from '$lib/http';
import type { LeaderboardUsers } from '$lib/models/api.js';

export async function load({ fetch }) {
    const users = !building && browser ? fetchLeaderboard(fetch) : ([] as LeaderboardUsers);
    return { users };
}
