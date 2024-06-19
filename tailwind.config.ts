import { type CustomThemeConfig, skeleton } from '@skeletonlabs/tw-plugin';
import type { Config } from 'tailwindcss';
import { join } from 'node:path';

const theme = {
    name: 'hotspotter',
    properties: {
        // =~= Theme Properties =~=
        '--theme-font-family-base': 'system-ui',
        '--theme-font-family-heading': 'system-ui',
        '--theme-font-color-base': '0 0 0',
        '--theme-font-color-dark': '255 255 255',
        '--theme-rounded-base': '9999px',
        '--theme-rounded-container': '8px',
        '--theme-border-base': '1px',
        // =~= Theme On-X Colors =~=
        '--on-primary': '0 0 0',
        '--on-secondary': '0 0 0',
        '--on-tertiary': '0 0 0',
        '--on-success': '0 0 0',
        '--on-warning': '0 0 0',
        '--on-error': '255 255 255',
        '--on-surface': '255 255 255',
        // =~= Theme Colors  =~=
        // primary | #FF7538
        '--color-primary-50': '255 234 225', // #ffeae1
        '--color-primary-100': '255 227 215', // #ffe3d7
        '--color-primary-200': '255 221 205', // #ffddcd
        '--color-primary-300': '255 200 175', // #ffc8af
        '--color-primary-400': '255 158 116', // #ff9e74
        '--color-primary-500': '255 117 56', // #FF7538
        '--color-primary-600': '230 105 50', // #e66932
        '--color-primary-700': '191 88 42', // #bf582a
        '--color-primary-800': '153 70 34', // #994622
        '--color-primary-900': '125 57 27', // #7d391b
        // secondary | #ffeb8a
        '--color-secondary-50': '255 252 237', // #fffced
        '--color-secondary-100': '255 251 232', // #fffbe8
        '--color-secondary-200': '255 250 226', // #fffae2
        '--color-secondary-300': '255 247 208', // #fff7d0
        '--color-secondary-400': '255 241 173', // #fff1ad
        '--color-secondary-500': '255 235 138', // #ffeb8a
        '--color-secondary-600': '230 212 124', // #e6d47c
        '--color-secondary-700': '191 176 104', // #bfb068
        '--color-secondary-800': '153 141 83', // #998d53
        '--color-secondary-900': '125 115 68', // #7d7344
        // tertiary | #ce97af
        '--color-tertiary-50': '248 239 243', // #f8eff3
        '--color-tertiary-100': '245 234 239', // #f5eaef
        '--color-tertiary-200': '243 229 235', // #f3e5eb
        '--color-tertiary-300': '235 213 223', // #ebd5df
        '--color-tertiary-400': '221 182 199', // #ddb6c7
        '--color-tertiary-500': '206 151 175', // #ce97af
        '--color-tertiary-600': '185 136 158', // #b9889e
        '--color-tertiary-700': '155 113 131', // #9b7183
        '--color-tertiary-800': '124 91 105', // #7c5b69
        '--color-tertiary-900': '101 74 86', // #654a56
        // success | #84cc16
        '--color-success-50': '237 247 220', // #edf7dc
        '--color-success-100': '230 245 208', // #e6f5d0
        '--color-success-200': '224 242 197', // #e0f2c5
        '--color-success-300': '206 235 162', // #ceeba2
        '--color-success-400': '169 219 92', // #a9db5c
        '--color-success-500': '132 204 22', // #84cc16
        '--color-success-600': '119 184 20', // #77b814
        '--color-success-700': '99 153 17', // #639911
        '--color-success-800': '79 122 13', // #4f7a0d
        '--color-success-900': '65 100 11', // #41640b
        // warning | #EAB308
        '--color-warning-50': '252 244 218', // #fcf4da
        '--color-warning-100': '251 240 206', // #fbf0ce
        '--color-warning-200': '250 236 193', // #faecc1
        '--color-warning-300': '247 225 156', // #f7e19c
        '--color-warning-400': '240 202 82', // #f0ca52
        '--color-warning-500': '234 179 8', // #EAB308
        '--color-warning-600': '211 161 7', // #d3a107
        '--color-warning-700': '176 134 6', // #b08606
        '--color-warning-800': '140 107 5', // #8c6b05
        '--color-warning-900': '115 88 4', // #735804
        // error | #ac1b38
        '--color-error-50': '243 221 225', // #f3dde1
        '--color-error-100': '238 209 215', // #eed1d7
        '--color-error-200': '234 198 205', // #eac6cd
        '--color-error-300': '222 164 175', // #dea4af
        '--color-error-400': '197 95 116', // #c55f74
        '--color-error-500': '172 27 56', // #ac1b38
        '--color-error-600': '155 24 50', // #9b1832
        '--color-error-700': '129 20 42', // #81142a
        '--color-error-800': '103 16 34', // #671022
        '--color-error-900': '84 13 27', // #540d1b
        // surface | #564c48
        '--color-surface-50': '230 228 228', // #e6e4e4
        '--color-surface-100': '221 219 218', // #dddbda
        '--color-surface-200': '213 210 209', // #d5d2d1
        '--color-surface-300': '187 183 182', // #bbb7b6
        '--color-surface-400': '137 130 127', // #89827f
        '--color-surface-500': '86 76 72', // #564c48
        '--color-surface-600': '77 68 65', // #4d4441
        '--color-surface-700': '65 57 54', // #413936
        '--color-surface-800': '52 46 43', // #342e2b
        '--color-surface-900': '42 37 35', // #2a2523
    },
} satisfies CustomThemeConfig;

export default {
    darkMode: 'class',
    content: [
        './src/**/*.{html,js,svelte,ts}',
        // eslint-disable-next-line no-undef
        join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
    ],
    safelist: ['container'],
    plugins: [skeleton({ themes: { custom: [theme] } })],
} satisfies Config;
