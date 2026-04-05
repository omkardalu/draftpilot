'use client'

import { useState, useRef, useEffect } from 'react'
import { MODES, Mode, PR_MODES, GENERAL_MODES } from './modes'

type HistoryItem = { mode: Mode; input: string; output: string }

function isGitHubPRUrl(input: string) {
  return /github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(input.trim())
}

export default function DraftPilot() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const outputRef = useRef<HTMLDivElement>(null)

  const mode = selectedMode ? MODES[selectedMode] : null
  const isPrMode = selectedMode?.startsWith('pr_') ?? false
  const inputReady = input.trim().length > 0

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  const handleGenerate = async () => {
    if (!selectedMode || !input.trim()) return
    setLoading(true)
    setOutput('')
    setError('')

    let finalInput = input.trim()

    // Fetch PR data if it's a PR mode and a GitHub URL
    if (isPrMode && isGitHubPRUrl(input)) {
      setFetchingUrl(true)
      try {
        const res = await fetch('/api/fetch-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input.trim() }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to fetch PR')
        finalInput = data.context
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch PR data')
        setLoading(false)
        setFetchingUrl(false)
        return
      }
      setFetchingUrl(false)
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: finalInput, mode: selectedMode }),
      })
      if (!res.ok) throw new Error('Failed to generate')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No stream')

      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setOutput(full)
      }

      setHistory(prev => [{ mode: selectedMode, input: input.trim(), output: full }, ...prev.slice(0, 4)])
    } catch (err) {
      setError('Something went wrong. Check your API key.')
      console.error(err)
    } finally {
      setLoading(false)
      setFetchingUrl(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate()
  }

  const selectMode = (m: Mode) => {
    setSelectedMode(m)
    setInput('')
    setOutput('')
    setError('')
  }

  const getStatusLabel = () => {
    if (fetchingUrl) return 'Fetching PR + diffs from GitHub...'
    if (loading) return 'Generating...'
    return ''
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fb' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '0.5px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#1E2761' }}>Draft</span>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#3b82f6' }}>Pilot</span>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Pick a mode → paste your input → get precise output</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
            GPT-4o
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

        {/* LEFT SIDEBAR — Mode Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* PR Analyzer section */}
          <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: '#1E2761', borderRadius: '16px 16px 0 0' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#CADCFC', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>PR Analyzer</p>
              <p style={{ fontSize: 11, color: '#93a8d4', margin: '2px 0 0' }}>Paste a public GitHub PR URL</p>
            </div>
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PR_MODES.map(m => {
                const cfg = MODES[m]
                const active = selectedMode === m
                return (
                  <button
                    key={m}
                    onClick={() => selectMode(m)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px',
                      borderRadius: 10, border: active ? '1px solid #1E2761' : '1px solid transparent',
                      background: active ? '#eef1f9' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                    }}
                  >
                    <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>{cfg.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: active ? '#1E2761' : '#374151', margin: 0 }}>{cfg.label}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '1px 0 0', lineHeight: 1.4 }}>{cfg.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* General tools section */}
          <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: '#f3f4f6', borderRadius: '16px 16px 0 0', borderBottom: '0.5px solid #e5e7eb' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>General tools</p>
            </div>
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {GENERAL_MODES.map(m => {
                const cfg = MODES[m]
                const active = selectedMode === m
                return (
                  <button
                    key={m}
                    onClick={() => selectMode(m)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px',
                      borderRadius: 10, border: active ? '1px solid #1E2761' : '1px solid transparent',
                      background: active ? '#eef1f9' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                    }}
                  >
                    <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>{cfg.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: active ? '#1E2761' : '#374151', margin: 0 }}>{cfg.label}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '1px 0 0', lineHeight: 1.4 }}>{cfg.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Recent</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedMode(h.mode); setInput(h.input); setOutput(h.output) }}
                    style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 8, border: '0.5px solid #e5e7eb', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
                  >
                    <span style={{ color: '#1E2761', fontWeight: 500 }}>{MODES[h.mode].label}</span>
                    <span style={{ color: '#9ca3af', marginLeft: 6 }}>{h.input.slice(0, 30)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Input + Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Empty state */}
          {!selectedMode && (
            <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>👈</div>
              <p style={{ fontSize: 16, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Pick a mode to get started</p>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Select what you want to generate from the sidebar</p>
            </div>
          )}

          {/* Input panel */}
          {selectedMode && mode && (
            <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '0.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{mode.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1E2761' }}>{mode.label}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>— {mode.description}</span>
                </div>
                {!isPrMode && (
                  <button
                    onClick={() => setInput(mode.example)}
                    style={{ fontSize: 12, color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    Load example
                  </button>
                )}
              </div>

              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); setOutput(''); setError('') }}
                onKeyDown={handleKeyDown}
                placeholder={mode.placeholder}
                rows={isPrMode ? 4 : 10}
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 13, fontFamily: 'monospace',
                  color: '#374151', border: 'none', outline: 'none', resize: 'none',
                  lineHeight: 1.6, background: 'transparent',
                }}
              />

              {/* URL validation hint for PR modes */}
              {isPrMode && input.trim() && !isGitHubPRUrl(input) && (
                <div style={{ margin: '0 16px 12px', padding: '8px 12px', background: '#fef3c7', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
                  Paste a full GitHub PR URL — e.g. https://github.com/owner/repo/pull/123
                </div>
              )}
              {isPrMode && isGitHubPRUrl(input) && (
                <div style={{ margin: '0 16px 12px', padding: '8px 12px', background: '#ecfdf5', borderRadius: 8, fontSize: 12, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✓</span> Valid GitHub PR URL — will fetch PR data + full diffs
                </div>
              )}

              <div style={{ padding: '10px 16px', borderTop: '0.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#d1d5db' }}>
                  {isPrMode ? 'Public GitHub PRs only' : `${input.length} characters · ⌘ Enter to generate`}
                </span>
                {input && <button onClick={() => { setInput(''); setOutput(''); setError('') }} style={{ fontSize: 12, color: '#d1d5db', border: 'none', background: 'none', cursor: 'pointer' }}>Clear</button>}
              </div>
            </div>
          )}

          {/* Generate button */}
          {selectedMode && (
            <button
              onClick={handleGenerate}
              disabled={loading || !inputReady || (isPrMode && !isGitHubPRUrl(input))}
              style={{
                width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                fontSize: 14, fontWeight: 500, cursor: loading || !inputReady ? 'not-allowed' : 'pointer',
                background: loading || !inputReady || (isPrMode && !isGitHubPRUrl(input)) ? '#f3f4f6' : '#1E2761',
                color: loading || !inputReady || (isPrMode && !isGitHubPRUrl(input)) ? '#9ca3af' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              {loading ? (
                <>
                  <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {getStatusLabel()}
                </>
              ) : (
                <>
                  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate — {selectedMode ? MODES[selectedMode].label : ''}
                  <span style={{ fontSize: 11, opacity: 0.5 }}>⌘ Enter</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: 12, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Output panel */}
          {(output || (loading && selectedMode)) && (
            <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '0.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {mode?.outputLabel ?? 'Output'}
                </span>
                {output && (
                  <button
                    onClick={handleCopy}
                    style={{
                      fontSize: 12, padding: '4px 12px', borderRadius: 8,
                      border: `0.5px solid ${copied ? '#86efac' : '#93c5fd'}`,
                      background: copied ? '#f0fdf4' : '#eff6ff',
                      color: copied ? '#166534' : '#1d4ed8',
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                )}
              </div>

              <div ref={outputRef} style={{ padding: '16px', maxHeight: 520, overflowY: 'auto' }}>
                {loading && !output && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#1E2761', opacity: 0.5, animation: `bounce 1s infinite ${i * 0.15}s` }} />
                      ))}
                    </div>
                    {getStatusLabel()}
                  </div>
                )}
                {output && (
                  <pre style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}>
                    {output}
                    {loading && <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#1E2761', marginLeft: 2, verticalAlign: 'middle', animation: 'blink 0.8s infinite' }} />}
                  </pre>
                )}
              </div>

              {output && !loading && (
                <div style={{ padding: '10px 16px', borderTop: '0.5px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Done — saved ~20 min</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        button:hover { opacity: 0.85; }
        textarea::placeholder { color: #d1d5db; }
      `}</style>
    </div>
  )
}
