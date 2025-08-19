// Minimal Eel browser stub for GitHub Pages/static hosting
// Prevents runtime errors when Python/Eel backend is not present
// Provides no-op implementations of the functions used by the app

(function (global) {
  if (global.eel) return; // if real eel is injected, keep it

  const exposed = {};

  function expose(fn, name) {
    const key = name || fn.name;
    exposed[key] = fn;
    // opcional: expor em window para uso direto
    if (!global.eel) global.eel = {};
    if (!global.eel.exposed_functions) global.eel.exposed_functions = {};
    global.eel.exposed_functions[key] = fn;
  }

  function noop() {}

  function wrapReturn(value) {
    // Eel returns are awaitable/callable; here we mimic a callable that returns a Promise
    const callable = function () { return Promise.resolve(value); };
    return callable;
  }

  const eel = {
    // Identify that this is the browser stub (useful for static-mode fallbacks)
    isStub: true,
    // Called as eel.init()()
    init: () => wrapReturn(undefined),
    // App-specific calls used in JS
    playAssistantSound: () => wrapReturn(undefined),
    allCommands: (/* message */) => wrapReturn(undefined),
    // Expose functions from JS to Python (no-op here)
    expose: (fn, name) => { expose(fn, name); },
  };

  global.eel = eel;
})(window);
