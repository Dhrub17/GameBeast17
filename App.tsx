import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  Trophy,
  MessageSquare,
  Send,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import {
  AuthSession,
  NavSection,
  Player,
  Tournament,
  MessageChannel,
  OrgCriteria,
  PressureMetrics,
  StackMetrics,
} from './types';
import {
  INITIAL_PLAYERS,
  INITIAL_TOURNAMENTS,
  INITIAL_CHANNELS,
  DEFAULT_ORG_CRITERIA,
  calculatePressureIndex,
  calculateStackScore,
} from './data/mockData';
import { LoginPage } from './components/LoginPage';
import { PlayerWorkspace } from './components/PlayerWorkspace';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ScoutingRoster } from './components/ScoutingRoster';
import { PressureStackLab } from './components/PressureStackLab';
import { TournamentsView } from './components/TournamentsView';
import { CommsView } from './components/CommsView';
import { PitchQueueView } from './components/PitchQueueView';

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'scouting', label: 'Scouting Roster', icon: Users },
  { id: 'calculator', label: 'Pressure & Stack Lab', icon: SlidersHorizontal },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy },
  { id: 'comms', label: 'Comms & Match Plan', icon: MessageSquare },
  { id: 'pitch-queue', label: 'Pitch Queue', icon: Send },
];

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeNav, setActiveNav] = useState<NavSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [channels, setChannels] = useState<MessageChannel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>(INITIAL_CHANNELS[0].id);
  const [criteria, setCriteria] = useState<OrgCriteria>(DEFAULT_ORG_CRITERIA);
  const [labPlayerId, setLabPlayerId] = useState<string | null>(null);

  const pitchedCount = players.filter((p) => p.pitchStatus === 'Pitched').length;
  const activeNavLabel = NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? 'Overview';

  const handleLogin = (nextSession: AuthSession) => {
    setSession(nextSession);
    setActiveNav('overview');
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    setSession(null);
    setMobileMenuOpen(false);
  };

  const handleVerifyRank = (playerId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p;
        const meetsCriteria =
          p.pressureIndex >= criteria.minPressureIndex &&
          p.stackScore >= criteria.minStackScore &&
          p.tournamentsPlayed >= criteria.minTournaments;
        return {
          ...p,
          verificationStatus: 'Verified',
          verifiedAt: today,
          pitchStatus: p.pitchStatus === 'Pitched' ? 'Pitched' : meetsCriteria ? 'Ready to Pitch' : p.pitchStatus,
        };
      })
    );
  };

  const handlePitchPlayer = (playerId: string, notes: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              pitchStatus: 'Pitched',
              pitchNotes: notes,
              pitchedAt: today,
              scoutComments: [
                {
                  id: `sc-${Date.now()}`,
                  author: session?.displayName ?? 'Organization Scout',
                  authorRole: session?.subtitle ?? 'Scouting Desk',
                  date: today,
                  category: 'Scouting Note',
                  text: `Pitched to scouters: ${notes}`,
                },
                ...p.scoutComments,
              ],
            }
          : p
      )
    );
  };

  const handleRemoveFromPitch = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, pitchStatus: 'Ready to Pitch' } : p
      )
    );
  };

  const handleSaveEvaluation = (
    playerId: string,
    pressureMetrics: PressureMetrics,
    stackMetrics: StackMetrics,
    tournamentsPlayed: number
  ) => {
    const nextPressure = calculatePressureIndex(pressureMetrics);
    const nextStack = calculateStackScore(stackMetrics);

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p;
        const meetsCriteria =
          nextPressure >= criteria.minPressureIndex &&
          nextStack >= criteria.minStackScore &&
          tournamentsPlayed >= criteria.minTournaments &&
          (!criteria.requireVerifiedRank || p.verificationStatus === 'Verified');

        const updatedSeasons = p.seasons.map((s, idx) =>
          idx === p.seasons.length - 1
            ? { ...s, pressureIndex: nextPressure, stackScore: nextStack }
            : s
        );

        return {
          ...p,
          pressureMetrics,
          pressureIndex: nextPressure,
          stackMetrics,
          stackScore: nextStack,
          tournamentsPlayed,
          seasons: updatedSeasons,
          pitchStatus:
            p.pitchStatus === 'Pitched'
              ? 'Pitched'
              : meetsCriteria
              ? 'Ready to Pitch'
              : 'Under Review',
        };
      })
    );
  };

  // Strictly enforce tournament creation only for Organization or VR1 Members
  const handleCreateTournament = (
    t: Omit<Tournament, 'id' | 'registeredPlayerIds' | 'matches'>
  ) => {
    if (!session || (session.role !== 'organization' && session.role !== 'vr1')) {
      return;
    }
    const newTournament: Tournament = {
      ...t,
      id: `t-${Date.now()}`,
      registeredPlayerIds: [],
      matches: [],
    };
    setTournaments((prev) => [newTournament, ...prev]);
  };

  const handleAssignPlayerToTournament = (tournamentId: string, playerId: string) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId && !t.registeredPlayerIds.includes(playerId)
          ? { ...t, registeredPlayerIds: [...t.registeredPlayerIds, playerId] }
          : t
      )
    );
  };

  const handleWithdrawPlayerFromTournament = (tournamentId: string, playerId: string) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? { ...t, registeredPlayerIds: t.registeredPlayerIds.filter((id) => id !== playerId) }
          : t
      )
    );
  };

  const handleRecordWinner = (tournamentId: string, winnerOrg: string) => {
    if (!session || (session.role !== 'organization' && session.role !== 'vr1')) {
      return;
    }
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId ? { ...t, status: 'Completed', winnerOrg } : t
      )
    );
  };

  const handleUpdatePitchStatement = (playerId: string, statement: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, playerPitchStatement: statement } : p))
    );
  };

  const handleAddPlayerComment = (playerId: string, text: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              scoutComments: [
                {
                  id: `sc-${Date.now()}`,
                  author: p.handle,
                  authorRole: `Player · ${p.game}`,
                  date: today,
                  category: 'Match Plan',
                  text,
                },
                ...p.scoutComments,
              ],
            }
          : p
      )
    );
  };

  const handleSendMessage = (
    channelId: string,
    text: string,
    overrideSender?: string,
    overrideRole?: string
  ) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `msg-${Date.now()}`,
                  sender: overrideSender ?? session?.displayName ?? 'Elena Rostova',
                  role: overrideRole ?? session?.subtitle ?? 'General Manager',
                  timestamp: now,
                  text,
                },
              ],
            }
          : c
      )
    );
  };

  const handleMessagePlayer = (player: Player) => {
    const existing = channels.find(
      (c) => c.type === 'Direct' && c.linkedPlayerId === player.id
    );
    if (existing) {
      setActiveChannelId(existing.id);
    } else {
      const newChannel: MessageChannel = {
        id: `c-${Date.now()}`,
        name: `DM: ${player.handle} (${player.game})`,
        type: 'Direct',
        subtitle: `Direct Recruitment · ${player.realName}`,
        linkedPlayerId: player.id,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: session?.displayName ?? 'Elena Rostova',
            role: session?.subtitle ?? 'General Manager',
            timestamp: 'Just now',
            text: `Hi ${player.realName}, we reviewed your ${player.game} Pressure Index (${player.pressureIndex}) and tournament record. Are you available for a tryout scrim this week?`,
          },
        ],
      };
      setChannels((prev) => [newChannel, ...prev]);
      setActiveChannelId(newChannel.id);
    }
    setActiveNav('comms');
  };

  const handleOpenLab = (playerId: string) => {
    setLabPlayerId(playerId);
    setActiveNav('calculator');
  };

  const navigate = (section: NavSection) => {
    setActiveNav(section);
    setMobileMenuOpen(false);
  };

  // 1. Unauthenticated -> Two-section Login Page
  if (!session) {
    return <LoginPage players={players} onLogin={handleLogin} />;
  }

  // 2. Player Role -> Strictly Scoped Player Workspace (Cannot host tournaments or access org scouting)
  if (session.role === 'player') {
    const currentPlayer = players.find((p) => p.id === session.playerId) ?? players[0];
    return (
      <PlayerWorkspace
        player={currentPlayer}
        tournaments={tournaments}
        channels={channels}
        criteria={criteria}
        onRegisterTournament={handleAssignPlayerToTournament}
        onWithdrawTournament={handleWithdrawPlayerFromTournament}
        onUpdatePitchStatement={handleUpdatePitchStatement}
        onSendPlayerMessage={handleSendMessage}
        onAddPlayerComment={handleAddPlayerComment}
        onSignOut={handleSignOut}
      />
    );
  }

  // 3. Organization or VR1 Member Role -> Full Scouting & Tournament Hosting Workspace
  const orgDisplay = session.orgName ?? 'Vanguard Esports';

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-slate-800 bg-[#0b0f17] sticky top-0 h-screen">
        <div className="h-16 px-6 flex items-center border-b border-slate-800">
          <span className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap">
            ClutchLine
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map((item) => {
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
                {item.id === 'pitch-queue' && pitchedCount > 0 && (
                  <span className="font-mono-num text-xs text-blue-400">{pitchedCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-xs">
            <div className="font-medium text-slate-200">{session.displayName}</div>
            <div className="text-slate-400 mt-0.5 truncate">{session.subtitle}</div>
            {session.orgId && (
              <div className="font-mono-num text-[11px] text-blue-400 mt-1">
                ID: {session.orgId}
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
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
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
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
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </span>
                    {item.id === 'pitch-queue' && pitchedCount > 0 && (
                      <span className="font-mono-num text-xs text-blue-400">{pitchedCount}</span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleSignOut}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 rounded-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
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
              <span className="text-slate-400 hidden sm:inline">
                {session.role === 'vr1' ? 'VR1 Member' : orgDisplay}
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <h1 className="font-semibold text-slate-50 truncate">{activeNavLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('tournaments')}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Host Tournament
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeNav === 'overview' && (
            <OverviewDashboard
              session={session}
              players={players}
              tournaments={tournaments}
              criteria={criteria}
              onNavigate={navigate}
              onSelectPlayerForLab={handleOpenLab}
              onPitchPlayer={handlePitchPlayer}
            />
          )}

          {activeNav === 'scouting' && (
            <ScoutingRoster
              players={players}
              onVerifyRank={handleVerifyRank}
              onPitchPlayer={handlePitchPlayer}
              onOpenLab={handleOpenLab}
              onMessagePlayer={handleMessagePlayer}
            />
          )}

          {activeNav === 'calculator' && (
            <PressureStackLab
              players={players}
              initialPlayerId={labPlayerId}
              criteria={criteria}
              onUpdateCriteria={setCriteria}
              onSaveEvaluation={handleSaveEvaluation}
              onPitchPlayer={handlePitchPlayer}
            />
          )}

          {activeNav === 'tournaments' && (
            <TournamentsView
              session={session}
              tournaments={tournaments}
              players={players}
              onCreateTournament={handleCreateTournament}
              onAssignPlayer={handleAssignPlayerToTournament}
              onRecordWinner={handleRecordWinner}
            />
          )}

          {activeNav === 'comms' && (
            <CommsView
              channels={channels}
              activeChannelId={activeChannelId}
              onSelectChannel={setActiveChannelId}
              onSendMessage={(chId, text) => handleSendMessage(chId, text)}
            />
          )}

          {activeNav === 'pitch-queue' && (
            <PitchQueueView
              players={players}
              onRemoveFromPitch={handleRemoveFromPitch}
              onMessagePlayer={handleMessagePlayer}
            />
          )}
        </main>
      </div>
    </div>
  );
}
