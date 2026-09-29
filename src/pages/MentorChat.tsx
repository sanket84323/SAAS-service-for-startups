import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { ChatMessage, UploadedDocument } from '../types';
import { 
  Bot, Send, Paperclip, FileText, UploadCloud, X, Loader2, Sparkles, 
  Trash2, Info, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MentorChat: React.FC = () => {
  const { workspace, user, addToast } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>('default');
  
  // Knowledge Base states
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load Sessions and Documents from live API
  useEffect(() => {
    if (workspace) {
      // 1. Get uploaded documents
      api.getDocuments(workspace.id)
        .then(setDocuments)
        .catch(() => setDocuments([]));

      // 2. Get chat sessions or create a default session
      api.getChatSessions(workspace.id)
        .then(async (sessions) => {
          if (sessions.length > 0) {
            const activeSession = sessions[0];
            setActiveSessionId(activeSession.id);
            const msgs = await api.getChatMessages(activeSession.id);
            if (msgs.length > 0) {
              setMessages(msgs);
            } else {
              setWelcomeMessage(activeSession.id);
            }
          } else {
            const newSession = await api.createChatSession(workspace.id, "AI Mentor Thread");
            setActiveSessionId(newSession.id);
            setWelcomeMessage(newSession.id);
          }
        })
        .catch(() => {});
    }
  }, [workspace]);

  const setWelcomeMessage = (sessId: string) => {
    setMessages([
      {
        id: 'msg_init',
        sessionId: sessId,
        sender: 'AI',
        content: `Hi ${user?.firstName || 'Founder'}! I'm your AI Startup Mentor. I've analyzed the ${workspace?.name || 'current'} workspace. You can ask me questions about your go-to-market strategy, business plan, or upload PDF documents (like market research or competitor analysis) for me to read and reference.`,
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !workspace) return;
    
    const userText = inputMessage.trim();
    const newUserMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sessionId: activeSessionId,
      sender: 'USER',
      content: userText,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      const aiResponse = await api.sendMessage(workspace.id, activeSessionId, userText);
      setMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      addToast(err.message || 'Failed to get mentor response', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!workspace) return;
    
    setIsUploading(true);
    
    api.uploadDocument(
      workspace.id, 
      file.name, 
      (file.size / 1024).toFixed(1) + ' KB', 
      file.type || 'application/pdf'
    )
      .then(newDoc => {
        setDocuments(prev => [...prev, newDoc]);
        addToast(`${file.name} uploaded and indexed successfully!`, 'success');
      })
      .catch((err) => {
        addToast(err.message || 'Failed to upload document', 'error');
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    addToast('Document removed from knowledge base', 'info');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-4 rounded-2xl mb-4 relative overflow-hidden flex justify-between items-center shrink-0 shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[50px] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> GPT-4o Powered
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AI Startup Mentor</h2>
        </div>
        <button 
          onClick={() => setMessages([])}
          className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors"
        >
          Clear Chat
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* Knowledge Base Sidebar (RAG) */}
        <div className="w-full md:w-72 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Knowledge Base
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Upload context documents (PDF, TXT, CSV) to improve AI accuracy.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Upload Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <input 
                id="hidden-file-input"
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileInput}
                accept=".pdf,.txt,.csv,.docx"
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center text-blue-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Processing...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Drop files here</span>
                  <span className="text-[10px] text-slate-400 mt-1">or click to browse</span>
                </>
              )}
            </div>

            {/* Document List */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Indexed Documents ({documents.length})</h4>
              
              {documents.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                  <span className="text-xs text-slate-500">No documents uploaded</span>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-white dark:bg-slate-800 rounded shadow-sm shrink-0">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{doc.fileName}</p>
                        <p className="text-[8px] text-slate-400">{doc.fileSize} • {doc.chunkCount} chunks</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl flex flex-col overflow-hidden shadow-sm min-w-0 relative">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-sm ${
                  msg.sender === 'USER' 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                    : 'bg-blue-600 border-blue-500 text-white'
                }`}>
                  {msg.sender === 'USER' ? (
                    <img 
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || 'User'}`} 
                      alt="User" 
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {/* Source Documents References */}
                  {msg.sourceDocuments && msg.sourceDocuments.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> References
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.sourceDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors group relative">
                            <FileText className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">{doc.name}</span>
                            
                            {/* Hover tooltip for matched text */}
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 hidden md:block">
                              <span className="block font-bold text-slate-400 mb-1 border-b border-slate-700 pb-1">Excerpt</span>
                              {doc.matchedText}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-card-dark border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask the AI mentor for advice, brainstorming, or analysis..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200 resize-none min-h-[50px] max-h-[150px] custom-scrollbar"
                  rows={1}
                />
                <button 
                  type="button"
                  onClick={() => document.getElementById('hidden-file-input')?.click()}
                  className="absolute right-3 bottom-3 p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                  title="Attach file (also supports drag and drop)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
              <button 
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="w-12 h-[50px] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400">AI Mentor can make mistakes. Verify important business decisions.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
