import { toProxy, enableTracingCallback, disableTracingCallback, isTracingEnabled } from './proxy';
import { toContentScript } from '../utils/communication';
import { addTrace } from './storage';
import * as messages from "../utils/messageTypes";

(function () {
    // On every page reload send current tracing state to devtools
    toContentScript(messages.INIT, {
        isTracingEnabled: isTracingEnabled()
    });
    
    window.__REFACTOR_WRAP_REDUCER__ = (fn) => {
        console.log('REFACTOR EXTENSION: wrap reducer');
    
        window.__REFACTOR_EXTENSION_IS_REDUCER_WRAPPED = true;
        toContentScript(messages.WRAPPED, {});
        
        return function() {
            const currentState = fn.apply(this, arguments);
    
            disableTracingCallback();
            
            if (! isTracingEnabled()) {
                return currentState;
            }
            
            const proxyState = toProxy(JSON.parse(JSON.stringify(currentState)), {
                isDeep: true,
                callback: opts => addTrace(opts)
            });
    
            enableTracingCallback();
            
            return proxyState;
        };
    };
})();