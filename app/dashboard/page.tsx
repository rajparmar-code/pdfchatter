'use client'

import { useEffect, useRef, useState } from 'react'
import { supabaseBrowser } from '../../lib/supabase-browser'

type Doc = {
  filename: string
  text: string
  pages: number | null
}

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [ready, setReady] = useState(false)

  const [doc, setDoc] = useState<Doc | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [askError, setAskError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sb = supabaseBrowser()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/'
        return
      }
      setEmail(data.user.email || '')
      setReady(true)
    })
  }, [])

  async function signout() {
    const sb = supabaseBrowser()
    await sb.auth.signOut()
    window.location.href = '/'
  }

  function chooseFile() {
    fileInputRef.current?.click()
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (file) uploadPdf(file)
  }

  async function uploadPdf(selectedFile: File) {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please choose a PDF file.')
      return
    }

    setUploading(true)
    setUploadError('')
    setAnswer('')
    setAskError('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      })

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('The PDF server returned an invalid response. Check the terminal.')
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process this PDF.')
      }

      setDoc({ filename: result.filename, text: result.text, pages: result.pages })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload this PDF.')
    } finally {
      setUploading(false)
    }
  }

  async function askQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!doc || !question.trim()) return

    setAsking(true)
    setAskError('')
    setAnswer('')

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, documentText: doc.text }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to get an answer.')

      setAnswer(result.answer)
    } catch (err) {
      setAskError(err instanceof Error ? err.message : 'Failed to get an answer.')
    } finally {
      setAsking(false)
    }
  }

  if (!ready) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <span className="brand-mark big">✦</span>
          <h1>Loading your workspace…</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">✦</span>
          <span>
            pdf<span className="brand-accent">chatter</span>
          </span>
        </a>
        <button className="ghost-btn" onClick={signout}>
          Sign out
        </button>
      </header>

      <section className="workspace">
        <div className="workspace-head">
          <div>
            <div className="section-kicker">YOUR WORKSPACE</div>
            <h2>Good to see you again.</h2>
            <p className="hero-copy">Signed in as {email}</p>
          </div>
          <div className="status">
            <span className="status-dot"></span> Secure session
          </div>
        </div>

        <div className="workspace-grid">
          <aside className="library panel">
            <div className="panel-title">
              <span>Library</span>
              <button className="icon-btn" onClick={chooseFile} disabled={uploading}>
                ＋
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={onFileSelected}
              style={{ display: 'none' }}
            />

            {!doc ? (
              <div className="empty-library">
                <div className="file-orb">⌁</div>
                <strong>{uploading ? 'Reading your PDF…' : 'No documents yet'}</strong>
                <span>
                  {uploading ? (
                    'This can take a few seconds for larger files.'
                  ) : (
                    <>
                      Upload one PDF to begin
                      <br />
                      your first conversation.
                    </>
                  )}
                </span>
                {!uploading && (
                  <button className="outline-btn" onClick={chooseFile}>
                    Choose a PDF
                  </button>
                )}
                {uploadError && <div className="notice">{uploadError}</div>}
              </div>
            ) : (
              <div className="empty-library">
                <div className="file-orb">✓</div>
                <strong>{doc.filename}</strong>
                <span>{doc.pages ? `${doc.pages} page${doc.pages === 1 ? '' : 's'} indexed` : 'Ready for questions'}</span>
                <button className="outline-btn" onClick={chooseFile} disabled={uploading}>
                  {uploading ? 'Reading…' : 'Replace PDF'}
                </button>
                {uploadError && <div className="notice">{uploadError}</div>}
              </div>
            )}
          </aside>

          <section className="chat panel">
            {!doc ? (
              <div className="chat-empty">
                <div className="sparkle">✦</div>
                <h3>Your document workspace is ready.</h3>
                <p>Upload a PDF and ask thoughtful questions about it.</p>
              </div>
            ) : (
              <>
                <div className="chat-head">
                  <div className="doc-chip">
                    <span className="pdf-icon">PDF</span>
                    <div>
                      {doc.filename}
                      <small>{doc.pages ?? '?'} pages</small>
                    </div>
                  </div>
                </div>

                <div className="chat-empty" style={{ flex: 1 }}>
                  {asking && <p>Thinking…</p>}
                  {!asking && answer && <p style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>{answer}</p>}
                  {!asking && !answer && !askError && <p>Ask anything about this document.</p>}
                  {askError && <div className="notice">{askError}</div>}
                </div>

                <form className="composer" onSubmit={askQuestion}>
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about this PDF…"
                    disabled={asking}
                  />
                  <button type="submit" disabled={asking || !question.trim()}>
                    ↗
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
