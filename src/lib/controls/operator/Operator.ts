import { getContext, hasContext, setContext } from 'svelte';
import { assert } from '$lib/assert';
import { writable } from 'svelte/store';

const OPERATOR = Symbol('operator');

function create() {
    return writable(null as number | null);
}

type Store = ReturnType<typeof create>;

export function init() {
    setContext(OPERATOR, create());
}

export function get() {
    assert(hasContext(OPERATOR), 'uninitialized operator select store');
    return getContext<Store>(OPERATOR);
}
