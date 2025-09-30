import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormBuilder from '../components/FormBuilder';
import { FormField, CreateFormRequest } from '../types';
import { formAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './CreateEditForm.css';

const CreateEditForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      loadForm(id);
    }
  }, [isEditing, id]);

  const loadForm = async (formId: string) => {
    try {
      setLoading(true);
      const form = await formAPI.getFormById(formId);
      setTitle(form.title);
      setDescription(form.description);
      setFields(form.fields);
    } catch (err) {
      setError('Failed to load form');
      console.error('Error loading form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Form title is required');
      return;
    }

    if (fields.length === 0) {
      setError('At least one field is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const formData: CreateFormRequest = {
        title: title.trim(),
        description: description.trim(),
        fields
      };

      if (isEditing && id) {
        await formAPI.updateForm(id, formData);
      } else {
        await formAPI.createForm(formData);
      }

      navigate('/admin');
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} form`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} form:`, err);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (fields.length === 0) {
      setError('Add some fields to preview the form');
      return;
    }
    
    // Store form data in sessionStorage for preview
    const previewData = {
      title: title || 'Untitled Form',
      description,
      fields
    };
    sessionStorage.setItem('previewForm', JSON.stringify(previewData));
    window.open('/preview', '_blank');
  };

  if (loading) {
    return (
      <div className="create-edit-form">
        <div className="loading">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="create-edit-form">
      <div className="form-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => navigate('/admin')}
              title="Back to Dashboard"
            >
              ← Back
            </button>
            <h1>{isEditing ? 'Edit Form' : 'Create New Form'}</h1>
          </div>
          <div className="header-actions">
            <button 
              className="preview-btn"
              onClick={handlePreview}
              disabled={fields.length === 0}
            >
              Preview
            </button>
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={saving || !title.trim()}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Form' : 'Create Form'}
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
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="form-settings">
        <div className="settings-section">
          <div className="form-group">
            <label htmlFor="title">Form Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title"
              className={!title.trim() && error ? 'error' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Form Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description (optional)"
              rows={3}
            />
          </div>
        </div>
      </div>

      <FormBuilder 
        fields={fields} 
        onFieldsChange={setFields} 
      />
    </div>
  );
};

export default CreateEditForm;