import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2, Plus, MessageSquare } from 'lucide-react';
import { supabase, callAIAssistant } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { AIConversation, AIMessage } from '../lib/supabase';

export default function AIAssistantPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    const fetchConvs = async () => {
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', profile.id)
        .order('updated_at', { ascending: false });
      setConversations(data as AIConversation[] ?? []);
      setLoadingConvs(false);
    };
    fetchConvs();
  }, [profile]);

  useEffect(() => {
    if (!activeConvId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', activeConvId)
        .order('created_at', { ascending: true });
      setMessages(data as AIMessage[] ?? []);
    };
    fetchMessages();
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: AIMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: activeConvId ?? '',
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      const data = await callAIAssistant(currentInput, activeConvId ?? undefined);
      if (!activeConvId && data.conversationId) {
        setActiveConvId(data.conversationId);
        // Refresh conversations list
        const { data: convs } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', profile!.id)
          .order('updated_at', { ascending: false });
        setConversations(convs as AIConversation[] ?? []);
      }
      const aiMsg: AIMessage = {
        id: 'ai-' + Date.now(),
        conversation_id: data.conversationId,
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        conversation_id: activeConvId ?? '',
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConv = async (id: string) => {
    await supabase.from('ai_conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
    }
  };

  const suggestedQuestions = [
    'What is SQL injection and how do I prevent it?',
    'Explain the OWASP Top 10',
    'How do I secure my web application?',
    'What is XSS and how does it work?',
    'How does CSRF work and how to prevent it?',
  ];

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Security Assistant</h1>
          <p className="text-sm text-neutral-500">Ask questions about cybersecurity, vulnerabilities, and best practices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Conversations sidebar */}
        <div className="lg:col-span-1">
          <button onClick={handleNewChat} className="btn-primary w-full mb-3">
            <Plus className="h-4 w-4" /> New Chat
          </button>
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-200 p-3 dark:border-neutral-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">History</p>
            </div>
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
              {loadingConvs ? (
                <div className="p-4 text-center text-sm text-neutral-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-center text-sm text-neutral-500">No conversations yet</p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 p-3 cursor-pointer transition-colors ${
                      activeConvId === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                    onClick={() => setActiveConvId(conv.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                    <p className="flex-1 truncate text-sm">{conv.title}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3">
          <div className="card flex h-[600px] flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Bot className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">Ask me anything about cybersecurity</p>
                  <p className="mt-1 text-sm text-neutral-500">I can explain vulnerabilities, recommend fixes, and help you learn.</p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:border-primary-300 hover:text-primary-600 dark:border-neutral-700 dark:text-neutral-400"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a cybersecurity question..."
                  className="input flex-1"
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
