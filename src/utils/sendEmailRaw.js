const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = new SESClient({ region: process.env.AWS_REGION });

/**
 * Envia um email utilizando SendRawEmailCommand para permitir headers customizados
 * e suportar respostas (In-Reply-To e References).
 *
 * @param {Object} params
 * @param {string} [params.from] - Endereço de remetente. Se não informado, usa process.env.MAIN_EMAIL.
 * @param {string|string[]} params.to - Destinatário(s) principal(is).
 * @param {string|string[]} [params.cc] - Destinatário(s) em cópia.
 * @param {string} params.subject - Assunto do email.
 * @param {string} params.text - Corpo do email em texto.
 * @param {string} [params.html] - Corpo do email em HTML (opcional).
 * @param {Object} [params.customHeaders] - Headers customizados.
 * @param {string} [params.inReplyTo] - Cabeçalho In-Reply-To.
 * @param {string} [params.references] - Cabeçalho References.
 */
async function sendEmailRaw({
  from = process.env.MAIN_EMAIL,
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

  const lines = [];
  lines.push(`From: ${from}`);
  lines.push(`To: ${toAddresses}`);
  if (ccAddresses) lines.push(`Cc: ${ccAddresses}`);
  lines.push(`Subject: ${subject}`);

  if (customHeaders) {
    for (const [key, value] of Object.entries(customHeaders)) {
      if (key.toLowerCase() === "message-id") {
        let msgId = value;
        if (!msgId.startsWith("<")) msgId = `<${msgId}`;
        if (!msgId.endsWith(">")) msgId = `${msgId}>`;
        lines.push(`Message-ID: ${msgId}`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
  }

  if (inReplyTo) {
    let irt = inReplyTo;
    if (!irt.startsWith("<")) irt = `<${irt}`;
    if (!irt.endsWith(">")) irt = `${irt}>`;
    lines.push(`In-Reply-To: ${irt}`);
  }
  if (references) lines.push(`References: ${references}`);

  lines.push("MIME-Version: 1.0");

  let rawMessage;
  if (html) {
    const boundary = "----=_Part_Boundary_123456";
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    rawMessage = lines.join("\n") + "\n\n";
    rawMessage += `--${boundary}\nContent-Type: text/plain; charset="UTF-8"\n\n${text}\n\n`;
    rawMessage += `--${boundary}\nContent-Type: text/html; charset="UTF-8"\n\n${html}\n\n`;
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
