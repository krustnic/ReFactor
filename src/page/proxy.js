const isProxySymbol = Symbol("isProxy");

let isTracingCallbackEnabled = true;

export const enableTracingCallback = () => {
    isTracingCallbackEnabled = true;
};

export const disableTracingCallback = () => {
    isTracingCallbackEnabled = false;
};

export const isProxy = obj => {
    return obj[isProxySymbol] === true;
};

export const isTracingEnabled = () => Boolean(window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED);

export const toProxy = (obj, opts = {}) => {
    const { prefix = '', isDeep = false, callback } = opts;
    
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    
    if (isDeep) {
        for(const key in obj) {
            if (typeof obj[key] === 'object') {
                obj[key] = toProxy(obj[key], {
                    prefix: [prefix, key].filter(Boolean).join('.'),
                    isDeep,
                    callback
                })
            }
        }
    }
    
    return new Proxy(obj, {
        get(target, key, receiver) {
            if (key === isProxySymbol) {
                return true;
            }
    
            if (typeof key === 'symbol') {
                return Reflect.get(target, key, receiver);
            }

            if (isTracingCallbackEnabled && isTracingEnabled()) {
                const path = [prefix, key].filter(Boolean).join('.');
    
                const err = new Error();
                const stack = err.stack;
    
                callback && callback({
                    path,
                    stack
                });
            }
            
            return Reflect.get(target, key, receiver);
        }
    })
};