import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import API from '../services/api';
import { getAvatarUrl } from '../utils/helpers';

const Messages = () => {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (location.state?.chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === location.state.chatId);
      if (chat) {
        loadChat(chat);
      }
    }
  }, [location.state, chats]);

  useEffect(() => {
    if (!socket || !selectedChat) return;

    socket.emit('join_chat', selectedChat._id);

    const handleReceiveMessage = (message) => {
      if (message.chat === selectedChat._id) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    const handleUserTyping = ({ chatId, userName }) => {
      if (chatId === selectedChat._id) {
        setTyping(userName);
      }
    };

    const handleUserStoppedTyping = ({ chatId }) => {
      if (chatId === selectedChat._id) {
        setTyping(false);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.emit('leave_chat', selectedChat._id);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/chats');
      setChats(data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (chat) => {
    try {
      setSelectedChat(chat);
      
      const { data } = await API.get(`/chats/${chat._id}/messages`);
      setMessages(data.messages);

      await API.put(`/chats/${chat._id}/messages/read`);
      fetchChats();
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      const messageContent = newMessage.trim();
      setNewMessage('');

      const { data } = await API.post(`/chats/${selectedChat._id}/messages`, {
        content: messageContent
      });

      setMessages((prev) => [...prev, data.message]);

      if (socket) {
        socket.emit('send_message', {
          chatId: selectedChat._id,
          message: data.message
        });
        socket.emit('stop_typing', selectedChat._id);
      }

      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && selectedChat) {
      socket.emit('typing', selectedChat._id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', selectedChat._id);
      }, 2000);
    }
  };

  const getOtherUser = (chat) => {
    return chat.participants.find(p => p._id !== user.id);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
      {/* Background elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl" />

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 backdrop-blur-xl bg-white/40 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg" />
              <span className="text-xl font-semibold text-gray-900">SkillSwap</span>
            </Link>
            
            <div className="flex items-center space-x-1">
              <Link to="/dashboard" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link to="/explore" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Explore
              </Link>
              <Link to="/swaps" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                My Swaps
              </Link>
              <Link to="/messages" className="px-4 py-2 text-gray-900 font-medium rounded-lg hover:bg-white/60 transition">
                Messages
              </Link>
              <Link to={`/profile/${user?.id}`} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Profile
              </Link>
              <button onClick={logout} className="ml-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Chat Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl flex border border-gray-200/50 overflow-hidden"
          style={{ height: 'calc(100vh - 180px)' }}
        >
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200/50 flex flex-col bg-white/30">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              {connected ? (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                  Connected
                </p>
              ) : (
                <p className="text-xs text-red-600 mt-1">Disconnected</p>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No messages yet
                </div>
              ) : (
                chats.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  return (
                    <motion.div
                      key={chat._id}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                      onClick={() => loadChat(chat)}
                      className={`p-4 border-b border-gray-200/50 cursor-pointer transition ${
                        selectedChat?._id === chat._id ? 'bg-white/60 border-l-4 border-l-indigo-500' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <img
                          src={getAvatarUrl(otherUser?.avatar)}
                          alt={otherUser?.name}
                          className="w-12 h-12 rounded-full mr-3 ring-2 ring-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser?.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50/50 to-white/50">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200/50 bg-white/40 backdrop-blur-sm">
                  <div className="flex items-center">
                    <img
                      src={getAvatarUrl(getOtherUser(selectedChat)?.avatar)}
                      alt={getOtherUser(selectedChat)?.name}
                      className="w-10 h-10 rounded-full mr-3 ring-2 ring-gray-200"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherUser(selectedChat)?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getOtherUser(selectedChat)?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender._id === user.id;
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'} max-w-xs lg:max-w-md`}>
                          {!isOwn && (
                            <img
                              src={getAvatarUrl(msg.sender.avatar)}
                              alt={msg.sender.name}
                              className="w-8 h-8 rounded-full mr-2 ring-2 ring-gray-200"
                            />
                          )}
                          <div>
                            <div className={`px-4 py-3 rounded-2xl ${
                              isOwn
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200'
                            }`}>
                              <p className="break-words">{msg.content}</p>
                            </div>
                            <p className={`text-xs mt-1 ${
                              isOwn ? 'text-right text-gray-500' : 'text-left text-gray-500'
                            }`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200/50 bg-white/40 backdrop-blur-sm">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleTyping}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      disabled={sending}
                    />
                    <motion.button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;