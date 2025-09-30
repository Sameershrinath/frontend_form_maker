import React, { useState, useEffect } from 'react';
import FormRenderer from '../components/FormRenderer';
import { FormField } from '../types';
import './FormPreview.css';

const FormPreview: React.FC = () => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    fields: FormField[];
  } | null>(null);

  useEffect(() => {
    // Get form data from sessionStorage
    const previewData = sessionStorage.getItem('previewForm');
    if (previewData) {
      try {
        const data = JSON.parse(previewData);
        setFormData(data);
      } catch (err) {
        console.error('Error parsing preview data:', err);
      }
    }
  }, []);

  const handleSubmit = (responses: { [fieldId: string]: any }) => {
    // Show a demo submission message
    alert('This is a preview! In the actual form, this would be submitted to the server.');
    console.log('Preview form responses:', responses);
  };

  if (!formData) {
    return (
      <div className="form-preview">
        <div className="preview-error">
          <h2>No preview data available</h2>
          <p>Please go back to the form builder to preview your form.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-preview">
      <div className="preview-header">
        <div className="preview-banner">
          <span className="preview-badge">PREVIEW MODE</span>
          <p>This is how your form will appear to users</p>
        </div>
      </div>
      
      <FormRenderer
        fields={formData.fields}
        title={formData.title}
        description={formData.description}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </div>
  );
};

export default FormPreview;