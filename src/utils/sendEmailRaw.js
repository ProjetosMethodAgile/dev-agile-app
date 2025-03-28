const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = new SESClient({ region: process.env.AWS_REGION });

/**
 * Envia um email utilizando SendRawEmailCommand para permitir headers customizados.
 * @param {Object} params - Parâmetros do email.
 * @param {string|string[]} params.to - Destinatário(s) principal(is).
 * @param {string|string[]} [params.cc] - Destinatário(s) em cópia.
 * @param {string} params.subject - Assunto do email.
 * @param {string} params.text - Corpo do email em texto.
 * @param {string} [params.html] - Corpo do email em HTML (opcional).
 * @param {Object} [params.customHeaders] - Headers customizados, ex: { "X-MyApp-MessageId": "valor" }.
 */
async function sendEmailRaw({ to, cc, subject, text, html, customHeaders }) {
  const toAddresses = Array.isArray(to) ? to.join(", ") : to;
  const ccAddresses = cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : "";
  let rawMessage = "";
  rawMessage += `From: ${process.env.MAIN_EMAIL}\n`;
  rawMessage += `To: ${toAddresses}\n`;
  if (ccAddresses) {
    rawMessage += `Cc: ${ccAddresses}\n`;
  }
  rawMessage += `Subject: ${subject}\n`;

  if (customHeaders) {
    for (const [key, value] of Object.entries(customHeaders)) {
      rawMessage += `${key}: ${value}\n`;
    }
  }

  rawMessage += "MIME-Version: 1.0\n";

  if (html) {
    const boundary = "----=_Part_Boundary_123456";
    rawMessage += `Content-Type: multipart/alternative; boundary="${boundary}"\n\n`;
    rawMessage += `--${boundary}\n`;
    rawMessage += `Content-Type: text/plain; charset="UTF-8"\n\n`;
    rawMessage += `${text}\n\n`;
    rawMessage += `--${boundary}\n`;
    rawMessage += `Content-Type: text/html; charset="UTF-8"\n\n`;
    rawMessage += `${html}\n\n`;
    rawMessage += `--${boundary}--`;
  } else {
    rawMessage += `Content-Type: text/plain; charset="UTF-8"\n\n`;
    rawMessage += text;
  }

  const command = new SendRawEmailCommand({
    RawMessage: { Data: Buffer.from(rawMessage) },
  });
  return await sesClient.send(command);
}

module.exports = { sendEmailRaw };
