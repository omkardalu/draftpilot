import { NextRequest } from 'next/server'

function parseGoogleDocUrl(url: string): string | null {
  // Matches: https://docs.google.com/document/d/DOC_ID/...
  const match = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function stripHtml(html: string): string {
  // Remove style/script blocks
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  // Replace block elements with newlines
  text = text
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, '')
  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  // Collapse excess whitespace
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const docId = parseGoogleDocUrl(url)
    if (!docId) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Google Docs URL. Format: https://docs.google.com/document/d/DOC_ID/...',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Google Docs export as plain text (works for publicly shared docs)
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`

    const res = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'DraftPilot/1.0',
      },
      redirect: 'follow',
    })

    if (res.status === 403 || res.status === 401) {
      return new Response(
        JSON.stringify({
          error:
            'This Google Doc is private. Please set sharing to "Anyone with the link can view" and try again.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Could not fetch doc (status ${res.status}). Make sure it is publicly shared.` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const contentType = res.headers.get('content-type') ?? ''
    let text = ''

    if (contentType.includes('text/html')) {
      const html = await res.text()
      text = stripHtml(html)
    } else {
      text = await res.text()
    }

    if (!text || text.length < 20) {
      return new Response(
        JSON.stringify({
          error: 'Doc appears to be empty or could not be read. Make sure it has content and is publicly shared.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Limit to ~3000 chars to avoid token overflow
    const trimmed = text.length > 3000 ? text.slice(0, 3000) + '\n\n[... document continues ...]' : text

    const context = `Google Doc Content:\n\n${trimmed}`

    return new Response(JSON.stringify({ context }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Google Docs fetch error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch Google Doc. Check the URL and sharing settings.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
