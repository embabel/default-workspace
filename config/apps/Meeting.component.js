// Rich visual for a Meeting (a MeetingSignal node) in the typed-entity host.
// Reads the nested CalendarEvent from `entity.fields.eventJson` for the real
// detail — when, where, how to join, who's coming — falling back to the flat
// fields when the event blob is absent. Pure visual: returns one HTMLElement.
//
// export default (entity, ctx) => HTMLElement   (ctx = { el, chip })

export default function Meeting(entity, ctx) {
  const { el } = ctx;
  const f = entity.fields || {};
  const ev = parse(f.eventJson);

  const title = (ev.title || entity.name || "Meeting").trim();
  const tz = ev.timeZone || f.timeZone || "UTC";
  const when = formatWhen(ev.start || f.start || f.occurredAt, ev.end, ev.isAllDay, tz);
  const where = ev.location || f.location || null;
  const join = ev.joinUrl || (typeof f.sourceUrl === "string" && /^https?:/.test(f.sourceUrl) ? f.sourceUrl : null);
  const people = attendeesOf(ev);

  const body = el("div", "m-body");

  const head = el("div", "m-head");
  head.appendChild(el("span", "m-icon", "📅"));
  head.appendChild(el("div", "m-title", title));
  if (ev.isRecurring) head.appendChild(el("span", "m-badge", "recurring"));
  body.appendChild(head);

  if (when) body.appendChild(row(el, "🕑", when));
  if (where) body.appendChild(row(el, "📍", where));

  if (join) {
    const a = el("a", "m-join", "Join");
    a.setAttribute("href", join);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
    const r = el("div", "m-row");
    r.appendChild(el("span", "m-bullet", "🔗"));
    r.appendChild(a);
    body.appendChild(r);
  }

  if (people.length) {
    const wrap = el("div", "m-att");
    wrap.appendChild(el("span", "m-bullet", "👥"));
    const chips = el("div", "m-chips");
    people.slice(0, 8).forEach((p) => {
      const c = el("span", "m-chip" + (p.isOrganizer ? " m-org" : "") + (p.declined ? " m-declined" : ""), p.name);
      if (p.isOrganizer) c.setAttribute("title", "Organizer");
      chips.appendChild(c);
    });
    if (people.length > 8) chips.appendChild(el("span", "m-more", `+${people.length - 8}`));
    wrap.appendChild(chips);
    body.appendChild(wrap);
  }

  body.appendChild(styleOnce(el));
  return body;
}

function parse(json) {
  if (!json || typeof json !== "string") return {};
  try { return JSON.parse(json) || {}; } catch (e) { return {}; }
}

function attendeesOf(ev) {
  const list = Array.isArray(ev.attendees) ? ev.attendees : [];
  return list
    .filter((a) => a && !a.isResource)
    .map((a) => ({
      name: a.displayName || a.email || "someone",
      isOrganizer: !!a.isOrganizer,
      declined: a.response === "DECLINED",
    }));
}

// Format a start (and optional end) in the meeting's own zone. Times are ISO
// instants; all-day events show the date only.
function formatWhen(start, end, isAllDay, tz) {
  if (!start) return null;
  const s = new Date(start);
  if (isNaN(s.getTime())) return null;
  const opts = isAllDay
    ? { timeZone: tz, weekday: "short", day: "numeric", month: "short" }
    : { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
  let out;
  try { out = new Intl.DateTimeFormat("en-AU", opts).format(s); } catch (e) { out = s.toISOString().slice(0, 16).replace("T", " "); }
  if (!isAllDay && end) {
    const e = new Date(end);
    if (!isNaN(e.getTime())) {
      try { out += " – " + new Intl.DateTimeFormat("en-AU", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(e); } catch (x) { /* skip */ }
    }
  }
  return out;
}

function row(el, bullet, text) {
  const r = el("div", "m-row");
  r.appendChild(el("span", "m-bullet", bullet));
  r.appendChild(el("span", "m-val", text));
  return r;
}

// Scoped styles, injected once per document.
function styleOnce(el) {
  if (document.getElementById("meeting-component-style")) return el("span");
  const s = document.createElement("style");
  s.id = "meeting-component-style";
  s.textContent = `
    .m-body{display:flex;flex-direction:column;gap:5px;font-size:12.5px;}
    .m-head{display:flex;align-items:center;gap:7px;}
    .m-icon{font-size:14px;}
    .m-title{font-weight:600;font-size:13.5px;line-height:1.2;}
    .m-badge{font-size:9px;text-transform:uppercase;letter-spacing:.05em;color:var(--accent,#63c0f5);border:1px solid rgba(99,192,245,.3);border-radius:8px;padding:1px 6px;}
    .m-row{display:flex;align-items:center;gap:7px;color:var(--muted,#9aa);}
    .m-bullet{flex:0 0 auto;opacity:.85;}
    .m-val{color:var(--text,#dde);}
    .m-join{color:var(--accent,#63c0f5);text-decoration:none;border:1px solid rgba(99,192,245,.4);border-radius:6px;padding:1px 9px;font-size:12px;}
    .m-join:hover{background:rgba(99,192,245,.12);}
    .m-att{display:flex;align-items:flex-start;gap:7px;}
    .m-chips{display:flex;flex-wrap:wrap;gap:4px;}
    .m-chip{font-size:11px;border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:1px 7px;color:var(--text,#dde);}
    .m-chip.m-org{border-color:rgba(99,192,245,.45);color:var(--accent,#63c0f5);}
    .m-chip.m-declined{opacity:.5;text-decoration:line-through;}
    .m-more{font-size:11px;color:var(--muted,#9aa);align-self:center;}
  `;
  document.head.appendChild(s);
  return el("span");
}
