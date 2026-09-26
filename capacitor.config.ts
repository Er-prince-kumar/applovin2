import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.linkearn.publisher',
  appName: 'LinkEarn',
  webDir: 'public',
  server: {
    // In local development or remote hosting, points the mobile app webview to the LinkEarn server
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000',
    cleartext: true,
  },
  android: {
    backgroundColor: '#0B0F17',
    allowMixedContent: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B0F17',
    },
  },
};

export default config;
