const { parseTraces } = require('../traces');
const records = require('./traces');

describe('parseTraces', () => {
    it('correctly parse', () => {
        const results = parseTraces(records);
        const item = results['config.deep.property'];
        
        expect(Array.isArray(item)).toBeTruthy();
        expect(Array.isArray(item[0])).toBeTruthy();
        expect(item[0][0]).toMatchObject({
            fileName: 'http://localhost:5000/static/js/main.4e535c83.chunk.js',
            lineNumber: 1,
            columnNumber: 432
        })
    });
});
