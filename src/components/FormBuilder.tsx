import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FormField } from '../types';
import './FormBuilder.css';

interface FormBuilderProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ fields, onFieldsChange }) => {
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isDragEnabled, setIsDragEnabled] = useState(false);

  useEffect(() => {
    // Enable drag and drop after component mounts
    const timer = setTimeout(() => {
      setIsDragEnabled(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fieldTypes = [
    { type: 'text', label: 'Text Input' },
    { type: 'email', label: 'Email' },
    { type: 'number', label: 'Number' },
    { type: 'textarea', label: 'Textarea' },
    { type: 'select', label: 'Dropdown' },
    { type: 'radio', label: 'Radio Buttons' },
    { type: 'checkbox', label: 'Checkboxes' },
  ];

  const addField = (type: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as FormField['type'],
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    };
    onFieldsChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
    if (selectedField?.id === id) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter(field => field.id !== id));
    if (selectedField?.id === id) {
      setSelectedField(null);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onFieldsChange(items);
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options, `Option ${field.options.length + 1}`];
      updateField(fieldId, { options: newOptions });
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  return (
    <div className="form-builder">
      <div className="form-builder-sidebar">
        <h3>Field Types</h3>
        <div className="field-types">
          {fieldTypes.map(({ type, label }) => (
            <button
              key={type}
              className="field-type-btn"
              onClick={() => addField(type)}
            >
              + {label}
            </button>
          ))}
        </div>

        {selectedField && (
          <div className="field-properties">
            <h3>Field Properties</h3>
            <div className="property-group">
              <label>Label:</label>
              <input
                type="text"
                value={selectedField.label}
                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
              />
            </div>
            <div className="property-group">
              <label>Placeholder:</label>
              <input
                type="text"
                value={selectedField.placeholder || ''}
                onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
              />
            </div>
            <div className="property-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                />
                Required
              </label>
            </div>

            {selectedField.options && (
              <div className="property-group">
                <label>Options:</label>
                {selectedField.options.map((option, index) => (
                  <div key={index} className="option-row">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(selectedField.id, index, e.target.value)}
                    />
                    <button
                      onClick={() => removeOption(selectedField.id, index)}
                      className="remove-option-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(selectedField.id)}
                  className="add-option-btn"
                >
                  + Add Option
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-builder-canvas">
        <h3>Form Preview</h3>
        {isDragEnabled ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="form-fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="form-fields-container"
                >
                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index} isDragDisabled={!isDragEnabled}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`form-field ${snapshot.isDragging ? 'dragging' : ''} ${
                            selectedField?.id === field.id ? 'selected' : ''
                          }`}
                          onClick={() => setSelectedField(field)}
                        >
                          <div className="field-header" {...provided.dragHandleProps}>
                            <span className="drag-handle">⋮⋮</span>
                            <span className="field-label">{field.label}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeField(field.id);
                              }}
                              className="remove-field-btn"
                            >
                              ×
                            </button>
                          </div>
                          <div className="field-preview">
                            {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                disabled
                              />
                            ) : field.type === 'textarea' ? (
                              <textarea
                                placeholder={field.placeholder}
                                disabled
                              />
                            ) : field.type === 'select' ? (
                              <select disabled>
                                <option>Select an option</option>
                                {field.options?.map((option, idx) => (
                                  <option key={idx} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'radio' ? (
                              <div className="radio-group">
                                {field.options?.map((option, idx) => (
                                  <label key={idx} className="radio-option">
                                    <input type="radio" name={field.id} disabled />
                                    {option}
                                  </label>
                                ))}
                              </div>
                            ) : field.type === 'checkbox' ? (
                              <div className="checkbox-group">
                                {field.options?.map((option, idx) => (
                                  <label key={idx} className="checkbox-option">
                                    <input type="checkbox" disabled />
                                    {option}
                                  </label>
                                ))}
                              </div>
                            ) : null}
                            {field.required && <span className="required-indicator">*</span>}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {fields.length === 0 && (
                    <div className="empty-form">
                      <p>Start building your form by adding fields from the sidebar</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="form-fields-container">
            {fields.map((field) => (
              <div
                key={field.id}
                className={`form-field ${selectedField?.id === field.id ? 'selected' : ''}`}
                onClick={() => setSelectedField(field)}
              >
                <div className="field-header">
                  <span className="drag-handle">⋮⋮</span>
                  <span className="field-label">{field.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                    className="remove-field-btn"
                  >
                    ×
                  </button>
                </div>
                <div className="field-preview">
                  {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      disabled
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      disabled
                    />
                  ) : field.type === 'select' ? (
                    <select disabled>
                      <option>Select an option</option>
                      {field.options?.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="radio-group">
                      {field.options?.map((option, idx) => (
                        <label key={idx} className="radio-option">
                          <input type="radio" name={field.id} disabled />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="checkbox-group">
                      {field.options?.map((option, idx) => (
                        <label key={idx} className="checkbox-option">
                          <input type="checkbox" disabled />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : null}
                  {field.required && <span className="required-indicator">*</span>}
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="empty-form">
                <p>Start building your form by adding fields from the sidebar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;