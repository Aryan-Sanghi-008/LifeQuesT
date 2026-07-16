if (__DEV__) {
  require('./src/dev/metroHmrStability');
}
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
