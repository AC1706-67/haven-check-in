/**
 * Dashboard.jsx — Haven Check-In Admin Analytics
 * Place at: src/pages/Dashboard.jsx
 *
 * Dependencies: recharts (npm install recharts)
 * Requires: src/lib/supabase.ts exports `supabase`
 *
 * Add to App.jsx:
 *   import Dashboard from './pages/Dashboard';
 *   <Route path="/dashboard" element={<Dashboard />} />
 *
 * Column names verified against live Supabase schema June 2026.
 */

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { supabase } from "../lib/supabase";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  teal:     "#0D9488",
  tealDark: "#134E4A",
  tealDim:  "#0F2B28",
  amber:    "#F59E0B",
  rose:     "#F43F5E",
  indigo:   "#6366F1",
  slate0:   "#020617",
  slate1:   "#0F172A",
  slate2:   "#1E293B",
  slate3:   "#334155",
  muted:    "#64748B",
  white:    "#F8FAFC",
};

const PIE_COLORS = [C.teal, C.amber, C.indigo, C.rose, "#10B981", "#8B5CF6"];

// ── Utilities ────────────────────────────────────────────────────────────────
const todayISO      = () => new Date().toISOString().slice(0, 10);
const monthStartISO = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

const shortDate = iso => { const [, m, d] = iso.split("-"); return `${+m}/${+d}`; };

