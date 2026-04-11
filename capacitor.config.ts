import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.westgojjam.police',
  appName: 'West Gojjam Police',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://west-gojjame-police-5svt.vercel.app/',
    cleartext: true
  }
};

export default config;
