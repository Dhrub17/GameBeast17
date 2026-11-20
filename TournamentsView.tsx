import React, { useState } from 'react';
import { Plus, Calendar, Users, Trophy, X, Award } from 'lucide-react';
import { Tournament, Player, GameTitle, AuthSession } from '../types';

interface TournamentsViewProps {
  session: AuthSession;
  tournaments: Tournament[];
  players: Player[];
  onCreateTournament: (t: Omit<Tournament, 'id' | 'registeredPlayerIds' | 'matches'>) => void;
  onAssignPlayer: (tournamentId: string, playerId: string) => void;
  onRecordWinner: (tournamentId: string, winnerOrg: string) => void;
}

type TournamentTab = 'all' | 'holding' | 'won';

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  session,
  tournaments,
  players,
  onCreateTournament,
  onAssignPlayer,
  onRecordWinner,
}) => {
  const canHost = session.role === 'organization' || session.role === 'vr1';
  const orgName = session.orgName ?? 'Vanguard Esports';
  const hostType: 'Organization' | 'VR1' = session.role === 'vr1' ? 'VR1' : 'Organization';

  const [tab, setTab] = useState<TournamentTab>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [game, setGame] = useState<GameTitle>('Valorant');
  const [format, setFormat] = useState('Double Elimination · Bo3');
  const [startDate, setStartDate] = useState('2026-12-18');
  const [minRank, setMinRank] = useState('Immortal 3+');
  const [minPressureIndex, setMinPressureIndex] = useState(78);
  const [prizeOrSlots, setPrizeOrSlots] = useState('2 Academy Contracts + $10,000');

  const filteredTournaments = tournaments.filter((t) => {
    if (tab === 'holding') {
      return t.status !== 'Completed' && (session.role === 'vr1' ? true : t.organizer === orgName);
    }
    if (tab === 'won') {
      return session.role === 'vr1'
        ? t.status === 'Completed' && Boolean(t.winnerOrg)
        : t.winnerOrg === orgName;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canHost || !name.trim()) return;
    onCreateTournament({
      name: name.trim(),
      game,
      format,
      startDate,
      status: 'Open Registration',
      minRank,
      minPressureIndex,
      prizeOrSlots,
      organizer: orgName,
      hostType,
    });
    setName('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Scouting Tournaments & Championship Record
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Only VR1 Members and Verified Organizations can host tournaments. Track active events you are holding and titles won.
          </p>
        </div>
        {canHost && (
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCreateForm ? 'Close Form' : `Host as ${hostType === 'VR1' ? 'VR1 Member' : orgName}`}
          </button>
        )}
      </div>

      {/* Filter Tabs: All / Holding / Won */}
      <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg w-fit">
        {(
          [
            ['all', `All Events (${tournaments.length})`],
            [
              'holding',
              `Holding (${
                tournaments.filter(
                  (t) => t.status !== 'Completed' && (session.role === 'vr1' ? true : t.organizer === orgName)
                ).length
              })`,
            ],
            [
              'won',
              `${session.role === 'vr1' ? 'Completed Winners' : 'Won by Us'} (${
                tournaments.filter((t) =>
                  session.role === 'vr1' ? Boolean(t.winnerOrg) : t.winnerOrg === orgName
                ).length
              })`,
            ],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              tab === id ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Create Tournament Form (Org & VR1 Only) */}
      {canHost && showCreateForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-slate-800 rounded-lg bg-[#111827] p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Create Scouting Tournament</h3>
            <span className="text-xs text-slate-400">
              Authorized Host:{' '}
              <span className="text-blue-400 font-medium">
                {orgName} ({hostType === 'VR1' ? 'VR1 Member' : `ID: ${session.orgId}`})
              </span>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Tournament Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vanguard Q1 Proving Grounds"
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Game Title</label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value as GameTitle)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Valorant">Valorant</option>
                <option value="CS2">CS2</option>
                <option value="League of Legends">League of Legends</option>
                <option value="Rocket League">Rocket League</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Format</label>
              <input
                type="text"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Min Pressure Index</label>
              <input
                type="number"
                min={50}
                max={95}
                value={minPressureIndex}
                onChange={(e) => setMinPressureIndex(Number(e.target.value))}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm font-mono-num text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Min Rank</label>
              <input
                type="text"
                value={minRank}
                onChange={(e) => setMinRank(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Prize Pool / Contract Slots</label>
              <input
                type="text"
                value={prizeOrSlots}
                onChange={(e) => setPrizeOrSlots(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md"
            >
              Publish Tournament
            </button>
          </div>
        </form>
      )}

      {/* Tournament List */}
      {filteredTournaments.length === 0 ? (
        <div className="border border-slate-800 rounded-lg bg-[#111827] p-10 text-center text-sm text-slate-400">
          No tournaments match this view yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTournaments.map((t) => {
            const registered = players.filter((p) => t.registeredPlayerIds.includes(p.id));
            const eligibleToAdd = players.filter(
              (p) => p.game === t.game && !t.registeredPlayerIds.includes(p.id)
            );

            return (
              <div key={t.id} className="border border-slate-800 rounded-lg bg-[#111827] p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
                      <span>{t.game}</span>
                      <span>·</span>
                      <span>{t.format}</span>
                      <span>·</span>
                      <span className={t.hostType === 'VR1' ? 'text-blue-400' : 'text-slate-300'}>
                        Hosted by {t.organizer} ({t.hostType === 'VR1' ? 'VR1 Member' : 'Organization'})
                      </span>
                      <span>·</span>
                      <span
                        className={
                          t.status === 'Open Registration'
                            ? 'text-blue-400 font-medium'
                            : t.status === 'In Progress'
                            ? 'text-emerald-400 font-medium'
                            : 'text-slate-400'
                        }
                      >
                        {t.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-50">{t.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {t.startDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5" />
                        {t.prizeOrSlots}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Min Rank: {t.minRank} · Min Pressure:{' '}
                        <span className="font-mono-num text-slate-200">{t.minPressureIndex}</span>
                      </span>
                      {t.winnerOrg && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <Award className="w-3.5 h-3.5" />
                          Winner: {t.winnerOrg}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {t.status !== 'Completed' && eligibleToAdd.length > 0 && (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onAssignPlayer(t.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="" disabled>
                          Enroll {t.game} prospect...
                        </option>
                        {eligibleToAdd.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.handle} (PI {p.pressureIndex})
                          </option>
                        ))}
                      </select>
                    )}

                    {canHost && t.status !== 'Completed' && (
                      <button
                        onClick={() => onRecordWinner(t.id, orgName)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/50 rounded-md transition-colors whitespace-nowrap"
                      >
                        Mark Won ({orgName})
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      Enrolled Scouted Prospects ({registered.length})
                    </div>
                    {registered.length === 0 ? (
                      <div className="text-xs text-slate-500">No prospects enrolled yet.</div>
                    ) : (
                      <div className="space-y-1.5 text-xs">
                        {registered.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-slate-200">
                            <span>
                              {p.handle} <span className="text-slate-500">· {p.role}</span>
                            </span>
                            <span className="font-mono-num text-emerald-400">PI {p.pressureIndex}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 lg:border-l lg:border-slate-800 lg:pl-6">
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      Bracket & Match Schedule
                    </div>
                    {t.matches.length === 0 ? (
                      <div className="text-xs text-slate-500">
                        Bracket seeding will lock 24 hours before start date.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/70 text-xs">
                        {t.matches.map((m) => (
                          <div key={m.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-slate-400 mr-2">{m.round}</span>
                              <span className="text-slate-100 font-medium">{m.teamA}</span>
                              <span className="text-slate-500 mx-1.5">vs</span>
                              <span className="text-slate-100 font-medium">{m.teamB}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 font-mono-num">
                              <span>{m.map}</span>
                              <span className="text-slate-200">{m.score}</span>
                              <span>{m.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
