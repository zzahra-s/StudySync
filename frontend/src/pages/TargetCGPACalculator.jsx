import React, { useState, useEffect } from 'react';
import { fetchWithToken } from '../utils/fetchWithToken';

const API = 'http://localhost:5001/api';

// ─────────────────────────────────────────────────────────────────
// Pure corrected calculation (mirrors backend logic exactly)
// ─────────────────────────────────────────────────────────────────
function calculatePlan(currentCGPA, completedCredits, targetCGPA, remainingCredits, remainingSemesters, customSemesters = []) {
  const cc  = parseFloat(currentCGPA);
  const cp  = parseFloat(completedCredits);
  const tc  = parseFloat(targetCGPA);
  const rc  = parseFloat(remainingCredits);
  const rs  = parseInt(remainingSemesters, 10);
  const tot = cp + rc;

  if (rc <= 0 || rs <= 0) {
    return { achievable: true, requiredSGPA: cc, maxPossible: cc, semesters: [],
      message: `Your current CGPA of ${cc.toFixed(2)} is already your final CGPA.` };
  }

  const required = (tc * tot - cc * cp) / rc;
  const maxPoss  = (cc * cp + 4.0 * rc) / tot;

  if (required > 4.0) {
    return {
      achievable: false,
      requiredSGPA: null,
      maxPossible: parseFloat(maxPoss.toFixed(2)),
      semesters: [],
      message: `Target CGPA of ${tc.toFixed(2)} is unachievable. Maximum possible CGPA is ${maxPoss.toFixed(2)}.`
    };
  }

  const sgpa = parseFloat(required.toFixed(2));
  let semesters;
  if (customSemesters && customSemesters.length > 0) {
    semesters = customSemesters.map((s, i) => ({
      name: s.name || `Semester ${i + 1}`,
      credits: parseInt(s.credits, 10),
      requiredSGPA: sgpa
    }));
  } else {
    const cps = parseFloat((rc / rs).toFixed(1));
    semesters = Array.from({ length: rs }, (_, i) => ({
      name: `Semester ${i + 1}`,
      credits: cps,
      requiredSGPA: sgpa
    }));
  }

  return {
    achievable: true,
    requiredSGPA: sgpa,
    maxPossible: parseFloat(maxPoss.toFixed(2)),
    semesters,
    message: `Score approximately ${sgpa.toFixed(2)} SGPA each semester to reach your target CGPA of ${tc.toFixed(2)}.`
  };
}

// ─────────────────────────────────────────────────────────────────
// Colour helpers
// ─────────────────────────────────────────────────────────────────
function sgpaColor(v) {
  if (!v && v !== 0) return 'var(--text-muted)';
  if (v >= 3.5) return 'var(--accent-gold)';
  if (v >= 3.0) return 'var(--accent)';
  if (v >= 2.5) return 'var(--warning)';
  return 'var(--red)';
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Inputs', 'Method', 'Results'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
      {steps.map((label, i) => {
        const idx   = i + 1;
        const done  = step > idx;
        const active = step === idx;
        return (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 14, transition: 'all .3s',
                background: done ? 'var(--success)' : active ? 'linear-gradient(135deg, var(--accent), var(--accent-hover))' : 'var(--bg-tertiary)',
                color: done || active ? '#0B1120' : 'var(--text-muted)',
                border: active ? '2px solid var(--accent)' : done ? '2px solid var(--success)' : '1px solid var(--border)',
                boxShadow: active ? '0 0 0 4px var(--accent-glow)' : 'none'
              }}>
                {done ? '✓' : idx}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--accent)' : done ? 'var(--success)' : 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 2,
                width: 60,
                background: step > idx + 1 ? 'var(--success)' : step > idx ? 'linear-gradient(90deg, var(--success), var(--border))' : 'var(--border)',
                margin: '0 4px',
                marginBottom: 22,
                transition: 'all .4s'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function InfoBanner({ currentCGPA, completedCredits, loading }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg-tertiary) 100%)',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex',
      gap: 32, flexWrap: 'wrap', alignItems: 'center'
    }}>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, color: 'var(--text-secondary)' }}>Current CGPA</div>
        {loading
          ? <div style={{ width: 64, height: 28, background: 'rgba(255,255,255,.05)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          : <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-gold)', fontFamily: "'JetBrains Mono', monospace" }}>{currentCGPA !== null ? Number(currentCGPA).toFixed(2) : '—'}</div>}
      </div>
      <div style={{ width: 1, height: 40, background: 'var(--border)', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, color: 'var(--text-secondary)' }}>Completed Credits</div>
        {loading
          ? <div style={{ width: 48, height: 28, background: 'rgba(255,255,255,.05)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          : <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{completedCredits !== null ? completedCredits : '—'}</div>}
      </div>
      <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13, maxWidth: 220, lineHeight: 1.5 }}>
        📊 Live data fetched from your grade records
      </div>
    </div>
  );
}

