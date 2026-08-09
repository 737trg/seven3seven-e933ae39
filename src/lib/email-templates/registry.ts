import type { ComponentType } from 'react'
import { template as dailyReminderTemplate } from './daily-reminder'
import { template as weeklyRecapTemplate } from './weekly-recap'
import { template as streakRescueTemplate } from './streak-rescue'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'daily-reminder': dailyReminderTemplate,
  'weekly-recap': weeklyRecapTemplate,
  'streak-rescue': streakRescueTemplate,
}
