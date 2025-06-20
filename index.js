import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import service from './service'; // هذا ملف service.ts

TrackPlayer.registerPlaybackService(() => service);

registerRootComponent(App);
