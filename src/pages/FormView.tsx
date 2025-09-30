import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FormRenderer from '../components/FormRenderer';
import { Form } from '../types';
import { formAPI, responseAPI } from '../utils/api';
import './FormView.css';

const FormView: React.FC = () => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedForm = await formAPI.getFormById(formId);
      
      if (!fetchedForm.isActive) {
        setError('This form is no longer accepting responses.');
        return;
      }
      
      setForm(fetchedForm);
    } catch (err) {
      setError('Form not found or no longer available.');
      console.error('Error loading form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (responses: { [fieldId: string]: any }) => {
    if (!form || !id) return;

    try {
      setSubmitting(true);
      setError(null);

      await responseAPI.submitResponse({
        formId: id,
        responses
      });

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-view">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="form-view">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Thank you for your submission!</h2>
          <p>Your response has been recorded successfully.</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="form-view">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Form Not Found</h2>
          <p>The form you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-view">
      <FormRenderer
        fields={form.fields}
        title={form.title}
        description={form.description}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
};

export default FormView;