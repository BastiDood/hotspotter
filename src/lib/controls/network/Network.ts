import { getContext, hasContext, setContext } from 'svelte';
import { CellType } from '$lib/models/api';
import { assert } from '$lib/assert';
import { writable } from 'svelte/store';

const NETWORK = Symbol('network');

function create() {
    return writable(CellType.WiFi);
}

type Store = ReturnType<typeof create>;

export function init() {
    setContext(NETWORK, create());
}

export function get() {
    assert(hasContext(NETWORK), 'uninitialized network select store');
    return getContext<Store>(NETWORK);
}
