import { Lens, hours } from "@embabel/runtime-types";
import type { LensResult, EntityRef } from "@embabel/runtime-types";

/**
 * The daily briefing as a typed program lens. Same pipeline as the cypherscript
 * `briefing`: selection → noise gate → deterministic KG ranking → editorial prose
 * that respects the ranking; deadlines from real unpaid bills; meetings always.
 *
 * The shape is what differs: a `Lens<BriefingParams, BriefingView>` whose
 * `retrieve()` returns `{ focus, data }` and NEVER calls `gateway.lens.*`.
 * Retrieval is decoupled from presentation — the host bridges the typed result to
 * the focus / present surfaces. Because it's a plain class it composes (a digest
 * lens can `new BriefingLens({ lookbackDays: 7 }).__bind(this.gateway).retrieve()`).
 *
 * Authored in TS importing `@embabel/runtime-types` exactly like a pack type
 * imports `Entity`. The build (esbuild) strips the import and the `Lens` base
 * becomes the host-injected ambient — the same runtime substrate a
 * dynamically-generated lens runs against.
 */

interface BriefingParams {
  /** ISO date — brief since this point. */
  since?: string;
  /** Window size when `since` is absent (default 30). */
  lookbackDays?: number;
}

interface BriefSection {
  label: string;
  type: string;
}

interface BriefingView {
  date: string;
  headline: string;
  dek: string;
  leadStory: { title: string; body: string };
  schedule: unknown[];
  openLoops: unknown[];
  deadlines: unknown[];
  closingThought: string | null;
  sections: BriefSection[];
}

/** The gateway slice this lens uses, typed locally (cf. pack types' `api` getter). */
interface BriefingGateway {
  kg: { query(a: { cypher: string; params: string }): Promise<any[]> };
  ai: {
    classify(a: { instruction: string; items: string[]; categories: string; role: string }): Promise<any[]>;
    complete(a: { prompt: string; role: string }): Promise<any>;
  };
}

export class BriefingLens extends Lens<BriefingParams, BriefingView> {
  // A morning brief ages slowly and is LLM-expensive (classify + compose) — cache
  // the whole result for hours so opening it, switching its views, or revisiting
  // it doesn't re-run the model. Per-user (the default scope): it's the user's KG.
  readonly cache = { ttlSeconds: hours(4) };

  private get api(): BriefingGateway {
    return this.gateway as unknown as BriefingGateway;
  }

