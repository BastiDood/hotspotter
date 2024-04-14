import { browser, building } from '$app/environment';
import { fetchLeaderboard } from '$lib/http';

export async function load({ fetch }) {
    const users = !building && browser ? await fetchLeaderboard(fetch) : [];
    return { users };
}
