import { useState } from "react";

const C = {
  void: "#181825", bg: "#222035", teal: "#2F404D", deepTeal: "#3D898D",
  purple: "#575267", warmGray: "#8D8980", silver: "#B8B8C8",
  brightSilver: "#D4D4E0", green: "#65DC98", mint: "#A0FFE3",
  cyan: "#85EBD9", amber: "#FFB366",
};

const skillGroups = [
  { label: "Frontend", items: ["React", "TypeScript", "Tailwind", "Framer Motion", "D3"] },
  { label: "Backend", items: ["Node.js", "PostgreSQL", "GraphQL", "Redis", "REST"] },
  { label: "Infra", items: ["AWS", "Docker", "Terraform", "CI/CD"] },
];
const projects = [
  { title: "Fintech Dashboard", desc: "Real-time trading viz with WebSocket streaming and D3 charts.", impact: "60% faster", tags: ["React", "D3", "WebSocket"], bullets: ["Sub-100ms streaming updates via WebSocket", "Custom D3 chart library with 12 viz types", "Load time reduced from 4.2s to 1.7s"] },
  { title: "E-Commerce Platform", desc: "Full-stack marketplace with Stripe, real-time inventory, and search.", impact: "50k MAU", tags: ["Next.js", "Stripe", "PG"], bullets: ["End-to-end Stripe Connect checkout flow", "Real-time inventory sync across 3 warehouses", "Typo-tolerant search with faceted filtering"] },
  { title: "Dev Tools CLI", desc: "Internal tooling automating deploys and environment provisioning.", impact: "200hrs saved", tags: ["Node", "TS", "AWS"], bullets: ["One-command environment provisioning", "Auto-rollback deploy pipelines", "Log aggregation across 40+ services"] },
  { title: "Data Pipeline", desc: "ETL system processing 2M+ records daily with quality checks.", impact: "2M/day", tags: ["Python", "AWS", "Docker"], bullets: ["Self-healing retries with dead-letter queues", "Automated data quality scoring", "Real-time anomaly alerting"] },
];
const experience = [
  { role: "Senior Frontend Dev", co: "TechCorp", yr: "2023\u2013now", note: "Led dashboard rewrite reducing load times 60%. Mentored 3 junior devs." },
  { role: "Full-Stack Developer", co: "StartupXYZ", yr: "2021\u20132023", note: "Built platform 0\u219250k MAU. Owned frontend + API." },
  { role: "Software Engineer", co: "MidCo", yr: "2020\u20132021", note: "Microservices migration. Reduced deploy time 80%." },
  { role: "Junior Developer", co: "AgencyOne", yr: "2019\u20132020", note: "Shipped 12+ client projects across React and Node." },
];

