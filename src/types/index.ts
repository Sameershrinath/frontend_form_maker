export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  value?: any;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface FormResponse {
  id: string;
  formId: string;
  responses: { [fieldId: string]: any };
  submittedAt: string;
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface SubmitResponseRequest {
  formId: string;
  responses: { [fieldId: string]: any };
}