import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail({
  to,
  resetLink,
  locale,
}: {
  to: string
  resetLink: string
  locale: string
}): Promise<void> {
  const isFr = locale === 'fr'

  const subject = isFr
    ? 'Réinitialisation de votre mot de passe Ascent'
    : 'Reset your Ascent password'

  const buttonLabel = isFr
    ? 'Réinitialiser mon mot de passe'
    : 'Reset my password'
  const ignoreText = isFr
    ? "Si vous n'avez pas fait cette demande, ignorez simplement cet email. Votre mot de passe restera inchangé."
    : 'If you did not request this, you can safely ignore this email. Your password will remain unchanged.'
  const expiryText = isFr
    ? 'Ce lien expire dans <strong>1 heure</strong>.'
    : 'This link expires in <strong>1 hour</strong>.'
  const greeting = isFr
    ? 'Bonjour,<br>Vous avez demandé à réinitialiser votre mot de passe Ascent.'
    : 'Hi,<br>You requested a password reset for your Ascent account.'

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:28px;font-weight:700;background:linear-gradient(to right,#4f46e5,#9333ea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#4f46e5;">
                ↑ Ascent
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">${greeting}</p>

              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">${expiryText}</p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${resetLink}"
                      style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;">
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
                ${isFr ? 'Ou copiez ce lien dans votre navigateur :' : 'Or copy this link into your browser:'}
              </p>
              <p style="margin:0 0 28px;font-size:12px;word-break:break-all;">
                <a href="${resetLink}" style="color:#4f46e5;text-decoration:underline;">${resetLink}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;" />

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">${ignoreText}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Ascent</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    throw new Error(error.message)
  }

  console.log('Resend email sent:', data?.id)
}

export async function sendVerificationEmail({
  to,
  verificationLink,
  locale,
}: {
  to: string
  verificationLink: string
  locale: string
}): Promise<void> {
  const isFr = locale === 'fr'

  const subject = isFr
    ? 'Vérifiez votre adresse email Ascent'
    : 'Verify your Ascent email address'

  const buttonLabel = isFr
    ? 'Vérifier mon adresse email'
    : 'Verify my email address'
  const ignoreText = isFr
    ? "Si vous n'avez pas créé de compte Ascent, ignorez simplement cet email."
    : 'If you did not create an Ascent account, you can safely ignore this email.'
  const expiryText = isFr
    ? 'Ce lien expire dans <strong>24 heures</strong>.'
    : 'This link expires in <strong>24 hours</strong>.'
  const greeting = isFr
    ? 'Bienvenue sur Ascent !<br>Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.'
    : 'Welcome to Ascent!<br>Click the button below to verify your email address.'

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:28px;font-weight:700;color:#4f46e5;">
                ↑ Ascent
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">${greeting}</p>

              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">${expiryText}</p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${verificationLink}"
                      style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;">
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
                ${isFr ? 'Ou copiez ce lien dans votre navigateur :' : 'Or copy this link into your browser:'}
              </p>
              <p style="margin:0 0 28px;font-size:12px;word-break:break-all;">
                <a href="${verificationLink}" style="color:#4f46e5;text-decoration:underline;">${verificationLink}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;" />

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">${ignoreText}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Ascent</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Resend verification error:', error)
    throw new Error(error.message)
  }

  console.log('Resend verification email sent:', data?.id)
}
