import { getContext, hasContext, setContext } from 'svelte';
import { assert } from '$lib/assert';
import { writable } from 'svelte/store';

const SATELLITE = Symbol('satellite');

function create() {
    return writable(false);
}

type Store = ReturnType<typeof create>;

export function init() {
    setContext(SATELLITE, create());
}

export function get() {
    assert(hasContext(SATELLITE), 'uninitialized satellite store');
    return getContext<Store>(SATELLITE);
}
