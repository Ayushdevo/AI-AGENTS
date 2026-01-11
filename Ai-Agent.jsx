import React, { useState } from 'react';
import { Bot, Plus, Trash2, MessageSquare, Settings, Send, Sparkles, X } from 'lucide-react';

export default function AIAgentBuilder() {
  const [agents, setAgents] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Agent builder form state
  const [agentForm, setAgentForm] = useState({
    name: '',
    role: '',
    personality: '',
    expertise: '',
    instructions: '',
    temperature: 0.7
  });

  const createAgent = () => {
    if (!agentForm.name || !agentForm.role) {
      alert('Please provide at least a name and role for your agent');
      return;
    }

    const newAgent = {
      id: Date.now(),
      ...agentForm,
      createdAt: new Date().toISOString()
    };

    setAgents([...agents, newAgent]);
    setAgentForm({
      name: '',
      role: '',
      personality: '',
      expertise: '',
      instructions: '',
      temperature: 0.7
    });
    setShowBuilder(false);
  };

  const deleteAgent = (id) => {
    setAgents(agents.filter(a => a.id !== id));
    if (activeAgent?.id === id) {
      setActiveAgent(null);
      setChatMessages([]);
    }
  };

  const startChat = (agent) => {
    setActiveAgent(agent);
    setChatMessages([{
      role: 'assistant',
      content: `Hello! I'm ${agent.name}, your ${agent.role}. ${agent.personality ? agent.personality + ' ' : ''}How can I help you today?`
    }]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build system prompt from agent configuration
      const systemPrompt = `You are ${activeAgent.name}, a ${activeAgent.role}.

${activeAgent.personality ? `Personality: ${activeAgent.personality}` : ''}
${activeAgent.expertise ? `Expertise: ${activeAgent.expertise}` : ''}
${activeAgent.instructions ? `Special Instructions: ${activeAgent.instructions}` : ''}

Stay in character and be helpful while following these guidelines.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        const assistantMessage = {
          role: 'assistant',
          content: data.content[0].text
        };
        setChatMessages([...updatedMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      setChatMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Agent Studio</h1>
                  <p className="text-sm text-white/70">Build and chat with custom AI agents</p>
                </div>
              </div>
              <button
                onClick={() => setShowBuilder(!showBuilder)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Agent</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Agent Builder Panel */}
          {showBuilder && (
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configure Agent
                </h2>
                <button
                  onClick={() => setShowBuilder(false)}
                  className="text-white/70 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Name *</label>
                  <input
                    type="text"
                    value={agentForm.name}
                    onChange={(e) => setAgentForm({...agentForm, name: e.target.value})}
                    placeholder="e.g., Sarah"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Role *</label>
                  <input
                    type="text"
                    value={agentForm.role}
                    onChange={(e) => setAgentForm({...agentForm, role: e.target.value})}
                    placeholder="e.g., Marketing Strategist"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Personality</label>
                  <textarea
                    value={agentForm.personality}
                    onChange={(e) => setAgentForm({...agentForm, personality: e.target.value})}
                    placeholder="e.g., Friendly, enthusiastic, creative"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Expertise</label>
                  <textarea
                    value={agentForm.expertise}
                    onChange={(e) => setAgentForm({...agentForm, expertise: e.target.value})}
                    placeholder="e.g., Social media, content creation, SEO"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Special Instructions</label>
                  <textarea
                    value={agentForm.instructions}
                    onChange={(e) => setAgentForm({...agentForm, instructions: e.target.value})}
                    placeholder="e.g., Always provide 3 actionable tips"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <button
                  onClick={createAgent}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Create Agent
                </button>
              </div>
            </div>
          )}

          {/* Agent List */}
          <div className={`${showBuilder ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 sm:p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Agents</h2>
              
              {agents.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                  <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No agents yet. Create your first agent to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        activeAgent?.id === agent.id
                          ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shadow-lg'
                          : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                      }`}
                      onClick={() => startChat(agent)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">{agent.name}</h3>
                          <p className="text-sm text-white/70 mb-2">{agent.role}</p>
                          {agent.personality && (
                            <p className="text-xs text-white/50 line-clamp-2">{agent.personality}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startChat(agent);
                            }}
                            className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAgent(agent.id);
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className={`${showBuilder ? 'lg:col-span-4' : 'lg:col-span-9'}`}>
            {activeAgent ? (
              <div className="flex flex-col h-[600px] bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 sm:p-6">
                  <h3 className="font-bold text-lg">{activeAgent.name}</h3>
                  <p className="text-sm opacity-90">{activeAgent.role}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-white p-4 rounded-2xl border border-white/20">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 border-t border-white/20 bg-white/5">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-dashed border-white/20">
                <div className="text-center text-white/60">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select an agent to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
