import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const mailService = {
  async sendMail({ mail, asunto, detalle }: { mail: string; asunto: string; detalle: string }) {
    return axios.post(`${API_BASE_URL}/mail`, { mail, asunto, detalle });
  },
};
