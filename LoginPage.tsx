import React, { useState } from 'react';
import { User, Building2, ShieldCheck, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { AuthSession, Player } from '../types';
import { ISSUED_ORG_ACCOUNTS } from '../data/mockData';

interface LoginPageProps {
  players: Player[];
  onLogin: (session: AuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ players, onLogin }) => {
  // Player login state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id ?? '');
  const [playerPasscode, setPlayerPasscode] = useState('player-access');
  const [playerError, setPlayerError] = useState('');

  // Organization / VR1 login state
  const [orgIdInput, setOrgIdInput] = useState('ORG-VGD-2026');
  const [orgPasscode, setOrgPasscode] = useState('org-verified');
  const [orgError, setOrgError] = useState('');

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player = players.find((p) => p.id === selectedPlayerId);
    if (!player) {
      setPlayerError('Please select a valid player account.');
      return;
    }
    if (!playerPasscode.trim()) {
      setPlayerError('Enter your player passcode to continue.');
      return;
    }
    setPlayerError('');
    onLogin({
      role: 'player',
      displayName: player.handle,
      subtitle: `${player.realName} · ${player.game}`,
      playerId: player.id,
    });
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = orgIdInput.trim().toUpperCase();
    const matched = ISSUED_ORG_ACCOUNTS.find((acc) => acc.orgId.toUpperCase() === normalized);
    if (!matched) {
      setOrgError(
        'Unrecognized Organization ID. Enter a valid issued ID (e.g. ORG-VGD-2026, ORG-HLS-2026, or VR1-HQ-001).'
      );
      return;
    }
    if (!orgPasscode.trim()) {
      setOrgError('Enter your organization access passcode.');
      return;
    }
    setOrgError('');
    onLogin({
      role: matched.role,
      displayName: matched.managerName,
      subtitle: `${matched.managerTitle} · ${matched.name}`,
      orgId: matched.orgId,
      orgName: matched.name,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-50 flex flex-col">
      {/* Minimal Header */}
      <header className="h-16 px-6 lg:px-10 border-b border-slate-800 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap">
          ClutchLine
        </span>
        <span className="text-xs text-slate-400">
          VR1 Esports Scouting & Tournament Platform
        </span>
      </header>

      {/* Centered Two-Section Portal */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-5xl space-y-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
              Sign in to ClutchLine
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Select your portal below. Players access their personal stats, upcoming tournaments, coach comments, and pitch plans. Organizations and VR1 members sign in with an issued ID to scout rosters and host tournaments.
            </p>
          </div>

          {/* Two Distinct Sections Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Section 1: Player / User Login */}
            <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center text-slate-200 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-50">Player / User Portal</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Personal stats, upcoming tournaments, comments & pitch plan
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePlayerSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="player-select" className="block text-xs text-slate-300 mb-1.5">
                      Player Account
                    </label>
                    <select
                      id="player-select"
                      value={selectedPlayerId}
                      onChange={(e) => {
                        setSelectedPlayerId(e.target.value);
                        setPlayerError('');
                      }}
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.handle} ({p.game} · {p.rank})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="player-pass" className="block text-xs text-slate-300 mb-1.5">
                      Password
                    </label>
                    <input
                      id="player-pass"
                      type="password"
                      value={playerPasscode}
                      onChange={(e) => {
                        setPlayerPasscode(e.target.value);
                        setPlayerError('');
                      }}
                      placeholder="Enter your password"
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {playerError && (
                    <div className="flex items-start gap-2 text-xs text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{playerError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
                  >
                    Sign In as Player
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="font-medium text-slate-300">User Space Permissions</div>
                <p className="leading-relaxed">
                  View upcoming events, track multi-season Pressure & Stack stats, manage your pitch plan, and reply to scout comments. Tournament hosting is restricted to VR1 members and verified organizations.
                </p>
              </div>
            </section>

            {/* Section 2: Organization & VR1 Member Login */}
            <section className="border border-slate-800 rounded-lg bg-[#111827] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-50">
                      Organization & VR1 Portal
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Host tournaments, scout top performers & track org wins
                    </p>
                  </div>
                </div>

                <form onSubmit={handleOrgSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="org-id-input" className="block text-xs text-slate-300 mb-1.5">
                      Issued Organization / VR1 ID
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="org-id-input"
                        type="text"
                        value={orgIdInput}
                        onChange={(e) => {
                          setOrgIdInput(e.target.value);
                          setOrgError('');
                        }}
                        placeholder="e.g. ORG-VGD-2026 or VR1-HQ-001"
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-md pl-10 pr-3.5 py-2.5 text-sm font-mono-num text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="org-pass" className="block text-xs text-slate-300 mb-1.5">
                      Access Passcode
                    </label>
                    <input
                      id="org-pass"
                      type="password"
                      value={orgPasscode}
                      onChange={(e) => {
                        setOrgPasscode(e.target.value);
                        setOrgError('');
                      }}
                      placeholder="Enter organization passcode"
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-md px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {orgError && (
                    <div className="flex items-start gap-2 text-xs text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{orgError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                  >
                    Sign In with Issued ID
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Issued IDs (Click to autofill)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ISSUED_ORG_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.orgId}
                      type="button"
                      onClick={() => {
                        setOrgIdInput(acc.orgId);
                        setOrgError('');
                      }}
                      className={`text-left p-2.5 rounded-md border transition-colors ${
                        orgIdInput.trim().toUpperCase() === acc.orgId
                          ? 'border-blue-500 bg-blue-950/30'
                          : 'border-slate-800 bg-[#0b0f17] hover:border-slate-700'
                      }`}
                    >
                      <div className="font-mono-num text-xs font-medium text-slate-100">
                        {acc.orgId}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {acc.role === 'vr1' ? 'VR1 Member' : acc.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
