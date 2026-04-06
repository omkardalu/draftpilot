'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    id: 1,
    title: 'Pick your mode',
    description: 'Select from PR Analyzer (needs a GitHub URL) or General Tools (needs pasted text).',
    visual: (
      <div className="flex flex-col sm:flex-row gap-4 p-5 mt-6 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-white shadow-inner">
        <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] transition-all duration-300 cursor-default">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">PR Analyzer</p>
          <div className="h-2 w-3/4 bg-blue-100/50 rounded-full mb-2.5"></div>
          <div className="h-2 w-1/2 bg-blue-50 rounded-full"></div>
        </div>
        <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-default">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">General Tools</p>
          <div className="h-2 w-3/4 bg-slate-100 rounded-full mb-2.5"></div>
          <div className="h-2 w-1/2 bg-slate-50 rounded-full"></div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Paste your input',
    description: 'Provide a public GitHub PR URL for PR modes, or directly paste text with [bracketed instructions] for general tools.',
    visual: (
      <div className="flex flex-col gap-3 mt-6">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-[13px] font-mono flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-sans shadow-sm text-xs">✓</div>
          https://github.com/owner/repo/pull/123
        </div>
        <div className="text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase my-1">Or</div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-[13px] font-mono text-slate-600">
          Dear Team, <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">[need to ask for extension politely]</span>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'Hit Generate',
    description: 'Click Generate or press ⌘+Enter. DraftPilot fetches real PR diffs or processes your text directly in seconds.',
    visual: (
      <div className="flex justify-center mt-10">
        <button className="relative group bg-gradient-to-tr from-[#1E2761] to-blue-800 text-white px-8 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(30,39,97,0.3)] font-medium flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgb(30,39,97,0.4)] transition-all duration-300">
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="relative z-10">Generate — Complete Email</span>
          <span className="relative z-10 text-[11px] opacity-60 ml-2 tracking-wider">⌘ ENTR</span>
        </button>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Read your output',
    description: 'Output streams in real-time. It is formatted, highly specific, and references actual code from your PRs.',
    visual: (
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] transform hover:scale-[1.01] transition-transform duration-500">
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-3 px-5 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300/60"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300/60"></div>
          <p className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Output streaming</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="h-2.5 w-5/6 bg-gradient-to-r from-blue-50 to-transparent rounded-full"></div>
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-50 to-transparent rounded-full"></div>
          <div className="h-2.5 w-4/6 bg-gradient-to-r from-blue-50 to-transparent rounded-full"></div>
          <div className="flex items-center gap-1.5 pt-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Copy and use',
    description: 'Copy with one click. Your draft is ready to be pasted right into GitHub, Slack, Jira, or a Google Doc.',
    visual: (
      <div className="mt-8 flex justify-center">
        <button className="group bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border border-emerald-200 px-8 py-3 rounded-xl font-medium shadow-[0_4px_15px_rgb(16,185,129,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(16,185,129,0.15)] transition-all duration-300 flex items-center gap-2">
          <span className="bg-emerald-200 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs group-hover:bg-emerald-500 transition-colors">✓</span>
          Copied to clipboard!
        </button>
      </div>
    ),
  },
]

const PR_MODES = [
  { name: 'PR description', desc: 'Writes Summary, Changes by file, How to test, Notes.', audience: 'For authors' },
  { name: 'File-by-file breakdown', desc: 'Every changed file: what it does, what changed, concerns found.', audience: 'For reviewers' },
  { name: 'Review brief', desc: 'Where to focus, what to verify, red flags already visible in the diff.', audience: 'For reviewers' },
  { name: 'Gaps & risks', desc: 'Verdict: SAFE / CAUTION / DO NOT MERGE + missing pieces and risky patterns.', audience: 'For team leads' },
  { name: 'Non-technical summary', desc: 'Plain English, zero jargon, 30-second read.', audience: 'For managers' },
  { name: 'Merge checklist', desc: '✅ PASS / ❌ FAIL / ⚠️ UNCLEAR on code quality, testing, docs.', audience: 'For release engineers' },
  { name: 'Strength check', desc: 'Quality score /10, pros, cons, and solution evaluation.', audience: 'For senior devs' },
]

const GENERAL_MODES = [
  { name: 'Complete email', desc: 'Finishes your half-written email in your exact tone. Paste context in [brackets].', audience: 'For everyone' },
  { name: 'Complete doc', desc: 'Continues your incomplete documentation and fills [placeholder] sections.', audience: 'For everyone' },
  { name: 'Complete Jira ticket', desc: 'Turns rough ticket info into a full ticket with AC, story points, priority.', audience: 'For PMs & Devs' },
]

