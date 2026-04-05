export type Mode =
  | 'pr_description'
  | 'pr_file_breakdown'
  | 'pr_review_brief'
  | 'pr_gaps_risks'
  | 'pr_nontechnical'
  | 'pr_merge_checklist'
  | 'pr_strength'
  | 'email'
  | 'doc'
  | 'jira'

export interface ModeConfig {
  label: string
  description: string
  inputType: 'pr_url' | 'text'
  placeholder: string
  example: string
  outputLabel: string
  group: 'pr' | 'general'
  icon: string
}

export const MODES: Record<Mode, ModeConfig> = {
  pr_description: {
    label: 'PR description',
    description: 'Write a complete, precise PR description from the actual diffs',
    inputType: 'pr_url',
    placeholder: 'Paste a public GitHub PR URL\nhttps://github.com/owner/repo/pull/123',
    example: '',
    outputLabel: 'PR description — ready to paste into GitHub',
    group: 'pr',
    icon: '📝',
  },
  pr_file_breakdown: {
    label: 'File-by-file breakdown',
    description: 'Every changed file explained — what changed, why, and any concerns',
    inputType: 'pr_url',
    placeholder: 'Paste a public GitHub PR URL\nhttps://github.com/owner/repo/pull/123',
    example: '',
    outputLabel: 'File-by-file breakdown',
    group: 'pr',
    icon: '📂',
  },
  pr_review_brief: {
    label: 'Review brief',
    description: 'Tell the reviewer exactly where to focus and what to verify',
    inputType: 'pr_url',
    placeholder: 'Paste a public GitHub PR URL\nhttps://github.com/owner/repo/pull/123',
    example: '',
    outputLabel: 'Review brief — share with your reviewer',
    group: 'pr',
    icon: '🔍',
  },
  pr_gaps_risks: {
    label: 'Gaps & risks',
    description: "What's missing, what could break, is it safe to merge?",
    inputType: 'pr_url',
    placeholder: 'Paste a public GitHub PR URL\nhttps://github.com/owner/repo/pull/123',
    example: '',
    outputLabel: 'Gaps & risk analysis',
    group: 'pr',
    icon: '⚠️',
  },
  pr_nontechnical: {
    label: 'Non-technical summary',
    description: 'Plain English for managers and stakeholders — zero jargon',
    inputType: 'pr_url',
    placeholder: 'Paste a public GitHub PR URL\nhttps://github.com/owner/repo/pull/123',
    example: '',
    outputLabel: 'Non-technical summary — share with your team',
    group: 'pr',
    icon: '💬',
  },
  pr_merge_checklist: {
    label: 'Merge checklist',
    description: 'Pre-merge quality gate — tests, docs, safety, breaking changes',
    inputType: 'pr_url',
    placeholder: 'Paste a public GitHub PR URL\nhttps://github.com/owner/repo/pull/123',
    example: '',
    outputLabel: 'Merge checklist',
    group: 'pr',
    icon: '✅',
  },
  pr_strength: {
    label: 'Strength check',
    description: 'Does this PR actually solve the problem? Honest quality score',
    inputType: 'pr_url',
    placeholder: 'Paste a public GitHub PR URL\nhttps://github.com/owner/repo/pull/123',
    example: '',
    outputLabel: 'Strength & quality assessment',
    group: 'pr',
    icon: '💪',
  },
  email: {
    label: 'Complete email',
    description: 'Finish your half-written email in your own tone',
    inputType: 'text',
    placeholder: 'Paste your incomplete email here...\n\nExample:\nHi John, regarding the project deadline...\n\n[need to ask for 3-day extension politely]',
    example: 'Hi sir, regarding the project deadline we discussed last week...\n\n[I need to politely ask for a 3-day extension because our API integration is taking longer than expected. Keep it professional but friendly.]',
    outputLabel: 'Email — ready to send',
    group: 'general',
    icon: '✉️',
  },
  doc: {
    label: 'Complete doc',
    description: 'Continue your incomplete documentation in the same style',
    inputType: 'text',
    placeholder: 'Paste your incomplete documentation...\n\n## Authentication\nThis API uses JWT tokens.\n\n[need to explain how to get a token and use it]',
    example: '## Authentication\n\nThis API uses JWT (JSON Web Token) for authentication.\n\n### Getting a Token\n\n[need to document: POST /auth/login endpoint, request body, response format, token expiry]\n\n### Using the Token\n\n[need to document: how to include in headers, example request]',
    outputLabel: 'Documentation — ready to publish',
    group: 'general',
    icon: '📄',
  },
  jira: {
    label: 'Complete Jira ticket',
    description: 'Turn your rough ticket into a complete, structured Jira ticket',
    inputType: 'text',
    placeholder: 'Paste your incomplete Jira ticket...\n\nTitle: Add rate limiting\nContext: brute force on login...\n\n[need full ticket]',
    example: 'Title: Add rate limiting to the login endpoint\n\nContext: We have been getting brute force attempts on /auth/login. Need to add rate limiting.\n\nTech: Express.js backend, Redis available.\n\n[Need full ticket with acceptance criteria and story points]',
    outputLabel: 'Jira ticket — ready to create',
    group: 'general',
    icon: '🎫',
  },
}

export const PR_MODES = (Object.keys(MODES) as Mode[]).filter(m => MODES[m].group === 'pr')
export const GENERAL_MODES = (Object.keys(MODES) as Mode[]).filter(m => MODES[m].group === 'general')
