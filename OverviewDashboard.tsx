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
import { ArrowUpRight, CheckCircle2, ShieldCheck, SlidersHorizontal, Trophy } from 'lucide-react';
import { Player, Tournament, OrgCriteria, NavSection, AuthSession } from '../types';

interface OverviewDashboardProps {
  session: AuthSession;
  players: Player[];
  tournaments: Tournament[];
  criteria: OrgCriteria;
  onNavigate: (section: NavSection) => void;
  onSelectPlayerForLab: (playerId: string) => void;
  onPitchPlayer: (playerId: string, notes: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  session,
  players,
  tournaments,
  criteria,
  onNavigate,
  onSelectPlayerForLab,
  onPitchPlayer,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id ?? '');
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? players[0];

  const orgName = session.orgName ?? 'Vanguard Esports';
  const isVR1 = session.role === 'vr1';

  const verifiedCount = players.filter((p) => p.verificationStatus === 'Verified').length;
  const holdingTournaments = tournaments.filter(
    (t) => t.status !== 'Completed' && (isVR1 ? true : t.organizer === orgName)
  );
  const wonTournaments = tournaments.filter((t) =>
    isVR1 ? t.status === 'Completed' && Boolean(t.winnerOrg) : t.winnerOrg === orgName
  );
  const topPerformers = [...players].sort(
    (a, b) => b.pressureIndex * 0.6 + b.stackScore * 0.4 - (a.pressureIndex * 0.6 + a.stackScore * 0.4)
  );

  const eligibleProspects = players
    .filter(
      (p) =>
        p.pressureIndex >= criteria.minPressureIndex &&
        p.stackScore >= criteria.minStackScore &&
        p.tournamentsPlayed >= criteria.minTournaments &&
        (!criteria.requireVerifiedRank || p.verificationStatus === 'Verified')
    )
    .sort((a, b) => b.pressureIndex - a.pressureIndex);

