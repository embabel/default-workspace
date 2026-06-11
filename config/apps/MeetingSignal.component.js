// MeetingSignal card — the "Schedule" rows in the brief. Standard type → ships in
// the workspace. HTML fragment + scoped styles + a bind hook that formats the UTC
// `start` in the user's own timezone (Intl runs in the user's browser). No
// framework.

import { cardComponent } from '/apps/entity-card.js';

const styles = `
  .meet{display:flex;flex-direction:column;gap:5px;font-family:'Inter',system-ui,sans-serif;}
  .meet-time{font-family:'JetBrains Mono',monospace;font-size:12px;color:#63c0f5;letter-spacing:.02em;}
  .meet-title{font-size:15px;font-weight:600;color:#fff;line-height:1.2;}
  .meet-loc{font-size:12.5px;color:#8b8b96;}
`;

function formatStart(start) {
  if (!start) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(new Date(start));
  } catch (e) { return String(start); }
}

export default await cardComponent({
  fragmentUrl: '/apps/MeetingSignal.tpl',
  styles,
  bind(root, entity, f) {
    const time = formatStart(f.start);
    const t = root.querySelector('[data-time]');
    if (time) t.textContent = time; else t.remove();

    root.querySelector('[data-title]').textContent = f.subject || entity.name || '(meeting)';

    const loc = root.querySelector('[data-loc]');
    if (f.location) loc.textContent = String(f.location); else loc.remove();
  },
});
