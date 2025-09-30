import React, { useState } from 'react';
import { FormField } from '../types';
import './FormRenderer.css';

interface FormRendererProps {
  fields: FormField[];
  onSubmit: (responses: { [fieldId: string]: any }) => void;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  fields,
  onSubmit,
  title,
  description,
  isSubmitting = false
}) => {
  const [responses, setResponses] = useState<{ [fieldId: string]: any }>({});
  const [errors, setErrors] = useState<{ [fieldId: string]: string }>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [fieldId: string]: string } = {};
    
    fields.forEach(field => {
      if (field.required) {
        const value = responses[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = 'This field is required';
        }
      }
      
      // Email validation
      if (field.type === 'email' && responses[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(responses[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(responses);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? 'error' : ''}
              rows={4}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? 'error' : ''}
            >
              <option value="">Select an option</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <span className="error-message">{error}</span>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="form-group">
            <label className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className={`radio-group ${error ? 'error' : ''}`}>
              {field.options?.map((option, index) => (
                <label key={index} className="radio-option">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
            {error && <span className="error-message">{error}</span>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="form-group">
            <label className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className={`checkbox-group ${error ? 'error' : ''}`}>
              {field.options?.map((option, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleInputChange(field.id, [...currentValues, option]);
                      } else {
                        handleInputChange(field.id, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
            {error && <span className="error-message">{error}</span>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="form-renderer">
      <div className="form-container">
        {title && <h1 className="form-title">{title}</h1>}
        {description && <p className="form-description">{description}</p>}
        
        <form onSubmit={handleSubmit}>
          {fields.map(renderField)}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormRenderer;