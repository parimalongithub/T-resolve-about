import { useState } from 'react';

const QUADRANTS = [
  {
    id: 'q1', label: 'Do Now', axis: 'Urgent + Important',
    color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)',
    action: 'Assign immediately. No delay.',
  },
  {
    id: 'q2', label: 'Schedule', axis: 'Important + Not Urgent',
    color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)',
    action: 'Plan it. Set a deadline. Do it right.',
  },
  {
    id: 'q3', label: 'Delegate', axis: 'Urgent + Not Important',
    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)',
    action: 'Find the right person. Transfer it.',
  },
  {
    id: 'q4', label: 'Eliminate', axis: 'Not Urgent + Not Important',
    color: '#6b7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.2)',
    action: 'Question whether this should exist.',
  },
];

const PEOPLE_CATEGORIES = [
  { label: 'Senior', color: '#ef4444', desc: 'Crisis resolvers, architects, final decision makers' },
  { label: 'Mid', color: '#3b82f6', desc: 'Feature builders, sprint executors, reviewers' },
  { label: 'Junior', color: '#f59e0b', desc: 'Capable learners, task executors, growing contributors' },
  { label: 'Support', color: '#22c55e', desc: 'Documentation, validation, QA, assistance roles' },
  { label: 'Learning', color: '#a78bfa', desc: 'Preparing for upcoming sprint concepts and required skills' },
];

const PILLARS = [
  {
    num: '01', icon: '🎯', title: 'Smart Assignment', color: '#e20074',
    desc: 'When a ticket is created, AI scans historical resolution data across the team and returns a ranked list of people — most capable for this specific ticket type first. The list is a suggestion. Ownership is always taken by the person, not forced by AI.',
  },
  {
    num: '02', icon: '⚖️', title: 'Transfer Suggestion', color: '#f97316',
    desc: 'People take ownership of their tickets. But at the start of a sprint — or at any point during it — if AI detects that someone is carrying more than a healthy load, it surfaces a suggestion. The team decides. AI only informs, never overrides.',
  },
  {
    num: '03', icon: '🚫', title: 'Fault Detection', color: '#ef4444',
    desc: 'Some tickets should not have been created. AI identifies these by looking at patterns:',
    bullets: [
      '100% of test cases are already covered for the reported issue — the ticket is created against an already-validated scenario',
      'A ticket is created and closed immediately without any meaningful work — indicating it was invalid from the start',
      'The ticket is an exact or near-exact duplicate of an existing open or recently closed ticket',
    ],
  },
  {
    num: '04', icon: '🔁', title: 'Recursive Tickets', color: '#22c55e',
    desc: 'Some issues are already known — either solved before in a previous sprint or version, or something the whole team is aware of but still needs to track. AI finds these references and links them to the new ticket so the team is not starting from scratch.',
  },
];

