const { toProxy, isProxy } = require('../proxy');

const lastCallParams = (fn, argNumber = 0) => fn.mock.calls[fn.mock.calls.length - 1][0];
const callsCount = fn => fn.mock.calls.length;

describe('toProxy', () => {
    const obj = {
        item: {
            deep: {
                path: null
            }
        },
        topLevel: {}
    };
    
    it('return correct path isDeep === false', () => {
        const callback = jest.fn();
        
        const proxy = toProxy(obj, { isDeep: false, callback });
        
        const value = proxy.item.deep.path;
        const params = lastCallParams(callback);
        
        expect(params.path).toBe('item');
    });
    
    it('return correct path isDeep === true', () => {
        const callback = jest.fn();
        
        const proxy = toProxy(obj, { isDeep: true, callback });
        
        const value = proxy.item.deep.path;
        const params = lastCallParams(callback);
        
        expect(params.path).toBe('item.deep.path');
    });
    
    it('return correct calls count isDeep === true', () => {
        const callback = jest.fn();
        
        const proxy = toProxy(obj, { isDeep: true, callback });
        
        const value = proxy.item.deep.path;
        const count = callsCount(callback);
        
        expect(count).toBe(3);
    });
});

describe('isProxy', () => {
    it('determine non-proxy object', () => {
        const obj = {};
        
        expect(isProxy(obj)).toBe(false);
    });
    
    it('do not determine transparent proxy object', () => {
        const obj = new Proxy({}, {});
        
        expect(isProxy(obj)).toBe(false);
    });
    
    it('determine "toProxy" proxy object', () => {
        const obj = toProxy({});
        
        expect(isProxy(obj)).toBe(true);
    })
});