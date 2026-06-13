/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Meeting, Project, Anomaly, Persona, SystemSettings } from './types';

export const SIMULATED_PERSONAS: Persona[] = [
  {
    id: 'p1',
    name: 'Alex Chen',
    role: 'CHRO',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgrgH5nQ22jsTKdGO4IRCSqkNlNeIJl9qL8L1h2t16Rp48gUM3mYoQ7ps_D811mOpSGGA1CCxRGcf7h_N5J7EKBIX0Ox9Gqn3EjpctJoODFG0TWuy9ryN21nxFZ7irfjSdN6uzzF4sKxhUrtqeifFXCYq1FQ9EfmELQdKkfMCidEzgDr_dIkWMBh5WHfr1K7ECw1ZieYanMjWAtEGo7SWUY4qe5LnS8ve4sxmMAc5lBgHW-PDG7kR8N-JlHSyddavKL1YwuYR8vXw',
    email: 'alex.chen@workpulse.ai'
  },
  {
    id: 'p2',
    name: 'Sarah Jenkins',
    role: 'CHRO / VP HR Operations',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHpQraQFwkzM9JWpA73Vc2dMVqmDFOLoB6pJQwyYtJMVa5b3K2wXWXlm_Vrfi5HI3LfkqNngBG6CEMdeHmfvL2FJOPLtTER8Yp_FOGge35DabJ7ij0l75zSNGQKMqrB4KRcHSo_4X78_s7ac1wfcZE3r2i6-4812lzrDJEgkGW4DorMhuRumviAaoBi2WsbGfphcNuRvwtzC7sg5vZ2xDG529wYWVdr6cKvy2VAiPLSC1DaM8LrWUEX9493SogC1X54Khh5cVd_dY',
    email: 'sarah.j@workpulse.ai'
  },
  {
    id: 'p3',
    name: 'Marcus Thorne',
    role: 'VP Engineering',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8A2TwP5OoFyBIkwzstUmdvYL0du6z3FtoFal-8SWCuo8vyiVaAIBmIN468r3SjZJGyTnfpa0ADpFb_-oOP86u06KY61pgDZT00n4Prjg1eoTI3TNNvMG-uGvAOtZj_0YqHq9EXv39Y_EPKMvPKeNwVH8tJwo1Hz4xuUnjr8vcJcciGhBxy_6rPKT_ye3wtqOhuEx5NF0n217NUwb60oF2XkqtAxuPukg-2YrJAvCDp-AlFRJT6Wsm-MFS1rBJCYwaEvRjw2GOJio',
    email: 'marcus.t@workpulse.ai'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  googleCalendarConnected: false,
  outlookConnected: false,
  syncIntervalMinutes: 60,
  ignoredKeywords: ['personal', 'lunch', 'pmo-block', 'vacation'],
  anomalyThresholdPercentage: 15,
  anomalyThresholdWeeklyAmount: 5000,
  googleImportedCount: 0,
  outlookImportedCount: 0,
  syncHealth: 'disconnected',
  automaticDailySync: true,
  departmentRates: [
    { department: 'Engineering', blendedRate: 150, l6Rate: 220, l4Rate: 140, l1Rate: 75 },
    { department: 'Product Management', blendedRate: 140, l6Rate: 210, l4Rate: 130, l1Rate: 70 },
    { department: 'Design', blendedRate: 120, l6Rate: 180, l4Rate: 110, l1Rate: 60 },
    { department: 'Sales & Growth', blendedRate: 110, l6Rate: 170, l4Rate: 100, l1Rate: 55 },
    { department: 'Finance & G&A', blendedRate: 125, l6Rate: 195, l4Rate: 115, l1Rate: 65 }
  ]
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Platform R&D',
    code: 'PLAT-RD',
    budget: 1500000,
    costToDate: 840000,
    fteCount: 22,
    blendedHourlyRate: 150,
    status: 'healthy',
    owner: 'Marcus Thorne',
    departmentAllocations: [
      { department: 'Engineering', percentage: 70, cost: 588000 },
      { department: 'Product Management', percentage: 15, cost: 126000 },
      { department: 'Design', percentage: 10, cost: 84000 },
      { department: 'Finance & G&A', percentage: 5, cost: 42000 }
    ],
    historyMonthly: [
      { month: 'Jul', spend: 110000, budget: 120000 },
      { month: 'Aug', spend: 130000, budget: 120000 },
      { month: 'Sep', spend: 115000, budget: 120000 },
      { month: 'Oct', spend: 140000, budget: 120000 },
      { month: 'Nov', spend: 165000, budget: 130000 },
      { month: 'Dec', spend: 180000, budget: 130000 }
    ]
  },
  {
    id: 'proj-2',
    name: 'Cloud Migration',
    code: 'CLOUD-MIG',
    budget: 900000,
    costToDate: 620000,
    fteCount: 12,
    blendedHourlyRate: 140,
    status: 'at_risk',
    owner: 'Linda Wu',
    departmentAllocations: [
      { department: 'Engineering', percentage: 80, cost: 496000 },
      { department: 'Product Management', percentage: 10, cost: 62000 },
      { department: 'Design', percentage: 5, cost: 31000 },
      { department: 'Finance & G&A', percentage: 5, cost: 31000 }
    ],
    historyMonthly: [
      { month: 'Jul', spend: 80000, budget: 85000 },
      { month: 'Aug', spend: 95000, budget: 85000 },
      { month: 'Sep', spend: 100000, budget: 85000 },
      { month: 'Oct', spend: 110000, budget: 85000 },
      { month: 'Nov', spend: 115000, budget: 90000 },
      { month: 'Dec', spend: 120000, budget: 90000 }
    ]
  },
  {
    id: 'proj-3',
    name: 'Compliance Audit',
    code: 'COMP-AUD',
    budget: 600000,
    costToDate: 490000,
    fteCount: 8,
    blendedHourlyRate: 130,
    status: 'healthy',
    owner: 'Sarah Jenkins',
    departmentAllocations: [
      { department: 'Finance & G&A', percentage: 60, cost: 294000 },
      { department: 'Engineering', percentage: 20, cost: 98000 },
      { department: 'Product Management', percentage: 20, cost: 98000 }
    ],
    historyMonthly: [
      { month: 'Jul', spend: 65000, budget: 70000 },
      { month: 'Aug', spend: 68000, budget: 70000 },
      { month: 'Sep', spend: 72000, budget: 70000 },
      { month: 'Oct', spend: 85000, budget: 80000 },
      { month: 'Nov', spend: 90000, budget: 80000 },
      { month: 'Dec', spend: 110000, budget: 80000 }
    ]
  },
  {
    id: 'proj-4',
    name: 'Legacy Maintenance',
    code: 'LEG-MAINT',
    budget: 400000,
    costToDate: 250000,
    fteCount: 6,
    blendedHourlyRate: 115,
    status: 'critical',
    owner: 'Sarah Jenkins',
    departmentAllocations: [
      { department: 'Engineering', percentage: 90, cost: 225000 },
      { department: 'Product Management', percentage: 10, cost: 25000 }
    ],
    historyMonthly: [
      { month: 'Jul', spend: 32000, budget: 35000 },
      { month: 'Aug', spend: 34000, budget: 35000 },
      { month: 'Sep', spend: 39000, budget: 35000 },
      { month: 'Oct', spend: 45000, budget: 35000 },
      { month: 'Nov', spend: 52000, budget: 35000 },
      { month: 'Dec', spend: 48000, budget: 35000 }
    ]
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    name: 'Q4 Strategy Sync',
    durationMinutes: 60,
    dateTime: '2026-06-12T14:00:00.000Z',
    participants: [
      { id: 'usr-1', name: 'Alex Chen', initials: 'AC', department: 'Finance & G&A', role: 'CHRO' },
      { id: 'usr-2', name: 'Sarah Jenkins', initials: 'SJ', department: 'Finance & G&A', role: 'VP HR' },
      { id: 'usr-3', name: 'Marcus Thorne', initials: 'MT', department: 'Engineering', role: 'VP Eng' },
      { id: 'usr-4', name: 'David Miller', initials: 'DM', department: 'Product Management', role: 'PM Lead' },
      { id: 'usr-5', name: 'Samantha Fox', initials: 'SF', department: 'Design', role: 'Design Director' },
      { id: 'usr-6', name: 'John Doe', initials: 'JD', department: 'Engineering', role: 'Staff Eng' }
    ],
    departments: ['Finance & G&A', 'Engineering', 'Product Management', 'Design'],
    suggestedProjectId: 'proj-1',
    suggestedProjectName: 'Platform R&D',
    costEstimate: 2250,
    confidence: 94,
    status: 'pending'
  },
  {
    id: 'meet-2',
    name: 'Architecture Review: Core v2',
    durationMinutes: 90,
    dateTime: '2026-06-12T10:30:00.000Z',
    participants: [
      { id: 'usr-3', name: 'Marcus Thorne', initials: 'MT', department: 'Engineering', role: 'VP Eng' },
      { id: 'usr-6', name: 'John Doe', initials: 'JD', department: 'Engineering', role: 'Staff Eng' },
      { id: 'usr-7', name: 'Alex Rivera', initials: 'AR', department: 'Engineering', role: 'Principal Architect' },
      { id: 'usr-8', name: 'Emily Taylor', initials: 'ET', department: 'Engineering', role: 'DevOps Lead' }
    ],
    departments: ['Engineering'],
    suggestedProjectId: 'proj-2',
    suggestedProjectName: 'Cloud Migration',
    costEstimate: 4800,
    confidence: 82,
    status: 'pending'
  },
  {
    id: 'meet-3',
    name: 'Weekly Sales Review & Sync',
    durationMinutes: 60,
    dateTime: '2026-06-12T09:00:00.000Z',
    participants: [
      { id: 'usr-9', name: 'Michael King', initials: 'MK', department: 'Sales & Growth', role: 'VP Sales' },
      { id: 'usr-10', name: 'Alice Young', initials: 'AY', department: 'Sales & Growth', role: 'Sales rep' },
      { id: 'usr-11', name: 'Bob Carter', initials: 'BC', department: 'Sales & Growth', role: 'Sales rep' },
      { id: 'usr-12', name: 'Diana Prince', initials: 'DP', department: 'Marketing', role: 'Growth Director' }
    ],
    departments: ['Sales & Growth'],
    suggestedProjectId: 'proj-4',
    suggestedProjectName: 'Legacy Maintenance',
    costEstimate: 1650,
    confidence: 76,
    status: 'pending'
  },
  {
    id: 'meet-4',
    name: 'Coffee Chat: Sales and Tech',
    durationMinutes: 30,
    dateTime: '2026-06-11T16:00:00.000Z',
    participants: [
      { id: 'usr-9', name: 'Michael King', initials: 'MK', department: 'Sales & Growth', role: 'VP Sales' },
      { id: 'usr-6', name: 'John Doe', initials: 'JD', department: 'Engineering', role: 'Staff Eng' }
    ],
    departments: ['Sales & Growth', 'Engineering'],
    suggestedProjectId: 'unassigned',
    suggestedProjectName: 'Uncategorized Waste',
    costEstimate: 450,
    confidence: 12,
    status: 'pending'
  },
  {
    id: 'meet-5',
    name: 'Security Penetration Overviews',
    durationMinutes: 45,
    dateTime: '2026-06-10T11:00:00.000Z',
    participants: [
      { id: 'usr-3', name: 'Marcus Thorne', initials: 'MT', department: 'Engineering', role: 'VP Eng' },
      { id: 'usr-7', name: 'Alex Rivera', initials: 'AR', department: 'Engineering', role: 'Principal Architect' },
      { id: 'usr-13', name: 'Rachel Green', initials: 'RG', department: 'Finance & G&A', role: 'Compliance Officer' }
    ],
    departments: ['Engineering', 'Finance & G&A'],
    suggestedProjectId: 'proj-3',
    suggestedProjectName: 'Compliance Audit',
    costEstimate: 1850,
    confidence: 95,
    status: 'approved'
  },
  {
    id: 'meet-6',
    name: 'Ad-hoc Cloud Budget Catchup',
    durationMinutes: 30,
    dateTime: '2026-06-09T14:30:00.000Z',
    participants: [
      { id: 'usr-1', name: 'Alex Chen', initials: 'AC', department: 'Finance & G&A', role: 'CHRO' },
      { id: 'usr-3', name: 'Marcus Thorne', initials: 'MT', department: 'Engineering', role: 'VP Eng' }
    ],
    departments: ['Finance & G&A', 'Engineering'],
    suggestedProjectId: 'proj-2',
    suggestedProjectName: 'Cloud Migration',
    costEstimate: 875,
    confidence: 89,
    status: 'approved'
  },
  {
    id: 'meet-7',
    name: 'PMO Sync and Project Alignment',
    durationMinutes: 60,
    dateTime: '2026-06-08T15:00:00.000Z',
    participants: [
      { id: 'usr-4', name: 'David Miller', initials: 'DM', department: 'Product Management', role: 'PM Lead' },
      { id: 'usr-2', name: 'Sarah Jenkins', initials: 'SJ', department: 'Finance & G&A', role: 'VP HR' }
    ],
    departments: ['Product Management', 'Finance & G&A'],
    suggestedProjectId: 'proj-1',
    suggestedProjectName: 'Platform R&D',
    costEstimate: 680,
    confidence: 91,
    status: 'discarded',
    rejectionReason: 'Routine G&A Alignment, not R&D related'
  }
];

