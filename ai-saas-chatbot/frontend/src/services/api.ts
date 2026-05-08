import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, Chat, Report } from '../types';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors globally
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear auth
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(
    username: string,
    email: string,
    password: string,
    businessName?: string,
    industry?: string
  ): Promise<AuthResponse> {
    const response = await this.client.post('/auth/register', {
      username,
      email,
      password,
      businessName,
      industry
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', {
      email,
      password
    });
    return response.data;
  }

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/google', {
      credential
    });
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: any }> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async upgradeToPro(): Promise<{ user: any }> {
    const response = await this.client.post('/auth/upgrade');
    return response.data;
  }

  // Report endpoints
  async uploadReport(file: File, onProgress?: (progress: number) => void): Promise<Report> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min for uploads
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return response.data.report;
  }

  async getReports(): Promise<Report[]> {
    const response = await this.client.get('/reports');
    return response.data.reports;
  }

  async getReport(reportId: string): Promise<Report> {
    const response = await this.client.get(`/reports/${reportId}`);
    return response.data.report;
  }

  async deleteReport(reportId: string): Promise<void> {
    await this.client.delete(`/reports/${reportId}`);
  }

  // Chat endpoints
  async createChat(reportId: string): Promise<Chat> {
    const response = await this.client.post('/chat', {
      reportId
    });
    return response.data.chat;
  }

  async getChats(reportId?: string): Promise<Chat[]> {
    const response = await this.client.get('/chat', {
      params: reportId ? { reportId } : undefined
    });
    return response.data.chats;
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await this.client.get(`/chat/${chatId}`);
    return response.data.chat;
  }

  async sendMessage(
    chatId: string,
    message: string
  ): Promise<{ chat: Chat; assistantMessage: { content: string; sources: string[] } }> {
    const response = await this.client.post(`/chat/${chatId}/message`, {
      message
    });
    return {
      chat: response.data.chat,
      assistantMessage: response.data.assistantMessage
    };
  }

  async rateMessage(chatId: string, messageIndex: number, rating: 'like' | 'dislike'): Promise<void> {
    await this.client.post(`/chat/${chatId}/rate`, {
      messageIndex,
      rating
    });
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.client.delete(`/chat/${chatId}`);
  }
}

export default new APIClient();
