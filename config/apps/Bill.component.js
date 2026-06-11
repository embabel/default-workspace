// Bill card — the "Deadlines" in the brief. Standard type → ships in the
// workspace. HTML fragment + Shadow-DOM-scoped styles + a bind hook for the
// amount / due / badge. No framework.

import { cardComponent } from '/apps/entity-card.js';

const styles = `
  .bill{display:flex;align-items:flex-start;gap:11px;font-family:'Inter',system-ui,sans-serif;}
  .bill-icon{flex:0 0 auto;color:#d8b27a;font-size:15px;line-height:1.4;}
  .bill-main{flex:1;min-width:0;}
  .bill-name{font-size:15px;font-weight:600;color:#fff;line-height:1.2;overflow-wrap:anywhere;}
  .bill-amount{font-family:'JetBrains Mono',monospace;font-size:17px;color:#f4f4f4;margin-top:3px;}
  .bill-due{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#8b8b96;margin-top:3px;}
  .bill-badge{align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:600;
    letter-spacing:.08em;padding:3px 7px;border-radius:999px;border:1px solid transparent;}
  .bill-overdue{color:#fb6563;background:rgba(251,101,99,.12);border-color:rgba(251,101,99,.3);}
  .bill-paid{color:#22c55e;background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);}
`;

export default await cardComponent({
  fragmentUrl: '/apps/Bill.tpl',
  styles,
  bind(root, entity, f) {
    root.querySelector('[data-name]').textContent = f.name || entity.name || 'Bill';

    const amt = (f.amount == null || f.amount === '') ? '' : ((f.currency ? f.currency + ' ' : '') + f.amount).trim();
    const amtEl = root.querySelector('[data-amount]');
    if (amt) amtEl.textContent = amt; else amtEl.remove();

    const dueEl = root.querySelector('[data-due]');
    if (f.dueDate) dueEl.textContent = 'Due ' + f.dueDate; else dueEl.remove();

    const badge = root.querySelector('[data-badge]');
    const paid = f.isPaid === true || String(f.isPaid) === 'true';
    const today = new Date().toISOString().slice(0, 10);
    if (paid) { badge.textContent = 'PAID'; badge.classList.add('bill-paid'); }
    else if (f.dueDate && String(f.dueDate) < today) { badge.textContent = 'OVERDUE'; badge.classList.add('bill-overdue'); }
    else badge.remove();
  },
});
