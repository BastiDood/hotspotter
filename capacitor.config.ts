import { CapacitorConfig } from '@capacitor/cli';

export default {
    appId: 'ph.edu.upd.dcs.ndsg.hotspotter',
    appName: 'Hotspotter',
    webDir: 'build',
    plugins: {
        CapacitorCookies: { enabled: true },
        CapacitorHttp: { enabled: true },
    },
} satisfies CapacitorConfig;