export const INITIAL_ANOMALIES: Anomaly[] = [
  {
    id: 'anom-1',
    title: 'Spike in Contractor Spend',
    description: 'Engineering billing records detect an unprecedented spike in recurring, multi-participant contractor standups.',
    department: 'Engineering',
    severity: 'critical',
    costDelta: 22400,
    potentialMonthlySavings: 12500,
    status: 'triggered',
    triggerDate: '2026-06-11T08:00:00.000Z',
    associatedProjectName: 'Cloud Migration',
    recommendationAction: 'Audit external partner attendance logs and consolidate duplicate 45-minute alignment standups into a weekly async Slack digest.'
  },
  {
    id: 'anom-2',
    title: 'Travel Budget Variance',
    description: 'Weekly team meetings in Sales West reveal travel-associated personnel expenditures exceeding forecast guidelines.',
    department: 'Sales & Growth',
    severity: 'medium',
    costDelta: 18900,
    potentialMonthlySavings: 8000,
    status: 'reviewed',
    triggerDate: '2026-06-10T10:00:00.000Z',
    associatedProjectName: 'Legacy Maintenance',
    recommendationAction: 'Optimize regional client mapping to reduce repeated physical travels for routine feedback loops, replacing with virtual high-bandwidth syncs.'
  },
  {
    id: 'anom-3',
    title: 'Meeting Fatigue Overhead',
    description: 'Vitals tracking indicates Engineering Team Omega spent an average of 22 hours per week in large sync alignment meetings.',
    department: 'Engineering',
    severity: 'high',
    costDelta: 31200,
    potentialMonthlySavings: 15400,
    status: 'triggered',
    triggerDate: '2026-06-08T14:00:00.000Z',
    associatedProjectName: 'Platform R&D',
    recommendationAction: 'Enforce a "No-Meeting Wednesday" rule and prune the participant list of the daily catchup by 40% (removing silent observers).'
  },
  {
    id: 'anom-4',
    title: 'Uncoded Calendar Alignment Overrun',
    description: 'PMO department logs several weekly recurrent meetings with more than 15 participants without code mapping.',
    department: 'Product Management',
    severity: 'low',
    costDelta: 5200,
    potentialMonthlySavings: 4200,
    status: 'resolved',
    triggerDate: '2026-06-07T09:30:00.000Z',
    associatedProjectName: 'Platform R&D',
    recommendationAction: 'Consolidate multiple project status review meetings into a single bimonthly board with structured Notion templates.'
  }
];

export const PRE_BAKED_QUESTIONS = [
  'How can we reduce meeting fatigue in the Engineering department?',
  'Analyze our current Project Titan cost variance and suggest solutions.',
  'What potential savings can we unlock by pruning unassigned meetings?',
  'Detail our workforce hourly rate distribution by department.'
];
