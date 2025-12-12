// src/Chatbot.jsx - Create this new file in your frontend/src folder
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm Slavo, your Salesforce CRM assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        if (!isMinimized) {
            inputRef.current?.focus();
        }
    }, [isMinimized]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            console.log('Sending message to chatbot:', inputMessage);

            const response = await fetch(`${API}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversationHistory: messages.slice(-10) // Send last 10 messages for context
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Chatbot response:', data);

            if (data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    text: data.reply,
                    sender: 'bot',
                    timestamp: new Date(data.timestamp)
                };

                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chatbot error:', error);

            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting right now. Please make sure the backend server is running on port 3001.",
                sender: 'bot',
                timestamp: new Date(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                text: "Chat cleared! How can I help you today?",
                sender: 'bot',
                timestamp: new Date()
            }
        ]);
    };

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageCircle size={28} color="#fff" />
            </button>
        );
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)' }}>
                            <Bot size={24} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Chat with Slavo</h1>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Your AI-powered CRM assistant</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={clearChat}
                            style={{ padding: '8px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#94a3b8', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Clear Chat
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div style={{
                flex: 1,
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 350px)',
                minHeight: '500px'
            }}>
                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                animation: 'slideIn 0.3s ease'
                            }}
                        >
                            {message.sender === 'bot' && (
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bot size={20} color="#fff" />
                                </div>
                            )}

                            <div style={{ flex: 1 }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: message.sender === 'user'
                                        ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                                        : message.isError
                                            ? 'rgba(239, 68, 68, 0.1)'
                                            : 'rgba(30, 41, 59, 0.8)',
                                    border: message.isError ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                    color: '#fff',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {message.text}
                                </div>
                                <p style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    margin: '4px 0 0 0',
                                    textAlign: message.sender === 'user' ? 'right' : 'left'
                                }}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {message.sender === 'user' && (
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <User size={20} color="#fff" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '70%' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={20} color="#fff" />
                            </div>
                            <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(30, 41, 59, 0.8)', display: 'flex', gap: '8px' }}>
                                <Loader2 className="animate-pulse" size={16} color="#8b5cf6" />
                                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Slavo is typing...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message... (Press Enter to send)"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    minHeight: '50px',
                                    maxHeight: '150px',
                                    padding: '12px 16px',
                                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                    border: '1px solid rgba(51, 65, 85, 0.5)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            style={{
                                padding: '12px 20px',
                                background: (!inputMessage.trim() || isLoading)
                                    ? 'rgba(51, 65, 85, 0.5)'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: (!inputMessage.trim() || isLoading) ? 0.5 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-pulse" size={18} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send
                                </>
                            )}
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[
                            "Show me my accounts",
                            "Create a new lead",
                            "View opportunities",
                            "Help me with reports"
                        ].map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInputMessage(suggestion)}
                                disabled={isLoading}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '8px',
                                    color: '#8b5cf6',
                                    fontSize: '12px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.5 : 1
                                }}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}