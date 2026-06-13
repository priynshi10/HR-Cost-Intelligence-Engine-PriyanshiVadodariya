/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  department: string;
  role: string;
  email?: string;
}

export type MeetingStatus = 'pending' | 'approved' | 'discarded';

export interface Meeting {
  id: string;
  name: string;
  durationMinutes: number;
  participants: Participant[];
  departments: string[];
  suggestedProjectId: string;
  suggestedProjectName: string;
  costEstimate: number;
  confidence: number;
  dateTime: string;
  status: MeetingStatus;
  rejectionReason?: string;
  description?: string;
  organizerName?: string;
  organizerEmail?: string;
  recurrence?: string;
  meetingLink?: string;
  sourceCalendar?: 'google' | 'outlook';
}

export type ProjectStatus = 'healthy' | 'at_risk' | 'critical';

export interface Project {
  id: string;
  name: string;
  code: string;
  budget: number;
  costToDate: number;
  fteCount: number;
  blendedHourlyRate: number;
  status: ProjectStatus;
  owner: string;
  departmentAllocations: { department: string; percentage: number; cost: number }[];
  historyMonthly: { month: string; spend: number; budget: number }[];
}

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
export type AnomalyStatus = 'triggered' | 'reviewed' | 'resolved';

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  department: string;
  severity: AnomalySeverity;
  costDelta: number;
  potentialMonthlySavings: number;
  status: AnomalyStatus;
  triggerDate: string;
  associatedProjectName?: string;
  recommendationAction: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  email: string;
}

export interface DepartmentRate {
  department: string;
  blendedRate: number;
  l6Rate: number;
  l4Rate: number;
  l1Rate: number;
}

export interface SystemSettings {
  googleCalendarConnected: boolean;
  outlookConnected: boolean;
  syncIntervalMinutes: number;
  ignoredKeywords: string[];
  departmentRates: DepartmentRate[];
  anomalyThresholdPercentage: number;
  anomalyThresholdWeeklyAmount: number;
  googleCalendarLastSync?: string;
  outlookLastSync?: string;
  googleImportedCount: number;
  outlookImportedCount: number;
  syncHealth: 'healthy' | 'warning' | 'error' | 'disconnected';
  automaticDailySync: boolean;
}
