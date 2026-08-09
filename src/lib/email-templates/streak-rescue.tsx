import React from 'react'
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { APP_URL, Wordmark, main, container, heading, paragraph, button, footerText } from './_shared'

interface Props {
  firstName?: string
  daysSinceLastSession?: number
  streakDays?: number
  programmeName?: string
}

const Email = ({ firstName, daysSinceLastSession = 5, streakDays, programmeName }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>One session gets you back on track</Preview>
    <Body style={main}>
      <Container style={container}>
        <Wordmark />
        <Heading style={heading}>{firstName ? `${firstName}, let's get you back in` : "Let's get you back in"}</Heading>
        <Text style={paragraph}>
          It's been {daysSinceLastSession} days since your last logged session
          {programmeName ? ` on ${programmeName}` : ''}
          {streakDays ? `, and your ${streakDays}-day streak is on the line` : ''}. No guilt — just pick up where you
          left off. One session is all it takes.
        </Text>
        <Section style={{ margin: '24px 0' }}>
          <Link href={`${APP_URL}/my-programmes`} style={button}>
            Resume training
          </Link>
        </Section>
        <Text style={footerText}>
          Prefer fewer nudges? Adjust them in your{' '}
          <Link href={`${APP_URL}/account`} style={{ color: '#101010' }}>account settings</Link>.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'One session gets you back on track',
  displayName: 'Streak rescue',
  previewData: { firstName: 'James', daysSinceLastSession: 6, streakDays: 12, programmeName: 'Hybrid Race Plan' },
} satisfies TemplateEntry