// ── Sub-components ───────────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: C.slate1, border: `1px solid ${accent ?? C.slate2}`,
      borderRadius: 16, padding: "22px 18px",
      boxShadow: accent ? `0 0 24px ${accent}1A` : "none",
      transition: "transform 0.15s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ color: C.muted, fontSize: 11, fontFamily: "'DM Mono',monospace", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: accent ?? C.white, fontSize: 40, fontFamily: "'Syne',sans-serif", fontWeight: 800, lineHeight: 1 }}>
        {value ?? "—"}
      </div>
      {sub && <div style={{ color: C.muted, fontSize: 11, fontFamily: "'DM Mono',monospace", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 style={{
      color: C.teal, fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700,
      letterSpacing: "0.13em", textTransform: "uppercase",
      margin: "28px 0 10px", borderLeft: `3px solid ${C.teal}`, paddingLeft: 10,
    }}>
      {children}
    </h2>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.slate1, border: `1px solid ${C.slate2}`, borderRadius: 16, padding: 18, ...style }}>
      {children}
    </div>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.slate3, border: `1px solid ${C.teal}`, borderRadius: 8, padding: "8px 14px", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
      <div style={{ color: C.muted, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color ?? C.teal }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [ts, setTs]             = useState(null);

  // KPIs
  const [totalPax, setTotalPax]       = useState(null);
  const [todayVisits, setTodayVisits] = useState(null);
  const [monthVisits, setMonthVisits] = useState(null);
  const [newEnrolled, setNewEnrolled] = useState(null);
  const [narcanTotal, setNarcanTotal] = useState(null);
  const [overdoseFlag, setOverdoseFlag] = useState(null);

  // Charts
  const [dailyData, setDailyData]     = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [demoGender, setDemoGender]   = useState([]);
  const [demoAge, setDemoAge]         = useState([]);
  const [naloxoneOrgs, setNaloxoneOrgs] = useState([]);
  const [totalNxUnits, setTotalNxUnits] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today      = todayISO();
      const monthStart = monthStartISO();
      const days       = last7Days();
      const weekStart  = days[0];

      // 1 — Total participants enrolled
      const { count: c1 } = await supabase
        .from("hc_participants")
        .select("*", { count: "exact", head: true });
      setTotalPax(c1 ?? 0);

      // 2 — Visits today  (visit_date is DATE type — compare as string YYYY-MM-DD)
      const { count: c2 } = await supabase
        .from("hc_visits")
        .select("*", { count: "exact", head: true })
        .eq("visit_date", today);
      setTodayVisits(c2 ?? 0);

      // 3 — Visits this month
      const { count: c3 } = await supabase
        .from("hc_visits")
        .select("*", { count: "exact", head: true })
        .gte("visit_date", monthStart);
      setMonthVisits(c3 ?? 0);

      // 4 — New enrollments this month
      const { count: c4 } = await supabase
        .from("hc_participants")
        .select("*", { count: "exact", head: true })
        .gte("enrolled_at", `${monthStart}T00:00:00`);
      setNewEnrolled(c4 ?? 0);

      // 5 — Narcan units distributed (all time, from hc_visits)
      const { data: narcanRows } = await supabase
        .from("hc_visits")
        .select("narcan_quantity")
        .eq("narcan_received", true);
      const narcanSum = (narcanRows ?? []).reduce((sum, r) => sum + (r.narcan_quantity ?? 1), 0);
      setNarcanTotal(narcanSum);

      // 6 — Recent overdose reports this month
      const { count: c6 } = await supabase
        .from("hc_visits")
        .select("*", { count: "exact", head: true })
        .eq("recent_overdose", true)
        .gte("visit_date", monthStart);
      setOverdoseFlag(c6 ?? 0);

      // 7 — Daily visits last 7 days
      const { data: weekRows } = await supabase
        .from("hc_visits")
        .select("visit_date")
        .gte("visit_date", weekStart);
      const dayCounts = Object.fromEntries(days.map(d => [d, 0]));
      (weekRows ?? []).forEach(r => { if (r.visit_date && dayCounts[r.visit_date] !== undefined) dayCounts[r.visit_date]++; });
      setDailyData(days.map(d => ({ day: shortDate(d), visits: dayCounts[d] })));

      // 8 — Services breakdown (count booleans across all visits this month)
      const { data: svcRows } = await supabase
        .from("hc_visits")
        .select("shower,tepap_food,narcan_received,clothing_pickup,mail_pickup,referral_made")
        .gte("visit_date", monthStart);
      const svcMap = { Shower: 0, "TEPAP Food": 0, Narcan: 0, Clothing: 0, Mail: 0, Referral: 0 };
      (svcRows ?? []).forEach(r => {
        if (r.shower)          svcMap["Shower"]++;
        if (r.tepap_food)      svcMap["TEPAP Food"]++;
        if (r.narcan_received) svcMap["Narcan"]++;
        if (r.clothing_pickup) svcMap["Clothing"]++;
        if (r.mail_pickup)     svcMap["Mail"]++;
        if (r.referral_made)   svcMap["Referral"]++;
      });
      setServicesData(Object.entries(svcMap).map(([name, count]) => ({ name, count })));

      // 9 — Demographics: gender breakdown
      const { data: genderRows } = await supabase
        .from("hc_demographics")
        .select("gender");
      const gMap = {};
      (genderRows ?? []).forEach(r => { const g = r.gender || "Unknown"; gMap[g] = (gMap[g] || 0) + 1; });
      setDemoGender(Object.entries(gMap).map(([name, value]) => ({ name, value })));

      // 10 — Demographics: age range breakdown
      const { data: ageRows } = await supabase
        .from("hc_demographics")
        .select("age_range");
      const aMap = {};
      (ageRows ?? []).forEach(r => { const a = r.age_range || "Unknown"; aMap[a] = (aMap[a] || 0) + 1; });
      setDemoAge(Object.entries(aMap).sort().map(([name, value]) => ({ name, value })));

      // 11 — Naloxone Hub: pickups by org
      //   hc_naloxone_pickups.org_id FK → hc_naloxone_orgs.id, org name = hc_naloxone_orgs.org_name
      //   pickup quantity column = units_picked_up
      const { data: nxPickups } = await supabase
        .from("hc_naloxone_pickups")
        .select("units_picked_up, hc_naloxone_orgs(org_name)");
      const orgMap = {};
      let nxTotal = 0;
      (nxPickups ?? []).forEach(p => {
        const name = p.hc_naloxone_orgs?.org_name ?? "Unknown Org";
        orgMap[name] = (orgMap[name] || 0) + (p.units_picked_up ?? 0);
        nxTotal += (p.units_picked_up ?? 0);
      });
      setTotalNxUnits(nxTotal);
      setNaloxoneOrgs(
        Object.entries(orgMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count]) => ({ name, count }))
      );

      setTs(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err?.message ?? "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.slate3}; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.slate0, color: C.white, fontFamily: "'DM Mono',monospace", paddingBottom: 88 }}>

        {/* Header */}
        <div style={{ background: C.slate1, borderBottom: `1px solid ${C.slate2}`, padding: "18px 20px 14px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: C.teal, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>Anonymous Haven LLC</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, color: C.white }}>Haven Check-In</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>Proyecto Centro Salvavida — 800 Montana Ave</div>
            </div>
            <button onClick={fetchAll} disabled={loading} style={{
              background: C.tealDim, border: `1px solid ${C.teal}`, borderRadius: 8,
              color: C.teal, fontFamily: "'DM Mono',monospace", fontSize: 11,
              padding: "8px 14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          {ts && <div style={{ color: C.muted, fontSize: 10, marginTop: 6 }}>Updated {ts} &bull; auto-refreshes every 5 min</div>}
        </div>

        <div style={{ padding: "0 16px" }}>

          {/* Error */}
          {error && (
            <div style={{ background: "#450A0A", border: `1px solid ${C.rose}`, borderRadius: 12, padding: "14px 18px", margin: "14px 0", color: "#FCA5A5", fontSize: 13 }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* ── KPI Grid ── */}
          <SectionLabel>Program Overview</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <KPICard label="Total Participants" value={loading ? "..." : (totalPax ?? 0).toLocaleString()} sub="enrolled since launch" accent={C.teal} />
            <KPICard label="Check-Ins Today"   value={loading ? "..." : todayVisits} sub={new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})} accent={C.amber} />
            <KPICard label="Visits This Month"  value={loading ? "..." : monthVisits} sub="total ODC visits" />
            <KPICard label="New Enrollments"    value={loading ? "..." : newEnrolled} sub="this month" accent={C.rose} />
          </div>

          {/* Narcan + Overdose row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <KPICard label="Naloxone Units Given" value={loading ? "..." : (narcanTotal ?? 0).toLocaleString()} sub="all time" accent={C.indigo} />
            <KPICard label="Overdose Reports"   value={loading ? "..." : overdoseFlag} sub="this month" accent={overdoseFlag > 0 ? C.rose : undefined} />
          </div>

          {/* ── Daily Bar Chart ── */}
          <SectionLabel>Daily Visits — Last 7 Days</SectionLabel>
          <Card>
            {loading
              ? <div style={{ height: 170, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading...</div>
              : <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: C.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: C.slate2 }} />
                    <Bar dataKey="visits" name="Visits" fill={C.teal} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </Card>

          {/* ── Services This Month ── */}
          <SectionLabel>Services Used This Month</SectionLabel>
          <Card>
            {loading
              ? <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading...</div>
              : <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={servicesData} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fill: C.muted, fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fill: C.white, fontSize: 11, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: C.slate2 }} />
                    <Bar dataKey="count" name="Count" fill={C.amber} radius={[0,6,6,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </Card>

          {/* ── Demographics Row ── */}
          <SectionLabel>Participant Demographics</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Gender Pie */}
            <Card>
              <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Gender</div>
              {loading
                ? <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>...</div>
                : <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={demoGender} cx="50%" cy="45%" outerRadius={48} dataKey="value" labelLine={false}>
                        {demoGender.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: C.muted }} />
                      <Tooltip content={<ChartTip />} />
                    </PieChart>
                  </ResponsiveContainer>
              }
            </Card>

            {/* Age Pie */}
            <Card>
              <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Age Range</div>
              {loading
                ? <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>...</div>
                : <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={demoAge} cx="50%" cy="45%" outerRadius={48} dataKey="value" labelLine={false}>
                        {demoAge.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: C.muted }} />
                      <Tooltip content={<ChartTip />} />
                    </PieChart>
                  </ResponsiveContainer>
              }
            </Card>
          </div>

          {/* ── Naloxone Hub ── */}
          <SectionLabel>Region 10 Naloxone Hub</SectionLabel>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.slate2}` }}>
              <span style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em" }}>Total Units Distributed</span>
              <span style={{ color: C.amber, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26 }}>
                {loading ? "..." : (totalNxUnits ?? 0).toLocaleString()}
              </span>
            </div>
            {loading
              ? <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: "16px 0" }}>Loading...</div>
              : naloxoneOrgs.length === 0
                ? <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: "16px 0" }}>No pickup data yet</div>
                : naloxoneOrgs.map((org, i) => {
                    const pct = Math.round((org.count / (naloxoneOrgs[0]?.count || 1)) * 100);
                    return (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: C.white, fontSize: 12, maxWidth: "76%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.name}</span>
                          <span style={{ color: C.amber, fontSize: 12 }}>{org.count}</span>
                        </div>
                        <div style={{ background: C.slate2, borderRadius: 4, height: 4 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${C.teal},${C.amber})`, borderRadius: 4, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })
            }
          </Card>

          {/* Footer */}
          <div style={{ textAlign: "center", color: C.muted, fontSize: 10, margin: "24px 0 8px", letterSpacing: "0.06em" }}>
            Protected under 42 CFR Part 2 &bull; Anonymous Haven LLC &bull; {new Date().getFullYear()}
          </div>

        </div>
      </div>
    </>
  );
}