const FAQS = [
  { q: 'Does it work with private GitHub repos?', a: 'No. Only public repos. For private repos, copy-paste the PR description and file list manually into the text area — it still generates great output.' },
  { q: 'What if the output is too generic?', a: 'Give more context. For emails, add what you need in [brackets]. For PRs, make sure the repo is public so it fetches real diffs.' },
  { q: 'How many files does it analyze in a PR?', a: 'Top 20 files with full line-by-line diffs. For very large PRs, it notes when diffs are truncated.' },
  { q: 'Is my code sent anywhere other than OpenAI?', a: 'Only to OpenAI / Google via setup APIs. Nothing is stored on DraftPilot servers.' },
  { q: 'Can I use it for any programming language?', a: 'Yes. The AI reads diffs regardless of language — JavaScript, Python, Go, Java, Rust, anything.' },
]

function Accordion({ title, children, openOpen }: { title: string, children: React.ReactNode, openOpen?: boolean }) {
  const [open, setOpen] = useState(openOpen ?? false)
  return (
    <div className={`border border-white bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden mb-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'shadow-[0_12px_40px_rgb(0,0,0,0.06)] -translate-y-0.5 my-6' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between group"
      >
        <span className={`font-semibold tracking-wide transition-colors duration-300 ${open ? 'text-blue-600' : 'text-[#1E2761] group-hover:text-blue-500'}`}>
          {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${open ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
          <svg
            className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className="transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[max-height,opacity]"
        style={{ maxHeight: open ? '2000px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="p-6 pt-0 border-t border-slate-100/50 text-slate-600 text-[14px] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function HowTo() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-sans text-slate-800 pb-24 relative selection:bg-blue-200">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none"></div>

      <button
        onClick={() => router.push('/')}
        className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50 backdrop-blur-xl bg-white/70 border border-white/50 text-[#1E2761] px-5 py-2.5 rounded-full font-medium shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
      >
        <span className="opacity-60 group-hover:opacity-100 transition-opacity transition-transform hover:-translate-x-1">←</span> Back to app
      </button>

      <div className="max-w-4xl mx-auto pt-28 px-4 sm:px-8 relative z-10">
        <div className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1E2761] to-blue-600 mb-4 tracking-tight drop-shadow-sm">
            How to use DraftPilot
          </h1>
          <p className="text-slate-500 text-lg">Master DraftPilot in under 60 seconds.</p>
        </div>

        {/* Part 1: Stepper */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_40px_rgb(30,39,97,0.06)] p-6 sm:p-12 mb-20 relative overflow-hidden">
          <h2 className="text-xl font-bold text-[#1E2761] mb-8">Quick start guide</h2>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-10">
            {STEPS.map((s, idx) => (
              <div
                key={s.id}
                className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden"
              >
                <div 
                  className="h-full bg-gradient-to-r from-[#1E2761] to-blue-500 transition-all duration-700 ease-in-out"
                  style={{ width: idx <= step ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="relative min-h-[300px]">
            {STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  idx === step 
                    ? 'opacity-100 translate-y-0 z-10' 
                    : 'opacity-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E2761] to-blue-600 shadow-md text-white flex items-center justify-center text-sm font-bold shadow-blue-900/20">
                    {s.id}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{s.title}</h3>
                </div>
                <p className="text-slate-500 text-[15px] mb-8 ml-12 max-w-lg leading-relaxed">{s.description}</p>
                <div className="ml-12 border-l-2 border-slate-100 pl-6 lg:pl-10">
                  {s.visual}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
            >
              Previous
            </button>
            <div className="text-xs font-bold tracking-widest text-[#1E2761] uppercase bg-blue-50 px-3 py-1.5 rounded-full">
              {step + 1} / {STEPS.length}
            </div>
            <button
              onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#1E2761] to-blue-700 hover:to-blue-600 rounded-xl disabled:opacity-40 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Part 2: Mode Guide */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E2761] to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mode Guide</h2>
          </div>
          
          <Accordion title="Group A — PR Analyzer (requires GitHub URL)" openOpen={true}>
            <div className="flex flex-col gap-2 mt-2">
              {PR_MODES.map((m, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-white/50 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300">
                  <div className="min-w-[190px] font-bold text-slate-700">{m.name}</div>
                  <div className="flex-1 text-slate-500 text-[13px]">{m.desc}</div>
                  <div className="shrink-0 mt-2 sm:mt-0">
                    <span className="inline-block px-3 py-1.5 bg-blue-50/80 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-blue-100/50">
                      {m.audience}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Group B — General Tools (requires pasted text)">
            <div className="flex flex-col gap-2 mt-2">
              {GENERAL_MODES.map((m, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-white/50 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300">
                  <div className="min-w-[190px] font-bold text-slate-700">{m.name}</div>
                  <div className="flex-1 text-slate-500 text-[13px]">{m.desc}</div>
                  <div className="shrink-0 mt-2 sm:mt-0">
                    <span className="inline-block px-3 py-1.5 bg-emerald-50/80 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-100/50">
                      {m.audience}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Accordion>
        </div>

        {/* Part 3: FAQ */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E2761] to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">?</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Frequently Asked Questions</h2>
          </div>
          {FAQS.map((faq, i) => (
            <Accordion key={i} title={faq.q}>
              <div className="mt-1 text-[15px] text-slate-500 leading-relaxed">{faq.a}</div>
            </Accordion>
          ))}
        </div>

      </div>
    </div>
  )
}
