import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const mailService = {
  async sendMail({ mail, asunto, detalle }: { mail: string; asunto: string; detalle: string }) {
    return axios.post(`${API_BASE_URL}/mail`, { mail, asunto, detalle });
  },

  async forgotPassword(email: string) {
    return axios.post(`${API_BASE_URL}/mail/forgot-password`, { email });
  },

  async welcome(email: string, nombre: string) {
    return axios.post(`${API_BASE_URL}/mail/welcome`, { email, nombre });
  },

  async notifyCredentialsChange(oldEmail: string, oldUsername: string) {
    return axios.post(`${API_BASE_URL}/mail/notify-credentials-change`, {
      email: oldEmail,
      oldUsername
    });
  },

  async paymentConfirmation(email: string, nombre: string, producto: string, codigo: string) {
    return axios.post(`${API_BASE_URL}/mail/payment-confirmation`, {
      email,
      nombre,
      producto,
      codigo
    });
  },
};
