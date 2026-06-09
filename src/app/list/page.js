'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        const response = await fetch(`${apiUrl}/api/prescriptions`);
        if (!response.ok) {
          throw new Error('Failed to retrieve prescriptions from the server.');
        }
        const data = await response.json();
        setPrescriptions(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unable to contact the pharmacy backend.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Class helper for severity badge colors
  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none': return 'badge-severity-none';
      case 'mild': return 'badge-severity-mild';
      case 'moderate': return 'badge-severity-moderate';
      case 'severe': return 'badge-severity-severe';
      default: return 'badge-severity-error';
    }
  };

  // Helper for formatting date
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  const handleRowClick = (id) => {
    router.push(`/prescriptions/${id}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Prescriptions Registry</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review all processed patient prescriptions and AI drug safety interaction warnings.
          </p>
        </div>
        <Link href="/" className="btn btn-primary">
          + New Prescription
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px', marginBottom: '1.5rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading prescriptions list...</p>
        </div>
      ) : error ? (
        <div style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          padding: '2rem', 
          borderRadius: 'var(--radius-lg)', 
          color: '#fca5a5',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Database Connection Error</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Retry Connection
          </button>
        </div>
      ) : prescriptions.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '5rem 2rem', 
          border: '1px dashed var(--border-color)', 
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1.5rem', opacity: 0.5 }}>📋</span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Prescriptions Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            There are currently no prescriptions registered in the database. Enter a new prescription to check drug interactions.
          </p>
          <Link href="/" className="btn btn-primary">
            Create First Prescription
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Patient</th>
                  <th style={{ width: '25%' }}>Prescribing Doctor</th>
                  <th style={{ width: '20%' }}>Date</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Drug Count</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>AI Severity</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr 
                    key={prescription.id} 
                    onClick={() => handleRowClick(prescription.id)}
                    className="table-row-clickable"
                  >
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{prescription.patient_name}</strong>
                    </td>
                    <td>{prescription.doctor_name}</td>
                    <td>{formatDate(prescription.date)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}>
                        {prescription.drug_count} {prescription.drug_count === 1 ? 'drug' : 'drugs'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${getSeverityBadgeClass(prescription.severity)}`}>
                        {prescription.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
