import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MessageSquare,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Player, GameTitle } from '../types';

interface ScoutingRosterProps {
  players: Player[];
  onVerifyRank: (playerId: string) => void;
  onPitchPlayer: (playerId: string, notes: string) => void;
  onOpenLab: (playerId: string) => void;
  onMessagePlayer: (player: Player) => void;
}

const GAMES: Array<'All' | GameTitle> = [
  'All',
  'Valorant',
  'CS2',
  'League of Legends',
  'Rocket League',
];

export const ScoutingRoster: React.FC<ScoutingRosterProps> = ({
  players,
  onVerifyRank,
  onPitchPlayer,
  onOpenLab,
  onMessagePlayer,
}) => {
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<'All' | GameTitle>('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [pitchNoteDraft, setPitchNoteDraft] = useState('');

  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.handle.toLowerCase().includes(search.toLowerCase()) ||
      p.realName.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const matchesGame = gameFilter === 'All' || p.game === gameFilter;
    const matchesVerified = !verifiedOnly || p.verificationStatus === 'Verified';
    return matchesSearch && matchesGame && matchesVerified;
  });

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  const handleOpenDetail = (player: Player) => {
    setSelectedPlayerId(player.id);
    setPitchNoteDraft(player.pitchNotes ?? '');
  };

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg">
          {GAMES.map((g) => (
            <button
              key={g}
              onClick={() => setGameFilter(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                gameFilter === g
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handle, name, role..."
              className="bg-[#111827] border border-slate-800 rounded-md pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-60"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-slate-700 bg-[#111827] text-blue-600 focus:ring-blue-500"
            />
            Verified ranks only
          </label>
        </div>
      </div>

      {/* Main Scouting Data Grid */}
      <div className="border border-slate-800 rounded-lg bg-[#111827] overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-300">No players match your current filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setGameFilter('All');
                setVerifiedOnly(false);
              }}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-3 px-5 font-medium">Prospect</th>
                  <th className="py-3 px-4 font-medium">Game / Role</th>
                  <th className="py-3 px-4 font-medium">Rank Verification</th>
                  <th className="py-3 px-4 font-medium text-right">K/D</th>
                  <th className="py-3 px-4 font-medium text-right">Pressure</th>
                  <th className="py-3 px-4 font-medium text-right">Stack Calc</th>
                  <th className="py-3 px-4 font-medium text-right">Tournaments</th>
                  <th className="py-3 px-5 font-medium text-right">Pitch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredPlayers.map((player) => (
                  <tr
                    key={player.id}
                    onClick={() => handleOpenDetail(player)}
                    className={`cursor-pointer transition-colors ${
                      selectedPlayerId === player.id
                        ? 'bg-slate-800/60'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-100">{player.handle}</div>
                      <div className="text-xs text-slate-400">
                        {player.realName} · {player.region} · {player.age}y
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{player.game}</div>
                      <div className="text-xs text-slate-400">{player.role}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-200">{player.rank}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                        {player.verificationStatus === 'Verified' && (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified · {player.verifiedAt}
                          </span>
                        )}
                        {player.verificationStatus === 'Pending' && (
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            Pending check
                          </span>
                        )}
                        {player.verificationStatus === 'Unverified' && (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-300">
                      {player.kd.toFixed(2)}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono-num font-medium ${
                        player.pressureIndex >= 78
                          ? 'text-emerald-400'
                          : player.pressureIndex >= 70
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {player.pressureIndex.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-200">
                      {player.stackScore.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-300">
                      {player.tournamentsPlayed}
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs font-medium">
                      <span
                        className={
                          player.pitchStatus === 'Pitched'
                            ? 'text-emerald-400'
                            : player.pitchStatus === 'Ready to Pitch'
                            ? 'text-blue-400'
                            : player.pitchStatus === 'Under Review'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }
                      >
                        {player.pitchStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Player Dossier Drawer */}
      {selectedPlayer && (
        <div className="border border-slate-800 rounded-lg bg-[#111827] p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-slate-50">{selectedPlayer.handle}</h3>
                <span className="text-xs text-slate-400">
                  {selectedPlayer.realName} · {selectedPlayer.game} · {selectedPlayer.role}
                </span>
              </div>
              <div className="mt-1.5 text-xs text-slate-400">
                Account: <span className="font-mono-num text-slate-200">{selectedPlayer.rankAccount}</span> ·{' '}
                Rank: <span className="text-slate-200">{selectedPlayer.rank}</span> ·{' '}
                Status:{' '}
                <span
                  className={
                    selectedPlayer.verificationStatus === 'Verified'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }
                >
                  {selectedPlayer.verificationStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedPlayer.verificationStatus !== 'Verified' && (
                <button
                  onClick={() => onVerifyRank(selectedPlayer.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/50 rounded-md transition-colors whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verify Rank Now
                </button>
              )}
              <button
                onClick={() => onOpenLab(selectedPlayer.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Pressure & Stack Lab
              </button>
              <button
                onClick={() => onMessagePlayer(selectedPlayer)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </button>
              <button
                onClick={() => setSelectedPlayerId(null)}
                aria-label="Close dossier"
                className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pressure Breakdown */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h4 className="text-sm font-medium text-slate-200">Pressure Breakdown</h4>
                <span className="font-mono-num text-sm font-semibold text-blue-400">
                  {selectedPlayer.pressureIndex.toFixed(1)} / 100
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  ['1vX Clutch Conversion', selectedPlayer.pressureMetrics.clutchConversion],
                  ['Overtime Consistency', selectedPlayer.pressureMetrics.overtimeDelta],
                  ['LAN Rating Retention', selectedPlayer.pressureMetrics.lanRetention],
                  ['Elimination Match Impact', selectedPlayer.pressureMetrics.eliminationImpact],
                  ['Comms Composure', selectedPlayer.pressureMetrics.commsComposure],
                  ['Mistake Recovery', selectedPlayer.pressureMetrics.mistakeRecovery],
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
            </div>

            {/* Stack Calc & Tournament History */}
            <div className="space-y-5">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-200">Stack Calculator</h4>
                  <span className="font-mono-num text-sm font-semibold text-emerald-400">
                    {selectedPlayer.stackScore.toFixed(1)} / 100
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center border border-slate-800 rounded-md p-3 bg-[#0b0f17]">
                  <div>
                    <div className="text-[11px] text-slate-400">Solo WR</div>
                    <div className="font-mono-num text-sm text-slate-200 mt-0.5">
                      {selectedPlayer.stackMetrics.soloWinRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Duo/Trio</div>
                    <div className="font-mono-num text-sm text-slate-200 mt-0.5">
                      {selectedPlayer.stackMetrics.duoTrioWinRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">5-Stack WR</div>
                    <div className="font-mono-num text-sm text-emerald-400 font-medium mt-0.5">
                      {selectedPlayer.stackMetrics.fullStackWinRate}%
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-200 mb-2">
                  Recent Tournaments ({selectedPlayer.tournamentsPlayed} total)
                </h4>
                <div className="space-y-2">
                  {selectedPlayer.recentEvents.map((ev) => (
                    <div
                      key={ev.name}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/70 last:border-0"
                    >
                      <div>
                        <div className="text-slate-200">{ev.name}</div>
                        <div className="text-slate-400">
                          {ev.date} · {ev.type}
                        </div>
                      </div>
                      <div className="text-right font-mono-num">
                        <div className="text-slate-100">{ev.placement}</div>
                        <div className="text-slate-400">PI {ev.pressureRating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pitch to Scouters Form */}
            <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-5 lg:pt-0 lg:pl-6">
              <div>
                <h4 className="text-sm font-medium text-slate-200 mb-1">
                  Pitch to Scouters
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Attach scouting notes before forwarding {selectedPlayer.handle} to the organization’s scouting committee.
                </p>
                <textarea
                  rows={4}
                  value={pitchNoteDraft}
                  onChange={(e) => setPitchNoteDraft(e.target.value)}
                  placeholder="Note clutch composure, comms clarity, or trial map priorities..."
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-md p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                {selectedPlayer.pitchStatus === 'Pitched' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Pitched {selectedPlayer.pitchedAt ? `on ${selectedPlayer.pitchedAt}` : ''}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Current: {selectedPlayer.pitchStatus}
                  </span>
                )}
                <button
                  onClick={() =>
                    onPitchPlayer(
                      selectedPlayer.id,
                      pitchNoteDraft.trim() ||
                        `Evaluated at Pressure ${selectedPlayer.pressureIndex} and Stack ${selectedPlayer.stackScore}.`
                    )
                  }
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
                >
                  {selectedPlayer.pitchStatus === 'Pitched' ? 'Update Pitch' : 'Pitch to Scouters'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
