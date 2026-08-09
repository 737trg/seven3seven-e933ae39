import React from 'react'
import { Body, Column, Container, Head, Heading, Hr, Html, Link, Preview, Row, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { APP_URL, Wordmark, main, container, heading, paragraph, button, statBox, statValue, statLabel, footerText } from './_shared'

interface Props {
  firstName?: string
  sessionsCompleted?: number
  sessionsPlanned?: number
  streakDays?: number
  newPbs?: number
  weekAheadTitle?: string
  weekAheadSessions?: string[]
}

const Email = ({
  firstName,
  sessionsCompleted = 0,
  sessionsPlanned = 0,
  streakDays = 0,
  newPbs = 0,
  weekAheadTitle,
  weekAheadSessions = [],
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your week: ${sessionsCompleted}/${sessionsPlanned} sessions logged`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Wordmark />
        <Heading style={heading}>{firstName ? `${firstName}, here's your week` : "Here's your week"}</Heading>
        <Text style={paragraph}>A quick look at the week just gone, and what's coming next.</Text>

        <Section style={{ margin: '20px 0' }}>
          <Row>
            <Column style={{ paddingRight: '6px' }}>
              <div style={statBox}>
                <p style={statValue}>{sessionsCompleted}/{sessionsPlanned}</p>
                <p style={statLabel}>Sessions</p>
              </div>
            </Column>
            <Column style={{ padding: '0 3px' }}>
              <div style={statBox}>
                <p style={statValue}>{streakDays}</p>
                <p style={statLabel}>Day streak</p>
              </div>
            </Column>
            <Column style={{ paddingLeft: '6px' }}>
              <div style={statBox}>
                <p style={statValue}>{newPbs}</p>
                <p style={statLabel}>New PBs</p>
              </div>
            </Column>
          </Row>
        </Section>

        <Hr style={{ borderColor: '#e6e4df', margin: '24px 0' }} />

        <Heading style={{ ...heading, fontSize: '17px' }}>{weekAheadTitle || 'The week ahead'}</Heading>
        {weekAheadSessions.length > 0 ? (
          weekAheadSessions.map((s, i) => (
            <Text key={i} style={{ ...paragraph, margin: '0 0 6px', color: '#101010' }}>
              {i + 1}. {s}
            </Text>
          ))
        ) : (
          <Text style={paragraph}>Open your programme to see what's scheduled.</Text>
        )}

        <Section style={{ margin: '24px 0' }}>
          <Link href={`${APP_URL}/my-programmes`} style={button}>
            View my programme
          </Link>
        </Section>

        <Text style={footerText}>
          Weekly recaps can be switched off in your{' '}
          <Link href={`${APP_URL}/account`} style={{ color: '#101010' }}>account settings</Link>.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your week: ${data['sessionsCompleted'] ?? 0}/${data['sessionsPlanned'] ?? 0} sessions logged`,
  displayName: 'Weekly recap',
  previewData: {
    firstName: 'James',
    sessionsCompleted: 4,
    sessionsPlanned: 5,
    streakDays: 12,
    newPbs: 2,
    weekAheadTitle: 'Week 4 — Build',
    weekAheadSessions: ['Session 1 — Strength Lower', 'Session 2 — Threshold Run', 'Session 3 — Hybrid Engine'],
  },
} satisfies TemplateEntry
