import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
    extensions: ['.svelte'],
    preprocess: vitePreprocess(),
    // HACK: We turn off strict mode so that API endpoints can work.
    kit: { adapter: adapter({ strict: false }) },
};
