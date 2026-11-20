import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  BarChart3,
  Trophy,
  Target,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
  Lock,
  LogOut,
  Menu,
  X,
  Map,
} from 'lucide-react';
import {
  Player,
  Tournament,
  MessageChannel,
  OrgCriteria,
  PlayerNavSection,
} from '../types';

interface PlayerWorkspaceProps {
  player: Player;
  tournaments: Tournament[];
  channels: MessageChannel[];
  criteria: OrgCriteria;
  onRegisterTournament: (tournamentId: string, playerId: string) => void;
  onWithdrawTournament: (tournamentId: string, playerId: string) => void;
  onUpdatePitchStatement: (playerId: string, statement: string) => void;
  onSendPlayerMessage: (channelId: string, text: string, senderName: string, senderRole: string) => void;
  onAddPlayerComment: (playerId: string, text: string) => void;
  onSignOut: () => void;
}

const PLAYER_NAV: {
  id: PlayerNavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'my-stats', label: 'My Stats', icon: BarChart3 },
  { id: 'upcoming-tournaments', label: 'Upcoming Tournaments', icon: Trophy },
  { id: 'plan-pitch', label: 'Plan & Pitch', icon: Target },
  { id: 'comments', label: 'Comments & Messages', icon: MessageSquare },
];

export const PlayerWorkspace: React.FC<PlayerWorkspaceProps> = ({
  player,
  tournaments,
  channels,
  criteria,
  onRegisterTournament,
  onWithdrawTournament,
  onUpdatePitchStatement,
  onSendPlayerMessage,
  onAddPlayerComment,
  onSignOut,
}) => {
  const [activeNav, setActiveNav] = useState<PlayerNavSection>('my-stats');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pitchStatement, setPitchStatement] = useState(player.playerPitchStatement ?? '');
  const [pitchSaved, setPitchSaved] = useState(false);

  const [commentDraft, setCommentDraft] = useState('');
  const [messageDraft, setMessageDraft] = useState('');

  // Strictly filter channels & match plans to this player's user space
  const playerChannels = channels.filter((c) => c.linkedPlayerId === player.id);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(playerChannels[0]?.id ?? '');
  const activeChannel =
    playerChannels.find((c) => c.id === selectedChannelId) ?? playerChannels[0] ?? null;

  const upcomingTournaments = tournaments.filter((t) => t.status !== 'Completed');
  const matchPlanChannels = playerChannels.filter((c) => c.type === 'Match Plan' && c.matchMeta);

  const passesPressure = player.pressureIndex >= criteria.minPressureIndex;
  const passesStack = player.stackScore >= criteria.minStackScore;
  const passesTournaments = player.tournamentsPlayed >= criteria.minTournaments;
  const passesRank = !criteria.requireVerifiedRank || player.verificationStatus === 'Verified';
  const stackLift = player.stackMetrics.fullStackWinRate - player.stackMetrics.soloWinRate;

  const activeNavLabel = PLAYER_NAV.find((n) => n.id === activeNav)?.label ?? 'My Stats';

  const handleSavePitch = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePitchStatement(player.id, pitchStatement.trim());
    setPitchSaved(true);
    setTimeout(() => setPitchSaved(false), 2500);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentDraft.trim()) return;
    onAddPlayerComment(player.id, commentDraft.trim());
    setCommentDraft('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageDraft.trim() || !activeChannel) return;
    onSendPlayerMessage(
      activeChannel.id,
      messageDraft.trim(),
      player.handle,
      `Player · ${player.game}`
    );
    setMessageDraft('');
  };

  const navigate = (section: PlayerNavSection) => {
    setActiveNav(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-50 flex">
      {/* Desktop Sidebar — Strictly User Space */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-slate-800 bg-[#0b0f17] sticky top-0 h-screen">
        <div className="h-16 px-6 flex items-center border-b border-slate-800">
          <span className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap">
            ClutchLine
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {PLAYER_NAV.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-slate-800/80 text-slate-50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </span>
                {item.id === 'upcoming-tournaments' && (
                  <span className="font-mono-num text-xs text-slate-400">
                    {upcomingTournaments.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-xs">
            <div className="font-medium text-slate-200">{player.handle}</div>
            <div className="text-slate-400 mt-0.5">
              Player Space · {player.game}
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 max-w-[80vw] bg-[#0b0f17] border-r border-slate-800 flex flex-col h-full z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
              <span className="font-display text-lg font-bold text-slate-50">ClutchLine</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="p-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {PLAYER_NAV.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={onSignOut}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 rounded-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar — No Host Tournament CTA in Player Space */}
        <header className="h-16 px-6 border-b border-slate-800 bg-[#0b0f17] flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-slate-400 hidden sm:inline">Player Space</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <h1 className="font-semibold text-slate-50 truncate">{activeNavLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('plan-pitch')}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              View Pitch Plan
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* 1. MY STATS */}
          {activeNav === 'my-stats' && (
            <>
              {/* Personal KPI Strip */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-800 rounded-lg bg-[#111827] divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
                <div className="p-5">
                  <div className="text-xs text-slate-400">Pressure Index</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-semibold font-mono-num text-slate-50">
                      {player.pressureIndex.toFixed(1)}
                    </span>
                    <span
                      className={`text-xs ${
                        passesPressure ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {passesPressure ? 'Above Org Avg' : 'Building'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-slate-400">Stack Score</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-semibold font-mono-num text-slate-50">
                      {player.stackScore.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono-num text-blue-400">
                      {stackLift >= 0 ? `+${stackLift}% 5-stack` : `${stackLift}% 5-stack`}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-slate-400">Tournaments Played</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-semibold font-mono-num text-slate-50">
                      {player.tournamentsPlayed}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-num">
                      {player.lanCount} LAN · {player.top3Finishes} Top-3
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-slate-400">Rank & Verification</div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-50 truncate">
                      {player.rank}
                    </span>
                    {player.verificationStatus === 'Verified' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : player.verificationStatus === 'Pending' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400 shrink-0">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Multi-Season Chart */}
              <section className="border border-slate-800 rounded-lg bg-[#111827] p-6">
                <div className="pb-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-50">
                      My Multi-Season Performance (S1–S6)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {player.handle} · {player.game} · {player.role} · Current K/D{' '}
                      <span className="font-mono-num text-slate-200">{player.kd.toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-blue-500 inline-block" />
                      Pressure Index
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" />
                      Stack Score
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={player.seasons} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis dataKey="season" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis domain={[45, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0b0f17',
                            borderColor: '#334155',
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pressureIndex"
                          name="Pressure Index"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#3b82f6' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="stackScore"
                          name="Stack Score"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border-t lg:border-t-0 lg:border-l border-slate-800 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200 mb-1">
                        Events by Season
                      </div>
                      <div className="text-xs text-slate-400 mb-4">
                        Avg Placement:{' '}
                        <span className="font-mono-num text-slate-200">
                          #{player.avgPlacement.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={player.seasons} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey="season" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0b0f17',
                                borderColor: '#334155',
                                borderRadius: '6px',
                                fontSize: '12px',
                              }}
                            />
                            <Bar dataKey="tournaments" name="Tournaments" fill="#334155" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pressure & Stack Breakdown + Recent History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-100">
                    High-Stakes Pressure Breakdown
                  </h3>
                  <div className="space-y-3 text-xs">
                    {[
                      ['1vX Clutch Conversion', player.pressureMetrics.clutchConversion],
                      ['Overtime Consistency', player.pressureMetrics.overtimeDelta],
                      ['LAN Rating Retention', player.pressureMetrics.lanRetention],
                      ['Elimination Match Impact', player.pressureMetrics.eliminationImpact],
                      ['Comms Composure', player.pressureMetrics.commsComposure],
                      ['Mistake Recovery', player.pressureMetrics.mistakeRecovery],
                    ].map(([label, val]) => (
                      <div key={label as string}>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>{label}</span>
                          <span className="font-mono-num text-slate-200">{val}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-3">
                      Stack Performance Comparison
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center border border-slate-800 rounded-md p-3.5 bg-[#0b0f17]">
                      <div>
                        <div className="text-[11px] text-slate-400">Solo WR</div>
                        <div className="font-mono-num text-base text-slate-200 mt-0.5">
                          {player.stackMetrics.soloWinRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">Duo / Trio</div>
                        <div className="font-mono-num text-base text-slate-200 mt-0.5">
                          {player.stackMetrics.duoTrioWinRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">5-Stack WR</div>
                        <div className="font-mono-num text-base text-emerald-400 font-semibold mt-0.5">
                          {player.stackMetrics.fullStackWinRate}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-2">
                      My Recent Tournament Finishes
                    </h3>
                    <div className="divide-y divide-slate-800/70 text-xs">
                      {player.recentEvents.map((ev) => (
                        <div key={ev.name} className="py-2.5 flex items-center justify-between">
                          <div>
                            <div className="text-slate-200 font-medium">{ev.name}</div>
                            <div className="text-slate-400">
                              {ev.date} · {ev.type}
                            </div>
                          </div>
                          <div className="text-right font-mono-num">
                            <div className="text-slate-100 font-medium">{ev.placement}</div>
                            <div className="text-slate-400">PI {ev.pressureRating}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* 2. UPCOMING TOURNAMENTS (Read & Register Only — Hosting Disabled for Players) */}
          {activeNav === 'upcoming-tournaments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-50">Upcoming Tournaments</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Browse official VR1 and Organization-hosted scouting tournaments and register for events you qualify for.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-slate-400 shrink-0">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Hosting restricted to VR1 Members & Organizations
                </div>
              </div>

              {upcomingTournaments.length === 0 ? (
                <div className="border border-slate-800 rounded-lg bg-[#111827] p-10 text-center text-sm text-slate-400">
                  No upcoming tournaments are open right now. Check back soon.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTournaments.map((t) => {
                    const isEnrolled = t.registeredPlayerIds.includes(player.id);
                    const matchesGame = t.game === player.game;
                    const meetsPressure = player.pressureIndex >= t.minPressureIndex;
                    const canRegister = matchesGame && meetsPressure && t.status === 'Open Registration';

                    return (
                      <div
                        key={t.id}
                        className="border border-slate-800 rounded-lg bg-[#111827] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className="text-slate-200 font-medium">{t.game}</span>
                            <span>·</span>
                            <span>{t.format}</span>
                            <span>·</span>
                            <span
                              className={
                                t.hostType === 'VR1'
                                  ? 'text-blue-400 font-medium'
                                  : 'text-emerald-400 font-medium'
                              }
                            >
                              Hosted by {t.organizer} ({t.hostType === 'VR1' ? 'VR1 Member' : 'Organization'})
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-50">{t.name}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {t.startDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5" />
                              {t.prizeOrSlots}
                            </span>
                            <span>
                              Req: {t.minRank} · Min Pressure{' '}
                              <span className="font-mono-num text-slate-200">{t.minPressureIndex}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                          {isEnrolled ? (
                            <>
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                Registered
                              </span>
                              <button
                                onClick={() => onWithdrawTournament(t.id, player.id)}
                                className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
                              >
                                Withdraw
                              </button>
                            </>
                          ) : canRegister ? (
                            <button
                              onClick={() => onRegisterTournament(t.id, player.id)}
                              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
                            >
                              Register for Event
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              {!matchesGame
                                ? `${t.game} players only`
                                : !meetsPressure
                                ? `Requires Pressure ≥ ${t.minPressureIndex}`
                                : 'Registration closed'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. PLAN & PITCH */}
          {activeNav === 'plan-pitch' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">My Plan & Scouter Pitch</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Track your readiness for organization scouters, refine your personal pitch summary, and review scheduled scrim plans.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Readiness Checklist */}
                <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">Scouter Pitch Readiness</h3>
                    <span
                      className={`text-xs font-medium ${
                        player.pitchStatus === 'Pitched'
                          ? 'text-emerald-400'
                          : player.pitchStatus === 'Ready to Pitch'
                          ? 'text-blue-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {player.pitchStatus}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/70 text-xs">
                    {[
                      {
                        label: `Pressure Index ≥ ${criteria.minPressureIndex}`,
                        current: player.pressureIndex.toFixed(1),
                        passed: passesPressure,
                      },
                      {
                        label: `Stack Score ≥ ${criteria.minStackScore}`,
                        current: player.stackScore.toFixed(1),
                        passed: passesStack,
                      },
                      {
                        label: `Tournaments Played ≥ ${criteria.minTournaments}`,
                        current: `${player.tournamentsPlayed} events`,
                        passed: passesTournaments,
                      },
                      {
                        label: 'Verified Rank Account',
                        current: player.verificationStatus,
                        passed: passesRank,
                      },
                    ].map((row) => (
                      <div key={row.label} className="py-3 flex items-center justify-between">
                        <span className="text-slate-300">{row.label}</span>
                        <div className="flex items-center gap-3 font-mono-num">
                          <span className="text-slate-200">{row.current}</span>
                          <span className={row.passed ? 'text-emerald-400' : 'text-amber-400'}>
                            {row.passed ? 'Met' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Personal Pitch Statement Editor */}
                <section className="border border-slate-800 rounded-lg bg-[#111827] p-6">
                  <h3 className="text-sm font-semibold text-slate-100">
                    My Pitch Statement to Scouters
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Organizations see this summary alongside your Pressure Index and multi-season trends.
                  </p>
                  <form onSubmit={handleSavePitch} className="space-y-4">
                    <textarea
                      rows={5}
                      value={pitchStatement}
                      onChange={(e) => {
                        setPitchStatement(e.target.value);
                        setPitchSaved(false);
                      }}
                      placeholder="Summarize your role strengths, LAN experience, communication style, and scrim availability..."
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-md p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400">
                        {pitchSaved ? 'Pitch statement saved.' : ''}
                      </span>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                      >
                        Save Pitch Plan
                      </button>
                    </div>
                  </form>
                </section>
              </div>

              {/* Assigned Match Plans */}
              <section className="border border-slate-800 rounded-lg bg-[#111827] p-6">
                <h3 className="text-sm font-semibold text-slate-100 mb-4">
                  My Scheduled Match Plans
                </h3>
                {matchPlanChannels.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No tryout scrim match plans are scheduled for your profile yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {matchPlanChannels.map((ch) => (
                      <div
                        key={ch.id}
                        className="border border-slate-800 rounded-md bg-[#0b0f17] p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                      >
                        <div>
                          <div className="text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Match & Time
                          </div>
                          <div className="text-slate-100 font-medium mt-1">
                            {ch.matchMeta?.opponent}
                          </div>
                          <div className="text-slate-400 font-mono-num mt-0.5">
                            {ch.matchMeta?.scheduledTime}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 flex items-center gap-1.5">
                            <Map className="w-3.5 h-3.5" />
                            Map Pool
                          </div>
                          <div className="text-slate-200 mt-1">
                            {ch.matchMeta?.mapPool.join(' · ')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" />
                            Coach Objective
                          </div>
                          <div className="text-slate-300 mt-1 leading-relaxed">
                            {ch.matchMeta?.objective}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* 4. COMMENTS & MESSAGES */}
          {activeNav === 'comments' && (
            <div className="space-y-6">
              {/* Scout & Coach Comments on Player */}
              <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-50">
                    Scout & Coach Comments
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluation feedback on your pressure composure, match prep, and pitch readiness.
                  </p>
                </div>

                <div className="divide-y divide-slate-800/70">
                  {player.scoutComments.map((c) => (
                    <div key={c.id} className="py-4 first:pt-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium text-slate-100">{c.author}</span>
                        <span className="text-slate-500">· {c.authorRole}</span>
                        <span className="text-blue-400">· {c.category}</span>
                        <span className="text-slate-500 font-mono-num ml-auto">{c.date}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostComment} className="pt-3 border-t border-slate-800 flex gap-3">
                  <input
                    type="text"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Add a personal comment or update for scouts..."
                    className="flex-1 bg-[#0b0f17] border border-slate-700 rounded-md px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
                  >
                    Post Comment
                  </button>
                </form>
              </section>

              {/* Player Direct & Match Plan Messages */}
              <section className="border border-slate-800 rounded-lg bg-[#111827] overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      My Direct Threads & Match Plan Chat
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Conversations with organizations and coaches linked to your profile.
                    </p>
                  </div>
                  {playerChannels.length > 1 && (
                    <select
                      value={activeChannel?.id ?? ''}
                      onChange={(e) => setSelectedChannelId(e.target.value)}
                      className="bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {playerChannels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {activeChannel ? (
                  <div>
                    <div className="p-5 space-y-4 max-h-72 overflow-y-auto">
                      {activeChannel.messages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-baseline gap-2 text-xs">
                            <span className="font-medium text-slate-100">{msg.sender}</span>
                            <span className="text-slate-500">· {msg.role}</span>
                            <span className="text-slate-500 font-mono-num ml-auto">
                              {msg.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={handleSendMessage}
                      className="p-4 border-t border-slate-800 flex items-center gap-3"
                    >
                      <input
                        type="text"
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        placeholder={`Reply in ${activeChannel.name}...`}
                        className="flex-1 bg-[#0b0f17] border border-slate-700 rounded-md px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No active direct threads with organizations yet. Keep your pitch plan updated to receive tryout invites.
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
