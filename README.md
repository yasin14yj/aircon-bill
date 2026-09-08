# Air-Con Electricity Cost Calculator

A small single-page tool for working out the electricity charge for a
sub-metered air-conditioner. Enter the opening and closing meter readings and it
computes the consumption and the amount payable at **RM0.60 per kWh**, then lets
you save or send a clean PDF statement.

Built as a personal project to bill air-conditioning usage in a rented room,
where the tenancy agreement charges electricity for air-conditioning at a fixed
rate per kWh.

> **Live demo:** <https://aircon-bill-yasin.netlify.app/>

<img width="490" height="880" alt="Screenshot" src="https://github.com/user-attachments/assets/dd52f89a-b06f-411a-b232-d3403dffb1e3" />

---

## Features

- **Fixed one-decimal meter entry** – you type digits and they fill in from the
  right, so readings are always recorded to exactly one decimal place.
- **Validation** – readings must be positive, and the closing reading cannot be
  lower than the opening reading.
- **Live calculation** – consumption (kWh) and amount payable (RM) update as you
  type; the amount is rounded to the nearest sen.
- **PDF statement** – generates a formatted A4 statement (name, date, readings,
  consumption, rate, total) with [jsPDF](https://github.com/parallax/jsPDF).
- **Send via WhatsApp** – opens a chat with the statement details pre-filled.
- **Email PDF** – a Netlify Function emails the statement with the PDF attached
  via [Resend](https://resend.com).
- **Remembers your last entry** in `localStorage`; light and dark themes.

## Tech

| Part | Choice |
| --- | --- |
| UI | Plain HTML + CSS + vanilla JS, no framework |
| PDF | jsPDF (UMD build from cdnjs) |
| Fonts | Archivo + IBM Plex Mono (Google Fonts) |
| Hosting | Netlify (static site + Functions) |
| Email | Resend API, called from a Netlify Function |

## Project structure

```
.
├── index.html                     # the whole app
├── config.example.js              # copy to config.js and fill in
├── config.js                      # your local values (gitignored)
├── netlify.toml                   # points Netlify at the functions folder
└── netlify/functions/
    └── send-statement.js          # POST endpoint: builds email + sends via Resend
```

## Run locally

It is a static page, so any static server works:

```bash
npx serve .
# or: python -m http.server
```

Then open the printed URL. Copy `config.example.js` to `config.js` first and set
your WhatsApp number. The **Email PDF** button only works once deployed to
Netlify with the environment variables below.

## Deploy (Netlify)

1. Create `config.js` from `config.example.js`.
2. Push to GitHub and "Import from Git" on Netlify, **or** drag the folder onto
   <https://app.netlify.com/drop>.
3. Add environment variables in **Site configuration → Environment variables**:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `RESEND_API_KEY` | yes | From <https://resend.com/api-keys> |
   | `STATEMENT_TO` | yes | Recipient address. On Resend's free tier this must be the email your Resend account is registered with. |
   | `STATEMENT_FROM` | no | Defaults to `onboarding@resend.dev`. Set a verified domain sender if you have one. |

4. Redeploy. The **Functions** tab should list `send-statement`.

### Resend free tier

- 100 emails/day, 3,000/month.
- Without a verified domain you can only send **to your own account email**, and
  the sender is `onboarding@resend.dev`.
- Verify a domain in Resend to send to anyone and use your own from-address.

## Configuration

`config.js` (gitignored) holds values that shouldn't be in the repo:

```js
window.AIRCON_CONFIG = {
  whatsappNumber: "60123456789" // international format, digits only; "" hides the button
};
```

The chargeable rate (RM0.60/kWh) is fixed in `index.html`.

## License

[MIT](LICENSE)
