// Netlify Function: emails the Air-Con electricity statement (with the PDF
// attached) through Resend. Set these environment variables in Netlify:
//   RESEND_API_KEY  - required, from https://resend.com/api-keys
//   STATEMENT_TO    - required, recipient address (on Resend's free tier this
//                     must be the email your Resend account is registered with)
//   STATEMENT_FROM  - optional, sender (defaults to Resend's shared address)

const DEFAULT_FROM = "Air-Con Bill <onboarding@resend.dev>";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { success: false, error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(500, { success: false, error: "RESEND_API_KEY is not set" });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  const {
    name = "Occupant",
    statementDate = "",
    opening = "",
    closing = "",
    consumption = "",
    rate = "RM0.60 / kWh",
    amount = "",
    filename = "aircon-statement.pdf",
    pdfBase64 = ""
  } = data;

  if (!pdfBase64) {
    return json(400, { success: false, error: "Missing PDF content" });
  }

  const to = process.env.STATEMENT_TO;
  const from = process.env.STATEMENT_FROM || DEFAULT_FROM;

  if (!to) {
    return json(500, { success: false, error: "STATEMENT_TO is not set" });
  }

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#14201e;max-width:520px">
    <h2 style="margin:0 0 2px;font-size:20px">Air-Conditioning Electricity Statement</h2>
    <p style="margin:0 0 16px;color:#5d6d6b;font-size:13px">Statement date: ${esc(statementDate)}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <tbody>
        ${row("Billed to", name)}
        ${row("Opening reading", opening)}
        ${row("Closing reading", closing)}
        ${row("Consumption", consumption)}
        ${row("Rate", rate)}
      </tbody>
    </table>
    <div style="margin-top:14px;padding:14px 16px;background:#f0f7f6;border:1px solid #0c8f8a;border-radius:8px">
      <span style="color:#0a5f5c;text-transform:uppercase;font-size:12px;letter-spacing:1px;font-weight:700">Amount payable</span>
      <div style="font-size:20px;font-weight:700;margin-top:2px">${esc(amount)}</div>
    </div>
    <p style="margin-top:18px;color:#5d6d6b;font-size:12px">Full statement attached as a PDF. Rate chargeable per tenancy agreement.</p>
  </div>`;

  let res;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Air-Con Electricity Statement - ${statementDate}`,
        html,
        attachments: [{ filename, content: pdfBase64 }]
      })
    });
  } catch (e) {
    return json(502, { success: false, error: "Could not reach Resend" });
  }

  const detail = await res.text();
  if (!res.ok) {
    return json(502, { success: false, error: "Resend rejected the request", detail });
  }

  return json(200, { success: true });
};

function row(label, value) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #d9e0df;color:#5d6d6b">${esc(label)}</td>
    <td style="padding:9px 0;border-bottom:1px solid #d9e0df;text-align:right;font-weight:600">${esc(value)}</td>
  </tr>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