  return (
    <div className="space-y-8">
      {/* KPI Strip — Best Players, Tournaments Holding, Tournaments Won, Verified Prospects */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-800 rounded-lg bg-[#111827] divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
        <div className="p-5">
          <div className="text-xs text-slate-400">Top Performing Player</div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-xl font-semibold text-slate-50 truncate">
              {topPerformers[0]?.handle ?? '—'}
            </span>
            <span className="text-xs font-mono-num text-emerald-400 shrink-0">
              PI {topPerformers[0]?.pressureIndex.toFixed(1) ?? '0.0'}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-slate-400">
            {isVR1 ? 'Active Events Held' : 'Tournaments Holding'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono-num text-slate-50">
              {holdingTournaments.length}
            </span>
            <button
              onClick={() => onNavigate('tournaments')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              Manage →
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-slate-400">
            {isVR1 ? 'Completed Championships' : 'Tournaments Won'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono-num text-emerald-400">
              {wonTournaments.length}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[120px]">
              {isVR1 ? 'Verified finals' : orgName}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-slate-400">Verified Prospects</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono-num text-slate-50">
              {verifiedCount} / {players.length}
            </span>
            <button
              onClick={() => onNavigate('pitch-queue')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              Pitch Queue →
            </button>
          </div>
        </div>
      </section>

      {/* Tournaments Holding & Won Snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-800 rounded-lg bg-[#111827] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-50">
                {isVR1 ? 'Active Tournaments Held' : `Tournaments Holding (${orgName})`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upcoming and in-progress scouting events you are hosting
              </p>
            </div>
            <button
              onClick={() => onNavigate('tournaments')}
              className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap"
            >
              Host / View All →
            </button>
          </div>
          {holdingTournaments.length === 0 ? (
            <p className="pt-5 text-xs text-slate-400">
              No active tournaments hosted under {orgName}. Use Host Tournament to launch one.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/70 mt-2">
              {holdingTournaments.map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="text-sm font-medium text-slate-100">{t.name}</div>
                    <div className="text-slate-400 mt-0.5">
                      {t.game} · {t.startDate} · Min PI {t.minPressureIndex}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-blue-400 font-medium">{t.status}</div>
                    <div className="text-slate-400 font-mono-num mt-0.5">
                      {t.registeredPlayerIds.length} enrolled
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-slate-800 rounded-lg bg-[#111827] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-50">
                {isVR1 ? 'Recent Tournament Winners' : `Tournaments Won (${orgName})`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified championship titles and completed finals record
              </p>
            </div>
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          {wonTournaments.length === 0 ? (
            <p className="pt-5 text-xs text-slate-400">
              No completed tournament wins recorded for {orgName} yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/70 mt-2">
              {wonTournaments.map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="text-sm font-medium text-slate-100">{t.name}</div>
                    <div className="text-slate-400 mt-0.5">
                      {t.game} · {t.startDate} · Hosted by {t.organizer}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-emerald-400 font-medium">
                      Winner: {t.winnerOrg}
                    </div>
                    <div className="text-slate-400 mt-0.5">{t.prizeOrSlots}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Multi-Season Performance Trends */}
      <section className="border border-slate-800 rounded-lg bg-[#111827] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Multi-Season Performance Trends
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Track individual Pressure Index, Stack Synergy, and tournament output across Seasons 1–6.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="season-player-select" className="text-xs text-slate-400 whitespace-nowrap">
              Inspect Player
            </label>
            <select
              id="season-player-select"
              value={selectedPlayer?.id ?? ''}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.handle} · {p.game} ({p.role})
                </option>
              ))}
            </select>
            {selectedPlayer && (
              <button
                onClick={() => onSelectPlayerForLab(selectedPlayer.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Open in Lab
              </button>
            )}
          </div>
        </div>

        {selectedPlayer && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-slate-200">
                  {selectedPlayer.handle} — Pressure Index vs. Stack Score (S1–S6)
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
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedPlayer.seasons} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="season" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis domain={[45, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0b0f17',
                        borderColor: '#334155',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pressureIndex"
                      name="Pressure Index"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#3b82f6' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="stackScore"
                      name="Stack Score"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#10b981' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-6">
              <div>
                <div className="text-sm font-medium text-slate-200 mb-1">
                  Tournaments Played per Season
                </div>
                <div className="text-xs text-slate-400 mb-4">
                  Total: <span className="font-mono-num text-slate-200">{selectedPlayer.tournamentsPlayed}</span> events ·{' '}
                  <span className="font-mono-num text-slate-200">{selectedPlayer.lanCount}</span> LANs ·{' '}
                  <span className="font-mono-num text-slate-200">{selectedPlayer.top3Finishes}</span> Top-3
                </div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedPlayer.seasons} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
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

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  S6 K/D: <span className="font-mono-num text-slate-100">{selectedPlayer.kd.toFixed(2)}</span>
                </span>
                <span className="text-slate-400">
                  Avg Place: <span className="font-mono-num text-slate-100">#{selectedPlayer.avgPlacement.toFixed(1)}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Best Performing & Pitch-Eligible Players */}
      <section className="border border-slate-800 rounded-lg bg-[#111827] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Best Performing & Pitch-Eligible Players
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active Org Criteria: Pressure ≥ <span className="font-mono-num text-slate-200">{criteria.minPressureIndex}</span> · Stack ≥{' '}
              <span className="font-mono-num text-slate-200">{criteria.minStackScore}</span> · Tournaments ≥{' '}
              <span className="font-mono-num text-slate-200">{criteria.minTournaments}</span> · Verified Rank Required
            </p>
          </div>
          <button
            onClick={() => onNavigate('scouting')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap shrink-0"
          >
            Full Scouting Roster
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {eligibleProspects.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No prospects currently meet all organization thresholds. Adjust criteria in the Pressure & Stack Lab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-3 px-6 font-medium">Player</th>
                  <th className="py-3 px-4 font-medium">Game / Role</th>
                  <th className="py-3 px-4 font-medium">Rank</th>
                  <th className="py-3 px-4 font-medium text-right">Pressure</th>
                  <th className="py-3 px-4 font-medium text-right">Stack Calc</th>
                  <th className="py-3 px-4 font-medium text-right">Events</th>
                  <th className="py-3 px-6 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {eligibleProspects.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-slate-100">{player.handle}</div>
                      <div className="text-xs text-slate-400">
                        {player.realName} · {player.region}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {player.game} <span className="text-slate-500">·</span> {player.role}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {player.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-emerald-400 font-medium">
                      {player.pressureIndex.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-200">
                      {player.stackScore.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-300">
                      {player.tournamentsPlayed} ({player.lanCount} LAN)
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {player.pitchStatus === 'Pitched' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Pitched
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            onPitchPlayer(
                              player.id,
                              `Meets all org benchmarks (Pressure ${player.pressureIndex}, Stack ${player.stackScore}, ${player.tournamentsPlayed} events).`
                            )
                          }
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
                        >
                          Pitch to Scouters
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
