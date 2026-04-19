import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.westgojjam.police',
  appName: 'West Gojjam Zone Police Management System',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      backgroundColor: '#002366',
      style: 'DARK',
      overlaysWebView: false
    }
  }
};

export default config;
