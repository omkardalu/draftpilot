import { NextRequest } from 'next/server'

function parseGitHubPRUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2], pull_number: match[3] }
}

function truncatePatch(patch: string, maxLines = 80): string {
  if (!patch) return ''
  const lines = patch.split('\n')
  if (lines.length <= maxLines) return patch
  return lines.slice(0, maxLines).join('\n') + `\n... [${lines.length - maxLines} more lines truncated]`
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return new Response(JSON.stringify({ error: 'Missing URL' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const parsed = parseGitHubPRUrl(url)
    if (!parsed) return new Response(JSON.stringify({ error: 'Invalid GitHub PR URL. Format: https://github.com/owner/repo/pull/123' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const { owner, repo, pull_number } = parsed
    const base = `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`

    const [prRes, filesRes] = await Promise.all([
      fetch(base, { headers }),
      fetch(`${base}/files?per_page=20`, { headers }),
    ])

    if (prRes.status === 404) return new Response(JSON.stringify({ error: 'PR not found. Make sure the repo is public.' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    if (!prRes.ok) return new Response(JSON.stringify({ error: `GitHub API error: ${prRes.status}` }), { status: prRes.status, headers: { 'Content-Type': 'application/json' } })

    const pr = await prRes.json()
    const filesData = filesRes.ok ? await filesRes.json() : []

    // Build rich file context with real diffs
    const fileDetails = Array.isArray(filesData)
      ? filesData.slice(0, 20).map((f: {
          filename: string
          status: string
          additions: number
          deletions: number
          changes: number
          patch?: string
        }) => {
          const patch = f.patch ? truncatePatch(f.patch, 80) : '[binary file or no diff available]'
          return `
FILE: ${f.filename}
Status: ${f.status} | +${f.additions} additions | -${f.deletions} deletions | ${f.changes} total changes
Diff:
${patch}
${'─'.repeat(60)}`
        }).join('\n')
      : '[Could not fetch file diffs]'

    const context = `
PR TITLE: ${pr.title || 'No title'}
BRANCH: ${pr.head?.ref || 'unknown'} → ${pr.base?.ref || 'main'}
AUTHOR: ${pr.user?.login || 'unknown'}
STATE: ${pr.state}
CREATED: ${pr.created_at ? new Date(pr.created_at).toDateString() : 'unknown'}
TOTAL FILES CHANGED: ${pr.changed_files ?? '?'}
TOTAL ADDITIONS: +${pr.additions ?? '?'}
TOTAL DELETIONS: -${pr.deletions ?? '?'}
COMMITS: ${pr.commits ?? '?'}

EXISTING PR DESCRIPTION:
${pr.body ? pr.body.trim() : '[No description written yet]'}

CHANGED FILES WITH DIFFS (top 20):
${fileDetails}
`.trim()

    return new Response(JSON.stringify({ context, pr_title: pr.title }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('GitHub fetch error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch PR data' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
