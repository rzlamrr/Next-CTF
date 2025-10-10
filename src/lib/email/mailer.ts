import type { Transporter } from 'nodemailer'

type SendMailOptions = {
  to: string[]
  subject: string
  text?: string
  html?: string
}

function isEmailEnabled(): boolean {
  const toggle = process.env.NOTIFICATIONS_EMAIL_ENABLED
  if (toggle && toggle.toLowerCase() === 'false') return false
  // If toggle not set, fallback to presence of minimal SMTP config
  return Boolean(
    process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_FROM
  )
}

function getSmtpConfig(): {
  host: string
  port: number
  secure: boolean
  auth?: { user: string; pass: string }
  from: string
} | null {
  const host = process.env.EMAIL_HOST
  const portStr = process.env.EMAIL_PORT
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  const from = process.env.EMAIL_FROM

  if (!host || !portStr || !from) return null

  const port = Number(portStr)
  const secure = port === 465 // common default for SMTPS
  const auth = user && pass ? { user, pass } : undefined

  return { host, port, secure, auth, from }
}

/**
 * Send an email using SMTP if configured and enabled.
 * If SMTP is not configured or disabled, this is a safe no-op.
 */
export async function sendMail(options: SendMailOptions): Promise<void> {
  if (!isEmailEnabled()) {
    // No-op if disabled or missing minimal config
    return
  }

  const cfg = getSmtpConfig()
  if (!cfg) {
    // Fallback: missing config - no-op
    return
  }

  // Dynamic import nodemailer to avoid hard dependency when not used
  let nodemailer: typeof import('nodemailer')
  try {
    nodemailer = await import('nodemailer')
  } catch {
    // If nodemailer is not installed, safely no-op (development fallback)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[mailer] nodemailer not installed; skipping email send')
    }
    return
  }

  const transporter: Transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
  })

  const toList = Array.from(new Set((options.to ?? []).filter(Boolean)))
  if (!toList.length) {
    // Nothing to send
    return
  }

  await transporter.sendMail({
    from: cfg.from,
    to: toList.join(','),
    subject: options.subject,
    text: options.text,
    html: options.html,
  })
}
