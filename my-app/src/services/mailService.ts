import { apiClient } from './httpClient';

export const mailService = {
  async sendMail({ mail, asunto, detalle }: { mail: string; asunto: string; detalle: string }) {
    return apiClient.post('/mail', { mail, asunto, detalle });
  },

  async forgotPassword(email: string) {
    return apiClient.post('/mail/forgot-password', { email });
  },

  async welcome(email: string, nombre: string) {
    return apiClient.post('/mail/welcome', { email, nombre });
  },

  async notifyCredentialsChange(oldEmail: string, oldUsername: string) {
    return apiClient.post('/mail/notify-credentials-change', {
      email: oldEmail,
      oldUsername
    });
  },

  async paymentConfirmation(email: string, nombre: string, producto: string, codigo: string) {
    return apiClient.post('/mail/payment-confirmation', {
      email,
      nombre,
      producto,
      codigo
    });
  },

  async sendDeletedUserMail(mail: string, nombreUsuario: string, motivo: string) {
    return apiClient.post('/mail/deleted-user', { mail, nombreUsuario, motivo });
  },
};
