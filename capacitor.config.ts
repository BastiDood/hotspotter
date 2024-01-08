import { CapacitorConfig } from '@capacitor/cli';

export default {
    appId: 'ph.edu.upd.dcs.ndsg.hotspotter',
    appName: 'Hotspotter',
    webDir: 'build',
    plugins: { CapacitorHttp: { enabled: true } },
    android: { minWebViewVersion: 120 },
} satisfies CapacitorConfig;
