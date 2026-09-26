import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { motion } from 'framer-motion'
import { 
  Send, 
  MessageSquare, 
  Store, 
  ArrowLeft, 
  Sparkles, 
  CheckCheck
} from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'

let socket

export default function Chat() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [conversations, setConversations] = useState([])
  const [recipient, setRecipient] = useState(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingConvos, setLoadingConvos] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? 'https://universe-oinp.onrender.com' : 'http://localhost:5000')
    socket = io(socketUrl)
    const token = localStorage.getItem('universe_access_token')
    if (token) {
      socket.emit('authenticate', token)
    }

    socket.on('newMessage', (msg) => {
      if (
        (msg.senderId === userId && msg.receiverId === user.id) ||
        (msg.senderId === user.id && msg.receiverId === userId)
      ) {
        setMessages((prev) => [...prev, msg])
      }
      fetchConversations()
    })

    fetchConversations()

    return () => {
      socket?.disconnect()
    }
  }, [user, userId])

  useEffect(() => {
    if (userId) {
      fetchConversationThread(userId)
    } else {
      setRecipient(null)
      setMessages([])
    }
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations')
      setConversations(data || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoadingConvos(false)
    }
  }

  const fetchConversationThread = async (targetUserId) => {
    setLoadingMessages(true)
    try {
      const { data } = await api.get(`/messages/conversation/${targetUserId}`)
      setMessages(data || [])

      const existing = conversations.find((c) => c.otherUser?.id === targetUserId)
      if (existing) {
        setRecipient(existing.otherUser)
      } else if (data.length > 0) {
        const first = data[0]
        const other = first.senderId === user.id ? first.receiver : first.sender
        setRecipient(other)
      } else {
        try {
          const { data: userProfile } = await api.get(`/messages/user/${targetUserId}`)
          if (userProfile) setRecipient(userProfile)
        } catch {
          setRecipient(null)
        }
      }
    } catch (err) {
      console.error('Error fetching message thread:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!text.trim() || !userId) return

    const payload = {
      receiverId: userId,
      text: text.trim(),
    }

    socket.emit('sendMessage', payload)
    setText('')
  }

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] dark:bg-[#070913] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-250">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6 flex flex-col h-[calc(100vh-1rem)]">
        <div className="flex-1 flex gap-4 min-h-0 rounded-3xl bg-white dark:bg-slate-900/50 p-3 border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
          {/* ═══ CONVERSATIONS SIDEBAR ═══ */}
          <aside
            className={`w-full md:w-80 lg:w-96 flex flex-col rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/5 overflow-hidden ${
              userId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Conversations</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct chats with buyers &amp; creators</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {conversations.length}
              </span>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.03] p-2 space-y-1">
              {loadingConvos ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Loading chats...
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-16 text-center text-slate-400 px-4">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No active conversations</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Visit any storefront to start a conversation with the seller.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = conv.otherUser
                  if (!other) return null
                  const isSelected = other.id === userId
                  return (
                    <button
                      key={other.id}
                      onClick={() => navigate(`/chat/${other.id}`)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border border-orange-200/80 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-indigo-500/20 dark:border-cyan-500/30'
                          : 'hover:bg-slate-100/80 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center font-bold text-xs text-white dark:text-slate-950 shadow-2xs">
                          {other.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {other.storefront?.displayName || other.name}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-orange-500 dark:bg-cyan-400 text-white dark:text-slate-950">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        {other.storefront?.handle && (
                          <p className="text-[10px] text-orange-600 dark:text-cyan-400 font-semibold">@{other.storefront.handle}</p>
                        )}

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {conv.lastMessage?.text || 'Started a chat'}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </aside>

          {/* ═══ ACTIVE CHAT WINDOW ═══ */}
          <section
            className={`flex-1 flex flex-col rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/5 overflow-hidden ${
              !userId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {!userId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-orange-500 dark:text-cyan-400 mb-3 shadow-xs">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold text-base mb-1">Select a Conversation</h3>
                <p className="text-xs max-w-sm text-slate-500 dark:text-slate-400">
                  Pick a conversation from the sidebar, or contact any seller directly from their store page.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Top Header */}
                <div className="p-3.5 px-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/chat')}
                      className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center font-bold text-xs text-white dark:text-slate-950 shadow-2xs">
                      {recipient?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{recipient?.storefront?.displayName || recipient?.name || 'User'}</span>
                      </h3>
                      {recipient?.storefront?.handle ? (
                        <Link
                          to={`/store/${recipient.storefront.handle}`}
                          className="text-[11px] text-orange-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Store className="w-3 h-3" />
                          <span>@{recipient.storefront.handle}</span>
                        </Link>
                      ) : (
                        <p className="text-[11px] text-slate-400">UniVerse Member</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Thread Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/40 dark:bg-transparent">
                  {loadingMessages ? (
                    <div className="py-20 text-center text-xs text-slate-400">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                      <Sparkles className="w-8 h-8 text-orange-500 dark:text-cyan-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-white">Start the conversation</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Send a greeting, ask about products, or request custom requirements.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user.id
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-sky-400 text-white dark:text-slate-950 font-medium rounded-br-xs shadow-xs'
                                : 'bg-white dark:bg-white/10 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-white/5 shadow-2xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? 'text-white/80 dark:text-slate-900/60 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString('en-PK', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-2 bg-white dark:bg-white/[0.01]"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-orange-500 dark:focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-400 dark:to-indigo-500 text-white dark:text-slate-950 font-bold transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </PageTransition>
  )
}