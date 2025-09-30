import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '../types';
import { formAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const fetchedForms = await formAPI.getAllForms();
      setForms(fetchedForms);
    } catch (err) {
      setError('Failed to load forms');
      console.error('Error loading forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await formAPI.deleteForm(id);
        setForms(forms.filter(form => form.id !== id));
      } catch (err) {
        setError('Failed to delete form');
        console.error('Error deleting form:', err);
      }
    }
  };

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Form link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Form link copied to clipboard!');
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Form Builder Admin</h1>
        </div>
        <div className="header-right">
          <button 
            className="create-btn"
            onClick={() => navigate('/admin/create')}
          >
            + Create New Form
          </button>
          <button 
            className="logout-btn"
            onClick={logout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="forms-grid">
        {forms.length === 0 ? (
          <div className="empty-state">
            <h3>No forms created yet</h3>
            <p>Create your first form to get started</p>
            <button 
              className="create-btn"
              onClick={() => navigate('/admin/create')}
            >
              Create Your First Form
            </button>
          </div>
        ) : (
          forms.map(form => (
            <div key={form.id} className="form-card">
              <div className="form-card-header">
                <h3>{form.title}</h3>
                <div className="form-status">
                  <span className={`status-badge ${form.isActive ? 'active' : 'inactive'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="form-card-body">
                <p className="form-description">
                  {form.description || 'No description provided'}
                </p>
                <div className="form-meta">
                  <span className="field-count">{form.fields.length} fields</span>
                  <span className="created-date">
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="form-card-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => navigate(`/admin/edit/${form.id}`)}
                >
                  Edit
                </button>
                <button 
                  className="action-btn view-btn"
                  onClick={() => navigate(`/admin/responses/${form.id}`)}
                >
                  View Responses
                </button>
                <button 
                  className="action-btn copy-btn"
                  onClick={() => copyFormLink(form.id)}
                  title="Copy form link"
                >
                  Copy Link
                </button>
                <button 
                  className="action-btn preview-btn"
                  onClick={() => window.open(`/form/${form.id}`, '_blank')}
                >
                  Preview
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteForm(form.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;