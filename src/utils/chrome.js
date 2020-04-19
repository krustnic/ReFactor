let isTrackingEnabled = false;

export const isInExtension = () => typeof chrome !== "undefined" && chrome.runtime?.id;

export const ChromeWrapper = isInExtension() ? chrome : {
    devtools: {
        inspectedWindow: {
            tabId: 0,
            
            eval(source, params, callback) {
                console.log('chrome.devtools.inspectedWindow.eval');
                
                if (source === 'window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED === true;') {
                    return callback && callback(isTrackingEnabled);
                }
                
                isTrackingEnabled = ! isTrackingEnabled;
                callback && callback(isTrackingEnabled);
            },
            
            reload() {
                console.log('chrome.devtools.inspectedWindow.reload');
            }
        }
    }
};