import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGrade, gradeTable } from '../utils/gradeCalculator';

const MCACalculator = () => {
  const navigate = useNavigate();
  const [mca, setMca] = useState(60);
  const [score, setScore] = useState(70);
  const [resultGrade, setResultGrade] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Automatically recalculate grade on input change
  useEffect(() => {
    const mcaNum = parseInt(mca, 10);
    const scoreNum = parseInt(score, 10);

    if (isNaN(mcaNum) || mcaNum < 30 || mcaNum > 91) {
      setErrorMsg('MCA must be a rounded integer between 30 and 91.');
      setResultGrade('');
      return;
    }

    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setErrorMsg('Absolute Score must be between 0 and 100.');
      setResultGrade('');
      return;
    }

    setErrorMsg('');
    const grade = getGrade(mcaNum, scoreNum);
    setResultGrade(grade);
  }, [mca, score]);

  // Color mapper based on calculated grade, using theme-compliant palette colors
  const getGradeStyles = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
      case 'A-':
        return {
          color: 'var(--success)', // #7BC8A4
          bg: 'var(--success-bg)',
          border: 'rgba(123, 200, 164, 0.3)',
          glow: 'rgba(123, 200, 164, 0.2)'
        };
      case 'B+':
      case 'B':
      case 'B-':
        return {
          color: 'var(--accent)', // #6C9BCF
          bg: 'var(--accent-glow)',
          border: 'rgba(108, 155, 207, 0.3)',
          glow: 'rgba(108, 155, 207, 0.2)'
        };
      case 'C+':
      case 'C':
      case 'C-':
        return {
          color: 'var(--accent-gold)', // #C5A880
          bg: 'rgba(197, 168, 128, 0.12)',
          border: 'rgba(197, 168, 128, 0.3)',
          glow: 'rgba(197, 168, 128, 0.2)'
        };
      case 'D+':
      case 'D':
      case 'F':
      default:
        return {
          color: 'var(--warning)', // #E8A87C
          bg: 'var(--warning-bg)',
          border: 'rgba(232, 168, 124, 0.3)',
          glow: 'rgba(232, 168, 124, 0.2)'
        };
    }
  };

  const currentStyles = getGradeStyles(resultGrade);

  // Get threshold list for the current MCA
  const getThresholdList = () => {
    const mcaNum = parseInt(mca, 10);
    if (isNaN(mcaNum) || !gradeTable[mcaNum]) return [];
    
    const row = gradeTable[mcaNum];
    const gradesOrder = ['D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
    const list = [];
    
    // Add F first
    list.push({ grade: 'F', range: `≤ ${row.F}`, minScore: 0 });
    
    for (let i = 0; i < gradesOrder.length; i++) {
      const grade = gradesOrder[i];
      const threshold = row[grade];
      if (threshold === null) continue;
      
      // Find the next non-null threshold to determine range max
      let nextThreshold = null;
      for (let j = i + 1; j < gradesOrder.length; j++) {
        if (row[gradesOrder[j]] !== null) {
          nextThreshold = row[gradesOrder[j]];
          break;
        }
      }
      
      const rangeText = nextThreshold !== null 
        ? `${threshold} - ${nextThreshold - 1}` 
        : `≥ ${threshold}`;
        
      list.push({
        grade,
        range: rangeText,
        minScore: threshold
      });
    }
    
    return list;
  };

  const thresholds = getThresholdList();

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <header className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">MCA-Based Relative Grade Calculator</h1>
        <p className="description">
          Find your relative letter grade using the course Mean of Class Average (MCA) and your absolute score.
        </p>
      </header>

      {errorMsg && <div className="error">{errorMsg}</div>}

      <div className="calculator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Input Card */}
        <div className="card" style={{ marginTop: 0, padding: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            Enter Course Data
          </h3>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div className="flex-between">
              <label htmlFor="mca-input" style={{ fontWeight: 600 }}>Mean of Class Average (MCA):</label>
              <strong style={{ color: 'var(--accent)', fontSize: '1.2rem', fontFamily: "'JetBrains Mono', monospace" }}>{mca}</strong>
            </div>
            <input 
              id="mca-input"
              type="number" 
              value={mca} 
              onChange={e => setMca(e.target.value)} 
              min="30" 
              max="91" 
              style={{ marginBottom: '12px' }}
            />
            <input 
              type="range" 
              value={mca} 
              onChange={e => setMca(e.target.value)} 
              min="30" 
              max="91" 
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer'
              }}
            />
            <small className="text-muted" style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              The MCA rounded value is typically found by clicking the course code in your transcript (Range: 30 - 91).
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div className="flex-between">
              <label htmlFor="score-input" style={{ fontWeight: 600 }}>Your Absolute Score:</label>
              <strong style={{ color: 'var(--accent)', fontSize: '1.2rem', fontFamily: "'JetBrains Mono', monospace" }}>{score}</strong>
            </div>
            <input 
              id="score-input"
              type="number" 
              value={score} 
              onChange={e => setScore(e.target.value)} 
              min="0" 
              max="100" 
              style={{ marginBottom: '12px' }}
            />
            <input 
              type="range" 
              value={score} 
              onChange={e => setScore(e.target.value)} 
              min="0" 
              max="100" 
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer'
              }}
            />
            <small className="text-muted" style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              Your raw overall numerical score for the course (Range: 0 - 100).
            </small>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="card" style={{ 
          marginTop: 0, 
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: resultGrade ? currentStyles.bg : 'var(--surface)',
          borderColor: resultGrade ? currentStyles.border : 'var(--border)',
          transition: 'all 0.3s ease',
          boxShadow: resultGrade ? `0 10px 30px ${currentStyles.glow}, var(--shadow)` : 'var(--shadow)'
        }}>
          {resultGrade ? (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="gpa-label" style={{ color: currentStyles.color, fontSize: '0.9rem', fontWeight: 700 }}>
                Calculated Grade
              </div>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                border: `4px solid ${currentStyles.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px auto',
                boxShadow: `0 8px 24px ${currentStyles.glow}`,
                fontSize: '3.5rem',
                fontWeight: '800',
                color: currentStyles.color,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.3s'
              }}>
                {resultGrade}
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem', marginTop: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                MCA: {mca} | Score: {score}
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '8px', maxWidth: '240px', margin: '8px auto 0' }}>
                {resultGrade === 'F' 
                  ? 'This score falls below the passing thresholds for this course average.'
                  : `Congratulations! Your score places you in the "${resultGrade}" grade tier.`}
              </p>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🧮</span>
              <h3 style={{ color: 'var(--text-muted)' }}>Awaiting Input</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '220px' }}>
                Please check the input values on the left to compute your grade.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Threshold Visualizer */}
      {!errorMsg && thresholds.length > 0 && (
        <div className="card" style={{ marginTop: '30px', padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Playfair Display', serif" }}>
            <span>📊</span> Grade Distribution for MCA {mca}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
            Below are the specific score thresholds required for each grade level under a Class Average of <strong>{mca}</strong>.
          </p>

          <div className="thresholds-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
            gap: '12px'
          }}>
            {thresholds.map((t) => {
              const isUserGrade = t.grade === resultGrade;
              const gradeStyles = getGradeStyles(t.grade);
              return (
                <div 
                  key={t.grade} 
                  style={{
                    padding: '16px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isUserGrade ? gradeStyles.bg : 'var(--bg-tertiary)',
                    border: isUserGrade ? `2px solid ${gradeStyles.color}` : '1px solid var(--border)',
                    textAlign: 'center',
                    boxShadow: isUserGrade ? `0 4px 12px ${gradeStyles.glow}` : 'none',
                    transform: isUserGrade ? 'scale(1.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '800', 
                    color: isUserGrade ? gradeStyles.color : 'var(--text-primary)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                    {t.grade}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: isUserGrade ? gradeStyles.color : 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: '4px'
                  }}>
                    {t.range}
                  </div>
                  {isUserGrade && (
                    <div style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      color: gradeStyles.color, 
                      marginTop: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Your Grade
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 600px) {
          .calculator-grid {
            grid-template-columns: 1fr !important;
          }
          .thresholds-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MCACalculator;
