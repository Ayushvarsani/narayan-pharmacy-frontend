'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrescriptionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        const response = await fetch(`${apiUrl}/api/prescriptions/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Prescription not found.');
          }
          throw new Error('Failed to retrieve prescription details.');
        }
        const data = await response.json();
        setPrescription(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unable to contact the pharmacy backend.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Class helper for severity badges
  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none': return 'badge-severity-none';
      case 'mild': return 'badge-severity-mild';
      case 'moderate': return 'badge-severity-moderate';
      case 'severe': return 'badge-severity-severe';
      default: return 'badge-severity-error';
    }
  };

  // Date formatting helper
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px', marginBottom: '1.5rem' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading prescription details...</p>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div style={{ 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid rgba(239, 68, 68, 0.2)', 
        padding: '2rem', 
        borderRadius: 'var(--radius-lg)', 
        color: '#fca5a5',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '4rem auto'
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Error Loading Details</h3>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>{error || 'The requested prescription could not be found.'}</p>
        <button onClick={() => router.push('/list')} className="btn btn-secondary">
          Back to List
        </button>
      </div>
    );
  }

  const result = prescription.interaction_result;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <Link href="/list" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            &larr; Back to Registry
          </Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Prescription Details</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Registry Record ID: #{prescription.id}
            </p>
          </div>
          <span className={`badge ${getSeverityBadgeClass(prescription.severity)}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1.25rem' }}>
            {prescription.severity} Severity
          </span>
        </div>
      </div>

      <div className="grid-2">
        {/* Left: Patient and Drug Details */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Patient Name</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{prescription.patient_name}</strong>
            </div>
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Prescribing Physician</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{prescription.doctor_name}</strong>
            </div>
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Date Dispensed</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{formatDate(prescription.date)}</strong>
            </div>
          </div>

          {/* Drugs List */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Prescribed Medications ({prescription.drugs.length})
            </h3>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Medication Name</th>
                    <th>Dosage / Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.drugs.map((drug, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{drug.drug_name}</strong>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{drug.dosage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: AI Safety checker details */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            Clinical Safety Review
          </h2>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Claude AI Interaction Log
                </span>
                <span className={`badge ${getSeverityBadgeClass(result.severity)}`}>
                  {result.severity}
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
                {result.summary}
              </div>

              {result.interactions && result.interactions.length > 0 ? (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Specific Interactions Detected
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.interactions.map((inter, idx) => (
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div>
                    <div style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.5rem' }}>✓</div>
                    <p style={{ fontSize: '0.9rem' }}>No drug-drug interactions detected for this prescription.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div>
                <p style={{ fontSize: '0.9rem' }}>No interaction checks are available for this record.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
