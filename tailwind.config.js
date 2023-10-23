import { join } from 'node:path';
import { skeleton } from '@skeletonlabs/tw-plugin';
import typo from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    experimental: { optimizeUniversalDefaults: true },
    content: [
        './src/**/*.{css,html,js,svelte,ts}',
        join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
    ],
    plugins: [typo, skeleton({ themes: { preset: ['wintry'] } })],
};
