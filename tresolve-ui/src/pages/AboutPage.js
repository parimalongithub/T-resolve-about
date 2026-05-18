import { useState } from 'react';

const QUADRANTS = [
  { id: 'q1', label: 'Do Now',    axis: 'Urgent + Important',         color: '#ef4444', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.3)',   action: 'Assign immediately. No delay.'         },
  { id: 'q2', label: 'Schedule',  axis: 'Important + Not Urgent',     color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)',  action: 'Plan it. Set a deadline. Do it right.' },
  { id: 'q3', label: 'Delegate',  axis: 'Urgent + Not Important',     color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)',  action: 'Find the right person. Transfer it.'   },
  { id: 'q4', label: 'Eliminate', axis: 'Not Urgent + Not Important', color: '#6b7280', bg: 'rgba(107,114,128,0.06)',border: 'rgba(107,114,128,0.2)', action: 'Question whether this should exist.'   },
];

const CATEGORIES = ['Senior', 'Mid', 'Junior', 'Support', 'Learning'];
const CAT_COLORS  = { Senior: '#ef4444', Mid: '#3b82f6', Junior: '#f59e0b', Support: '#22c55e', Learning: '#a78bfa' };

const QUADRANT_OWNERS = [
  { label: 'Do Now',    color: '#ef4444', owner: 'Senior'  },
  { label: 'Schedule',  color: '#3b82f6', owner: 'Mid'     },
  { label: 'Delegate',  color: '#f59e0b', owner: 'Junior'  },
  { label: 'Eliminate', color: '#6b7280', owner: 'Support' },
];

const PILLARS = [
  {
    num: '01', icon: '🎯', title: 'Smart Assignment', color: '#e20074',
    desc: 'When a ticket is created, AI scans historical resolution data across the team and returns a ranked list of people, most capable for this specific ticket type first. The list is a suggestion. Ownership is always taken by the person, not forced by AI.',
  },
  {
    num: '02', icon: '⚖️', title: 'Transfer Suggestion', color: '#f97316',
    desc: 'People take ownership of their tickets. At the start of a sprint or at any point during it, if AI detects that someone is carrying more than a healthy load, it surfaces a suggestion. The team decides. AI only informs, never overrides.',
  },
  {
    num: '03', icon: '🚫', title: 'Fault Detection', color: '#ef4444',
    desc: 'Some tickets should not have been created. AI identifies these by looking at patterns:',
    bullets: [
      '100% of test cases are already covered for the reported issue. The ticket is created against an already-validated scenario.',
      'A ticket is created and closed immediately without any meaningful work, indicating it was invalid from the start.',
      'The ticket is an exact or near-exact duplicate of an existing open or recently closed ticket.',
    ],
  },
  {
    num: '04', icon: '🔁', title: 'Recursive Tickets', color: '#22c55e',
    desc: "Some issues are already known, either solved before in a previous sprint or version, or something the whole team is aware of but still needs to track. AI finds these references and links them to the new ticket so the team is not starting from scratch.",
  },
];

