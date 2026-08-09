import React from 'react'
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { APP_URL, Wordmark, main, container, heading, paragraph, button, footerText } from './_shared'

interface Props {
  firstName?: string
  sessionTitle?: string
  programmeName?: string
  sessionUrl?: string
}

const Email = ({ firstName, sessionTitle, programmeName, sessionUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{sessionTitle ? `Today: ${sessionTitle}` : 'Your session is waiting'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Wordmark />
        <Heading style={heading}>{firstName ? `${firstName}, today's session is ready` : "Today's session is ready"}</Heading>
        <Text style={paragraph}>
          {sessionTitle
            ? `${sessionTitle}${programmeName ? ` — ${programmeName}` : ''}. Get it logged and keep the streak alive.`
            : 'Open your programme and get the work in. Consistency is the whole game.'}
        </Text>
        <Section style={{ margin: '24px 0' }}>
          <Link href={sessionUrl || `${APP_URL}/my-programmes`} style={button}>
            Start session
          </Link>
        </Section>
        <Text style={footerText}>
          You're getting this because daily reminders are on. Turn them off any time in your{' '}
          <Link href={`${APP_URL}/account`} style={{ color: '#101010' }}>account settings</Link>.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data['sessionTitle'] ? `Today: ${data['sessionTitle']}` : 'Your session is waiting',
  displayName: 'Daily training reminder',
  previewData: {
    firstName: 'James',
    sessionTitle: 'Week 3 · Session 2 — Threshold Intervals',
    programmeName: 'Hybrid Race Plan',
    sessionUrl: `${APP_URL}/my-programmes`,
  },
} satisfies TemplateEntry
