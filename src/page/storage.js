import debounce from 'lodash/debounce';

import { toContentScript } from '../utils/communication';
import * as messages from '../utils/messageTypes';

let storage = [];

const sendTracesCount = debounce(() => {
    toContentScript(messages.STACKTRACES, storage);
    
    storage = [];
}, 500);

export const addTrace = data => {
    storage.push(data);
    
    sendTracesCount();
};