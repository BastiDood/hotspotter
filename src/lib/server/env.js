import { POSTGRES_URL } from '$env/static/private';
import { assert } from '$lib/assert';

assert(POSTGRES_URL, 'database url cannot be empty');
assert(URL.canParse(POSTGRES_URL), 'database url must be valid');

export { POSTGRES_URL };
