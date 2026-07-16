import { Platform } from 'react-native';

if (__DEV__ && Platform.OS === 'web') {
  require('./metroHmrStability.web');
}
