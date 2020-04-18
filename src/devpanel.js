import * as message from './utils/messageTypes';

const data = {};

const render = (props = {}) => {
    const { isTracingEnabled, count = 0, status, sources } = props;
    
    document.querySelector('#record').textContent = isTracingEnabled ? 'Record: true' : 'Record: false';
    document.querySelector('#load').textContent = `Load (${count})`;
    document.querySelector('#status').textContent = `${status || ''}`;
    document.querySelector('#json').textContent = JSON.stringify(sources, null, 2);
};

const getTracingStatus = callback => {
    chrome.devtools.inspectedWindow.eval(
        'window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED === true;',
        null,
        isTracingEnabled => {
            callback({ isTracingEnabled })
        }
    );
};

getTracingStatus(({ isTracingEnabled }) => {
    data.isTracingEnabled = isTracingEnabled;
    render(data);
});

window.dispatch = msg => {
    if (msg.type === message.INIT) {
        const { isTracingEnabled } = msg.payload;
    
        data.isTracingEnabled = isTracingEnabled;
        data.count = 0;
    } else if (msg.type === message.TRACES_COUNT) {
        data.count = msg.payload;
    }
    
    render(data);
};

document.querySelector('#record').addEventListener('click', () => {
    const { isTracingEnabled } = data;
    
    chrome.devtools.inspectedWindow.eval(
        `window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED = ${! isTracingEnabled};`,
        null,
        () => {
            getTracingStatus(({ isTracingEnabled }) => {
                data.isTracingEnabled = isTracingEnabled;
                render(data);
            });
        }
    );
});

document.querySelector('#reload').addEventListener('click', () => {
    chrome.devtools.inspectedWindow.reload({
        injectedScript: 'window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED = true;'
    })
});

document.querySelector('#load').addEventListener('click', () => {
    data.status = 'processing';
    
    window.toBG({
        type: message.GET_TRACES,
        payload: {
            contentTabId: chrome.devtools.inspectedWindow.tabId
        }
    }, (msg = {}) => {
        const { payload = {} } = msg;
        
        data.status = 'loaded';
        data.sources = payload;
        
        render(data);
    });
    
    render(data);
});