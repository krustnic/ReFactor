import * as messages from '../utils/messageTypes';
import {
    parseTraces,
    getSourcePlacesMap,
    downloadSourceMapsAsync,
    applySourceMapsAsync,
    buildTree
} from './traces';

const devtoolPorts = {};

// Listen messages from: content script, popup window, devtools
chrome.runtime.onConnect.addListener(port => {
    const [ name ] = port.name.split('-');
    
    switch (name) {
        case 'content':
            handleContentMessages(port);
            break;
        case 'devtools':
            handleDevtoolsMessages(port);
            break;
    }
});

const handleContentMessages = port => {
    port.onMessage.addListener((msg, stats) => {
        const tabId = stats?.sender?.tab?.id ?? 0;
        
        switch (msg.type) {
            case messages.INIT:
                devtoolPorts[tabId] && devtoolPorts[tabId].postMessage(msg);
                break;
            case messages.TRACES_COUNT:
                devtoolPorts[tabId] && devtoolPorts[tabId].postMessage(msg);
                break;
        }
    });
};

const handleDevtoolsMessages = port => {
    const [ name, tabId ] = port.name.split('-');
    
    if (! tabId) {
        return;
    }
    
    devtoolPorts[tabId] = port;
    
    port.onDisconnect.addListener(() => {
        delete devtoolPorts[tabId];
    });
    
    port.onMessage.addListener(msg => {
        switch (msg.type) {
            case messages.GET_TRACES:
                const { token } = msg;
                const { contentTabId } = msg.payload;
                
                chrome.tabs.sendMessage(contentTabId, {
                    type: messages.GET_TRACES
                }, async (traces) => {
                    const parsed = parseTraces(traces);
                    const places = getSourcePlacesMap(parsed);
                    const fileNames = Object.keys(places);
                    const maps = await downloadSourceMapsAsync(fileNames);
                    const sources = await applySourceMapsAsync(places, maps);
                    const tree = buildTree(parsed, sources);
                    
                    port.postMessage({
                        token,
                        payload: tree
                    });
                });
                
                break;
        }
    });
};