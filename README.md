# ReFactor!

Chrome extension that allows to track which source files are using specific redux store item. It is useful in large code base to determine values that actually used in project.

# TodoMVC demo

[![TodoMVC demo](https://img.youtube.com/vi/jElO0m6JP8Y/maxresdefault.jpg)](https://www.youtube.com/watch?v=jElO0m6JP8Y)

# Installation

1. Install browser extension as usual
2. Wrap rootReducer with function provided by extension:
```js
const store = createStore(window.__REFACTOR_WRAP_REDUCER__ ?
    window.__REFACTOR_WRAP_REDUCER__(rootReducer) :
    rootReducer
);
```