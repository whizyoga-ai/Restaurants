/* ==========================================================================
   Animated workflow canvas — n8n-shaped, drawn from a graph definition.

   Two graphs live here: REACH publishing a new menu across social channels,
   and the restaurant order-to-cash chain with its subflows.

   The animation is not decoration. A static box-and-arrow diagram makes a
   customer nod; watching one menu change fan out to four channels and come
   back with results is the thing that makes them ask what it costs. So the
   packets actually travel the wires, nodes actually run in dependency order,
   and the log actually narrates the subflow steps as they fire.
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------- graphs */

const FLOW_REACH = {
  id: 'reach',
  viewBox: [0, 0, 1020, 430],
  runLabel: 'Publish “Summer menu” to all channels',
  nodes: [
    { id: 'trigger', x: 20,  y: 183, icon: '📝', label: 'Menu updated',
      sub: 'Menu studio · trigger', kind: 'trigger',
      steps: ['Watching Menu studio', 'Detected 3 changed dishes', 'Run started'] },

    { id: 'compose', x: 250, y: 183, icon: '✨', label: 'Compose assets',
      sub: 'subflow · 4 steps', kind: 'sub',
      steps: ['Pull dish name, price, macros', 'Write caption in house tone',
              'Crop photo 1:1, 4:5 and 16:9', 'Generate alt text'] },

    { id: 'ig',    x: 520, y: 20,  icon: '📸', label: 'Instagram',
      sub: 'feed + story', kind: 'channel',
      steps: ['Upload 4:5 image', 'Attach caption and tags', 'Publish', 'Story with menu sticker'] },
    { id: 'fb',    x: 520, y: 128, icon: '👥', label: 'Facebook',
      sub: 'page post', kind: 'channel',
      steps: ['Upload 16:9 image', 'Publish to page', 'Pin for 48 hours'] },
    { id: 'gbp',   x: 520, y: 236, icon: '🗺️', label: 'Google Business',
      sub: 'post + menu sync', kind: 'channel',
      steps: ['Publish “What’s new” post', 'Sync menu items and prices',
              'Refresh opening hours'] },
    { id: 'email', x: 520, y: 344, icon: '✉️', label: 'Office list',
      sub: 'B2B lunch accounts', kind: 'channel',
      steps: ['Segment: kennitala accounts', 'Insert this week’s trays', 'Send 38 emails'] },

    { id: 'results', x: 790, y: 183, icon: '📊', label: 'Results in',
      sub: 'one place', kind: 'end',
      steps: ['Collect reach and clicks', 'Attribute orders to posts',
              'Write back to the dashboard'] },
  ],
  edges: [
    ['trigger', 'compose'],
    ['compose', 'ig'], ['compose', 'fb'], ['compose', 'gbp'], ['compose', 'email'],
    ['ig', 'results'], ['fb', 'results'], ['gbp', 'results'], ['email', 'results'],
  ],
  /* Each entry is one wavefront. The four channels share a wavefront because
     they genuinely run at once — that simultaneity is the whole point. */
  steps: [['trigger'], ['compose'], ['ig', 'fb', 'gbp', 'email'], ['results']],
};

const FLOW_O2C = {
  id: 'o2c',
  viewBox: [0, 0, 1160, 430],
  runLabel: 'Lunch service · 11:30 – 21:00',
  nodes: [
    { id: 'order',  x: 20,  y: 183, icon: '🛎️', label: 'Order in',
      sub: 'counter · web · delivery', kind: 'trigger',
      steps: ['Counter till', 'Order-ahead from the site', 'Wolt / Aha if connected',
              'One queue, whatever the source'] },

    { id: 'ticket', x: 215, y: 183, icon: '🎫', label: 'Kitchen ticket',
      sub: 'subflow · routing', kind: 'sub',
      steps: ['Split by station: cold line, oven', 'Group salad and focaccia to land together',
              'Fire timer per item'] },

    { id: 'serve',  x: 410, y: 183, icon: '🥗', label: 'Prep & serve',
      sub: 'timing', kind: 'step',
      steps: ['Ticket bumped when plated', 'Average 6m 40s today'] },

    { id: 'pay',    x: 605, y: 183, icon: '💳', label: 'Payment',
      sub: 'subflow · 3 routes', kind: 'sub',
      steps: ['Route by payment type', 'Card and cash settle now',
              'Account orders defer to invoicing'] },

    { id: 'card',   x: 810, y: 62,  icon: '💳', label: 'Card',
      sub: 'settles today', kind: 'step',
      steps: ['Capture', 'Match to till', 'Post to takings'] },
    { id: 'cash',   x: 810, y: 183, icon: '💰', label: 'Cash',
      sub: 'drawer count', kind: 'step',
      steps: ['Drawer count', 'Variance flagged over 500 ISK'] },
    { id: 'acct',   x: 810, y: 304, icon: '🏢', label: 'On account',
      sub: 'office lunch', kind: 'step',
      steps: ['Match to kennitala', 'Add to this month’s run', 'No payment at the counter'] },

    { id: 'invoice', x: 990, y: 304, icon: '🧾', label: 'Invoice run',
      sub: 'subflow · monthly', kind: 'sub', w: 150,
      steps: ['Group orders by company', 'Build greiðsluseðill',
              'Send with itemised lines', 'Chase at day 14 and 21'] },

    { id: 'close',  x: 990, y: 123, icon: '🌙', label: 'Daily close',
      sub: 'takings · covers', kind: 'end', w: 150,
      steps: ['Reconcile card, cash and account', 'Covers and dish counts',
              'Export for the accountant'] },
  ],
  edges: [
    ['order', 'ticket'], ['ticket', 'serve'], ['serve', 'pay'],
    ['pay', 'card'], ['pay', 'cash'], ['pay', 'acct'],
    ['acct', 'invoice'],
    ['card', 'close'], ['cash', 'close'], ['invoice', 'close'],
  ],
  steps: [['order'], ['ticket'], ['serve'], ['pay'], ['card', 'cash', 'acct'],
          ['invoice'], ['close']],
};

