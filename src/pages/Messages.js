import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, setDoc, Timestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import StitchNav, { StitchFooter, MobileBottomNav } from '../components/StitchNav';

export default function Messages() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser) loadConversations();
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'conversations'));
      const convos = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.participants?.includes(currentUser.email));
      setConversations(convos);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadMessages = async (convoId) => {
    try {
      const snap = await getDocs(collection(db, 'conversations', convoId, 'messages'));
      const msgs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(msgs);
    } catch (e) { console.error(e); }
  };

  const selectConvo = (convo) => {
    setSelectedConvo(convo);
    loadMessages(convo.id);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMsg.trim() || !selectedConvo || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'conversations', selectedConvo.id, 'messages'), {
        text: newMsg.trim(),
        sender: currentUser.email,
        createdAt: Timestamp.now(),
      });
      await setDoc(doc(db, 'conversations', selectedConvo.id), {
        ...selectedConvo,
        lastMessage: newMsg.trim(),
        lastMessageAt: Timestamp.now(),
      }, { merge: true });
      setNewMsg('');
      loadMessages(selectedConvo.id);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const getOther = (convo) => convo.participants?.find(p => p !== currentUser?.email) || 'Unknown';

  const filtered = conversations.filter(c => {
    const other = getOther(c);
    return other.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.adTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md overflow-hidden">
      {/* Atmospheric */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full"></div>
      </div>

      <StitchNav active="community" />

      <main className="flex-1 flex w-full max-w-[1280px] mx-auto md:px-margin-desktop md:py-gutter h-[calc(100vh-80px)] overflow-hidden z-10 pt-24 md:pt-32">
        {/* Chat List Sidebar */}
        <aside className={`${selectedConvo ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 glass-panel rounded-none md:rounded-xl flex-col overflow-hidden border-r md:border-r-0 border-white/5`}>
          <div className="p-6 border-b border-white/5 space-y-4">
            <h2 className="font-syne text-headline-md">Chats</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl py-2 pl-10 pr-4 text-body-md focus:border-primary-container focus:ring-0 focus:outline-none transition-all placeholder:text-on-surface-variant/50 font-outfit"
                type="text"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined animate-spin text-primary-container text-3xl">progress_activity</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-6">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">chat_bubble_outline</span>
                <p className="text-on-surface-variant font-outfit text-body-md">No conversations yet.</p>
                <p className="text-on-surface-variant text-label-sm mt-2 font-outfit">
                  Unlock contacts on listings to start chatting.
                </p>
              </div>
            ) : (
              filtered.map(convo => {
                const other = getOther(convo);
                const isActive = selectedConvo?.id === convo.id;
                const initial = other[0]?.toUpperCase() || 'U';
                return (
                  <div
                    key={convo.id}
                    onClick={() => selectConvo(convo)}
                    className={`p-4 flex gap-4 cursor-pointer transition-all ${
                      isActive ? 'bg-primary-container/10 border-l-4 border-primary-container' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center">
                        <span className="font-syne text-primary-container">{initial}</span>
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-outfit text-label-md text-on-surface truncate">{other.split('@')[0]}</span>
                        <span className="text-[10px] text-on-surface-variant uppercase">
                          {convo.lastMessageAt?.toDate?.()?.toLocaleDateString() || 'New'}
                        </span>
                      </div>
                      {convo.adTitle && (
                        <p className="text-sm text-primary-container font-semibold truncate mb-1 font-outfit">{convo.adTitle}</p>
                      )}
                      <p className="text-xs text-on-surface-variant truncate font-outfit">
                        {convo.lastMessage || 'Tap to view conversation'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Chat Window */}
        <section className={`${selectedConvo ? 'flex' : 'hidden md:flex'} flex-1 flex-col rounded-r-xl border-l border-white/5 overflow-hidden`} style={{ background: 'rgba(28, 28, 33, 0.8)', backdropFilter: 'blur(40px)' }}>
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <header className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedConvo(null)}
                    className="md:hidden material-symbols-outlined text-on-surface-variant hover:text-primary-container"
                  >
                    arrow_back
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center">
                    <span className="font-syne text-primary-container">{getOther(selectedConvo)[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-syne text-body-lg font-bold leading-none">{getOther(selectedConvo).split('@')[0]}</h3>
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    </div>
                    <span className="text-xs text-on-surface-variant font-outfit">{getOther(selectedConvo)}</span>
                  </div>
                </div>
              </header>

              {/* Conversation Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {selectedConvo.adTitle && (
                  <div className="flex justify-center mb-4">
                    <div className="max-w-md w-full glass-panel p-4 rounded-xl flex gap-4 items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-bold rounded uppercase font-outfit">Live</span>
                        </div>
                        <h4 className="font-syne text-body-md font-bold mb-1">{selectedConvo.adTitle}</h4>
                        {selectedConvo.adId && (
                          <button
                            onClick={() => navigate(`/product/${selectedConvo.adId}`)}
                            className="text-xs font-bold text-secondary uppercase hover:underline font-outfit"
                          >
                            View Listing
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl opacity-30 mb-4">chat</span>
                    <p className="font-outfit text-body-md">No messages yet. Say hi!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map(msg => {
                      const isMine = msg.sender === currentUser?.email;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'flex-col items-end ml-auto' : 'items-end'} gap-2 max-w-[80%]`}>
                          <div className={`p-4 rounded-2xl ${
                            isMine
                              ? 'rounded-br-none bg-primary-container text-on-primary-container shadow-lg'
                              : 'rounded-bl-none glass-panel'
                          } text-sm leading-relaxed font-outfit`}>
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-on-surface-variant px-1 font-outfit">
                            {msg.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-6 bg-surface-container-lowest/50 border-t border-white/5">
                <div className="flex items-center gap-3 bg-surface-container-lowest border border-white/10 rounded-2xl p-2 focus-within:border-primary-container/50 focus-within:ring-1 focus-within:ring-primary-container/20 transition-all">
                  <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder:text-on-surface-variant/40 outline-none text-on-surface font-outfit"
                    type="text"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMsg.trim()}
                    className="w-10 h-10 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95 transition-all disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {sending ? 'progress_activity' : 'send'}
                    </span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-on-surface-variant p-8">
              <span className="material-symbols-outlined text-7xl opacity-20 mb-6">chat_bubble_outline</span>
              <h3 className="font-syne text-headline-md mb-3">Select a conversation</h3>
              <p className="font-outfit text-body-md max-w-md">Choose a chat from the sidebar to view messages.</p>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full px-6 py-3 flex justify-between items-center z-50 border-t border-white/5" style={{ background: 'rgba(28, 28, 33, 0.8)', backdropFilter: 'blur(40px)' }}>
        <button onClick={() => navigate('/marketplace')} className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] font-medium uppercase font-outfit">Explore</span>
        </button>
        <button onClick={() => navigate('/myads')} className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-[10px] font-medium uppercase font-outfit">Listings</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary-container">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          <span className="text-[10px] font-medium uppercase font-outfit">Messages</span>
        </button>
        <button onClick={() => navigate('/post')} className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-[10px] font-medium uppercase font-outfit">Sell</span>
        </button>
      </nav>
    </div>
  );
}
