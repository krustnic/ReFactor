import * as sourceMap from 'source-map';
import * as ErrorStackParser from 'error-stack-parser';

const sourceMapConsumer = sourceMap.SourceMapConsumer;

sourceMapConsumer.initialize({
    'lib/mappings.wasm': 'https://unpkg.com/source-map@0.7.3/lib/mappings.wasm',
});

export const parseTraces = records => {
    const result = {};
    
    for(const { path, stack } of records) {
        const stacktraces = ErrorStackParser.parse({ stack });
        const batch = [];
    
        for (const { fileName = null, lineNumber = -1, columnNumber = -1 } of stacktraces) {
            if (! fileName) continue;
            
            batch.push({
                fileName,
                lineNumber,
                columnNumber
            });
        }
    
        result[path] = result[path] || [];
        result[path].push(batch);
    }
    
    return result;
};

export const getSourcePlacesMap = result => {
    const sources = {};
    
    for (const path in result) {
        const traces = result[path];
        
        for (const trace of traces) {
            for (const { fileName, lineNumber, columnNumber } of trace) {
                sources[fileName] = sources[fileName] || {};
                sources[fileName][`${fileName}:${lineNumber}:${columnNumber}`] = {
                    lineNumber,
                    columnNumber,
                };
            }
        }
    }
    
    return sources;
};

export const downloadSourceMapsAsync = async (fileNames) => {
    const maps = {};
    
    for (const fileName of fileNames) {
        if (! maps[fileName]) {
            try {
                const response = await fetch(`${fileName}.map`);
                maps[fileName] = await response.json();
            } catch (e) {
                continue;
            }
        }
    }
    
    return maps;
};

export const applySourceMapsAsync = async (sourcePlaces, maps) => {
    const results = {};
    const sourceFiles = Object.keys(sourcePlaces);
    
    for(const fileName of sourceFiles) {
        if (! maps[fileName]) {
            continue;
        }
        
        await sourceMapConsumer.with(maps[fileName], null, (consumer) => {
            for (const place in sourcePlaces[fileName]) {
                const { lineNumber, columnNumber } = sourcePlaces[fileName][place];
    
                const sourceInfo = consumer.originalPositionFor({
                    line: lineNumber,
                    column: columnNumber,
                });
    
                const { source, line, column } = sourceInfo;
    
                if (! source || source.indexOf('node_modules') !== -1) {
                    continue;
                }
    
                results[place] = {
                    source: source.replace('webpack://', ''),
                    line,
                    column
                };
            }
        });
    }
    
    return results;
};

export const buildTree = (parsed, sourceMapResults) => {
    const result = {};
    
    for(const path in parsed) {
        result[path] = {};
        
        for(const stack of parsed[path]) {
            let tree = result[path];
        
            stack.reverse().forEach(trace => {
                const { fileName, lineNumber, columnNumber } = trace;
                const place = `${fileName}:${lineNumber}:${columnNumber}`;
                
                if (! sourceMapResults[place]) {
                    return;
                }
                
                const { source, line, column } = sourceMapResults[place];
                const decodedPlace = `${source}:${line}:${column}`;
                
                tree[decodedPlace] = tree[decodedPlace] || {};
                tree = tree[decodedPlace]
            });
        }
    }
    
    return result;
};