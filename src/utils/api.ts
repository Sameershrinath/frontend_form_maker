import axios from 'axios';
import { Form, CreateFormRequest, FormResponse, SubmitResponseRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Form API calls
export const formAPI = {
  getAllForms: async (): Promise<Form[]> => {
    const response = await api.get('/forms');
    return response.data;
  },

  getFormById: async (id: string): Promise<Form> => {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },

  createForm: async (formData: CreateFormRequest): Promise<Form> => {
    const response = await api.post('/forms', formData);
    return response.data;
  },

  updateForm: async (id: string, formData: Partial<CreateFormRequest>): Promise<Form> => {
    const response = await api.put(`/forms/${id}`, formData);
    return response.data;
  },

  deleteForm: async (id: string): Promise<void> => {
    await api.delete(`/forms/${id}`);
  },
};

// Response API calls
export const responseAPI = {
  submitResponse: async (responseData: SubmitResponseRequest): Promise<{ message: string; id: string }> => {
    const response = await api.post('/responses', responseData);
    return response.data;
  },

  getResponsesByFormId: async (formId: string): Promise<FormResponse[]> => {
    const response = await api.get(`/responses/form/${formId}`);
    return response.data;
  },

  getAllResponses: async (): Promise<FormResponse[]> => {
    const response = await api.get('/responses');
    return response.data;
  },

  deleteResponse: async (id: string): Promise<void> => {
    await api.delete(`/responses/${id}`);
  },
};