function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { naam, email, telefoon, oppervlakte, kamer, bericht, _gotcha } = req.body ?? {};

  // Honeypot — bot detectie
  if (_gotcha) return res.status(200).json({ ok: true });

  if (!naam || !email || !bericht) {
    return res.status(400).json({ error: 'Verplichte velden ontbreken' });
  }

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1a54d2;padding:24px 28px;border-radius:8px 8px 0 0;">
    <h1 style="color:white;margin:0;font-size:20px;">Nieuwe offerte aanvraag</h1>
    <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:14px;">Via coolgeregeld.nl</p>
  </div>
  <div style="background:#f8fafc;padding:24px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      <tr>
        <td style="padding:8px 0;color:#64748b;width:140px;vertical-align:top;">Naam</td>
        <td style="padding:8px 0;font-weight:600;color:#1e293b;">${esc(naam)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#64748b;vertical-align:top;">E-mailadres</td>
        <td style="padding:8px 0;"><a href="mailto:${esc(email)}" style="color:#1a54d2;">${esc(email)}</a></td>
      </tr>
      ${telefoon ? `<tr>
        <td style="padding:8px 0;color:#64748b;vertical-align:top;">Telefoon</td>
        <td style="padding:8px 0;"><a href="tel:${esc(telefoon)}" style="color:#1a54d2;">${esc(telefoon)}</a></td>
      </tr>` : ''}
      ${oppervlakte ? `<tr>
        <td style="padding:8px 0;color:#64748b;vertical-align:top;">Oppervlakte</td>
        <td style="padding:8px 0;color:#1e293b;">${esc(oppervlakte)}</td>
      </tr>` : ''}
      ${kamer ? `<tr>
        <td style="padding:8px 0;color:#64748b;vertical-align:top;">Type kamer</td>
        <td style="padding:8px 0;color:#1e293b;">${esc(kamer)}</td>
      </tr>` : ''}
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
    <h3 style="margin:0 0 10px;color:#1e293b;font-size:15px;">Bericht</h3>
    <p style="margin:0;color:#334155;line-height:1.6;white-space:pre-line;">${esc(bericht)}</p>
    <div style="margin-top:24px;padding:14px 16px;background:#eff6ff;border-left:4px solid #1a54d2;border-radius:4px;font-size:13px;color:#1e40af;">
      Stuur een antwoord naar: <a href="mailto:${esc(email)}" style="color:#1a54d2;font-weight:600;">${esc(email)}</a>
    </div>
  </div>
</div>`;

  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Coolgeregeld Website <noreply@coolgeregeld.nl>',
        to: ['info@coolgeregeld.nl'],
        reply_to: email,
        subject: `Offerte aanvraag van ${naam}`,
        html,
      }),
    });

    if (!result.ok) {
      const err = await result.json().catch(() => ({}));
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Verzenden mislukt' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Serverfout' });
  }
}