function SectionHeader({ label, count, centered }) {
  if (centered) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, justifyContent: "center" }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg, ${C.teal}, transparent)` }} />
        <span style={{ fontSize: 9, color: C.warmGray, letterSpacing: 3, fontWeight: 600 }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.teal}, transparent)` }} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 9, color: C.warmGray, letterSpacing: 3, fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.teal}, transparent)` }} />
      {count && <span style={{ fontSize: 8, color: C.purple }}>{count}</span>}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 4, fontSize: 9,
      color: C.silver, background: `${C.teal}30`, border: `1px solid ${C.teal}60`,
    }}>{children}</span>
  );
}

function ImpactBadge({ children }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, color: C.amber,
      background: `${C.amber}10`, padding: "3px 10px",
      borderRadius: 12, border: `1px solid ${C.amber}12`,
    }}>{children}</span>
  );
}

function ActionBtn({ children }) {
  return (
    <span
      onMouseEnter={e => { e.currentTarget.style.background = C.green; e.currentTarget.style.color = C.bg; e.currentTarget.style.borderColor = C.green; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.green; e.currentTarget.style.borderColor = `${C.green}35`; }}
      style={{
        padding: "6px 16px", borderRadius: 6, fontSize: 10, fontWeight: 600,
        border: `1px solid ${C.green}35`, color: C.green, background: "transparent",
        cursor: "pointer", letterSpacing: 1, transition: "all 0.2s",
      }}
    >{children} {"\u2192"}</span>
  );
}

const Divider = ({ maxW = 440 }) => (
  <div style={{ height: 1, maxWidth: maxW, margin: "0 auto", background: `linear-gradient(90deg, transparent, ${C.teal}, transparent)` }} />
);

/* ═══════════════════════════════════════ */
/*  DESKTOP                                */
/* ═══════════════════════════════════════ */
function Desktop() {
  const [expandedP, setExpandedP] = useState(null);
  const [expandedE, setExpandedE] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAllP, setShowAllP] = useState(false);
  const visibleP = showAllP ? projects : projects.slice(0, 3);

  return (
    <div style={{ width: "100%", background: C.bg }}>
      {/* Hero */}
      <div style={{ padding: "32px 24px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${C.teal}`, background: `linear-gradient(135deg, ${C.bg}, ${C.teal}50)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: C.warmGray }}>avatar</div>
        <div style={{ fontSize: 16, color: C.mint, fontWeight: 700, letterSpacing: 3 }}>YOUR NAME</div>
        <div style={{ fontSize: 9, color: C.warmGray, letterSpacing: 2 }}>FULL-STACK DEVELOPER {"\u00B7"} 5+ YEARS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}50` }} />
          <span style={{ fontSize: 7, color: C.warmGray, letterSpacing: 1 }}>AVAILABLE</span>
        </div>
        <span style={{ padding: "6px 18px", border: `1px solid ${C.green}30`, borderRadius: 4, color: C.green, fontSize: 9, letterSpacing: 1.5, cursor: "pointer", marginTop: 4 }}>enter console</span>
        <div style={{ fontSize: 7, color: C.purple, marginTop: 8, letterSpacing: 2 }}>{"\u2193"} SCROLL</div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.teal}, transparent)` }} />

      {/* About */}
      <div style={{ padding: "24px 28px 18px", maxWidth: 440, margin: "0 auto" }}>
        <SectionHeader label="ABOUT" />
        <div style={{ fontSize: 11, color: C.silver, lineHeight: 1.9 }}>
          I build performant web applications and developer tools. Focused on React ecosystems, cloud infrastructure, and clean architecture.
        </div>
      </div>

      <Divider />

      {/* Skills */}
      <div style={{ padding: "20px 28px", maxWidth: 440, margin: "0 auto" }}>
        <SectionHeader label="SKILLS" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {skillGroups.map(g => (
            <div key={g.label}>
              <div style={{ fontSize: 8, color: C.deepTeal, letterSpacing: 2, fontWeight: 600, marginBottom: 7 }}>{g.label.toUpperCase()}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {g.items.map(s => <Chip key={s}>{s}</Chip>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Projects */}
      <div style={{ padding: "20px 28px", maxWidth: 440, margin: "0 auto" }}>
        <SectionHeader label="FEATURED WORK" count={projects.length} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {visibleP.map((p, i) => {
            const isOpen = expandedP === i;
            return (
              <div key={i}>
                <div onClick={() => setExpandedP(isOpen ? null : i)} style={{
                  padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  background: isOpen ? `${C.teal}22` : "transparent",
                  borderLeft: isOpen ? `3px solid ${C.green}40` : `3px solid transparent`,
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isOpen ? C.brightSilver : C.silver, transition: "color 0.2s" }}>{p.title}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ImpactBadge>{p.impact}</ImpactBadge>
                      <span style={{ fontSize: 11, color: isOpen ? C.green : C.purple, transition: "color 0.2s", fontWeight: 300 }}>{isOpen ? "\u2212" : "+"}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: C.warmGray, lineHeight: 1.6 }}>{p.desc}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                    {p.tags.map(t => <Chip key={t}>{t}</Chip>)}
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.teal}30` }}>
                      {p.bullets.map((b, j) => (
                        <div key={j} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
                          <span style={{ color: C.green, fontSize: 10, flexShrink: 0, marginTop: 1 }}>{"\u25B8"}</span>
                          <span style={{ color: C.silver, fontSize: 10, lineHeight: 1.6 }}>{b}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                        <ActionBtn>GitHub</ActionBtn>
                        <ActionBtn>Demo</ActionBtn>
                      </div>
                    </div>
                  )}
                </div>
                {i < visibleP.length - 1 && <div style={{ height: 1, background: `${C.teal}25`, margin: "2px 16px" }} />}
              </div>
            );
          })}
        </div>
        {!showAllP && projects.length > 3 && (
          <div onClick={() => setShowAllP(true)}
            onMouseEnter={e => e.currentTarget.style.color = C.silver}
            onMouseLeave={e => e.currentTarget.style.color = C.warmGray}
            style={{ textAlign: "center", marginTop: 12, fontSize: 9, color: C.warmGray, cursor: "pointer", transition: "color 0.2s" }}>
            show {projects.length - 3} more {"\u2193"}
          </div>
        )}
      </div>

      <Divider />

      {/* Experience */}
      <div style={{ padding: "20px 28px", maxWidth: 440, margin: "0 auto" }}>
        <SectionHeader label="EXPERIENCE" />
        {experience.map((e, i) => {
          const isOpen = expandedE === i;
          return (
            <div key={i}>
              <div onClick={() => setExpandedE(isOpen ? null : i)} style={{
                padding: "10px 14px", borderRadius: 6, cursor: "pointer",
                background: isOpen ? `${C.teal}18` : "transparent",
                borderLeft: isOpen ? `3px solid ${C.deepTeal}` : `3px solid transparent`,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isOpen ? C.brightSilver : C.silver, transition: "color 0.2s" }}>{e.role}</span>
                    <span style={{ fontSize: 9, color: C.warmGray, marginLeft: 8 }}>{e.co}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 8, color: C.purple }}>{e.yr}</span>
                    <span style={{ fontSize: 10, color: isOpen ? C.deepTeal : C.purple, fontWeight: 300 }}>{isOpen ? "\u2212" : "+"}</span>
                  </div>
                </div>
                {isOpen && <div style={{ marginTop: 8, fontSize: 10, color: C.silver, lineHeight: 1.7 }}>{e.note}</div>}
              </div>
              {i < experience.length - 1 && <div style={{ height: 1, background: `${C.teal}20`, margin: "2px 14px" }} />}
            </div>
          );
        })}
      </div>

      <Divider />

      {/* Contact */}
      <div style={{ padding: "22px 28px 32px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
        <SectionHeader label="CONTACT" centered />
        <div onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: 6,
            border: `1px solid ${copied ? C.green + "50" : C.teal}`,
            background: copied ? `${C.green}08` : "transparent",
            cursor: "pointer", transition: "all 0.2s",
          }}>
          <span style={{ color: copied ? C.green : C.silver, fontSize: 11 }}>{copied ? "copied!" : "your@email.com"}</span>
          <span style={{ fontSize: 8, color: copied ? C.green : C.purple }}>{copied ? "\u2713" : "click to copy"}</span>
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 14 }}>
          {["GitHub", "LinkedIn", "Resume"].map(l => (
            <span key={l} onMouseEnter={e => e.currentTarget.style.color = C.silver}
              onMouseLeave={e => e.currentTarget.style.color = C.warmGray}
              style={{ color: C.warmGray, fontSize: 9, cursor: "pointer", transition: "color 0.2s" }}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize: 7, color: C.purple, marginTop: 12, letterSpacing: 1 }}>Toronto, ON {"\u00B7"} Remote friendly</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*  MOBILE                                 */
/* ═══════════════════════════════════════ */
function Mobile() {
  const [expandedP, setExpandedP] = useState(null);
  const [expandedE, setExpandedE] = useState(null);
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ width: "100%", position: "relative", paddingBottom: 44 }}>
      {/* Hero — no console button */}
      <div style={{
        padding: "28px 18px 20px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6, borderBottom: `1px solid ${C.teal}30`,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", border: `2px solid ${C.teal}`,
          background: `linear-gradient(135deg, ${C.bg}, ${C.teal}50)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 6, color: C.warmGray,
        }}>avatar</div>
        <div style={{ fontSize: 13, color: C.mint, fontWeight: 700, letterSpacing: 3 }}>YOUR NAME</div>
        <div style={{ fontSize: 8, color: C.warmGray, letterSpacing: 1.5 }}>Full-Stack Developer {"\u00B7"} 5+ years</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.green, boxShadow: `0 0 5px ${C.green}50` }} />
          <span style={{ fontSize: 6, color: C.warmGray }}>AVAILABLE</span>
        </div>
      </div>

      {/* Content — continuous scroll */}
      <div style={{ padding: "14px 16px" }}>
        {/* About */}
        <div style={{ fontSize: 10, color: C.silver, lineHeight: 1.8, marginBottom: 14 }}>
          I build performant web apps and developer tools. React ecosystems, cloud infrastructure, clean architecture.
        </div>

        <div style={{ height: 1, background: `${C.teal}40`, marginBottom: 14 }} />

        {/* Skills */}
        <div style={{ fontSize: 8, color: C.warmGray, letterSpacing: 2, fontWeight: 600, marginBottom: 10 }}>SKILLS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {skillGroups.map(g => (
            <div key={g.label}>
              <div style={{ fontSize: 7, color: C.deepTeal, letterSpacing: 2, fontWeight: 600, marginBottom: 5 }}>{g.label.toUpperCase()}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {g.items.map(s => (
                  <span key={s} style={{
                    padding: "3px 8px", borderRadius: 4, fontSize: 8,
                    color: C.silver, background: `${C.teal}30`, border: `1px solid ${C.teal}60`,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: `${C.teal}40`, marginBottom: 14 }} />

        {/* Projects */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 8, color: C.warmGray, letterSpacing: 2, fontWeight: 600 }}>WORK</span>
          <span style={{ fontSize: 7, color: C.purple }}>{projects.length}</span>
        </div>
        {projects.map((p, i) => {
          const isOpen = expandedP === i;
          return (
            <div key={i}>
              <div onClick={() => setExpandedP(isOpen ? null : i)} style={{
                padding: "10px 12px", borderRadius: 6, cursor: "pointer",
                background: isOpen ? `${C.teal}20` : "transparent",
                borderLeft: isOpen ? `2px solid ${C.green}40` : `2px solid transparent`,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isOpen ? C.brightSilver : C.silver }}>{p.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 7, fontWeight: 600, color: C.amber,
                      background: `${C.amber}10`, padding: "2px 7px",
                      borderRadius: 10, border: `1px solid ${C.amber}12`,
                    }}>{p.impact}</span>
                    <span style={{ fontSize: 10, color: isOpen ? C.green : C.purple, fontWeight: 300 }}>{isOpen ? "\u2212" : "+"}</span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: C.warmGray, lineHeight: 1.5 }}>{p.desc}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 8,
                      color: C.silver, background: `${C.teal}30`, border: `1px solid ${C.teal}60`,
                    }}>{t}</span>
                  ))}
                </div>
                {isOpen && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.teal}25` }}>
                    {p.bullets.map((b, j) => (
                      <div key={j} style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                        <span style={{ color: C.green, fontSize: 9, flexShrink: 0 }}>{"\u25B8"}</span>
                        <span style={{ color: C.silver, fontSize: 9, lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      {["GitHub", "Demo"].map(l => (
                        <span key={l} style={{
                          padding: "5px 12px", borderRadius: 5, fontSize: 9, fontWeight: 600,
                          border: `1px solid ${C.green}35`, color: C.green,
                          letterSpacing: 1, cursor: "pointer",
                        }}>{l} {"\u2192"}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {i < projects.length - 1 && <div style={{ height: 1, background: `${C.teal}20`, margin: "2px 12px" }} />}
            </div>
          );
        })}

        <div style={{ height: 1, background: `${C.teal}40`, margin: "10px 0" }} />

        {/* Experience */}
        <div style={{ fontSize: 8, color: C.warmGray, letterSpacing: 2, fontWeight: 600, marginBottom: 10 }}>EXPERIENCE</div>
        {experience.map((e, i) => {
          const isOpen = expandedE === i;
          return (
            <div key={i}>
              <div onClick={() => setExpandedE(isOpen ? null : i)} style={{
                padding: "8px 10px", borderRadius: 5, cursor: "pointer",
                background: isOpen ? `${C.teal}15` : "transparent",
                borderLeft: isOpen ? `2px solid ${C.deepTeal}` : `2px solid transparent`,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: isOpen ? C.brightSilver : C.silver }}>{e.role}</span>
                    <span style={{ fontSize: 7, color: C.warmGray, marginLeft: 6 }}>{e.co}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 7, color: C.purple }}>{e.yr}</span>
                    <span style={{ fontSize: 9, color: isOpen ? C.deepTeal : C.purple, fontWeight: 300 }}>{isOpen ? "\u2212" : "+"}</span>
                  </div>
                </div>
                {isOpen && <div style={{ marginTop: 6, fontSize: 9, color: C.silver, lineHeight: 1.6 }}>{e.note}</div>}
              </div>
              {i < experience.length - 1 && <div style={{ height: 1, background: `${C.teal}18`, margin: "2px 10px" }} />}
            </div>
          );
        })}

        <div style={{ height: 1, background: `${C.teal}40`, margin: "10px 0" }} />

        {/* Contact — brief, above sticky bar */}
        <div style={{ textAlign: "center", paddingBottom: 4 }}>
          <div onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 5,
            border: `1px solid ${copied ? C.green + "50" : C.teal}`,
            cursor: "pointer", transition: "all 0.2s",
          }}>
            <span style={{ color: copied ? C.green : C.silver, fontSize: 9 }}>{copied ? "copied!" : "your@email.com"}</span>
            <span style={{ fontSize: 7, color: copied ? C.green : C.purple }}>{copied ? "\u2713" : "tap to copy"}</span>
          </div>
          <div style={{ fontSize: 7, color: C.purple, marginTop: 8, letterSpacing: 1 }}>Toronto {"\u00B7"} Remote OK</div>
        </div>
      </div>

      {/* Sticky contact bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 8px 5px" }}>
        <div style={{
          display: "flex", justifyContent: "space-around", padding: "7px 6px",
          background: "rgba(34,32,53,0.94)", border: `1px solid ${C.teal}`,
          borderRadius: 8, backdropFilter: "blur(8px)",
        }}>
          {["email", "github", "linkedin", "resume"].map(l => (
            <span key={l} style={{ fontSize: 7, color: C.cyan, letterSpacing: 1, cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*  MAIN                                   */
/* ═══════════════════════════════════════ */
export default function FinalWithMobile() {
  return (
    <div style={{
      minHeight: "100vh", background: C.void,
      fontFamily: "'JetBrains Mono','Courier New',monospace",
      padding: "16px 12px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.mint, letterSpacing: 3, fontWeight: 700, marginBottom: 6 }}>
          FINAL DESIGN
        </div>
        <div style={{ fontSize: 9, color: C.warmGray, lineHeight: 1.5, maxWidth: 460, margin: "0 auto" }}>
          60/30/10 color hierarchy. Titles stay silver. Amber for impact. Green for actions only.
          Mobile: no console button, continuous scroll, sticky contact bar.
        </div>
      </div>

      {/* Palette reference */}
      <div style={{
        display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap",
        marginBottom: 16, padding: "10px 0",
      }}>
        {[
          { hex: C.mint, label: "Mint Glow", tier: "10%" },
          { hex: C.green, label: "Matrix Green", tier: "10%" },
          { hex: C.amber, label: "Amber", tier: "10%" },
          { hex: C.cyan, label: "Cyan", tier: "30%" },
          { hex: C.deepTeal, label: "Deep Teal", tier: "30%" },
          { hex: C.silver, label: "Silver", tier: "30%" },
          { hex: C.brightSilver, label: "Bright Silver", tier: "30%" },
          { hex: C.warmGray, label: "Warm Gray", tier: "60%" },
          { hex: C.purple, label: "Muted Purple", tier: "60%" },
          { hex: C.teal, label: "Teal BG", tier: "60%" },
          { hex: C.bg, label: "Deep Space", tier: "60%" },
          { hex: C.void, label: "Void", tier: "60%" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{
              width: 34, height: 22, borderRadius: 3, background: s.hex,
              border: `1px solid ${C.teal}`,
            }} />
            <span style={{ fontSize: 6, color: C.warmGray, textAlign: "center", maxWidth: 38, lineHeight: 1.2 }}>{s.label}</span>
            <span style={{ fontSize: 5, color: C.purple }}>{s.tier}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", gap: 20, justifyContent: "center",
        alignItems: "flex-start", flexWrap: "wrap",
      }}>
        {/* Desktop */}
        <div>
          <div style={{ fontSize: 8, color: C.warmGray, letterSpacing: 2, marginBottom: 6, textAlign: "center" }}>DESKTOP</div>
          <div style={{
            width: 480, maxWidth: "90vw", border: `2px solid ${C.teal}`,
            borderRadius: 10, background: C.bg, overflow: "hidden",
          }}>
            <div style={{
              padding: "6px 10px", background: `${C.teal}40`,
              display: "flex", alignItems: "center", gap: 5,
              borderBottom: `1px solid ${C.teal}`,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff5f5780" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#febc2e80" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#28c84080" }} />
              <div style={{ flex: 1, marginLeft: 6, padding: "2px 8px", background: `${C.teal}40`, borderRadius: 3, fontSize: 7, color: C.purple, textAlign: "center" }}>yourname.dev</div>
            </div>
            <div style={{ maxHeight: 560, overflowY: "auto" }}>
              <Desktop />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div>
          <div style={{ fontSize: 8, color: C.warmGray, letterSpacing: 2, marginBottom: 6, textAlign: "center" }}>MOBILE</div>
          <div style={{
            width: 280, border: `2px solid ${C.teal}`,
            borderRadius: 22, background: C.bg, overflow: "hidden",
            position: "relative",
          }}>
            <div style={{ width: 80, height: 18, background: C.void, borderRadius: "0 0 12px 12px", margin: "0 auto" }} />
            <div style={{ maxHeight: 520, overflowY: "auto" }}>
              <Mobile />
            </div>
            <div style={{ padding: "5px 0 3px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: 80, height: 3, borderRadius: 2, background: `${C.teal}60` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
