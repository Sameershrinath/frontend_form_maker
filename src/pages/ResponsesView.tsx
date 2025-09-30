import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, FormResponse } from '../types';
import { formAPI, responseAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './ResponsesView.css';

const ResponsesView: React.FC = () => {
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (id) {
      loadFormAndResponses(id);
    }
  }, [id]);

  const loadFormAndResponses = async (formId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [fetchedForm, fetchedResponses] = await Promise.all([
        formAPI.getFormById(formId),
        responseAPI.getResponsesByFormId(formId)
      ]);
      
      setForm(fetchedForm);
      setResponses(fetchedResponses);
    } catch (err) {
      setError('Failed to load form responses');
      console.error('Error loading form and responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      try {
        await responseAPI.deleteResponse(responseId);
        setResponses(responses.filter(r => r.id !== responseId));
      } catch (err) {
        setError('Failed to delete response');
        console.error('Error deleting response:', err);
      }
    }
  };

  const exportToCSV = () => {
    if (!form || responses.length === 0) return;

    // Create CSV headers
    const headers = ['Submission Date', ...form.fields.map(field => field.label)];
    
    // Create CSV rows
    const rows = responses.map(response => {
      const row = [new Date(response.submittedAt).toLocaleString()];
      
      form.fields.forEach(field => {
        const value = response.responses[field.id];
        if (Array.isArray(value)) {
          row.push(value.join(', '));
        } else {
          row.push(value || '');
        }
      });
      
      return row;
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="responses-view">
        <div className="loading">Loading responses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="responses-view">
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="responses-view">
        <div className="error-message">Form not found</div>
      </div>
    );
  }

  return (
    <div className="responses-view">
      <div className="responses-header">
        <div className="header-content">
          <div className="header-info">
            <button 
              className="back-btn"
              onClick={() => navigate('/admin')}
            >
              ← Back to Dashboard
            </button>
            <h1>Responses for "{form.title}"</h1>
            <p className="response-count">
              {responses.length} response{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="header-actions">
            {responses.length > 0 && (
              <button 
                className="export-btn"
                onClick={exportToCSV}
              >
                Export to CSV
              </button>
            )}
            <button 
              className="logout-btn"
              onClick={logout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="no-responses">
          <div className="no-responses-icon">📝</div>
          <h3>No responses yet</h3>
          <p>Share your form to start collecting responses!</p>
          <div className="form-link-container">
            <label>Form Link:</label>
            <div className="link-input-group">
              <input 
                type="text" 
                value={`${window.location.origin}/form/${form.id}`}
                readOnly
                className="form-link-input"
              />
              <button 
                className="copy-link-btn"
                onClick={() => {
                  const link = `${window.location.origin}/form/${form.id}`;
                  navigator.clipboard.writeText(link).then(() => {
                    alert('Form link copied to clipboard!');
                  });
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="responses-table-container">
          <div className="table-wrapper">
            <table className="responses-table">
              <thead>
                <tr>
                  <th>Submission Date</th>
                  {form.fields.map(field => (
                    <th key={field.id}>{field.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {responses.map(response => (
                  <tr key={response.id}>
                    <td className="date-cell">
                      {new Date(response.submittedAt).toLocaleString()}
                    </td>
                    {form.fields.map(field => {
                      const value = response.responses[field.id];
                      return (
                        <td key={field.id} className="response-cell">
                          {Array.isArray(value) ? value.join(', ') : value || '-'}
                        </td>
                      );
                    })}
                    <td className="actions-cell">
                      <button 
                        className="delete-response-btn"
                        onClick={() => handleDeleteResponse(response.id)}
                        title="Delete response"
                      >
                        Delete
                      </button>
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
};

export default ResponsesView;