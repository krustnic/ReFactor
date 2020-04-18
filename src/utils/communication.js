export const toContentScript = (type, msg = {}) => {
    window.postMessage({
        type,
        payload: JSON.stringify(msg),
        namespace: 'refactor-extension'
    }, '*');
};

export const isFromPageScript = event => {
    return event.source === window && event.data.namespace === 'refactor-extension';
};