const S = {
  page: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#f8f8fb',
    display: 'grid',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 20px 48px',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1.7fr) minmax(260px,0.9fr)',
    gap: '24px',
    padding: '28px',
    background: 'linear-gradient(135deg,rgba(255,255,255,0.03),rgba(226,0,116,0.08)),linear-gradient(180deg,#181820,#121219)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg,#ff4fac,#e20074)' },
  heroStat: {
    padding: '22px',
    borderRadius: '18px',
    background: 'radial-gradient(circle at top right,rgba(255,255,255,0.12),transparent 30%),linear-gradient(160deg,rgba(226,0,116,0.24),rgba(10,10,16,0.28))',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sectionLabel: { margin: '0 0 8px', color: '#ff8ecb', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' },
  heroTitle: { margin: '0 0 14px', fontSize: 'clamp(2rem,4vw,3.2rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 800 },
  heroCopy: { margin: 0, color: '#b1b6c4', fontSize: '1rem', lineHeight: 1.7, maxWidth: '60ch' },
  card: {
    background: 'linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01)),#181820',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px',
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: { position: 'absolute', left: 0, top: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg,#e20074,rgba(226,0,116,0))' },
  cardHeader: { padding: '22px 22px 0' },
  cardTitle: { margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#f8f8fb' },
  cardSubtitle: { margin: 0, color: '#b1b6c4', fontSize: '0.92rem', lineHeight: 1.5 },
  cardBody: { padding: '22px' },
};

function Card({ title, subtitle, children, style }) {
  return (
    <div style={{ ...S.card, ...style }}>
      <div style={S.cardAccent} />
      <div style={S.cardHeader}>
        <h3 style={S.cardTitle}>{title}</h3>
        {subtitle ? <p style={S.cardSubtitle}>{subtitle}</p> : null}
      </div>
      <div style={S.cardBody}>{children}</div>
    </div>
  );
}

function EisenhowerGraph() {
  const [active, setActive] = useState(null);
  const activeQuadrant = QUADRANTS.find((quadrant) => quadrant.id === active);

  const width = 420;
  const height = 380;
  const padding = { top: 30, right: 20, bottom: 60, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const midX = padding.left + innerWidth / 2;
  const midY = padding.top + innerHeight / 2;

  const quadrantPositions = {
    q1: { cx: padding.left + innerWidth * 0.75, cy: padding.top + innerHeight * 0.25 },
    q2: { cx: padding.left + innerWidth * 0.25, cy: padding.top + innerHeight * 0.25 },
    q3: { cx: padding.left + innerWidth * 0.75, cy: padding.top + innerHeight * 0.75 },
    q4: { cx: padding.left + innerWidth * 0.25, cy: padding.top + innerHeight * 0.75 },
  };

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: width, display: 'block', margin: '0 auto' }}>
        <rect x={padding.left} y={padding.top} width={innerWidth / 2} height={innerHeight / 2} fill="rgba(59,130,246,0.06)" />
        <rect x={midX} y={padding.top} width={innerWidth / 2} height={innerHeight / 2} fill="rgba(239,68,68,0.06)" />
        <rect x={padding.left} y={midY} width={innerWidth / 2} height={innerHeight / 2} fill="rgba(107,114,128,0.04)" />
        <rect x={midX} y={midY} width={innerWidth / 2} height={innerHeight / 2} fill="rgba(245,158,11,0.06)" />

        <line x1={padding.left} y1={padding.top + innerHeight} x2={padding.left + innerWidth} y2={padding.top + innerHeight} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1={midX} y1={padding.top} x2={midX} y2={padding.top + innerHeight} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={padding.left} y1={midY} x2={padding.left + innerWidth} y2={midY} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />

        <polygon points={`${padding.left + innerWidth},${padding.top + innerHeight - 5} ${padding.left + innerWidth + 8},${padding.top + innerHeight} ${padding.left + innerWidth},${padding.top + innerHeight + 5}`} fill="rgba(255,255,255,0.4)" />
        <polygon points={`${padding.left - 5},${padding.top} ${padding.left},${padding.top - 8} ${padding.left + 5},${padding.top}`} fill="rgba(255,255,255,0.4)" />

        <text x={padding.left + innerWidth / 2} y={height - 8} textAnchor="middle" fill="#b1b6c4" fontSize="12" fontFamily="Plus Jakarta Sans, sans-serif">Urgency -&gt;</text>
        <text x={padding.left + innerWidth * 0.25} y={padding.top + innerHeight + 16} textAnchor="middle" fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">Low</text>
        <text x={padding.left + innerWidth * 0.75} y={padding.top + innerHeight + 16} textAnchor="middle" fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">High</text>
        <text x={14} y={padding.top + innerHeight / 2} textAnchor="middle" fill="#b1b6c4" fontSize="12" fontFamily="Plus Jakarta Sans, sans-serif" transform={`rotate(-90, 14, ${padding.top + innerHeight / 2})`}>Importance -&gt;</text>
        <text x={padding.left - 8} y={padding.top + innerHeight * 0.75 + 4} textAnchor="end" fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">Low</text>
        <text x={padding.left - 8} y={padding.top + innerHeight * 0.25 + 4} textAnchor="end" fill="rgba(177,182,196,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">High</text>

        {QUADRANTS.map((quadrant) => {
          const position = quadrantPositions[quadrant.id];
          const isActive = active === quadrant.id;

          return (
            <g key={quadrant.id} style={{ cursor: 'pointer' }} onClick={() => setActive(active === quadrant.id ? null : quadrant.id)}>
              <circle cx={position.cx} cy={position.cy} r={isActive ? 40 : 34} fill={quadrant.color} fillOpacity={isActive ? 0.25 : 0.12} stroke={quadrant.color} strokeWidth={isActive ? 2 : 1} />
              <text x={position.cx} y={position.cy - 4} textAnchor="middle" fill={quadrant.color} fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">{quadrant.label}</text>
              <text x={position.cx} y={position.cy + 12} textAnchor="middle" fill={quadrant.color} fontSize="9" fontFamily="Plus Jakarta Sans, sans-serif" fillOpacity="0.75">{quadrant.axis}</text>
            </g>
          );
        })}
      </svg>

      {activeQuadrant ? (
        <div style={{ marginTop: '14px', padding: '16px', borderRadius: '12px', background: activeQuadrant.bg, border: `1px solid ${activeQuadrant.border}` }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: activeQuadrant.color, fontSize: '0.85rem' }}>{activeQuadrant.label} - {activeQuadrant.axis}</p>
          <p style={{ margin: 0, color: '#f8f8fb', fontSize: '0.88rem', lineHeight: 1.6 }}>{activeQuadrant.action}</p>
        </div>
      ) : null}
    </div>
  );
}

function AboutPage() {
  return (
    <div style={S.page}>
      <section style={S.hero}>
        <div style={S.heroAccent} />
        <div style={{ position: 'relative' }}>
          <p style={S.sectionLabel}>About T Resolve</p>
          <h2 style={S.heroTitle}>From reactive firefighting<br />to predictive ops</h2>
          <p style={S.heroCopy}>
            T Resolve is a Ticket Intelligence Hub built on the Eisenhower Matrix. It brings 4 AI pillars - Smart Assignment, Transfer Suggestion, Fault Detection, and Recursive Tickets - along with a complementary AI Suggestion feature, to ensure every ticket is handled by the right person at the right time.
          </p>
        </div>
        <div style={S.heroStat}>
          <p style={{ margin: '0 0 8px', color: '#ff9bd2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Built for</p>
          <p style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em' }}>T-Systems</p>
          <p style={{ margin: '10px 0 0', color: '#b1b6c4', fontSize: '0.9rem' }}>Creatathon 2026 · Reactive -&gt; Predictive</p>
        </div>
      </section>

      <Card title="The Eisenhower Matrix - Core Framework" subtitle="Click any quadrant to explore. People are placed in quadrants based on skill level and seniority. Tickets move between quadrants - people stay.">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: '32px' }}>
          <EisenhowerGraph />
          <div style={{ display: 'grid', gap: '14px', alignContent: 'start' }}>
            <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>5 People Categories</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {PEOPLE_CATEGORIES.map((person) => (
                  <div key={person.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '999px', background: `${person.color}18`, color: person.color, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '1px' }}>{person.label}</span>
                    <span style={{ color: '#b1b6c4', fontSize: '0.83rem', lineHeight: 1.5 }}>{person.desc}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: 'rgba(177,182,196,0.6)', fontStyle: 'italic' }}>One person can belong to two quadrants simultaneously.</p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Moving people between quadrants</p>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Quadrant placement is a manual decision - made by the team lead or manager based on growth, performance, or role change. AI does not move people between quadrants. Only tickets move automatically.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(226,0,116,0.07)', border: '1px solid rgba(226,0,116,0.2)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What moves - and T Resolve tells you why</p>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Tickets flow between quadrants as priority or context changes. T Resolve AI tells you <strong style={{ color: '#f8f8fb' }}>why</strong> a ticket is moving and <strong style={{ color: '#f8f8fb' }}>where</strong> it should go next based on the current team state.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Who assigns tickets?</p>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Traditionally, a manager assigns based on gut feel - who seems free, who worked on something similar once. T Resolve AI replaces gut feel with historical data. It knows who has resolved what, how fast, and how well - and suggests accordingly.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="The 4 AI Pillars" subtitle="Core intelligence capabilities - always active on every ticket">
        <div style={{ display: 'grid', gap: '16px' }}>
          {PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${pillar.color}`,
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pillar.color, fontFamily: 'monospace' }}>{pillar.num}</span>
                <span style={{ fontSize: '1.3rem' }}>{pillar.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8f8fb' }}>{pillar.title}</span>
              </div>
              <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.92rem', lineHeight: 1.7 }}>{pillar.desc}</p>
              {pillar.bullets ? (
                <ul style={{ margin: '10px 0 0', paddingLeft: '18px', display: 'grid', gap: '6px' }}>
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet} style={{ color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.92rem', lineHeight: 1.7 }}>
            <strong style={{ color: '#f8f8fb' }}>Core philosophy:</strong> All team members are skilled. AI actively learns from every ticket resolved, every fault detected, and every recursive match found - continuously improving its suggestions without ever overriding the team&apos;s decisions.
          </p>
        </div>
      </Card>

      <Card title="AI Suggestion - Complementary Feature" subtitle="Not a pillar. Runs at sprint level, not ticket level.">
        <div style={{ display: 'grid', gap: '14px' }}>
          <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.95rem', lineHeight: 1.75 }}>
            Before each sprint, AI reads the upcoming ticket titles and predicts what technical concepts the team will encounter. It surfaces learning recommendations so the team arrives at the sprint prepared - turning reactive scrambling into collaborative readiness.
          </p>
          <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.88rem', lineHeight: 1.65 }}>
              The suggestion is based on <strong style={{ color: '#f8f8fb' }}>upcoming sprint ticket titles only</strong> - not generic recommendations. Different sprints produce different learning suggestions.
            </p>
          </div>
        </div>
      </Card>

      <Card title="How T Resolve Gets Ticket Data" subtitle="Jira Webhook - real-time, zero manual steps">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px' }}>
            {[
              { step: '1', label: 'Ticket created in Jira' },
              { step: '2', label: 'Webhook fires instantly' },
              { step: '3', label: 'AI runs all 4 pillars' },
              { step: '4', label: 'Dashboard updates live' },
            ].map((item) => (
              <div key={item.step} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#e20074,#91004d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 }}>{item.step}</span>
                <span style={{ color: '#b1b6c4', fontSize: '0.85rem', lineHeight: 1.4 }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(226,0,116,0.06)', border: '1px solid rgba(226,0,116,0.2)' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#ff9bd2', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Step 3 in action - example ticket
            </p>
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '14px' }}>
              <p style={{ margin: 0, color: '#f8f8fb', fontSize: '0.88rem', fontWeight: 600 }}>New ticket: &quot;Auth service returning timeout errors&quot;</p>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                { num: '01', icon: '🎯', label: 'Smart Assignment', result: 'Suggested -> Rahul Mehta (resolved 6 auth tickets, avg 4.1hrs)', color: '#e20074', ok: true },
                { num: '02', icon: '⚖️', label: 'Transfer Suggestion', result: 'Rahul load: 3 tickets - within capacity. No transfer needed.', color: '#f97316', ok: true },
                { num: '03', icon: '🚫', label: 'Fault Detection', result: 'Valid ticket - no matching closed patterns or duplicates found.', color: '#22c55e', ok: true },
                { num: '04', icon: '🔁', label: 'Recursive Check', result: 'Match found -> TK-0842 (similar issue, resolved in previous sprint)', color: '#a78bfa', ok: false },
              ].map((result) => (
                <div key={result.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: result.color, fontFamily: 'monospace', marginTop: '2px', whiteSpace: 'nowrap' }}>{result.num}</span>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{result.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#f8f8fb', fontSize: '0.85rem' }}>{result.label}</p>
                    <p style={{ margin: 0, color: '#b1b6c4', fontSize: '0.82rem', lineHeight: 1.5 }}>{result.result}</p>
                  </div>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{result.ok ? 'OK' : 'LINK'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Technology Stack" subtitle="Built with production-grade tools">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px' }}>
          {[
            { name: 'React.js', role: 'Frontend UI', color: '#61dafb' },
            { name: 'Spring Boot', role: 'Backend API', color: '#6db33f' },
            { name: 'MongoDB', role: 'Ticket Database', color: '#47a248' },
            { name: 'Gemini AI', role: 'Intelligence Engine', color: '#e20074' },
            { name: 'Chart.js', role: 'Data Visualization', color: '#ff6384' },
            { name: 'Jira API', role: 'Ticket Integration', color: '#0052cc' },
          ].map((tech) => (
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

export default AboutPage;
