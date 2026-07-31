/* eslint-disable global-require */
import { Assets } from 'react-native-ui-lib';

export const LoadAssets = () => {
  Assets.loadAssetsGroup('icons', {
    menu: require('./icons/menu.png'),
    clipboard: require('./icons/clipboard_solid.png'),
    trash: require('./icons/trash_solid.png'),
    barsOpen: require('./icons/bars_open.png'),
    barsClose: require('./icons/bars_close.png'),
    stop: require('./icons/stop_solid.png'),
    start: require('./icons/play_solid.png'),
    cpu: require('./icons/cpu_solid.png'),
    cpuCore: require('./icons/rect_solid.png'),
    memory: require('./icons/memory_solid.png'),
    blockchain: require('./icons/blockchain.png'),
    working: require('./icons/terminal.png'),
    save: require('./icons/save.png'),
    warning: require('./icons/warning.png'),
  });
};
