'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PrescriptionEntry() {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [drugs, setDrugs] = useState([{ drug_name: '', dosage: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [interactionResult, setInteractionResult] = useState(null);
  const [savedId, setSavedId] = useState(null);

  // Add a new drug row
  const handleAddDrug = () => {
    setDrugs([...drugs, { drug_name: '', dosage: '' }]);
  };

  // Remove a drug row
  const handleRemoveDrug = (index) => {
    if (drugs.length === 1) {
      setDrugs([{ drug_name: '', dosage: '' }]);
    } else {
      setDrugs(drugs.filter((_, i) => i !== index));
    }
  };

  // Handle drug field change
  const handleDrugChange = (index, field, value) => {
    const updatedDrugs = [...drugs];
    updatedDrugs[index][field] = value;
    setDrugs(updatedDrugs);
  };

  // Reset the form
  const handleReset = () => {
    setPatientName('');
    setDoctorName('');
    setDate(new Date().toISOString().split('T')[0]);
    setDrugs([{ drug_name: '', dosage: '' }]);
    setIsLoading(false);
    setError(null);
    setSuccess(false);
    setInteractionResult(null);
    setSavedId(null);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setInteractionResult(null);

    // Filter out empty rows
    const validDrugs = drugs.filter(d => d.drug_name.trim() !== '');

    // Validate inputs
    if (!patientName.trim()) {
      setError('Patient name is required.');
      return;
    }
    if (!doctorName.trim()) {
      setError('Doctor name is required.');
      return;
    }
    if (validDrugs.length === 0) {
      setError('At least one drug must be entered.');
      return;
    }

    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${apiUrl}/api/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          doctorName: doctorName.trim(),
          date,
          drugs: validDrugs.map(d => ({
            drug_name: d.drug_name.trim(),
            dosage: d.dosage.trim() || 'As directed'
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit prescription.');
      }

      setSavedId(data.prescriptionId);
      setInteractionResult(data.interactionResult);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please verify database connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Class helper for severity levels
  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none': return 'badge-severity-none';
      case 'mild': return 'badge-severity-mild';
      case 'moderate': return 'badge-severity-moderate';
      case 'severe': return 'badge-severity-severe';
      default: return 'badge-severity-error';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Prescription Entry</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Record a new patient prescription. If multiple drugs are entered, Claude AI will review potential drug-drug interactions automatically.
        </p>
      </div>

      <div className="grid-2">
        {/* Left: Form Card */}
        <div className="glass-card">
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ 
                width: '4rem', 
                height: '4rem', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--success)',
                fontSize: '2rem'
              }}>
                ✓
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Prescription Saved</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Prescription for <strong>{patientName}</strong> has been successfully committed to the database.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={handleReset} className="btn btn-primary">
                  New Prescription
                </button>
                <Link href={`/list`} className="btn btn-secondary">
                  Go to List
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Prescribing Doctor</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Smith"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Prescribed Medication
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDrug}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    disabled={isLoading}
                  >
                    + Add Drug
                  </button>
                </div>

                {drugs.map((drug, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1.5 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Drug Name (e.g. Metformin)"
                        value={drug.drug_name}
                        onChange={(e) => handleDrugChange(index, 'drug_name', e.target.value)}
                        disabled={isLoading}
                        required={index === 0}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dosage (e.g. 500mg daily)"
                        value={drug.dosage}
                        onChange={(e) => handleDrugChange(index, 'dosage', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDrug(index)}
                        className="btn btn-danger"
                        style={{ padding: '0.7rem 0.8rem' }}
                        disabled={isLoading}
                        title="Remove drug"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  color: '#fca5a5', 
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  <strong>Submission Error:</strong> {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{ marginRight: '0.5rem' }}></div>
                    AI Safety Checker running...
                  </>
                ) : (
                  'Validate & Save Prescription'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Interaction Results Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            Clinical Safety Checker
          </h2>

          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px', marginBottom: '1.5rem' }}></div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Analyzing Drug-Drug Interactions</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                Claude AI is currently cross-checking active compounds and dosage mechanisms to identify warnings...
              </p>
            </div>
          ) : interactionResult ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  AI Analysis Summary
                </span>
                <span className={`badge ${getSeverityBadgeClass(interactionResult.severity)}`}>
                  {interactionResult.severity} Severity
                </span>
              </div>

              <div style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-color)',
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                lineHeight: 1.5
              }}>
                {interactionResult.summary}
              </div>

              {interactionResult.interactions && interactionResult.interactions.length > 0 ? (
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Detected Drug Interactions ({interactionResult.interactions.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {interactionResult.interactions.map((inter, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          borderLeft: `3px solid var(--severity-${inter.severity.toLowerCase()})`,
                          backgroundColor: 'rgba(255, 255, 255, 0.01)',
                          padding: '1rem',
                          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                          borderTop: '1px solid var(--border-color)',
                          borderRight: '1px solid var(--border-color)',
                          borderBottom: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem' }}>
                            {inter.drugs[0]} + {inter.drugs[1]}
                          </strong>
                          <span className={`badge ${getSeverityBadgeClass(inter.severity)}`} style={{ padding: '0.1rem 0.5rem', fontSize: '0.65rem' }}>
                            {inter.severity}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Mechanism:</span> {inter.mechanism}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4, backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Recommendation:</span> {inter.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--success)', marginBottom: '0.5rem' }}>✓</div>
                    <p style={{ fontSize: '0.9rem' }}>No dangerous drug-drug interactions detected by AI.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🛡️</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Awaiting Validation</h3>
              <p style={{ fontSize: '0.875rem', maxWidth: '300px' }}>
                Fill out the prescription form on the left. Adding 2 or more drugs triggers automatic safety cross-checking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
