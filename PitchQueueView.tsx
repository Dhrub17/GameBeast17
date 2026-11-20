import React from 'react';
import { ShieldCheck, MessageSquare, Trash2 } from 'lucide-react';
import { Player } from '../types';

interface PitchQueueViewProps {
  players: Player[];
  onRemoveFromPitch: (playerId: string) => void;
  onMessagePlayer: (player: Player) => void;
}

export const PitchQueueView: React.FC<PitchQueueViewProps> = ({
  players,
  onRemoveFromPitch,
  onMessagePlayer,
}) => {
  const pitchedPlayers = players.filter((p) => p.pitchStatus === 'Pitched');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">Scouter Pitch Queue</h2>
        <p className="text-xs text-slate-400 mt-1">
          Prospects formally pitched to organization scouters based on verified rank, Pressure Index, Stack Calc, and multi-season trends.
        </p>
      </div>

      {pitchedPlayers.length === 0 ? (
        <div className="border border-slate-800 rounded-lg bg-[#111827] p-10 text-center">
          <p className="text-sm text-slate-300">No players have been pitched to scouters yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate prospects in the Scouting Roster or Pressure & Stack Lab to pitch them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pitchedPlayers.map((player) => (
            <div
              key={player.id}
              className="border border-slate-800 rounded-lg bg-[#111827] p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{player.game}</span>
                  <span>·</span>
                  <span>{player.role}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {player.rank}
                  </span>
                  {player.pitchedAt && (
                    <>
                      <span>·</span>
                      <span className="font-mono-num">Pitched {player.pitchedAt}</span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-50">
                  {player.handle}{' '}
                  <span className="text-sm font-normal text-slate-400">({player.realName})</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {player.pitchNotes || 'Recommended for organization scouting review.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 shrink-0">
                <div className="grid grid-cols-3 gap-5 text-right font-mono-num">
                  <div>
                    <div className="text-[11px] text-slate-400">Pressure</div>
                    <div className="text-base font-semibold text-emerald-400">
                      {player.pressureIndex.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Stack</div>
                    <div className="text-base font-semibold text-slate-100">
                      {player.stackScore.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Events</div>
                    <div className="text-base font-semibold text-slate-100">
                      {player.tournamentsPlayed}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-800 pl-5">
                  <button
                    onClick={() => onMessagePlayer(player)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </button>
                  <button
                    onClick={() => onRemoveFromPitch(player.id)}
                    aria-label={`Remove ${player.handle} from pitch queue`}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
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
  );
};
