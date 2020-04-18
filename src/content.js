import rawPageContent from '!!raw-loader!../dist/page.bundle.js';

import * as messages from './utils/messageTypes';
import {isFromPageScript, toContentScript} from './utils/communication';

// Functions that should be invoked in the same context as page scripts
const script = document.createElement('script');
script.textContent = rawPageContent;
(document.head || document.documentElement).appendChild(script);
script.remove();

const port = chrome.runtime.connect({
    name: 'content'
});

let storage = [];

// Proxy message to background script
window.addEventListener('message', event => {
    if (isFromPageScript(event)) {
        const msg = {
            type: event.data.type,
            payload: JSON.parse(event.data.payload)
        };
        
        switch (msg.type) {
            case messages.STACKTRACES:
                storage = storage.concat(msg.payload);
                
                port.postMessage({
                    type: messages.TRACES_COUNT,
                    payload: storage.length
                });
                break;
            default:
                port.postMessage(msg);
                break;
        }
    }
}, false);

// Listen messages from extension
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.type === messages.GET_TRACES) {
        sendResponse(storage);
        
        storage = [];
    }
});