/* ---------------------------------------------------------------- render */

const NODE_W = 170;
const NODE_H = 66;
const SVG_NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}) {
  const n = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

function nodeById(graph, id) { return graph.nodes.find(n => n.id === id); }
function nodeW(n) { return n.w || NODE_W; }

function edgePath(a, b) {
  const x1 = a.x + nodeW(a), y1 = a.y + NODE_H / 2;
  const x2 = b.x,            y2 = b.y + NODE_H / 2;
  // Horizontal control points keep the curve flat where the run is straight
  // and give a clean S where it fans out, which is what n8n's wires look like.
  const dx = Math.max(46, (x2 - x1) * 0.55);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function buildFlow(host, graph) {
  host.innerHTML = '';

  const svg = el('svg', {
    viewBox: graph.viewBox.join(' '),
    class: 'wf',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': `${graph.runLabel} — workflow diagram`,
  });

  const gEdges = el('g', { class: 'wf__edges' });
  const gNodes = el('g', { class: 'wf__nodes' });
  svg.append(gEdges, gNodes);

  // --- edges ---
  graph._edgeEls = {};
  graph.edges.forEach(([from, to]) => {
    const d = edgePath(nodeById(graph, from), nodeById(graph, to));
    const base = el('path', { d, class: 'wf-edge' });
    const live = el('path', { d, class: 'wf-edge wf-edge--live' });
    const pkt = el('circle', { r: 5, class: 'wf-pkt' });
    gEdges.append(base, live, pkt);
    graph._edgeEls[`${from}>${to}`] = { base, live, pkt };
  });

  // --- nodes ---
  graph._nodeEls = {};
  graph.nodes.forEach(n => {
    const g = el('g', {
      class: `wf-node wf-node--${n.kind}`,
      transform: `translate(${n.x} ${n.y})`,
      tabindex: '0',
      role: 'button',
      'aria-label': `${n.label} — ${n.sub}`,
    });

    g.append(
      el('rect', { class: 'wf-node__box', width: nodeW(n), height: NODE_H, rx: 13 }),
      el('rect', { class: 'wf-node__glow', width: nodeW(n), height: NODE_H, rx: 13 }),
    );

    const icon = el('text', { class: 'wf-node__icon', x: 17, y: 40 });
    icon.textContent = n.icon;
    const label = el('text', { class: 'wf-node__label', x: 46, y: 30 });
    label.textContent = n.label;
    const sub = el('text', { class: 'wf-node__sub', x: 46, y: 48 });
    sub.textContent = n.sub;
    g.append(icon, label, sub);

    // running spinner and completed tick, in the top-right corner
    const spin = el('circle', { class: 'wf-node__spin', cx: nodeW(n) - 17, cy: 21, r: 7 });
    const tick = el('path', { class: 'wf-node__tick',
      d: `M ${nodeW(n) - 22} 21 l 4 4 l 7 -8` });
    g.append(spin, tick);

    const open = () => window.openLock && window.openLock(
      graph.id === 'reach' ? 'reach' : 'order-to-cash',
      `${n.label} — ${n.steps.join(' · ')}.`);
    g.addEventListener('click', open);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });

    gNodes.append(g);
    graph._nodeEls[n.id] = g;
  });

  host.append(svg);
  return svg;
}

/* --------------------------------------------------------------- animate */

