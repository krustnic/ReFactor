# ReFactor!

Chrome extension that allows to track which source files are using specific redux store item. It is useful in large code base to determine values that actually used in project.

## TodoMVC demo

[![TodoMVC demo](https://img.youtube.com/vi/jElO0m6JP8Y/maxresdefault.jpg)](https://www.youtube.com/watch?v=jElO0m6JP8Y)

## Installation

1. Install unpacked browser extension as usual (from [releases](https://github.com/krustnic/ReFactor/releases))
2. Wrap rootReducer with function provided by extension:
```js
const store = createStore(window.__REFACTOR_WRAP_REDUCER__ ?
    window.__REFACTOR_WRAP_REDUCER__(rootReducer) :
    rootReducer
);
```

**Note:** you should have sourcemap files with name: <bundle_name>.js.map

## Contribution

Development:
```bash
npm run watch
```

Build new release:

1. Update version in manifest.json
2. If new core extension files were added - update extension-files.txt
3. Build new package:
```bash
npm run package
```