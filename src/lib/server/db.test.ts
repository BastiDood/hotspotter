import { it } from 'vitest';
import { resolveResolution } from './db';

it('resolve resolution level', ({ expect }) => {
    expect(resolveResolution(0, 0.011)).toBe(11);
    expect(resolveResolution(0, 0.022)).toBe(11);
    expect(resolveResolution(0, 0.044)).toBe(10);
    expect(resolveResolution(0, 0.088)).toBe(9);
    expect(resolveResolution(0, 0.176)).toBe(8);
    expect(resolveResolution(0, 0.352)).toBe(8);
    expect(resolveResolution(0, 0.703)).toBe(7);
    expect(resolveResolution(0, 1.406)).toBe(6);
    expect(resolveResolution(0, 2.813)).toBe(5);
    expect(resolveResolution(0, 5.625)).toBe(4);
    expect(resolveResolution(0, 11.25)).toBe(3);
    expect(resolveResolution(0, 22.5)).toBe(2);
    expect(resolveResolution(0, 45)).toBe(1);
    expect(resolveResolution(0, 90)).toBe(0);
});