const S = {
  page:        { fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#f8f8fb', display: 'grid', gap: '24px' },
  hero:        { display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(260px,0.9fr)', gap: '24px', padding: '28px', background: 'linear-gradient(135deg,rgba(255,255,255,0.03),rgba(226,0,116,0.08)),linear-gradient(180deg,#181820,#121219)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', position: 'relative', overflow: 'hidden' },
  heroAccent:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg,#ff4fac,#e20074)' },
  heroStat:    { padding: '22px', borderRadius: '18px', background: 'radial-gradient(circle at top right,rgba(255,255,255,0.12),transparent 30%),linear-gradient(160deg,rgba(226,0,116,0.24),rgba(10,10,16,0.28))', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  eyebrow:     { margin: '0 0 8px', color: '#ff8ecb', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' },
  heroTitle:   { margin: '0 0 14px', fontSize: 'clamp(2rem,4vw,3.2rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 800 },
  heroCopy:    { margin: 0, color: '#b1b6c4', fontSize: '1rem', lineHeight: 1.7, maxWidth: '60ch' },
  card:        { background: 'linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01)),#181820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden', position: 'relative' },
  cardAccent:  { position: 'absolute', left: 0, top: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg,#e20074,rgba(226,0,116,0))' },
  cardHeader:  { padding: '22px 22px 0' },
  cardTitle:   { margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#f8f8fb' },
  cardSubtitle:{ margin: 0, color: '#b1b6c4', fontSize: '0.92rem', lineHeight: 1.5 },
  cardBody:    { padding: '22px' },
  divider:     { width: '100%', height: '1px', background: 'rgba(255,255,255,0.07)', margin: '16px 0' },
  panelHead:   { margin: '0 0 10px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
};

function Card({ title, subtitle, children }) {
  return (
    <div style={S.card}>
      <div style={S.cardAccent} />
      <div style={S.cardHeader}>
        <h3 style={S.cardTitle}>{title}</h3>
        {subtitle && <p style={S.cardSubtitle}>{subtitle}</p>}
      </div>
      <div style={S.cardBody}>{children}</div>
    </div>
  );
}

function EisenhowerGraph() {
  const [active, setActive] = useState(null);
  const activeQ = QUADRANTS.find(q => q.id === active);
  const W = 420, H = 380;
  const PAD = { top: 30, right: 20, bottom: 60, left: 60 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const mX = PAD.left + iW / 2;
  const mY = PAD.top + iH / 2;
  const qPos = {
    q1: { cx: PAD.left + iW * 0.75, cy: PAD.top + iH * 0.25 },
    q2: { cx: PAD.left + iW * 0.25, cy: PAD.top + iH * 0.25 },
    q3: { cx: PAD.left + iW * 0.75, cy: PAD.top + iH * 0.75 },
    q4: { cx: PAD.left + iW * 0.25, cy: PAD.top + iH * 0.75 },
  };
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
        <rect x={PAD.left} y={PAD.top}  width={iW/2} height={iH/2} fill="rgba(59,130,246,0.06)" />
        <rect x={mX}       y={PAD.top}  width={iW/2} height={iH/2} fill="rgba(239,68,68,0.06)"  />
        <rect x={PAD.left} y={mY}       width={iW/2} height={iH/2} fill="rgba(107,114,128,0.04)"/>
        <rect x={mX}       y={mY}       width={iW/2} height={iH/2} fill="rgba(245,158,11,0.06)" />
        <line x1={PAD.left} y1={PAD.top+iH} x2={PAD.left+iW} y2={PAD.top+iH} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top}    x2={PAD.left}    y2={PAD.top+iH} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1={mX} y1={PAD.top} x2={mX} y2={PAD.top+iH} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={PAD.left} y1={mY} x2={PAD.left+iW} y2={mY} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />
        <polygon points={`${PAD.left+iW},${PAD.top+iH-5} ${PAD.left+iW+8},${PAD.top+iH} ${PAD.left+iW},${PAD.top+iH+5}`} fill="rgba(255,255,255,0.4)" />
        <polygon points={`${PAD.left-5},${PAD.top} ${PAD.left},${PAD.top-8} ${PAD.left+5},${PAD.top}`} fill="rgba(255,255,255,0.4)" />
        <text x={PAD.left+iW/2}       y={H-8}              textAnchor="middle" fill="#b1b6c4" fontSize="12" fontFamily="Plus Jakarta Sans,sans-serif">Urgency →</text>
        <text x={PAD.left+iW*0.25}    y={PAD.top+iH+16}    textAnchor="middle" fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans,sans-serif">Low</text>
        <text x={PAD.left+iW*0.75}    y={PAD.top+iH+16}    textAnchor="middle" fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans,sans-serif">High</text>
        <text x={14}                  y={PAD.top+iH/2}      textAnchor="middle" fill="#b1b6c4" fontSize="12" fontFamily="Plus Jakarta Sans,sans-serif" transform={`rotate(-90,14,${PAD.top+iH/2})`}>Importance →</text>
        <text x={PAD.left-8}          y={PAD.top+iH*0.75+4} textAnchor="end"   fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans,sans-serif">Low</text>
        <text x={PAD.left-8}          y={PAD.top+iH*0.25+4} textAnchor="end"   fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans,sans-serif">High</text>
        {QUADRANTS.map(q => {
          const p = qPos[q.id];
          const on = active === q.id;
          return (
            <g key={q.id} style={{ cursor: 'pointer' }} onClick={() => setActive(active === q.id ? null : q.id)}>
              <circle cx={p.cx} cy={p.cy} r={on ? 40 : 34} fill={q.color} fillOpacity={on ? 0.25 : 0.12} stroke={q.color} strokeWidth={on ? 2 : 1} />
              <text x={p.cx} y={p.cy-4}  textAnchor="middle" fill={q.color} fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans,sans-serif">{q.label}</text>
              <text x={p.cx} y={p.cy+12} textAnchor="middle" fill={q.color} fontSize="9"  fontFamily="Plus Jakarta Sans,sans-serif" fillOpacity="0.75">{q.axis}</text>
            </g>
          );
        })}
      </svg>
      {activeQ && (
        <div style={{ marginTop: '14px', padding: '16px', borderRadius: '12px', background: activeQ.bg, border: `1px solid ${activeQ.border}` }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: activeQ.color, fontSize: '0.85rem' }}>{activeQ.label} — {activeQ.axis}</p>
          <p style={{ margin: 0, color: '#f8f8fb', fontSize: '0.88rem', lineHeight: 1.6 }}>{activeQ.action}</p>
        </div>
      )}
    </div>
  );
}

function AboutPage5() {
  return (
    <div style={S.page}>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.heroAccent} />
        <div style={{ position: 'relative' }}>
          <p style={S.eyebrow}>About T Resolve</p>
          <h2 style={S.heroTitle}>From reactive firefighting<br />to predictive ops</h2>
          <p style={S.heroCopy}>
            T Resolve is a Ticket Intelligence Hub built on the Eisenhower Matrix. It brings 4 AI pillars — Smart Assignment, Transfer Suggestion, Fault Detection, and Recursive Tickets — along with a complementary AI Suggestion feature, to ensure every ticket is handled by the right person at the right time.
          </p>
        </div>
        <div style={S.heroStat}>
          <p style={{ margin: '0 0 8px', color: '#ff9bd2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Built for</p>
          <p style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em' }}>T-Systems</p>
          <p style={{ margin: '10px 0 0', color: '#b1b6c4', fontSize: '0.9rem' }}>Creatathon 2026 · Reactive → Predictive</p>
        </div>
      </section>

      {/* Eisenhower Matrix */}
      <Card title="The Eisenhower Matrix — Core Framework" subtitle="Click any quadrant to explore. People are placed in quadrants based on skill level and seniority. Tickets move between quadrants, people stay.">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: '32px' }}>
          <EisenhowerGraph />
          <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>

            {/* 5 categories + ownership */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid #e20074' }}>
              <p style={{ ...S.panelHead, color: '#ff9bd2' }}>5 People Categories</p>
              <p style={{ margin: '0 0 12px', color: '#b1b6c4', fontSize: '0.87rem', lineHeight: 1.65 }}>
                Every quadrant belongs to a member from the team. AI uses these categories as extra context when suggesting assignments.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {CATEGORIES.map(c => (
                  <span key={c} style={{ padding: '5px 14px', borderRadius: '999px', background: `${CAT_COLORS[c]}18`, color: CAT_COLORS[c], fontSize: '0.83rem', fontWeight: 700, border: `1px solid ${CAT_COLORS[c]}30` }}>
                    {c}
                  </span>
                ))}
              </div>
              <div style={S.divider} />
              <div style={{ display: 'grid', gap: '7px' }}>
                {QUADRANT_OWNERS.map(q => (
                  <div key={q.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: q.color, flexShrink: 0 }} />
                    <span style={{ color: '#f8f8fb', fontSize: '0.85rem', fontWeight: 600, minWidth: '76px' }}>{q.label}</span>
                    <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ padding: '2px 10px', borderRadius: '999px', background: `${q.color}18`, color: q.color, fontSize: '0.75rem', fontWeight: 700 }}>{q.owner}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'rgba(177,182,196,0.55)', fontStyle: 'italic' }}>One person can belong to two quadrants.</p>
            </div>

            {/* Moving people */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Moving people between quadrants</p>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Quadrant placement is a manual decision — made by the team lead or manager based on growth, performance, or role change. AI does not move people between quadrants.
              </p>
            </div>

            {/* What moves */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(226,0,116,0.07)', border: '1px solid rgba(226,0,116,0.2)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What moves — and T Resolve tells you why</p>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Tickets flow between quadrants as priority or context changes. T Resolve AI tells you <strong style={{ color: '#f8f8fb' }}>why</strong> a ticket is moving — escalation, scope change, load shift — and <strong style={{ color: '#f8f8fb' }}>where</strong> it should go next based on the current team state.
              </p>
            </div>

            {/* Who assigns */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Who assigns tickets?</p>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Traditionally, a manager assigns based on gut feel — who seems free, who worked on something similar once. T Resolve AI replaces gut feel with historical data. It knows who has resolved what, how fast, and how well — and suggests accordingly.
              </p>
            </div>

          </div>
        </div>
      </Card>

      {/* 4 Pillars */}
      <Card title="The 4 AI Pillars" subtitle="Core intelligence capabilities — always active on every ticket">
        <div style={{ display: 'grid', gap: '16px' }}>
          {PILLARS.map(p => (
            <div key={p.num} style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${p.color}`, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: p.color, fontFamily: 'monospace' }}>{p.num}</span>
                <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8f8fb' }}>{p.title}</span>
              </div>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.92rem', lineHeight: 1.7 }}>{p.desc}</p>
              {p.bullets && (
                <ul style={{ margin: '10px 0 0', paddingLeft: '18px', display: 'grid', gap: '6px' }}>
                  {p.bullets.map((b, i) => (
                    <li key={i} style={{ color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.92rem', lineHeight: 1.7 }}>
            <strong style={{ color: '#f8f8fb' }}>Core philosophy:</strong> All team members are skilled. AI actively learns from every ticket resolved, every fault detected, and every recursive match found — continuously improving its suggestions without ever overriding the team's decisions.
          </p>
        </div>
      </Card>

      {/* AI Suggestion */}
      <Card title="AI Suggestion — Complementary Feature" subtitle="Not a pillar. Runs at sprint level, not ticket level.">
        <div style={{ display: 'grid', gap: '14px' }}>
          <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.95rem', lineHeight: 1.75 }}>
            Before each sprint, AI reads the upcoming ticket titles and predicts what technical concepts the team will encounter. It surfaces learning recommendations so the team arrives at the sprint prepared, turning reactive scrambling into collaborative readiness.
          </p>
          <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
              The suggestion is based on <strong style={{ color: '#f8f8fb' }}>upcoming sprint ticket titles only.</strong> Different sprints produce different learning suggestions.
            </p>
          </div>
        </div>
      </Card>

      {/* Jira Webhook */}
      <Card title="How T Resolve Gets Ticket Data" subtitle="Jira Webhook — real-time, zero manual steps">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px' }}>
            {[
              { step: '1', label: 'Ticket created in Jira'  },
              { step: '2', label: 'Webhook fires instantly'  },
              { step: '3', label: 'AI runs all 4 pillars'   },
              { step: '4', label: 'Dashboard updates live'  },
            ].map(s => (
              <div key={s.step} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#e20074,#91004d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 }}>{s.step}</span>
                <span style={{ color: '#b1b6c4', fontSize: '0.85rem', lineHeight: 1.4 }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={S.divider} />
          <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(226,0,116,0.06)', border: '1px solid rgba(226,0,116,0.2)' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 3 in action — example ticket</p>
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '14px' }}>
              <p style={{ margin: 0, color: '#f8f8fb', fontSize: '0.88rem', fontWeight: 600 }}>🎫 New ticket: "Auth service returning timeout errors"</p>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                { num: '01', icon: '🎯', label: 'Smart Assignment',    result: 'Suggested assignee identified based on past resolution history in this category.', color: '#e20074', badge: '✅ Assigned'  },
                { num: '02', icon: '⚖️', label: 'Transfer Suggestion', result: 'Assignee load is within healthy range. No transfer suggested at this point.',       color: '#f97316', badge: '✅ No action' },
                { num: '03', icon: '🚫', label: 'Fault Detection',     result: 'No matching closed patterns or duplicate tickets found. Ticket is valid.',            color: '#22c55e', badge: '✅ Valid'     },
                { num: '04', icon: '🔁', label: 'Recursive Check',     result: 'Similar issue found in a previous sprint. Reference linked for the assignee.',        color: '#a78bfa', badge: '🔗 Linked'   },
              ].map(r => (
                <div key={r.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: r.color, fontFamily: 'monospace', marginTop: '2px', whiteSpace: 'nowrap' }}>{r.num}</span>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{r.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#f8f8fb', fontSize: '0.85rem' }}>{r.label}</p>
                    <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.82rem', lineHeight: 1.5 }}>{r.result}</p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', background: `${r.color}18`, color: r.color, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{r.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tech Stack */}
      <Card title="Technology Stack" subtitle="Built with production-grade tools">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px' }}>
          {[
            { name: 'React.js',    role: 'Frontend UI',         color: '#61dafb' },
            { name: 'Spring Boot', role: 'Backend API',         color: '#6db33f' },
            { name: 'MongoDB',     role: 'Ticket Database',     color: '#47a248' },
            { name: 'Gemini AI',   role: 'Intelligence Engine', color: '#e20074' },
            { name: 'Chart.js',    role: 'Data Visualization',  color: '#ff6384' },
            { name: 'Jira API',    role: 'Ticket Integration',  color: '#0052cc' },
          ].map(tech => (
            <div key={tech.name} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderTop: `3px solid ${tech.color}` }}>
              <p style={{ margin: '0 0 5px', fontWeight: 800, color: tech.color, fontSize: '0.95rem' }}>{tech.name}</p>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.8rem' }}>{tech.role}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}

export default AboutPage5;
