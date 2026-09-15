const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the component's actual hooks and event handlers with a controlled clock.
let slots = [], cursor = 0, pending = [], dirty = false, tree;
let nextTimer = 0;
const timers = new Map();
let observeVisibility, changePreference;
const preference = { matches: false, addEventListener: (_, fn) => { changePreference = fn; }, removeEventListener: () => {} };
const react = {
  useState(initial) {
    const key = cursor++;
    if (!(key in slots)) slots[key] = { value: initial };
    return [slots[key].value, value => {
      const next = typeof value === "function" ? value(slots[key].value) : value;
      if (!Object.is(next, slots[key].value)) { slots[key].value = next; dirty = true; }
    }];
  },
  useRef(initial) {
    const key = cursor++;
    return slots[key] ?? (slots[key] = { current: initial });
  },
  useEffect(fn, deps) {
    const key = cursor++;
    const previous = slots[key];
    if (!previous || deps.some((dep, i) => !Object.is(dep, previous.deps[i]))) {
      pending.push(() => { previous?.cleanup?.(); slots[key] = { deps, cleanup: fn() }; });
    }
  },
};
function jsx(type, props) {
  const node = { type, props };
  if (props.ref) props.ref.current = node;
  return node;
}
const exportsObject = {};
const document = { hidden: false };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/app/hackathon/PastHackathonGallery.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  exports: exportsObject, document, HTMLElement: class {},
  window: { matchMedia: () => preference, setInterval: fn => { timers.set(++nextTimer, fn); return nextTimer; }, clearInterval: id => timers.delete(id) },
  IntersectionObserver: class { constructor(fn) { observeVisibility = fn; } observe() { observeVisibility([{ isIntersecting: true }]); } disconnect() {} },
  require: name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx } : { default: "image" },
});
function render() {
  do { dirty = false; cursor = 0; pending = []; tree = exportsObject.default(); pending.forEach(fn => fn()); } while (dirty);
}
function nodes(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(child => nodes(child))];
}
function button(label) { return nodes(tree).find(node => node.type === "button" && node.props["aria-label"] === label); }
function current() { return nodes(tree).find(node => node.props?.["aria-roledescription"] === "slide" && !node.props["aria-hidden"]).props["aria-label"]; }
function click(label) { const node = button(label); assert.ok(node, label); node.props.onClick(); render(); }
function tick() { for (const fn of [...timers.values()]) fn(); render(); }
render();
assert.equal(timers.size, 1);
// Hover must not silently override an explicit Play action.
tree.props.onMouseEnter?.(); render();
click("Pause slideshow");
const stopped = current(); tick(); assert.equal(current(), stopped);
click("Play slideshow"); tick(); assert.notEqual(current(), stopped);
click("Next photo"); assert.ok(button("Play slideshow"));
const manual = current(); tick(); assert.equal(current(), manual);
click("Play slideshow");
observeVisibility([{ isIntersecting: false }]); render(); assert.equal(timers.size, 0);
observeVisibility([{ isIntersecting: true }]); render(); assert.equal(timers.size, 1);
document.hidden = true; const hidden = current(); tick(); assert.equal(current(), hidden); document.hidden = false;
tree.props.onFocusCapture({ target: {} }); render(); assert.equal(timers.size, 0);
click("Play slideshow");
tree.props.onKeyDown({ key: "ArrowRight", preventDefault() {} }); render(); assert.equal(timers.size, 0);
click("Play slideshow"); preference.matches = true; changePreference(); render(); assert.equal(timers.size, 0);
assert.equal(button("Pause slideshow"), undefined);
slots.forEach(slot => slot?.cleanup?.());
assert.equal(timers.size, 0);
console.log("PASS: pause/play under hover, manual navigation, keyboard focus, visibility, reduced motion, and timer cleanup");
