'use client'

import { useAuth } from '@/hooks/useAuth'
import { useLiveSession } from '@/hooks/useLiveSession'
import { useMessages } from '@/hooks/useMessages'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useState, useRef, useEffect, use } from 'react'
import Link from 'next/link'

export default function LiveSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const { profile } = useAuth()
  const { session, loading } = useLiveSession(sessionId)
  const messages = useMessages(sessionId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(type: 'chat' | 'raise-hand' = 'chat') {
    if (!profile || (!text.trim() && type === 'chat')) return
    setSending(true)
    await addDoc(collection(db, 'liveSessions', sessionId, 'messages'), {
      senderUid: profile.uid,
      senderName: profile.displayName,
      text: type === 'raise-hand' ? '✋ Raised hand' : text.trim(),
      type,
      sentAt: serverTimestamp(),
    })
    if (type === 'chat') setText('')
    if (type === 'raise-hand') setHandRaised(true)
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-lg font-semibold">Session not found</p>
        <Link href="/dashboard">
          <Button variant="secondary">← Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  if (session.status === 'ended') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white text-xl font-bold">Session Ended</p>
        <p className="text-zinc-500 text-sm">This live session has concluded.</p>
        {session.recordingUrl && (
          <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">Watch Recording</Button>
          </a>
        )}
        <Link href="/dashboard">
          <Button variant="ghost">← Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white text-lg font-black tracking-tight">
            Edu<span className="text-indigo-400">Track</span>
          </span>
          <span className="text-zinc-700">·</span>
          <h1 className="text-sm font-bold text-white truncate max-w-xs">{session.title}</h1>
          {session.status === 'live' && <Badge variant="live">LIVE</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{profile?.displayName}</span>
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">Leave</Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {session.dailyRoomUrl ? (
            <iframe
              src={session.dailyRoomUrl}
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="flex-1 w-full border-0"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-zinc-400 font-semibold">Video room not configured</p>
              <p className="text-zinc-600 text-sm text-center max-w-sm">
                A Daily.co room URL hasn't been set for this session. Use the chat to communicate.
              </p>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Live Chat</h2>
            <span className="text-xs text-zinc-500">{messages.length} messages</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-zinc-600 text-xs text-center mt-4">No messages yet. Say hello!</p>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.senderUid === profile?.uid ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-zinc-500">{msg.senderName}</span>
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[90%] ${
                    msg.type === 'raise-hand'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                      : msg.senderUid === profile?.uid
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-zinc-800 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <Button size="sm" loading={sending} onClick={() => sendMessage()} disabled={!text.trim()}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
            <button
              onClick={() => !handRaised && sendMessage('raise-hand')}
              disabled={handRaised}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                handRaised
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-default'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              ✋ {handRaised ? 'Hand Raised' : 'Raise Hand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