function InputCard({ label, id, type = 'number', value, onChange, placeholder, hint, min, max, step }) {
  return (
    <div className="form-group" style={{ marginBottom: 20 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '.3px' }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} min={min} max={max} step={step || 'any'}
        style={{
          width: '100%', padding: '11px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
          fontSize: 15, outline: 'none', transition: 'border .2s, box-shadow 0.2s', boxSizing: 'border-box',
          fontFamily: 'inherit', background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
      />
      {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function SemesterResultCard({ sem, index }) {
  const color = sgpaColor(sem.requiredSGPA);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderRadius: 12, background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)', transition: 'box-shadow .2s, border-color 0.2s'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow)';
      e.currentTarget.style.borderColor = 'var(--accent-glow)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'var(--border)';
    }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{sem.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{sem.credits} credit hours</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{sem.requiredSGPA?.toFixed(2)}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.5px' }}>Required SGPA</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
export default function TargetCGPACalculator() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user?.student_id;

  // Live CGPA state (fetched from backend)
  const [liveCGPA,    setLiveCGPA]    = useState(null);
  const [liveCredits, setLiveCredits] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);

  // Step & flow
  const [step,   setStep]   = useState(1);
  const [method, setMethod] = useState(null); // 'equal' | 'custom'

  // Form inputs
  const [targetCGPA,          setTargetCGPA]         = useState('');
  const [remainingCredits,    setRemainingCredits]    = useState('');
  const [remainingSemesters,  setRemainingSemesters]  = useState('');
  const [manualCurrentCGPA,   setManualCurrentCGPA]   = useState('');
  const [manualCompleted,     setManualCompleted]     = useState('');
  const [useManual,           setUseManual]           = useState(false);

  // Custom semester inputs
  const [customSems, setCustomSems] = useState([]);

  // Results
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // ── Fetch live CGPA on mount ──────────────────────────────────
  useEffect(() => {
    if (!studentId) { setLiveLoading(false); setUseManual(true); return; }
    (async () => {
      try {
        const res  = await fetchWithToken(`${API}/students/${studentId}/cgpa`);
        const data = await res.json();
        if (res.ok && data.cgpa !== null && data.cgpa !== undefined) {
          setLiveCGPA(parseFloat(data.cgpa));
          setLiveCredits(parseFloat(data.total_credit_hours) || 0);
        } else {
          setUseManual(true);
        }
      } catch { setUseManual(true); }
      finally  { setLiveLoading(false); }
    })();
  }, [studentId]);

  // ── Load existing saved plan ──────────────────────────────────
  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const res  = await fetchWithToken(`${API}/students/${studentId}/target-cgpa-plan`);
        const data = await res.json();
        if (res.ok && data.plan) {
          const p = data.plan;
          setTargetCGPA(p.target_cgpa?.toString() || '');
          setRemainingCredits(p.remaining_credits?.toString() || '');
          setRemainingSemesters(p.remaining_semesters?.toString() || '');
          setMethod(p.distribution_method || 'equal');
          // Reconstruct results
          const cc  = parseFloat(p.current_cgpa);
          const cp  = parseFloat(p.total_degree_credits) - parseFloat(p.remaining_credits);
          const sems = p.semesters?.map(s => ({ name: s.semester_name, credits: s.credits, requiredSGPA: parseFloat(s.required_sgpa) })) || [];
          setResult({
            achievable:   !!p.is_achievable,
            requiredSGPA: parseFloat(p.required_sgpa) || null,
            maxPossible:  parseFloat(p.max_possible_cgpa) || null,
            semesters:    sems,
            message:      p.is_achievable
              ? `Score approximately ${parseFloat(p.required_sgpa).toFixed(2)} SGPA each semester to reach your target CGPA of ${parseFloat(p.target_cgpa).toFixed(2)}.`
              : `Maximum possible CGPA is ${parseFloat(p.max_possible_cgpa).toFixed(2)}. Please lower your target.`
          });
          if (sems.length > 0 || p.distribution_method === 'equal') setStep(3);
        }
      } catch { /* no saved plan — that's fine */ }
    })();
  }, [studentId]);

  // ── Derived values ────────────────────────────────────────────
  const currentCGPA      = useManual ? parseFloat(manualCurrentCGPA) : liveCGPA;
  const completedCredits = useManual ? parseFloat(manualCompleted)   : liveCredits;

  // ── Validation helpers ────────────────────────────────────────
  function validate() {
    if (useManual) {
      if (isNaN(currentCGPA) || currentCGPA < 0 || currentCGPA > 4)
        return 'Current CGPA must be between 0 and 4.0';
      if (isNaN(completedCredits) || completedCredits < 0)
        return 'Completed credits must be 0 or more';
    }
    const tc = parseFloat(targetCGPA);
    if (isNaN(tc) || tc < 0 || tc > 4) return 'Target CGPA must be between 0 and 4.0';
    const rc = parseFloat(remainingCredits);
    if (isNaN(rc) || rc <= 0)          return 'Remaining credit hours must be greater than 0';
    const rs = parseInt(remainingSemesters, 10);
    if (isNaN(rs) || rs <= 0)          return 'Remaining semesters must be at least 1';
    return null;
  }

  function validateCustom() {
    for (const s of customSems) {
      if (!s.name.trim()) return 'All semester names are required';
      if (isNaN(parseInt(s.credits, 10)) || parseInt(s.credits, 10) <= 0)
        return 'All semester credit hours must be positive';
    }
    const total = customSems.reduce((sum, s) => sum + parseInt(s.credits, 10), 0);
    if (total !== parseInt(remainingCredits, 10))
      return `Custom credit total (${total}) must equal remaining credits (${remainingCredits})`;
    return null;
  }

  // ── Handlers ──────────────────────────────────────────────────
  function handleStep1(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  }

  function selectMethod(m) {
    setMethod(m);
    if (m === 'equal') {
      runCalculation(m, []);
    } else {
      const rs = parseInt(remainingSemesters, 10);
      setCustomSems(Array.from({ length: rs }, (_, i) => ({ name: `Semester ${i + 1}`, credits: '' })));
      setStep(3);
    }
  }

  function runCalculation(m, sems) {
    const calc = calculatePlan(
      currentCGPA, completedCredits,
      parseFloat(targetCGPA),
      parseFloat(remainingCredits),
      parseInt(remainingSemesters, 10),
      m === 'custom' ? sems : []
    );
    setResult(calc);
    setStep(3);
  }

  function handleCustomSubmit(e) {
    e.preventDefault();
    const err = validateCustom();
    if (err) { setError(err); return; }
    setError('');
    runCalculation('custom', customSems);
  }

  async function handleSave() {
    if (!studentId) { setError('You must be logged in to save a plan.'); return; }
    setSaving(true);
    setSaved(false);
    try {
      const body = {
        currentCGPA:       currentCGPA,
        completedCredits:  completedCredits,
        targetCGPA:        parseFloat(targetCGPA),
        remainingCredits:  parseInt(remainingCredits, 10),
        remainingSemesters:parseInt(remainingSemesters, 10),
        distributionMethod:method,
        semesters:         method === 'custom' ? customSems : []
      };
      const res = await fetchWithToken(`${API}/students/${studentId}/target-cgpa-plan`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else {
        const data = await res.json();
        setError(data.message || 'Failed to save plan.');
      }
    } catch { setError('Network error while saving.'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!studentId) return;
    try {
      await fetchWithToken(`${API}/students/${studentId}/target-cgpa-plan`, { method: 'DELETE' });
      handleReset();
    } catch { setError('Failed to delete plan.'); }
  }

  function handleReset() {
    setStep(1); setMethod(null); setResult(null); setError('');
    setTargetCGPA(''); setRemainingCredits(''); setRemainingSemesters('');
    setCustomSems([]); setManualCurrentCGPA(''); setManualCompleted('');
    setSaved(false);
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop { 0%{transform:scale(.95);opacity:0} 100%{transform:scale(1);opacity:1} }
        .cgpa-card { animation: slideUp .35s ease both; }
        .method-btn {
          cursor: pointer;
          text-align: left;
          transition: all .25s ease;
          outline: none;
          box-shadow: var(--shadow-sm);
        }
        .method-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow) !important;
          border-color: var(--accent) !important;
        }
      `}</style>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">🎯 Target CGPA Calculator</h1>
        <p className="description">
          Plan exactly what SGPA you need each semester to hit your goal — with mathematically correct results.
        </p>
      </div>

      {/* ── Live CGPA banner ─────────────────────────────────── */}
      <InfoBanner currentCGPA={liveCGPA} completedCredits={liveCredits} loading={liveLoading} />

      {/* ── Step indicator ───────────────────────────────────── */}
      <StepIndicator step={step} />

      {/* ══════════════════════════════════════════════════════
          STEP 1 – Input form
      ═══════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="card cgpa-card">
          <h2 style={{ marginBottom: 6, fontSize: 20, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>Academic Information</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
            {liveLoading ? 'Fetching your live CGPA…' : liveCGPA !== null
              ? `Your current CGPA (${liveCGPA.toFixed(2)}) and completed credits (${liveCredits}) are automatically loaded from your grades.`
              : 'No graded courses found — please enter your current CGPA manually.'}
          </p>

          {/* Manual override toggle */}
          {liveCGPA !== null && !liveLoading && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={useManual} onChange={e => setUseManual(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              Override with custom CGPA &amp; credits
            </label>
          )}

          <form onSubmit={handleStep1}>
            {useManual && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16 }}>
                <InputCard
                  id="manCGPA" label="Your Current CGPA" value={manualCurrentCGPA}
                  onChange={e => setManualCurrentCGPA(e.target.value)}
                  placeholder="e.g. 3.10" min="0" max="4" hint="Between 0.0 and 4.0"
                />
                <InputCard
                  id="manCred" label="Completed Credit Hours" value={manualCompleted}
                  onChange={e => setManualCompleted(e.target.value)}
                  placeholder="e.g. 60" min="0" hint="Total credits completed so far"
                />
              </div>
            )}

            <div className="inputs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <InputCard
                id="targetCGPA" label="🎯 Target CGPA" value={targetCGPA}
                onChange={e => setTargetCGPA(e.target.value)}
                placeholder="e.g. 3.50" min="0" max="4" hint="Your desired final CGPA (0–4.0)"
              />
              <InputCard
                id="remCredits" label="Remaining Credit Hours" value={remainingCredits}
                onChange={e => setRemainingCredits(e.target.value)}
                placeholder="e.g. 80" min="1" step="1" hint="Total credits left to complete"
              />
              <div style={{ gridColumn: 'span 2' }}>
                <InputCard
                  id="remSems" label="Remaining Semesters" value={remainingSemesters}
                  onChange={e => setRemainingSemesters(e.target.value)}
                  placeholder="e.g. 4" min="1" step="1" hint="How many semesters left"
                />
              </div>
            </div>

            {error && (
              <div className="error" style={{ marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>
                Continue → Choose Method
              </button>
              {result && (
                <button type="button" className="btn-secondary" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 2 – Method selection
      ═══════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="card cgpa-card">
          <h2 style={{ marginBottom: 8, fontSize: 20, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>Choose Distribution Method</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
            How would you like to distribute your remaining <strong>{remainingCredits} credits</strong> across <strong>{remainingSemesters} semesters</strong>?
          </p>

          <div className="method-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              {
                key: 'equal',
                icon: '⚖️',
                title: 'Equal Distribution',
                desc: `Split ${remainingCredits} credits equally — ${(parseFloat(remainingCredits) / parseInt(remainingSemesters, 10)).toFixed(1)} credits per semester. Fastest calculation.`,
                accent: 'var(--accent)'
              },
              {
                key: 'custom',
                icon: '✏️',
                title: 'Custom Distribution',
                desc: 'Specify exact credit hours for each semester — useful if semesters vary in load.',
                accent: 'var(--accent-gold)'
              }
            ].map(opt => (
              <button key={opt.key} className="method-btn" type="button" onClick={() => selectMethod(opt.key)}
                style={{
                  padding: '28px 24px', border: `1.5px solid var(--border)`, borderRadius: 16,
                  background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{opt.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>{opt.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
            ← Back
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 3A – Custom semester input form
      ═══════════════════════════════════════════════════════ */}
      {step === 3 && method === 'custom' && !result && (
        <div className="card cgpa-card">
          <h2 style={{ marginBottom: 4, fontSize: 20, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>Custom Semester Credits</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Total to distribute: <strong style={{ color: 'var(--accent)' }}>{remainingCredits} credits</strong>.
            Credits sum must match exactly.
          </p>

          <form onSubmit={handleCustomSubmit}>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '6px', marginBottom: '16px' }}>
              {customSems.map((sem, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end',
                  padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 12, marginBottom: 12,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <InputCard
                      id={`sn-${i}`} type="text" label={`Semester ${i + 1} Name`}
                      value={sem.name} placeholder="e.g. Spring 2026"
                      onChange={e => setCustomSems(cs => cs.map((s, j) => j === i ? { ...s, name: e.target.value } : s))}
                    />
                    <InputCard
                      id={`sc-${i}`} label="Credit Hours"
                      value={sem.credits} placeholder="e.g. 18" min="1" step="1"
                      onChange={e => setCustomSems(cs => cs.map((s, j) => j === i ? { ...s, credits: e.target.value } : s))}
                    />
                  </div>
                  <div style={{ paddingBottom: 16, color: customSems.reduce((s, x) => s + (parseInt(x.credits, 10) || 0), 0) > parseInt(remainingCredits, 10) ? 'var(--red)' : 'var(--success)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>
                    {parseInt(sem.credits, 10) || 0} cr
                  </div>
                </div>
              ))}
            </div>

            {/* Credit tally */}
            {(() => {
              const used = customSems.reduce((s, x) => s + (parseInt(x.credits, 10) || 0), 0);
              const rem  = parseInt(remainingCredits, 10);
              return (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 10, background: used === rem ? 'var(--success-bg)' : 'var(--red-bg)', marginBottom: 16, border: `1px solid ${used === rem ? 'rgba(123, 200, 164, 0.3)' : 'rgba(249, 112, 102, 0.3)'}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Credit Total</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: used === rem ? 'var(--success)' : 'var(--red)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {used} / {rem} {used === rem ? '✓' : ''}
                  </span>
                </div>
              );
            })()}

            {error && (
              <div className="error" style={{ marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Calculate Requirements</button>
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 3B – Results
      ═══════════════════════════════════════════════════════ */}
      {step === 3 && result && (
        <div className="cgpa-card" style={{ animation: 'pop .35s ease both' }}>

          {/* ── Status banner ──────────────────────────────── */}
          <div style={{
            borderRadius: 16, padding: '24px 28px', marginBottom: 24,
            background: result.achievable
              ? 'linear-gradient(135deg, rgba(123,200,164,0.15) 0%, rgba(108,155,207,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(249,112,102,0.15) 0%, rgba(232,168,124,0.1) 100%)',
            border: result.achievable
              ? '1.5px solid var(--success)'
              : '1.5px solid var(--red)',
            boxShadow: result.achievable
              ? '0 8px 32px rgba(123, 200, 164, 0.08)'
              : '0 8px 32px rgba(249, 112, 102, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ fontSize: 36, lineHeight: 1 }}>{result.achievable ? '🎯' : '⚠️'}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
                  {result.achievable ? 'Target Achievable!' : 'Target Unachievable'}
                </div>
                <div style={{ fontSize: 14, color: result.achievable ? 'var(--text-secondary)' : 'var(--red)', lineHeight: 1.6 }}>
                  {result.message}
                </div>
              </div>
            </div>

            {/* Big SGPA number */}
            {result.achievable && result.requiredSGPA !== null && (
              <div style={{ marginTop: 20, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Required SGPA (every semester)</div>
                  <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {result.requiredSGPA.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Max Possible CGPA</div>
                  <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--success)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {result.maxPossible?.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {!result.achievable && (
              <div style={{ marginTop: 16, display: 'flex', gap: 32 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Maximum Possible CGPA</div>
                  <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--red)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {result.maxPossible?.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Semester breakdown ─────────────────────────── */}
          {result.semesters && result.semesters.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16, fontSize: 16, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>
                📅 Semester Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.semesters.map((sem, i) => (
                  <SemesterResultCard key={i} sem={sem} index={i} />
                ))}
              </div>

              {result.achievable && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--accent-glow)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', border: '1px solid var(--border)', lineHeight: 1.6 }}>
                  ℹ️ <strong>Why the same SGPA for all semesters?</strong> Scoring identical SGPA each semester automatically produces exactly your target CGPA, regardless of how credits are split between semesters. This is mathematically correct.
                </div>
              )}
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, minWidth: 140, background: saved ? 'var(--success)' : 'var(--accent)', color: '#0B1120', opacity: saving ? .7 : 1 }}>
              {saving ? '⏳ Saving…' : saved ? '✓ Saved!' : '💾 Save Plan'}
            </button>
            <button className="btn-secondary" onClick={() => setStep(2)}>
              ← Change Method
            </button>
            <button className="btn-secondary" onClick={handleReset} style={{ color: 'var(--red)', borderColor: 'rgba(249, 112, 102, 0.3)' }}>
              🗑 Reset
            </button>
            {studentId && (
              <button className="btn-secondary" onClick={handleDelete} style={{ color: 'var(--text-muted)' }}>
                Delete Saved Plan
              </button>
            )}
          </div>

          {error && (
            <div className="error" style={{ marginTop: 12 }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          Formula reference card
      ═══════════════════════════════════════════════════════ */}
      <div className="card" style={{ marginTop: 24, background: 'linear-gradient(135deg, var(--surface), var(--bg-tertiary))', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>
          📐 Formula Reference
        </h3>
        <div className="formula-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
          {[
            { label: 'Required SGPA', formula: '(Target × Total − Current × Completed) ÷ Remaining', color: 'var(--accent)' },
            { label: 'Max Possible CGPA', formula: '(Current × Completed + 4.0 × Remaining) ÷ Total', color: 'var(--accent-gold)' },
            { label: 'Total Credits', formula: 'Completed Credits + Remaining Credits', color: 'var(--success)' }
          ].map(f => (
            <div key={f.label} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: `1.5px solid var(--border)` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: f.color, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>{f.label}</div>
              <code style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>{f.formula}</code>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--accent-glow)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }}>
          ⚡ <strong>Testing:</strong> CGPA 3.1, Completed 20cr, Target 3.5, Remaining 100cr → Required SGPA = <strong>3.58</strong> ✓
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .inputs-grid {
            grid-template-columns: 1fr !important;
          }
          .inputs-grid > div {
            grid-column: span 1 !important;
          }
          .method-grid {
            grid-template-columns: 1fr !important;
          }
          .formula-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
