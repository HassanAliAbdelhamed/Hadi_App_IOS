// IMPORTANT: gesture-handler must be the very first import
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import service from './service';

// Register playback service — synchronous, must be called before registerRootComponent
try {
  TrackPlayer.registerPlaybackService(() => service);
  console.log('Playback service registered successfully');
} catch (e) {
  console.warn('Error in TrackPlayer setup:', e.message);
}

AppRegistry.registerComponent('main', () => App);
