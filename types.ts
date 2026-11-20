export type GameTitle = 'Valorant' | 'CS2' | 'League of Legends' | 'Rocket League';

export type VerificationStatus = 'Verified' | 'Pending' | 'Unverified';

export type PitchStatus = 'Ready to Pitch' | 'Pitched' | 'Under Review' | 'Needs Data';

export type AuthRole = 'player' | 'organization' | 'vr1';

export interface AuthSession {
  role: AuthRole;
  displayName: string;
  subtitle: string;
  orgId?: string;
  orgName?: string;
  playerId?: string;
}

export interface IssuedOrgAccount {
  orgId: string;
  name: string;
  role: 'organization' | 'vr1';
  managerName: string;
  managerTitle: string;
  region: string;
}

export type NavSection =
  | 'overview'
  | 'scouting'
  | 'calculator'
  | 'tournaments'
  | 'comms'
  | 'pitch-queue';

export type PlayerNavSection =
  | 'my-stats'
  | 'upcoming-tournaments'
  | 'plan-pitch'
  | 'comments';

export interface SeasonStat {
  season: string;
  kd: number;
  pressureIndex: number;
  stackScore: number;
  tournaments: number;
  impactRating: number;
}

export interface PressureMetrics {
  clutchConversion: number; // 0-100 (%)
  overtimeDelta: number; // 0-100 (normalized consistency in OT)
  lanRetention: number; // 0-100 (% of online rating retained on LAN)
  eliminationImpact: number; // 0-100 (impact in elimination matches)
  commsComposure: number; // 0-100 (coach/scout composure rating)
  mistakeRecovery: number; // 0-100 (next-round bounce-back rate)
}

export interface StackMetrics {
  soloWinRate: number; // %
  duoTrioWinRate: number; // %
  fullStackWinRate: number; // %
  tradeEfficiency: number; // 0-100
  utilityAssistScore: number; // 0-100
  roleFlexibility: number; // 0-100
}

export interface TournamentRecord {
  name: string;
  date: string;
  placement: string;
  type: 'LAN' | 'Online';
  pressureRating: number;
}

export interface ScoutComment {
  id: string;
  author: string;
  authorRole: string;
  date: string;
  category: 'Pressure Review' | 'Match Plan' | 'Scouting Note';
  text: string;
}

export interface Player {
  id: string;
  handle: string;
  realName: string;
  region: string;
  age: number;
  game: GameTitle;
  role: string;
  rank: string;
  rankAccount: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string;
  kd: number;
  tournamentsPlayed: number;
  lanCount: number;
  top3Finishes: number;
  avgPlacement: number;
  pressureMetrics: PressureMetrics;
  pressureIndex: number;
  stackMetrics: StackMetrics;
  stackScore: number;
  pitchStatus: PitchStatus;
  pitchNotes?: string;
  playerPitchStatement?: string;
  pitchedAt?: string;
  seasons: SeasonStat[];
  recentEvents: TournamentRecord[];
  scoutComments: ScoutComment[];
}

export interface TournamentMatch {
  id: string;
  round: string;
  teamA: string;
  teamB: string;
  score: string;
  time: string;
  map: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: GameTitle;
  format: string;
  startDate: string;
  status: 'Open Registration' | 'In Progress' | 'Completed';
  minRank: string;
  minPressureIndex: number;
  prizeOrSlots: string;
  organizer: string;
  hostType: 'Organization' | 'VR1';
  winnerOrg?: string;
  registeredPlayerIds: string[];
  matches: TournamentMatch[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  timestamp: string;
  text: string;
}

export interface MatchPlanMeta {
  opponent: string;
  mapPool: string[];
  scheduledTime: string;
  objective: string;
}

export interface MessageChannel {
  id: string;
  name: string;
  type: 'Direct' | 'Scouting' | 'Match Plan';
  subtitle: string;
  linkedPlayerId?: string;
  matchMeta?: MatchPlanMeta;
  messages: ChatMessage[];
}

export interface OrgCriteria {
  minPressureIndex: number;
  minStackScore: number;
  minTournaments: number;
  requireVerifiedRank: boolean;
}
