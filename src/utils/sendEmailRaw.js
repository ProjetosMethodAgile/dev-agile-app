const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = new SESClient({ region: process.env.AWS_REGION });

/**
 * Envia um email utilizando SendRawEmailCommand para permitir headers customizados
 * e suportar respostas (In-Reply-To e References).
 *
 * @param {Object} params
 * @param {string|string[]} params.to - Destinatário(s) principal(is).
 * @param {string|string[]} [params.cc] - Destinatário(s) em cópia.
 * @param {string} params.subject - Assunto do email.
 * @param {string} params.text - Corpo do email em texto.
 * @param {string} [params.html] - Corpo do email em HTML (opcional).
 * @param {Object} [params.customHeaders] - Headers customizados, ex: { "X-MyApp-MessageId": "valor", "Message-ID": "valor" }.
 * @param {string} [params.inReplyTo] - Valor para o cabeçalho In-Reply-To (ex.: messageId).
 * @param {string} [params.references] - Valor para o cabeçalho References (ex.: <id1> <id2>).
 */
async function sendEmailRaw({
  to,
  cc,
  subject,
  text,
  html,
  customHeaders,
  inReplyTo,
  references,
}) {

  const toAddresses = Array.isArray(to) ? to.join(", ") : to;
  const ccAddresses = cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : null;

  // Utilize um array para construir a mensagem linha a linha
  const lines = [];
  lines.push(`From: ${process.env.MAIN_EMAIL}`);
  lines.push(`To: ${toAddresses}`);
  if (ccAddresses) {
    lines.push(`Cc: ${ccAddresses}`);
  }
  lines.push(`Subject: ${subject}`);

  // Adiciona os headers customizados, tratando o "Message-ID" para garantir o padrão
  if (customHeaders) {
    for (const [key, value] of Object.entries(customHeaders)) {
      if (key.toLowerCase() === "message-id") {
        let formatted = value;
        if (!formatted.startsWith("<")) {
          formatted = `<${formatted}`;
        }
        if (!formatted.endsWith(">")) {
          formatted = `${formatted}>`;
        }
        lines.push(`Message-ID: ${formatted}`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
  }

  // Cabeçalhos para threading de emails
  if (inReplyTo) {
    let formatted = inReplyTo;
    if (!formatted.startsWith("<")) {
      formatted = `<${formatted}`;
    }
    if (!formatted.endsWith(">")) {
      formatted = `${formatted}>`;
    }
    lines.push(`In-Reply-To: ${formatted}`);
  }
  if (references) {
    lines.push(`References: ${references}`);
  }

  lines.push("MIME-Version: 1.0");

  let rawMessage = "";
  if (html) {
    const boundary = "----=_Part_Boundary_123456";
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    rawMessage = lines.join("\n") + "\n\n";
    rawMessage += `--${boundary}\n`;
    rawMessage += `Content-Type: text/plain; charset="UTF-8"\n\n`;
    rawMessage += `${text}\n\n`;
    rawMessage += `--${boundary}\n`;
    rawMessage += `Content-Type: text/html; charset="UTF-8"\n\n`;
    rawMessage += `${html}\n\n`;
    rawMessage += `--${boundary}--`;
  } else {
    lines.push(`Content-Type: text/plain; charset="UTF-8"`);
    rawMessage = lines.join("\n") + "\n\n" + text;
  }

  const command = new SendRawEmailCommand({
    RawMessage: { Data: Buffer.from(rawMessage) },
  });
  return await sesClient.send(command);
}

module.exports = { sendEmailRaw };
