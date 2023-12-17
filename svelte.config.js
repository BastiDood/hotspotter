import 'dotenv/config';
import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
    extensions: ['.svelte'],
    preprocess: vitePreprocess(),
    // HACK: We turn off strict mode so that API endpoints can work.
    // HACK: Prefer a more sustainable adapter switcher solution.
    kit: { adapter: process.env.MOBILE === '1' ? adapterStatic({ strict: false }) : adapterVercel() },
};
