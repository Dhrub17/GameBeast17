import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw, Save } from 'lucide-react';
import { Player, OrgCriteria, PressureMetrics, StackMetrics } from '../types';
import { calculatePressureIndex, calculateStackScore } from '../data/mockData';

interface PressureStackLabProps {
  players: Player[];
  initialPlayerId: string | null;
  criteria: OrgCriteria;
  onUpdateCriteria: (next: OrgCriteria) => void;
  onSaveEvaluation: (
    playerId: string,
    pressureMetrics: PressureMetrics,
    stackMetrics: StackMetrics,
    tournamentsPlayed: number
  ) => void;
  onPitchPlayer: (playerId: string, notes: string) => void;
}

export const PressureStackLab: React.FC<PressureStackLabProps> = ({
  players,
  initialPlayerId,
  criteria,
  onUpdateCriteria,
  onSaveEvaluation,
  onPitchPlayer,
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialPlayerId ?? players[0]?.id ?? '');
  const activePlayer = players.find((p) => p.id === selectedId) ?? players[0];

  const [pressure, setPressure] = useState<PressureMetrics>(activePlayer.pressureMetrics);
  const [stack, setStack] = useState<StackMetrics>(activePlayer.stackMetrics);
  const [tournamentsPlayed, setTournamentsPlayed] = useState<number>(activePlayer.tournamentsPlayed);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (initialPlayerId) {
      setSelectedId(initialPlayerId);
    }
  }, [initialPlayerId]);

  useEffect(() => {
    if (activePlayer) {
      setPressure(activePlayer.pressureMetrics);
      setStack(activePlayer.stackMetrics);
      setTournamentsPlayed(activePlayer.tournamentsPlayed);
      setSavedFeedback(false);
    }
  }, [activePlayer?.id]);

  const livePressureIndex = calculatePressureIndex(pressure);
  const liveStackScore = calculateStackScore(stack);
  const stackLift = stack.fullStackWinRate - stack.soloWinRate;

  const passesPressure = livePressureIndex >= criteria.minPressureIndex;
  const passesStack = liveStackScore >= criteria.minStackScore;
  const passesTournaments = tournamentsPlayed >= criteria.minTournaments;
  const passesRank = !criteria.requireVerifiedRank || activePlayer.verificationStatus === 'Verified';
  const isPitchReady = passesPressure && passesStack && passesTournaments && passesRank;

  const handleSave = () => {
    onSaveEvaluation(activePlayer.id, pressure, stack, tournamentsPlayed);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Live Verdict Bar */}
      <div className="border border-slate-800 rounded-lg bg-[#111827] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="lab-player-select" className="block text-xs text-slate-400 mb-1">
              Evaluating Prospect
            </label>
            <select
              id="lab-player-select"
              value={activePlayer.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.handle} · {p.game} ({p.role})
                </option>
              ))}
            </select>
          </div>
          <div className="pl-2 border-l border-slate-800">
            <div className="text-xs text-slate-400">Live Pressure Index</div>
            <div
              className={`text-2xl font-semibold font-mono-num ${
                passesPressure ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {livePressureIndex.toFixed(1)}
            </div>
          </div>
          <div className="pl-4 border-l border-slate-800">
            <div className="text-xs text-slate-400">Live Stack Score</div>
            <div
              className={`text-2xl font-semibold font-mono-num ${
                passesStack ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {liveStackScore.toFixed(1)}
            </div>
          </div>
          <div className="pl-4 border-l border-slate-800">
            <div className="text-xs text-slate-400">5-Stack Lift</div>
            <div
              className={`text-2xl font-semibold font-mono-num ${
                stackLift >= 0 ? 'text-blue-400' : 'text-red-400'
              }`}
            >
              {stackLift >= 0 ? `+${stackLift}%` : `${stackLift}%`}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setPressure(activePlayer.pressureMetrics);
              setStack(activePlayer.stackMetrics);
              setTournamentsPlayed(activePlayer.tournamentsPlayed);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-100 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            {savedFeedback ? 'Saved' : 'Save to Profile'}
          </button>
          <button
            onClick={() => {
              handleSave();
              onPitchPlayer(
                activePlayer.id,
                `Lab verified: Pressure ${livePressureIndex.toFixed(1)}, Stack ${liveStackScore.toFixed(1)}, ${tournamentsPlayed} tournaments.`
              );
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
          >
            Pitch to Scouters
          </button>
        </div>
      </div>

      {/* Two Calculators Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pressure Calculator */}
        <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-50">
              High-Stakes Pressure Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Measures consistency in clutch rounds, overtime, LAN environments, and elimination series beyond raw K/D.
            </p>
          </div>

          <div className="space-y-4">
            {(
              [
                ['clutchConversion', '1vX Clutch Conversion Rate', '22% weight'],
                ['lanRetention', 'LAN vs. Online Rating Retention', '20% weight'],
                ['eliminationImpact', 'Elimination Match Impact', '18% weight'],
                ['overtimeDelta', 'Overtime Composure & Consistency', '16% weight'],
                ['commsComposure', 'Voice Comms Composure (Coach Score)', '12% weight'],
                ['mistakeRecovery', 'Post-Mistake Next-Round Recovery', '12% weight'],
              ] as const
            ).map(([key, label, weight]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-200">{label}</span>
                  <span className="font-mono-num text-slate-300">
                    {pressure[key]} <span className="text-slate-500">· {weight}</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={pressure[key]}
                  onChange={(e) =>
                    setPressure((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Stack Calculator & Tournament Volume */}
        <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-50">
              Stack Calculator & Tournament Volume
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Separates solo-queue pubstompers from structured 5-stack team players with verified tournament reps.
            </p>
          </div>

          <div className="space-y-4">
            {(
              [
                ['soloWinRate', 'Solo Queue Win Rate (%)'],
                ['duoTrioWinRate', 'Duo / Trio Queue Win Rate (%)'],
                ['fullStackWinRate', 'Full 5-Stack / Scrim Win Rate (%)'],
                ['tradeEfficiency', 'Team Trade Efficiency'],
                ['utilityAssistScore', 'Utility & Assist Contribution'],
                ['roleFlexibility', 'Role & Agent/Map Flexibility'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-200">{label}</span>
                  <span className="font-mono-num text-slate-300">{stack[key]}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={stack[key]}
                  onChange={(e) =>
                    setStack((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            ))}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <label htmlFor="tournaments-input" className="text-xs text-slate-200">
                Verified Tournaments Played
              </label>
              <input
                id="tournaments-input"
                type="number"
                min={0}
                max={200}
                value={tournamentsPlayed}
                onChange={(e) => setTournamentsPlayed(Math.max(0, Number(e.target.value)))}
                className="w-24 bg-[#0b0f17] border border-slate-700 rounded-md px-3 py-1.5 text-sm font-mono-num text-slate-100 text-right focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Org Criteria Configuration & Verdict */}
      <section className="border border-slate-800 rounded-lg bg-[#111827] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-50">
              Organization Scouting Criteria & Pitch Verdict
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your organization’s minimum benchmarks to automatically determine pitch eligibility.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            {isPitchReady ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Recommended to Pitch
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Below Org Threshold
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5">
              Min Pressure Index ({criteria.minPressureIndex})
            </label>
            <input
              type="range"
              min={50}
              max={95}
              value={criteria.minPressureIndex}
              onChange={(e) =>
                onUpdateCriteria({ ...criteria, minPressureIndex: Number(e.target.value) })
              }
              className="w-full accent-blue-500"
            />
            <div className={`mt-1 ${passesPressure ? 'text-emerald-400' : 'text-red-400'}`}>
              {passesPressure ? 'Passed' : 'Not met'}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">
              Min Stack Score ({criteria.minStackScore})
            </label>
            <input
              type="range"
              min={50}
              max={95}
              value={criteria.minStackScore}
              onChange={(e) =>
                onUpdateCriteria({ ...criteria, minStackScore: Number(e.target.value) })
              }
              className="w-full accent-blue-500"
            />
            <div className={`mt-1 ${passesStack ? 'text-emerald-400' : 'text-red-400'}`}>
              {passesStack ? 'Passed' : 'Not met'}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">
              Min Tournaments ({criteria.minTournaments})
            </label>
            <input
              type="range"
              min={1}
              max={40}
              value={criteria.minTournaments}
              onChange={(e) =>
                onUpdateCriteria({ ...criteria, minTournaments: Number(e.target.value) })
              }
              className="w-full accent-blue-500"
            />
            <div className={`mt-1 ${passesTournaments ? 'text-emerald-400' : 'text-red-400'}`}>
              {passesTournaments ? 'Passed' : 'Not met'}
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <label className="inline-flex items-center gap-2 text-slate-200 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={criteria.requireVerifiedRank}
                onChange={(e) =>
                  onUpdateCriteria({ ...criteria, requireVerifiedRank: e.target.checked })
                }
                className="rounded border-slate-700 bg-[#0b0f17] text-blue-600"
              />
              Require Verified Rank
            </label>
            <div className={`mt-1 ${passesRank ? 'text-emerald-400' : 'text-red-400'}`}>
              {passesRank ? 'Rank check passed' : 'Rank verification required'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
