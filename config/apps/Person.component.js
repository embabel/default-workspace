// Person card — initials avatar, name, role/org, email. Standard type → ships in
// the workspace (config/apps). Markup is an HTML fragment; styles are scoped via
// Shadow DOM; the computed bits (initials, mailto, the role line) are the bind
// hook. No framework.

import { cardComponent } from '/apps/entity-card.js';

const styles = `
  .person{display:flex;align-items:center;gap:11px;font-family:'Inter',system-ui,sans-serif;}
  .avatar{flex:0 0 auto;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;
    justify-content:center;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;
    color:#0a0a0f;background:linear-gradient(150deg,#63c0f5,#9f77cd);}
  .meta{min-width:0;}
  .name{font-size:15px;font-weight:600;color:#fff;line-height:1.2;overflow-wrap:anywhere;}
  .sub{font-size:12px;color:#8b8b96;margin-top:1px;}
  .email{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:11.5px;
    color:#63c0f5;text-decoration:none;margin-top:2px;}
  .email:hover{text-decoration:underline;}
`;

export default await cardComponent({
  fragmentUrl: '/apps/Person.tpl',
  styles,
  bind(root, entity, f) {
    const initials = String(entity.name || '?').trim().split(/\s+/)
      .map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
    root.querySelector('[data-avatar]').textContent = initials;

    const role = f.role || f.title || f.org || f.organization || f.company;
    const sub = root.querySelector('[data-sub]');
    if (role) sub.textContent = String(role); else sub.remove();

    const email = f.email || f.emailAddress;
    const a = root.querySelector('[data-email]');
    if (email) { a.textContent = email; a.setAttribute('href', 'mailto:' + email); } else a.remove();
  },
});
