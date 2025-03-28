const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Cria o cliente SES utilizando a região definida no .env
const sesClient = new SESClient({ region: process.env.AWS_REGION });

/**
 * Envia um email utilizando AWS SES.
 * @param {Object} params - Parâmetros do email.
 * @param {string|string[]} params.to - Destinatário(s) principal(is).
 * @param {string|string[]} [params.cc] - Destinatário(s) em cópia.
 * @param {string} params.subject - Assunto do email.
 * @param {string} params.text - Corpo do email em texto.
 * @param {string} [params.html] - Corpo do email em HTML (opcional).
 */
async function sendEmail({ to, cc, subject, text, html }) {
  const params = {
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
      CcAddresses: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
    },
    Message: {
      Body: {
        Text: { Data: text },
        ...(html && { Html: { Data: html } }),
      },
      Subject: { Data: subject },
    },
    Source: process.env.MAIN_EMAIL, // O email verificado no SES que atua como remetente
  };

  const command = new SendEmailCommand(params);
  return await sesClient.send(command);
}

module.exports = { sendEmail };
