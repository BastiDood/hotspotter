import { getContext, hasContext, setContext } from 'svelte';
import type { DateTime } from '@easepick/datetime';
import { assert } from '$lib/assert';
import { writable } from 'svelte/store';

const START = Symbol('temporal:start');
const END = Symbol('temporal:end');

function create() {
    return writable<DateTime | undefined>();
}

type Store = ReturnType<typeof create>;

export function initStart() {
    setContext(START, create());
}

export function getStart() {
    assert(hasContext(START), 'uninitialized start date store');
    return getContext<Store>(START);
}

export function initEnd() {
    setContext(END, create());
}

export function getEnd() {
    assert(hasContext(END), 'uninitialized end date store');
    return getContext<Store>(END);
}