  async retrieve(): Promise<LensResult<BriefingView>> {
    const gateway = this.api;
    const lensArgs = this.params || {};

    const today = new Date().toISOString().slice(0, 10);
    const days = lensArgs.lookbackDays ? lensArgs.lookbackDays : 30;
    const since = lensArgs.since
      ? lensArgs.since
      : new Date(Date.now() - days * 86400000).toISOString();

    // 1. Selection: recent email signals in the window.
    let rows = await gateway.kg.query({
      cypher: `MATCH (s:EmailSignal) WHERE s.lastMessageAt > $since
               RETURN s.id AS id, s.subject AS subject, s.from AS sender,
                      coalesce(s.messageCount, 1) AS msgs,
                      right(coalesce(s.bodyText, ''), 4000) AS body
               ORDER BY s.lastMessageAt DESC LIMIT 40`,
      params: JSON.stringify({ since }),
    });

    // 2. Me — id (EMAILED salience) + addresses (skip threads I answered last).
    const meRows = await gateway.kg.query({
      cypher: `MATCH (me:AssistantUser) RETURN me.id AS id, me.email AS email, me.emails AS others, me.timeZone AS timeZone`,
      params: JSON.stringify({}),
    });
    const me = (meRows && meRows[0]) || {};
    const myId = me.id || "";
    const userTz = me.timeZone || "UTC";
    const myAddrs = new Set<string>();
    if (me.email) myAddrs.add(String(me.email).toLowerCase());
    (me.others || []).forEach((e: any) => e && myAddrs.add(String(e).toLowerCase()));
    const addrOf = (s: any) => { const m = String(s || "").match(/<([^>]+)>/); return (m ? m[1] : String(s || "")).toLowerCase().trim(); };
    if (myAddrs.size) rows = rows.filter((r) => !myAddrs.has(addrOf(r.sender)));

    const recentMsg = (body: any) => { const b = String(body || "").split(/-{3}\s[^-].*?\s-{3}/).map((s) => s.trim()).filter(Boolean); return b.length ? b[b.length - 1] : String(body || ""); };
    const stripFooter = (t: any) => { const s = String(t); const cut = s.search(/\n\s*(-{2,}\s*$|This (e-?mail|message)\b|Disclaimer\b|Confidential|KPMG International\b|\*{5,}|Sent from my |Get Outlook)/im); return cut > 40 ? s.slice(0, cut) : s; };
    const snippet = (r: any, n: number) => stripFooter(recentMsg(r.body)).replace(/\s+/g, " ").slice(0, n);

    // 3. Action-state gate, judged by the BODY.
    let kept: any[] = [];
    if (rows.length) {
      const verdicts = await gateway.ai.classify({
        instruction: "Classify each email by its LATEST MESSAGE (shown first), NOT its subject — thread subjects like 'Action Required' persist even after the matter is closed, so ignore them. 'needs-action' = the person still must DO something (reply, pay, decide, sign). 'fyi' = the latest message shows the matter is already resolved, acknowledged, or closed — e.g. the other party writes 'Great, thank you for confirming, we will update our records' — or it is purely informational with nothing to do. 'skip' = bulk, promotional, upsell, or automated noise.",
        items: rows.map((r) => `${snippet(r, 300)}  «subject: ${r.subject || "(no subject)"}»`),
        categories: "needs-action,fyi,skip",
        role: "best",
      });
      const stateByIdx = new Map((verdicts || []).map((v: any) => [v.index, v.category]));
      kept = rows.map((r, i) => Object.assign({}, r, { actionState: stateByIdx.get(i) || "fyi" }))
                 .filter((r) => r.actionState !== "skip");
    }

    // Upcoming meetings — next 7 days, deterministic, formatted in user's zone.
    const nowIso = new Date().toISOString();
    const weekEndIso = new Date(Date.now() + 7 * 86400000).toISOString();
    const meetRows = await gateway.kg.query({
      cypher: `MATCH (m:MeetingSignal) WHERE m.start >= $now AND m.start <= $weekEnd
               RETURN m.id AS id, m.subject AS title, m.start AS start, m.location AS location, m.timeZone AS tz
               ORDER BY m.start ASC LIMIT 8`,
      params: JSON.stringify({ now: nowIso, weekEnd: weekEndIso }),
    });
    const fmtTime = (iso: any, tz: any) => { try { return new Intl.DateTimeFormat('en-AU', { timeZone: tz || 'UTC', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); } catch (e) { return String(iso).replace('T', ' ').slice(0, 16) + ' UTC'; } };
    const mSeen = new Set<string>();
    const schedule = (meetRows || []).filter((m) => { const k = (m.title || "") + "|" + m.start; if (mSeen.has(k)) return false; mSeen.add(k); return true; })
      .map((m) => ({ time: fmtTime(m.start, userTz), title: m.title || "(meeting)", kind: null, note: m.location ? String(m.location).slice(0, 80) : null }));
    let focusIds: string[] = (meetRows || []).map((m) => m.id).filter(Boolean);

    // DEADLINES — real unpaid bills due recently/soon. Computed independently of
    // email so a quiet inbox (or a meeting-only day) still surfaces what's owed.
    const floor = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const billRows = await gateway.kg.query({
      cypher: `MATCH (bill:Bill) WHERE coalesce(bill.isPaid, false) = false AND bill.dueDate >= $floor
               OPTIONAL MATCH (bill:Bill)-[:BILLED_BY]->(org:Organization)
               RETURN bill.id AS id, bill.name AS name, bill.dueDate AS due, bill.amount AS amount, bill.currency AS ccy, org.name AS vendor
               ORDER BY bill.dueDate ASC LIMIT 8`,
      params: JSON.stringify({ floor }),
    });
    const deadlines = (billRows || []).map((b) => {
      const overdue = String(b.due) < today;
      const urgency = overdue ? "today" : (String(b.due) <= weekEnd ? "this week" : "later");
      const amt = (b.amount != null) ? ` ${b.ccy || ""} ${b.amount}`.replace(/\s+/g, " ").trim() : "";
      return { title: `${b.vendor || b.name || "Bill"}${amt ? " — " + amt : ""}`, due: (overdue ? "overdue " : "") + b.due, urgency, why: "Unpaid bill" };
    });
    focusIds.push(...(billRows || []).map((b) => b.id).filter(Boolean));

    let brief: any;
    if (!kept.length && !schedule.length && !deadlines.length) {
      // Truly nothing — no salient mail, no meetings, no bills.
      brief = { date: today, headline: "A quiet morning", dek: "Nothing pressing right now.",
                leadStory: { title: "Clear runway", body: "No salient mail, meetings, or bills to brief on — a good window for focused work." },
                schedule, openLoops: [], deadlines: [], closingThought: null };
    } else {
      // Email ranking runs only when there IS email; meetings + bills carry the
      // brief on a quiet-inbox day. `items` stays [] when there's no mail.
      let items: any[] = [];
      if (kept.length) {
      const keptIds = kept.map((r) => r.id);

      // DETERMINISTIC RANKING of the email threads.
      const enrich = await gateway.kg.query({
        cypher: `MATCH (e:EmailSignal) WHERE e.id IN $ids
                 OPTIONAL MATCH (e:EmailSignal)-[:HAS_PARTICIPANT]->(p:Person)
                 OPTIONAL MATCH (me:Person {id:$meId})-[r:EMAILED]->(p:Person)
                 OPTIONAL MATCH (bill:Bill)-[:GROUNDED_IN]->(e:EmailSignal)
                 RETURN e.id AS id,
                        max(coalesce(r.messageCount, 0)) AS salience,
                        count(DISTINCT bill) AS bills,
                        max(CASE WHEN coalesce(bill.isPaid, false) THEN 1 ELSE 0 END) AS billPaid`,
        params: JSON.stringify({ ids: keptIds, meId: myId }),
      });
      const eById: Record<string, any> = {}; (enrich || []).forEach((x: any) => eById[x.id] = x);

      const promoRows = await gateway.kg.query({
        cypher: `MATCH (u:UnsubscribePossibility) RETURN collect(DISTINCT toLower(u.senderAddress)) AS addrs`,
        params: JSON.stringify({}),
      });
      const promo = new Set(((promoRows && promoRows[0] && promoRows[0].addrs) || []).filter(Boolean));

      const maxSal = Math.max(1, ...kept.map((r) => (eById[r.id] && eById[r.id].salience) || 0));
      kept.forEach((r) => {
        const e = eById[r.id] || {};
        const sal = (e.salience || 0) / maxSal;
        const eng = Math.min(1, Math.log2(1 + (r.msgs || 1)) / 4);
        const fin = (e.bills > 0 && !e.billPaid) ? 1 : 0;
        const isPromo = promo.has(addrOf(r.sender)) ? 1 : 0;
        const resolved = (r.actionState === "fyi") ? 1 : 0;
        r.score = 0.45 * sal + 0.20 * eng + 0.30 * fin - 0.40 * isPromo - 0.25 * resolved;
        r.signals = { salience: e.salience || 0, threadDepth: r.msgs || 1, unpaidBill: !!fin, promo: !!isPromo };
      });
      kept.sort((a, b) => b.score - a.score);
      kept.forEach((r) => { r.priority = r.score >= 0.45 ? "high" : (r.score >= 0.15 ? "medium" : "low"); });

      const ent = await gateway.kg.query({
        cypher: `MATCH (e:EmailSignal) WHERE e.id IN $ids
                 OPTIONAL MATCH (e:EmailSignal)-[:HAS_PARTICIPANT]->(person:Person)
                 OPTIONAL MATCH (e:EmailSignal)-[:HAS_PARTICIPANT]->(org:Organization)
                 OPTIONAL MATCH (bill:Bill)-[:GROUNDED_IN]->(e:EmailSignal)
                 RETURN collect(DISTINCT person.id) AS people, collect(DISTINCT org.id) AS orgs, collect(DISTINCT bill.id) AS bills`,
        params: JSON.stringify({ ids: keptIds }),
      });
      const er = (ent && ent[0]) || {};
      focusIds.push(...(er.people || []), ...(er.orgs || []), ...(er.bills || []));

        items = kept.map((r) => ({ priority: r.priority, state: r.actionState, subject: r.subject, from: r.sender, signals: r.signals, body: snippet(r, 600) }));
      }

      // Editorial — prose that weighs EMAIL and MEETINGS together (plus the
      // deterministic deadlines). A meeting can be the lead; on a quiet inbox the
      // brief leads with the day's schedule rather than calling it "quiet".
      const completion = await gateway.ai.complete({
        prompt: `Write a person's morning brief that weighs EMAIL and MEETINGS together — both are first-class.
    - Ranked email items (may be empty) are ordered by IMPORTANCE (priority high|medium|low) from who-matters salience, financial consequence, and engagement. Use that order.
    - Upcoming meetings are first-class context, not a footnote: weight the IMMINENT ones (today / tomorrow, judge from each meeting's "time") most. An important or imminent meeting MAY be the lead story or feature in the dek. The schedule renders separately, so do NOT enumerate every meeting — describe the SHAPE of the day ("back-to-back afternoon", "one call before lunch").
    - The lead story is the single most important thing across email AND meetings. If there is no salient email, lead with the day's meetings (or the nearest deadline) — never call a day with meetings "quiet".
    - openLoops: ONLY email items whose state is "needs-action", the few that genuinely matter (aim 3–6, most important first; high → today, medium → this week). An item whose state is "fyi" is already resolved — NEVER an open loop. Do NOT put meetings in openLoops; they live in the schedule.
    - For deadlines, use ONLY the supplied list; never invent one.
    Reply with STRICT JSON only (no markdown), exactly this shape:
    {"date":"${today}","headline":"<=60 chars","dek":"1-2 sentences","leadStory":{"title":"3-6 words","body":"2-4 sentences"},"schedule":[],"openLoops":[{"title":"5-10 words","urgency":"today|this week|whenever"}],"deadlines":[],"closingThought":null}
    Name real people, meetings, and items; never invent.
    Ranked email items: ${JSON.stringify(items)}
    Upcoming meetings: ${JSON.stringify(schedule)}
    Supplied deadlines: ${JSON.stringify(deadlines)}`,
        role: "best",
      });
      if (completion && typeof completion === "object") {
        brief = completion;
      } else {
        const text = String(completion);
        try {
          brief = JSON.parse(text.replace(/^```(json)?/i, "").replace(/```$/, "").trim());
        } catch (e) {
          brief = { date: today, headline: "Your morning brief", dek: text.slice(0, 160),
                    leadStory: { title: "Today", body: text.slice(0, 400) },
                    schedule: [], openLoops: [], deadlines: [], closingThought: null };
        }
      }
      brief.deadlines = deadlines;
      brief.schedule = schedule;
    }
    // Section labels/order the host reads to render typed components (Schedule =
    // focused MeetingSignals, Deadlines = unpaid Bills, In focus = ranked People).
    // `kind` is stamped by the host driver from the spec's presentKind ("brief").
    brief.sections = [
      { label: "Schedule", type: "Meeting" },
      { label: "Deadlines", type: "Bill" },
      { label: "In focus", type: "Person" },
    ];

    const focus: EntityRef[] = Array.from(new Set(focusIds.filter(Boolean))).map((id) => ({ id }));
    return { focus, data: brief as BriefingView };
  }
}
