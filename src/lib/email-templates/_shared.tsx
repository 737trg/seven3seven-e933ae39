import React from 'react'

export const colors = {
  ink: '#101010',
  muted: '#6b6b6b',
  border: '#e6e4df',
  signal: '#D82932',
  surface: '#faf9f6',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  color: colors.ink,
}

export const container = {
  padding: '32px 24px',
  maxWidth: '560px',
  margin: '0 auto',
}

export const wordmark = {
  fontSize: '14px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  fontWeight: 700,
  color: colors.ink,
  margin: '0 0 24px',
}

export const heading = {
  fontSize: '24px',
  lineHeight: '1.25',
  fontWeight: 700,
  margin: '0 0 12px',
  color: colors.ink,
}

export const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: colors.muted,
  margin: '0 0 16px',
}

export const button = {
  backgroundColor: colors.signal,
  color: '#ffffff',
  padding: '13px 22px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  display: 'inline-block',
}

export const statBox = {
  border: `1px solid ${colors.border}`,
  borderRadius: '6px',
  padding: '14px 16px',
  backgroundColor: colors.surface,
}

export const statValue = {
  fontSize: '22px',
  fontWeight: 700,
  margin: '0',
  color: colors.ink,
}

export const statLabel = {
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: colors.muted,
  margin: '4px 0 0',
}

export const footerText = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: colors.muted,
  margin: '24px 0 0',
}

export const APP_URL = 'https://737trg.com'

export function Wordmark() {
  return <p style={wordmark}>SEVEN3SEVEN</p>
}
