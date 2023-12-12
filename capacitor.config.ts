import { CapacitorConfig } from '@capacitor/cli';

export default {
    appId: 'ph.edu.up.dcs.ndsg.opsense',
    appName: 'Opportunistic Sensing',
    webDir: 'build',
    server: { androidScheme: 'https' },
    plugins: { CapacitorHttp: { enabled: true } },
    android: { minWebViewVersion: 120 },
} satisfies CapacitorConfig;
