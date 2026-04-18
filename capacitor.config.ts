import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.westgojjam.police',
  appName: 'West Gojjam Police',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1A237E',
      overlaysWebView: false
    }
  }
};

export default config;
