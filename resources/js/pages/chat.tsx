import { Head, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Send, User, Users } from 'lucide-react';

interface Message {
    id: number;
    sender_type: string;
    content: string;
    created_at: string | null;
}

interface Conversation {
    id: number;
    subject: string | null;
    status: string;
    chat_token: string;
}

interface PageProps extends Record<string, unknown> {
    conversation: Conversation;
    messages: Message[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    new: { label: 'Starting...', color: 'bg-blue-100 text-blue-700' },
    agent_working: { label: 'AI is responding...', color: 'bg-blue-100 text-blue-700' },
    needs_human: { label: 'Connecting to support...', color: 'bg-yellow-100 text-yellow-700' },
    queued: { label: 'Waiting for agent...', color: 'bg-yellow-100 text-yellow-700' },
    assigned: { label: 'Agent assigned', color: 'bg-green-100 text-green-700' },
    human_working: { label: 'Chatting with support', color: 'bg-green-100 text-green-700' },
    back_to_agent: { label: 'AI is responding...', color: 'bg-blue-100 text-blue-700' },
    resolved: { label: 'Resolved', color: 'bg-gray-100 text-gray-600' },
    archived: { label: 'Closed', color: 'bg-gray-100 text-gray-600' },
};

export default function ChatPage() {
    const { conversation: initialConversation, messages: initialMessages } = usePage<PageProps>().props;
    
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [conversation, setConversation] = useState<Conversation>(initialConversation);
    const [inputValue, setInputValue] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const isResolved = conversation.status === 'resolved' || conversation.status === 'archived';

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for new messages
    useEffect(() => {
        if (isResolved) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/chat/${conversation.chat_token}/messages`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages);
                    setConversation(prev => ({ ...prev, status: data.conversation.status }));
                }
            } catch {
                // Silent fail on polling errors
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [conversation.chat_token, isResolved]);

    const handleSend = useCallback(async () => {
        if (!inputValue.trim() || sending || isResolved) return;

        const content = inputValue.trim();
        setInputValue('');
        setSending(true);
        setError(null);

        // Optimistic update
        const tempMessage: Message = {
            id: Date.now(),
            sender_type: 'requester',
            content,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch(`/chat/${conversation.chat_token}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.error || 'Failed to send message');
            }

            const data = await response.json();
            setConversation(prev => ({ ...prev, status: data.conversation.status }));
            
            // Replace temp message with real one
            setMessages(prev => 
                prev.map(m => m.id === tempMessage.id ? data.message : m)
            );
        } catch (err) {
            setError((err as Error).message);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            setInputValue(content);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }, [inputValue, sending, isResolved, conversation.chat_token]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const statusInfo = STATUS_LABELS[conversation.status] || STATUS_LABELS.new;

    return (
        <>
            <Head title={conversation.subject || 'Chat'} />
            
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
                {/* Header */}
                <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
                    <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="font-semibold text-slate-900">
                                    {conversation.subject || 'Support Chat'}
                                </h1>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-2xl px-4 py-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Bot className="h-8 w-8 text-blue-600" />
                                </div>
                                <h2 className="mb-2 text-lg font-medium text-slate-900">Welcome!</h2>
                                <p className="text-sm text-slate-500">
                                    Type a message below to start the conversation.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <MessageBubble key={message.id} message={message} />
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>

                {/* Input */}
                <footer className="sticky bottom-0 border-t border-slate-200 bg-white/80 backdrop-blur-lg">
                    <div className="mx-auto max-w-2xl px-4 py-3">
                        {error && (
                            <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        
                        {isResolved ? (
                            <div className="rounded-lg bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">
                                This conversation has been resolved. Thank you for contacting us!
                            </div>
                        ) : (
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    disabled={sending}
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || sending}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
}

function MessageBubble({ message }: { message: Message }) {
    const isRequester = message.sender_type === 'requester';
    const isAgent = message.sender_type === 'agent';
    const isHuman = message.sender_type === 'human';

    const Icon = isRequester ? User : isHuman ? Users : Bot;
    const label = isRequester ? 'You' : isHuman ? 'Support Agent' : 'AI Assistant';

    return (
        <div className={`flex gap-3 ${isRequester ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                isRequester 
                    ? 'bg-slate-200 text-slate-600' 
                    : isHuman 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
            }`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className={`max-w-[75%] ${isRequester ? 'text-right' : ''}`}>
                <div className={`mb-1 text-xs font-medium ${isRequester ? 'text-slate-500' : 'text-slate-600'}`}>
                    {label}
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                    isRequester 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-900'
                }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                {message.created_at && (
                    <div className={`mt-1 text-xs text-slate-400 ${isRequester ? 'text-right' : ''}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
        </div>
    );
}
