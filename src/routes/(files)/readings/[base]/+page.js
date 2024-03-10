export const prerender = false;

export async function load({ parent, params: { base } }) {
    const { cache } = await parent();
    const reading = cache[base] ?? null;
    return { reading };
}