const sleep = ms => new Promise(r => setTimeout(r, ms));

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Move a packet along one edge. Resolves when it lands. */
function sendPacket(graph, from, to, ms = 620) {
  const e = graph._edgeEls[`${from}>${to}`];
  if (!e) return Promise.resolve();

  e.live.classList.add('is-on');

  if (reducedMotion()) { e.pkt.classList.remove('is-on'); return sleep(80); }

  const len = e.base.getTotalLength();
  e.pkt.classList.add('is-on');

  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      e.pkt.classList.remove('is-on');
      resolve();
    };

    /* requestAnimationFrame does not fire while a tab is backgrounded, and
       some embedded webviews never composite at all. Without this guard the
       promise never settles, the awaiting run stalls forever, and the diagram
       sits frozen one node in — which is exactly how this first behaved.
       The timer is the floor: whichever finishes first wins. */
    const guard = setTimeout(finish, ms + 600);

    const t0 = performance.now();
    const tick = now => {
      if (settled) return;
      const t = Math.min(1, (now - t0) / ms);
      // ease-in-out so the packet leaves and arrives gently
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = e.base.getPointAtLength(eased * len);
      e.pkt.setAttribute('cx', p.x);
      e.pkt.setAttribute('cy', p.y);
      if (t < 1) requestAnimationFrame(tick);
      else finish();
    };
    requestAnimationFrame(tick);
  });
}

function logLine(logEl, text, cls = '') {
  const li = document.createElement('li');
  li.className = `wf-log__line ${cls}`;
  li.textContent = text;
  logEl.append(li);
  logEl.scrollTop = logEl.scrollHeight;
  return li;
}

function resetFlow(graph, logEl) {
  Object.values(graph._nodeEls).forEach(g =>
    g.classList.remove('is-running', 'is-done'));
  Object.values(graph._edgeEls).forEach(e => {
    e.live.classList.remove('is-on');
    e.pkt.classList.remove('is-on');
  });
  if (logEl) logEl.innerHTML = '';
}

let runToken = 0;

async function runFlow(graph, logEl, btn) {
  const me = ++runToken;
  resetFlow(graph, logEl);
  if (btn) { btn.disabled = true; btn.textContent = 'Running…'; }

  logLine(logEl, `▶ ${graph.runLabel}`, 'wf-log__line--head');

  const done = new Set();

  for (const wave of graph.steps) {
    if (me !== runToken) return;               // a newer run superseded this one

    // packets from every already-completed parent into this wavefront
    const arrivals = [];
    wave.forEach(id => {
      graph.edges
        .filter(([from, to]) => to === id && done.has(from))
        .forEach(([from]) => arrivals.push(sendPacket(graph, from, id)));
    });
    await Promise.all(arrivals);
    if (me !== runToken) return;

    // run the wavefront
    wave.forEach(id => graph._nodeEls[id].classList.add('is-running'));
    const nodes = wave.map(id => nodeById(graph, id));

    if (wave.length > 1) {
      logLine(logEl, `${nodes.length} branches in parallel — ${nodes.map(n => n.label).join(', ')}`,
              'wf-log__line--fan');
    }

    // narrate the subflow steps, interleaved across a parallel wavefront
    const maxSteps = Math.max(...nodes.map(n => n.steps.length));
    for (let i = 0; i < maxSteps; i++) {
      if (me !== runToken) return;
      nodes.forEach(n => {
        if (n.steps[i]) {
          logLine(logEl, `  ${n.label} · ${n.steps[i]}`);
        }
      });
      await sleep(reducedMotion() ? 0 : 190);
    }

    wave.forEach(id => {
      graph._nodeEls[id].classList.remove('is-running');
      graph._nodeEls[id].classList.add('is-done');
      done.add(id);
    });
    await sleep(reducedMotion() ? 0 : 140);
  }

  if (me !== runToken) return;
  logLine(logEl, '✔ Run finished — nothing was actually published.', 'wf-log__line--end');
  if (btn) { btn.disabled = false; btn.textContent = 'Run it again'; }
}

/* Kick a flow off when its tab is first opened, and once only, so switching
   tabs back and forth does not restart it mid-run. */
const started = new Set();

function mountFlow(hostSel, logSel, btnSel, graph) {
  const host = document.querySelector(hostSel);
  const log = document.querySelector(logSel);
  const btn = document.querySelector(btnSel);
  if (!host) return;

  buildFlow(host, graph);
  if (btn) btn.addEventListener('click', () => runFlow(graph, log, btn));

  return {
    play() {
      if (started.has(graph.id)) return;
      started.add(graph.id);
      runFlow(graph, log, btn);
    },
  };
}

window.FLOWS = { FLOW_REACH, FLOW_O2C, mountFlow, runFlow };
