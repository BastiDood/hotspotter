export async function load({ parent, params: { base } }) {
    const data = await parent();
    const reading = data[base] ?? null;
    return { reading };
}
