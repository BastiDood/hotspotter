import { assert } from '$lib/assert';
import { env } from '$env/dynamic/private';

const { POSTGRES_URL } = env;
assert(POSTGRES_URL, 'database url cannot be empty');
assert(URL.canParse(POSTGRES_URL), 'database url must be valid');
export default { POSTGRES_URL };
