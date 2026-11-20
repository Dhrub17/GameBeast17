import React, { useState, useEffect } from 'react';
import { Send, Calendar, Map, Target } from 'lucide-react';
import { MessageChannel } from '../types';

interface CommsViewProps {
  channels: MessageChannel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onSendMessage: (channelId: string, text: string) => void;
}

export const CommsView: React.FC<CommsViewProps> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  onSendMessage,
}) => {
  const [draft, setDraft] = useState('');
  const activeChannel = channels.find((c) => c.id === activeChannelId) ?? channels[0];

  useEffect(() => {
    setDraft('');
  }, [activeChannelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeChannel) return;
    onSendMessage(activeChannel.id, draft.trim());
    setDraft('');
  };

  return (
    <div className="border border-slate-800 rounded-lg bg-[#111827] grid grid-cols-1 lg:grid-cols-12 min-h-[580px] overflow-hidden">
      {/* Left Channel List */}
      <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">
            Team Coordination & Recruitment
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct prospect threads, scouting war room, and match plans.
          </p>
        </div>

        <div className="divide-y divide-slate-800/70 overflow-y-auto flex-1">
          {channels.map((ch) => {
            const isSelected = ch.id === activeChannel?.id;
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`w-full text-left p-4 transition-colors ${
                  isSelected ? 'bg-slate-800/70' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span
                    className={
                      ch.type === 'Match Plan'
                        ? 'text-blue-400 font-medium'
                        : ch.type === 'Scouting'
                        ? 'text-emerald-400 font-medium'
                        : 'text-slate-400'
                    }
                  >
                    {ch.type}
                  </span>
                  <span className="font-mono-num">
                    {ch.messages[ch.messages.length - 1]?.timestamp ?? ''}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-100 truncate">{ch.name}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{ch.subtitle}</div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Active Thread */}
      <div className="lg:col-span-8 flex flex-col">
        {activeChannel ? (
          <>
            <div className="p-4 border-b border-slate-800">
              <div className="text-sm font-semibold text-slate-50">{activeChannel.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{activeChannel.subtitle}</div>
            </div>

            {/* Match Plan Header Brief */}
            {activeChannel.matchMeta && (
              <div className="p-4 bg-[#0b0f17] border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Scheduled Match
                  </div>
                  <div className="text-slate-200 font-medium mt-1">
                    {activeChannel.matchMeta.opponent}
                  </div>
                  <div className="text-slate-400 font-mono-num mt-0.5">
                    {activeChannel.matchMeta.scheduledTime}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" />
                    Map Veto / Pool
                  </div>
                  <div className="text-slate-200 mt-1">
                    {activeChannel.matchMeta.mapPool.join(' · ')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Scouting Objective
                  </div>
                  <div className="text-slate-300 mt-1 leading-relaxed">
                    {activeChannel.matchMeta.objective}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-5 space-y-5 overflow-y-auto max-h-[380px]">
              {activeChannel.messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="font-medium text-slate-100">{msg.sender}</span>
                    <span className="text-slate-500">· {msg.role}</span>
                    <span className="text-slate-500 font-mono-num ml-auto">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-slate-800 flex items-center gap-3"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${activeChannel.name}...`}
                className="flex-1 bg-[#0b0f17] border border-slate-700 rounded-md px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400">Select a channel to view messages.</div>
        )}
      </div>
    </div>
  );
};
