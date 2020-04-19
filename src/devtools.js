import * as messages from './utils/messageTypes';

const generateToken = () => {
    const time = (new Date()).getTime();
    const random = Math.random().toString(36);
    return `${time}.${random}`;
};

chrome.devtools.panels.create(
    "ReFactor!",
    "assets/icon.png",
    "html/devpanel.html",
    extensionPanel => {
        let _window;
        const callbacks = {};
        const { tabId } = chrome.devtools.inspectedWindow;
        const port = chrome.runtime.connect({
            name: `devtools-${tabId}`
        });
        
        // On message from background page
        port.onMessage.addListener(function(msg) {
            const { token } = msg;
            const cb = callbacks[token];
            
            cb && cb(msg) || _window && _window.dispatch(msg);
        });
        
        extensionPanel.onShown.addListener(function tmp(panelWindow) {
            _window = panelWindow;
            // This listener should be invoked only once
            extensionPanel.onShown.removeListener(tmp);
            
            // Could be invoked from devpanel
            _window.toBG = (msg, cb) => {
                const token = generateToken();
                
                msg.token = token;
                callbacks[token] = cb;
                
                port.postMessage(msg);
            };
        });
    }
);