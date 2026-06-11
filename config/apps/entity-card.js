// entity-card.js — modular typed cards from HTML fragments, no framework.
//
// The platform already has components: <template> fragments for markup, Shadow
// DOM for scoped styles, and declarative binding. This ~40-line helper wraps that
// so a component file is just markup + CSS + an optional bind hook — no React, no
// build step, no virtual DOM.
//
// A component (markup in a SEPARATE .tpl file, fetched once at module load):
//
//   import { cardComponent } from '/apps/entity-card.js';
//   export default await cardComponent({
//     fragmentUrl: '/apps/Person.tpl',      // the HTML fragment, its own file
//     styles:      `.x{ ... }`,             // scoped to this card (Shadow DOM)
//     bind(root, entity, fields) { ... },   // optional: computed bits
//   });
//
// (An inline `fragment:` string is also accepted — handy for a one-off.)
//
// Declarative bindings inside the fragment (no JS needed for the simple cases):
//   data-text="path"        textContent from fields[path] ?? entity[path]
//   data-when="path"        drop the node when that value is empty/false
//   data-attr="attr:path;…" set an attribute from a field (e.g. href:url)
//
// Returns a render fn (entity, ctx) -> HTMLElement — the host's component
// contract — so nothing in the host changes. All text goes in via textContent /
// setAttribute, so entity data can never inject markup.

export async function cardComponent({ fragment, fragmentUrl, styles = '', bind } = {}) {
  let html = fragment || '';
  if (fragmentUrl) {
    try {
      const r = await fetch(fragmentUrl, { credentials: 'same-origin' });
      html = r.ok ? await r.text() : `<div style="color:#fb6563">fragment ${fragmentUrl} → HTTP ${r.status}</div>`;
    } catch (e) {
      html = `<div style="color:#fb6563">fragment ${fragmentUrl} failed to load</div>`;
    }
  }
  const tpl = document.createElement('template');
  tpl.innerHTML = `<style>:host{display:block}${styles}</style>${html}`;
  return (entity) => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.appendChild(tpl.content.cloneNode(true));
    applyBindings(root, entity || {});
    if (bind) { try { bind(root, entity || {}, (entity && entity.fields) || {}); } catch (e) { /* ignore */ } }
    return host;
  };
}

function valueOf(entity, path) {
  const f = entity.fields || {};
  return f[path] !== undefined ? f[path] : entity[path];
}

function applyBindings(root, entity) {
  root.querySelectorAll('[data-text]').forEach((n) => {
    const v = valueOf(entity, n.getAttribute('data-text'));
    n.textContent = v == null ? '' : String(v);
  });
  root.querySelectorAll('[data-when]').forEach((n) => {
    const v = valueOf(entity, n.getAttribute('data-when'));
    if (v == null || v === '' || v === false) n.remove();
  });
  root.querySelectorAll('[data-attr]').forEach((n) => {
    n.getAttribute('data-attr').split(';').forEach((pair) => {
      const [attr, path] = pair.split(':').map((s) => s && s.trim());
      const v = valueOf(entity, path);
      if (attr && v != null && v !== '') n.setAttribute(attr, String(v));
    });
  });
}
