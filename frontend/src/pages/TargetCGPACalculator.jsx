import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function TargetCGPACalculator() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  // State for initial inputs - stored as strings to preserve user input exactly
  const [step, setStep] = useState(1); // 1: Input, 2: Method Selection, 3: Results
  const [currentCGPAInput, setCurrentCGPAInput] = useState('');
  const [targetCGPAInput, setTargetCGPAInput] = useState('');
  const [remainingCreditsInput, setRemainingCreditsInput] = useState('');
  const [remainingSemestersInput, setRemainingSemestersInput] = useState('');
  const [totalDegreeCreditsInput, setTotalDegreeCreditsInput] = useState('120');

  // State for custom distribution
  const [semesterData, setSemesterData] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [distributionMethod, setDistributionMethod] = useState(null);

  // Helper function to safely parse numbers
  const parseNumber = (value, type = 'float') => {
    const num = type === 'float' ? parseFloat(value) : parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  // Load saved plan on component mount
  useEffect(() => {
    if (studentId) {
      loadSavedPlan();
    }
  }, [studentId]);

  // Load saved plan from backend
  const loadSavedPlan = async () => {
    try {
      const response = await api.get(`/students/${studentId}/target-cgpa-plan`);
      if (response.data.success && response.data.plan) {
        const plan = response.data.plan;
        setCurrentCGPAInput(plan.current_cgpa.toString());
        setTargetCGPAInput(plan.target_cgpa.toString());
        setRemainingCreditsInput(plan.remaining_credits.toString());
        setRemainingSemestersInput(plan.remaining_semesters.toString());
        setTotalDegreeCreditsInput(plan.total_degree_credits.toString());
        setDistributionMethod(plan.distribution_method);

        // Load semester data if custom distribution
        if (plan.distribution_method === 'custom' && plan.semesters) {
          setSemesterData(
            plan.semesters.map((sem, idx) => ({
              id: idx,
              name: sem.semester_name,
              credits: sem.credits.toString()
            }))
          );
          // Display results if plan was already calculated
          if (plan.semesters.length > 0) {
            setResults({
              achievable: plan.is_achievable,
              message: plan.is_achievable
                ? 'Your custom distribution plan is achievable with the following semester requirements:'
                : `Maximum possible CGPA is ${plan.max_possible_cgpa}. Please adjust your distribution.`,
              semesters: plan.semesters.map((sem) => ({
                name: sem.semester_name,
                credits: sem.credits,
                requiredSGPA: sem.required_sgpa.toFixed(2),
                achievable: sem.is_achievable
              })),
              custom: true
            });
            setStep(3);
          }
        } else if (plan.distribution_method === 'equal') {
          // Reconstruct equal distribution results
          const remainingSem = parseInt(plan.remaining_semesters);
          const creditsPerSem = plan.remaining_credits / remainingSem;
          setResults({
            achievable: plan.is_achievable,
            message: plan.is_achievable
              ? `Score approximately ${plan.required_sgpa.toFixed(2)} SGPA each semester to reach your target CGPA of ${plan.target_cgpa.toFixed(2)}`
              : `Maximum possible CGPA is ${plan.max_possible_cgpa}. Please lower your target.`,
            requiredSGPA: plan.required_sgpa,
            creditsPerSemester: creditsPerSem,
            semesters: Array.from({ length: remainingSem }, (_, i) => ({
              name: `Semester ${i + 1}`,
              credits: creditsPerSem.toFixed(2),
              requiredSGPA: plan.required_sgpa.toFixed(2)
            }))
          });
          setStep(3);
        }
      }
    } catch (error) {
      console.error('Error loading saved plan:', error);
      // Silently fail - user can still create new plan
    }
  };

  // Save plan to backend
  const savePlan = async (planData) => {
    try {
      if (!studentId) {
        console.error('Student ID not available');
        return;
      }

      const payload = {
        currentCGPA: parseNumber(currentCGPAInput, 'float'),
        targetCGPA: parseNumber(targetCGPAInput, 'float'),
        remainingCredits: parseNumber(remainingCreditsInput, 'int'),
        remainingSemesters: parseNumber(remainingSemestersInput, 'int'),
        totalDegreeCredits: parseNumber(totalDegreeCreditsInput, 'int'),
        distributionMethod: distributionMethod,
        isAchievable: planData.achievable,
        requiredSGPA: planData.requiredSGPA || null,
        maxPossibleCGPA: planData.maxPossibleCGPA || null,
        semesters: planData.semesters || []
      };

      const response = await api.post(
        `/students/${studentId}/target-cgpa-plan`,
        payload
      );

      if (response.data.success) {
        console.log('Plan saved successfully:', response.data.planId);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  // Validation for initial inputs
  const validateInputs = () => {
    // Validate current CGPA
    const currentCGPA = parseNumber(currentCGPAInput, 'float');
    if (currentCGPAInput === '' || currentCGPA === null) {
      setError('Please enter your current CGPA');
      return false;
    }
    if (currentCGPA < 0 || currentCGPA > 4.0) {
      setError('Current CGPA must be between 0 and 4.0');
      return false;
    }

    // Validate target CGPA
    const targetCGPA = parseNumber(targetCGPAInput, 'float');
    if (targetCGPAInput === '' || targetCGPA === null) {
      setError('Please enter your target CGPA');
      return false;
    }
    if (targetCGPA < 0 || targetCGPA > 4.0) {
      setError('Target CGPA must be between 0 and 4.0');
      return false;
    }

    // Validate remaining credits
    const remainingCredits = parseNumber(remainingCreditsInput, 'int');
    if (remainingCreditsInput === '' || remainingCredits === null || remainingCredits <= 0) {
      setError('Remaining credit hours must be greater than 0');
      return false;
    }

    // Validate remaining semesters
    const remainingSemesters = parseNumber(remainingSemestersInput, 'int');
    if (remainingSemestersInput === '' || remainingSemesters === null || remainingSemesters <= 0) {
      setError('Remaining semesters must be greater than 0');
      return false;
    }

    // Validate total degree credits
    const totalDegreeCredits = parseNumber(totalDegreeCreditsInput, 'int');
    if (totalDegreeCreditsInput === '' || totalDegreeCredits === null || totalDegreeCredits <= 0) {
      setError('Total degree credits must be greater than 0');
      return false;
    }

    // Validate that remaining credits doesn't exceed total credits
    if (remainingCredits > totalDegreeCredits) {
      setError('Remaining credits cannot be greater than total degree credits');
      return false;
    }

    setError('');
    return true;
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      setStep(2);
    }
  };

  const handleMethodSelection = (method) => {
    setDistributionMethod(method);
    if (method === 'equal') {
      calculateEqualDistribution();
    } else {
      initializeCustomSemesters();
    }
  };

  const calculateEqualDistribution = () => {
    const currentCGPA = parseNumber(currentCGPAInput, 'float');
    const targetCGPA = parseNumber(targetCGPAInput, 'float');
    const remainingCredits = parseNumber(remainingCreditsInput, 'int');
    const remainingSemesters = parseNumber(remainingSemestersInput, 'int');
    const totalDegreeCredits = parseNumber(totalDegreeCreditsInput, 'int');

    const completedCredits = totalDegreeCredits - remainingCredits;
    const creditsPerSemester = remainingCredits / remainingSemesters;

    const requiredTotal =
      (targetCGPA * totalDegreeCredits - currentCGPA * completedCredits) / remainingCredits;
    const requiredSGPA = requiredTotal;

    // Check if achievable
    if (requiredSGPA > 4.0) {
      const maxCGPA = (currentCGPA * completedCredits + 4.0 * remainingCredits) / totalDegreeCredits;
      setResults({
        achievable: false,
        message: `❌ Unachievable! Maximum possible CGPA is ${maxCGPA.toFixed(2)}. Please lower your target.`,
        requiredSGPA: null,
        creditsPerSemester,
        semesters: Array.from({ length: remainingSemesters }, (_, i) => ({
          name: `Semester ${i + 1}`,
          credits: creditsPerSemester.toFixed(2),
          requiredSGPA: requiredSGPA.toFixed(2)
        }))
      });
    } else if (requiredSGPA < 0) {
      setResults({
        achievable: true,
        message: `✓ Already achieved! You're on track. Your current CGPA of ${currentCGPA.toFixed(2)} already exceeds your target of ${targetCGPA.toFixed(2)}.`,
        requiredSGPA: 0,
        creditsPerSemester,
        semesters: Array.from({ length: remainingSemesters }, (_, i) => ({
          name: `Semester ${i + 1}`,
          credits: creditsPerSemester.toFixed(2),
          requiredSGPA: '0.00'
        }))
      });
    } else {
      setResults({
        achievable: true,
        message: `Score approximately ${requiredSGPA.toFixed(2)} SGPA each semester to reach your target CGPA of ${targetCGPA.toFixed(2)}`,
        requiredSGPA: requiredSGPA.toFixed(2),
        creditsPerSemester,
        semesters: Array.from({ length: remainingSemesters }, (_, i) => ({
          name: `Semester ${i + 1}`,
          credits: creditsPerSemester.toFixed(2),
          requiredSGPA: requiredSGPA.toFixed(2)
        }))
      });
    }

    // Save plan to database
    if (requiredSGPA <= 4.0 && requiredSGPA >= 0) {
      savePlan({
        achievable: true,
        requiredSGPA: requiredSGPA.toFixed(2),
        semesters: Array.from({ length: remainingSemesters }, (_, i) => ({
          name: `Semester ${i + 1}`,
          credits: creditsPerSemester.toFixed(2),
          requiredSGPA: requiredSGPA.toFixed(2)
        }))
      });
    } else if (requiredSGPA > 4.0) {
      const maxCGPA = (currentCGPA * completedCredits + 4.0 * remainingCredits) / totalDegreeCredits;
      savePlan({
        achievable: false,
        maxPossibleCGPA: maxCGPA.toFixed(2),
        semesters: null
      });
    }

    setStep(3);
  };

  const initializeCustomSemesters = () => {
    const remainingSemesters = parseNumber(remainingSemestersInput, 'int');
    const newSemesters = Array.from({ length: remainingSemesters }, (_, i) => ({
      id: i,
      name: `Semester ${i + 1}`,
      credits: ''
    }));
    setSemesterData(newSemesters);
    setStep(3);
  };

  const handleSemesterChange = (id, field, value) => {
    setSemesterData(
      semesterData.map((sem) =>
        sem.id === id ? { ...sem, [field]: value } : sem
      )
    );
  };

  const validateCustomDistribution = () => {
    for (let sem of semesterData) {
      if (!sem.name.trim()) {
        setError(`Semester name is required`);
        return false;
      }
      const credits = parseNumber(sem.credits, 'int');
      if (sem.credits === '' || credits === null || credits <= 0) {
        setError(`All semesters must have credit hours greater than 0`);
        return false;
      }
    }

    const remainingCredits = parseNumber(remainingCreditsInput, 'int');
    const totalCustomCredits = semesterData.reduce(
      (sum, sem) => sum + parseNumber(sem.credits, 'int'),
      0
    );

    if (totalCustomCredits !== remainingCredits) {
      setError(
        `Total custom credits (${totalCustomCredits}) must equal remaining credits (${remainingCredits})`
      );
      return false;
    }

    setError('');
    return true;
  };

  const calculateCustomDistribution = () => {
    if (!validateCustomDistribution()) return;

    const targetCGPA = parseNumber(targetCGPAInput, 'float');
    const currentCGPA = parseNumber(currentCGPAInput, 'float');
    const remainingCredits = parseNumber(remainingCreditsInput, 'int');
    const totalDegreeCredits = parseNumber(totalDegreeCreditsInput, 'int');
    const completedCredits = totalDegreeCredits - remainingCredits;

    const requiredTotal =
      (targetCGPA * totalDegreeCredits - currentCGPA * completedCredits) / remainingCredits;

    const results_semesters = semesterData.map((sem) => {
      const semCredits = parseNumber(sem.credits, 'int');
      const semRequiredSGPA = requiredTotal * (semCredits / remainingCredits);
      return {
        name: sem.name,
        credits: semCredits,
        requiredSGPA: semRequiredSGPA.toFixed(2),
        achievable: semRequiredSGPA <= 4.0
      };
    });

    const allAchievable = results_semesters.every((sem) => sem.achievable);
    const maxCGPA = (currentCGPA * completedCredits + 4.0 * remainingCredits) / totalDegreeCredits;

    if (!allAchievable) {
      setResults({
        achievable: false,
        message: `❌ Unachievable! Maximum possible CGPA is ${maxCGPA.toFixed(2)}. Please adjust your distribution.`,
        semesters: results_semesters,
        custom: true
      });
      savePlan({
        achievable: false,
        maxPossibleCGPA: maxCGPA.toFixed(2),
        semesters: results_semesters
      });
    } else {
      setResults({
        achievable: true,
        message: `Your custom distribution plan is achievable with the following semester requirements:`,
        semesters: results_semesters,
        custom: true
      });
      savePlan({
        achievable: true,
        semesters: results_semesters
      });
    }
  };

  const resetCalculator = () => {
    setStep(1);
    setCurrentCGPAInput('');
    setTargetCGPAInput('');
    setRemainingCreditsInput('');
    setRemainingSemestersInput('');
    setTotalDegreeCreditsInput('120');
    setDistributionMethod(null);
    setSemesterData([]);
    setResults(null);
    setError('');
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Target CGPA Calculator</h1>
      <p className="description">Plan your academic path to achieve your target CGPA</p>

      {step === 1 && (
        <div className="card">
          <p style={{ marginBottom: '24px', fontSize: '16px', color: '#666', fontWeight: '500' }}>
            Please provide your academic information to calculate your required GPA path.
          </p>
          <form onSubmit={handleInitialSubmit}>
            <div style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #2196F3' }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#1976d2', fontWeight: '500' }}>
                ℹ️ Required Fields: Start by entering your current and target CGPA
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="currentCGPA">
                <span style={{ color: '#d32f2f' }}>*</span> Current CGPA (0.0 - 4.0)
              </label>
              <input
                id="currentCGPA"
                type="number"
                min="0"
                max="4"
                step="any"
                value={currentCGPAInput}
                onChange={(e) => setCurrentCGPAInput(e.target.value)}
                placeholder="e.g., 3.2"
                required
              />
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Your cumulative GPA as of now
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="targetCGPA">
                <span style={{ color: '#d32f2f' }}>*</span> Target CGPA (0.0 - 4.0)
              </label>
              <input
                id="targetCGPA"
                type="number"
                min="0"
                max="4"
                step="any"
                value={targetCGPAInput}
                onChange={(e) => setTargetCGPAInput(e.target.value)}
                placeholder="e.g., 3.4"
                required
              />
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Your desired final CGPA
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="remainingCredits">
                <span style={{ color: '#d32f2f' }}>*</span> Remaining Credit Hours
              </label>
              <input
                id="remainingCredits"
                type="number"
                min="1"
                step="1"
                value={remainingCreditsInput}
                onChange={(e) => setRemainingCreditsInput(e.target.value)}
                placeholder="e.g., 100"
                required
              />
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Total credit hours remaining in your degree
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="remainingSemesters">
                <span style={{ color: '#d32f2f' }}>*</span> Remaining Semesters
              </label>
              <input
                id="remainingSemesters"
                type="number"
                min="1"
                step="1"
                value={remainingSemestersInput}
                onChange={(e) => setRemainingSemestersInput(e.target.value)}
                placeholder="e.g., 4"
                required
              />
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                How many semesters you have left
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="totalDegreeCredits">Total Degree Credits</label>
              <input
                id="totalDegreeCredits"
                type="number"
                min="1"
                step="1"
                value={totalDegreeCreditsInput}
                onChange={(e) => setTotalDegreeCreditsInput(e.target.value)}
              />
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Typically 120 for bachelor's degrees
              </small>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                borderLeft: '4px solid #d32f2f',
                fontSize: '14px'
              }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" style={{ marginTop: '16px' }}>
              Continue to Planning Method
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Choose Planning Method</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            <button
              type="button"
              onClick={() => handleMethodSelection('equal')}
              style={{
                padding: '24px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#f5f5f5',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = '#1976d2')}
              onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
            >
              📊 Equal Distribution
              <p style={{ fontSize: '13px', marginTop: '8px', fontWeight: 'normal', color: '#666' }}>
                Divide credits equally across all semesters
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleMethodSelection('custom')}
              style={{
                padding: '24px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#f5f5f5',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = '#1976d2')}
              onMouseLeave={(e) => (e.target.style.borderColor = '#ddd')}
            >
              ✏️ Custom Distribution
              <p style={{ fontSize: '13px', marginTop: '8px', fontWeight: 'normal', color: '#666' }}>
                Specify credits for each semester
              </p>
            </button>
          </div>
          <button
            type="button"
            onClick={resetCalculator}
            style={{ backgroundColor: '#f5f5f5', color: '#333' }}
          >
            ← Back
          </button>
        </div>
      )}

      {step === 3 && distributionMethod === 'equal' && results && (
        <div className="card">
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: results.achievable ? '#e8f5e9' : '#ffebee',
              marginBottom: '24px',
              borderLeft: `4px solid ${results.achievable ? '#4caf50' : '#f44336'}`
            }}
          >
            <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>
              {results.message}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3>Semester Requirements</h3>
            <div
              style={{
                display: 'grid',
                gap: '12px',
                marginTop: '12px'
              }}
            >
              {results.semesters.map((sem, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${parseFloat(sem.requiredSGPA) > 4 ? '#f44336' : '#4caf50'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{sem.name}</p>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        Credits: {sem.credits}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#1976d2' }}>
                        {sem.requiredSGPA} SGPA
                      </p>
                      {parseFloat(sem.requiredSGPA) > 4 && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#f44336' }}>
                          Unachievable
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={resetCalculator}
              style={{ backgroundColor: '#f5f5f5', color: '#333' }}
            >
              ← Start Over
            </button>
          </div>
        </div>
      )}

      {step === 3 && distributionMethod === 'custom' && !results && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Enter Credits per Semester</h2>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            Total credits to distribute: <strong>{remainingCreditsInput}</strong>
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateCustomDistribution();
            }}
          >
            {semesterData.map((sem, idx) => (
              <div
                key={sem.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label htmlFor={`semName-${sem.id}`}>Semester Name</label>
                    <input
                      id={`semName-${sem.id}`}
                      type="text"
                      value={sem.name}
                      onChange={(e) => handleSemesterChange(sem.id, 'name', e.target.value)}
                      placeholder="e.g., Spring 2026"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`semCredits-${sem.id}`}>Credit Hours</label>
                    <input
                      id={`semCredits-${sem.id}`}
                      type="number"
                      min="1"
                      step="1"
                      value={sem.credits}
                      onChange={(e) => handleSemesterChange(sem.id, 'credits', e.target.value)}
                      placeholder="e.g., 15"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            {error && <p style={{ color: '#d32f2f', marginBottom: '12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit">Calculate Requirements</button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ backgroundColor: '#f5f5f5', color: '#333' }}
              >
                ← Back
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 3 && distributionMethod === 'custom' && results && (
        <div className="card">
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: results.achievable ? '#e8f5e9' : '#ffebee',
              marginBottom: '24px',
              borderLeft: `4px solid ${results.achievable ? '#4caf50' : '#f44336'}`
            }}
          >
            <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>
              {results.message}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3>Your Semester Plan</h3>
            <div
              style={{
                display: 'grid',
                gap: '12px',
                marginTop: '12px'
              }}
            >
              {results.semesters.map((sem, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${sem.achievable ? '#4caf50' : '#f44336'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{sem.name}</p>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        Credits: {sem.credits}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#1976d2' }}>
                        {sem.requiredSGPA} SGPA
                      </p>
                      {!sem.achievable && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#f44336' }}>
                          Unachievable
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={resetCalculator}
              style={{ backgroundColor: '#f5f5f5', color: '#333' }}
            >
              ← Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TargetCGPACalculator;
