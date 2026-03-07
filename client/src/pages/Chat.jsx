import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

let socket;

export default function Chat() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [conversations, setConversations] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    // Connect socket
    socket = io('http://localhost:5000')
    socket.emit('authenticate', user.token)

    // Listen for new messages
    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    // Load conversations
    fetchConversations()

    return () => socket.disconnect()
  }, [user])

  useEffect(() => {
    if (userId) fetchMessages()
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/messages', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setConversations(data)
    } catch (err) { console.log(err) }
  }

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/messages/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setMessages(data)

      // Get other user info from conversations or store
      const { data: store } = await axios.get(`/store/${userId}`)
      setOtherUser(store.seller)
    } catch (err) { console.log(err) }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!text.trim() || !userId) return
    socket.emit('sendMessage', { receiverId: userId, text })
    setText('')
  }

  const getOtherPerson = (convo) => {
    if (!convo.sender || !convo.receiver) return null
    return convo.sender._id === user._id ? convo.receiver : convo.sender
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-6 h-screen flex flex-col">
        <h1 className="text-2xl font-black mb-4">Messages</h1>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Sidebar - Conversations */}
          <div className="w-72 flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5">
              <p className="text-zinc-400 text-xs uppercase tracking-widest">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center text-zinc-600 text-sm py-10 px-4">
                  No conversations yet
                </div>
              ) : (
                conversations.map(convo => {
                  const other = getOtherPerson(convo)
                  if (!other) return null
                  return (
                    <Link
                      key={convo._id}
                      to={`/chat/${other._id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all border-b border-white/5 ${
                        userId === other._id ? 'bg-white/8' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm font-bold flex-shrink-0">
                        {other.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {other.storeName || other.name}
                        </p>
                        <p className="text-zinc-600 text-xs truncate">{convo.text}</p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex flex-col min-h-0">
            {!userId ? (
              <div className="flex-1 flex items-center justify-center text-zinc-600">
                <div className="text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p>Select a conversation or</p>
                  <p className="text-sm mt-1">visit a store to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                    {otherUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {otherUser?.storeName || otherUser?.name}
                    </p>
                    <p className="text-zinc-600 text-xs">{otherUser?.department}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-zinc-600 text-sm py-10">
                      No messages yet — say hello! 👋
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                    const isMe = (msg.sender?._id || msg.sender)?.toString() === user._id?.toString()
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-cyan-500 text-black rounded-br-sm'
                              : 'bg-white/10 text-white rounded-bl-sm'
                          }`}>
                            <p>{msg.text}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-black/50' : 'text-zinc-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('en-PK', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-white/5 flex gap-3">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}