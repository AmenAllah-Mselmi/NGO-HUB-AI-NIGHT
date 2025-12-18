export const ObjectifDifficulty = {
  Extreme: 'Extreme',
  Hard: 'Hard',
  Medium: 'Medium',
  Basic: 'Basic',
} as const;
export type ObjectifDifficulty = (typeof ObjectifDifficulty)[keyof typeof ObjectifDifficulty];

export const FeaturesType = {
  Events: 'Events',
  Meetings: 'Meetings',
  Trainings: 'Trainings',
  Teams: 'teams',
  Votes: 'Votes',
  Tasks: 'Tasks',
  Projects: 'Projects',
  Strategies: 'Strategies',
  Subtasks: 'Subtasks',
  Comments: 'Comments',
  Replys: 'Replys',
  Emojis: 'Emojis',
  Activities: 'Activities',
  Board: 'Board',
  Culture: 'Culture',
  Pv: 'Pv',
  Objectif: 'Objectif',
  Members: 'Members',
  Guests: 'Guests',
  PastPresident: 'PastPresident',
} as const;
export type FeaturesType = (typeof FeaturesType)[keyof typeof FeaturesType];

export const GroupObjectif = {
  AttendanceCheck: 'AttendanceCheck',
  Modification: 'Modification',
  Interaction: 'Interaction',
  Decision: 'Decision',
  Contribution: 'Contribution',
  Exploration: 'Exploration',
} as const;
export type GroupObjectif = (typeof GroupObjectif)[keyof typeof GroupObjectif];

export const ObjectifActionType = {
  CheckIn: 'CheckIn',
  Create: 'Create',
  Update: 'Update',
  Delete: 'Delete',
  Attend: 'Attend',
  Join: 'Join',
  VoteIn: 'VoteIn',
  Send: 'Send',
  ReplyTo: 'ReplyTo',
  ReactTo: 'ReactTo',
  Discover: 'Discover',
} as const;
export type ObjectifActionType = (typeof ObjectifActionType)[keyof typeof ObjectifActionType];

export const PrivacyType = {
  Public: 'Public',
  Private: 'Private',
} as const;
export type PrivacyType = (typeof PrivacyType)[keyof typeof PrivacyType];

export const CibleType = {
  President: 'President',
  VPs: 'VPs',
  Members: 'Members',
  NewMembers: 'newMembers',
  Advisors: 'Advisors',
  Secretary: 'Secretary',
  CommittedMember: 'CommittedMember',
  Guests: 'Guests',
} as const;
export type CibleType = (typeof CibleType)[keyof typeof CibleType];

export interface Objectif {
  id: string;
  groupObjectif: GroupObjectif;
  objectifActionType: ObjectifActionType;
  privacy?: PrivacyType;
  cible: CibleType[];
  difficulty?: ObjectifDifficulty;
  feature: FeaturesType;
  target?: number;
  title?: string;
  points: number;
}

export interface UserObjectif {
  objectifId: string;
  currentProgress: number;
  isCompleted: boolean;
  assignedAt: string; // ISO Date string
}

export interface UserObjectifInfos {
  objectif: Objectif;
  userObjectif: UserObjectif | null;
}

export interface ActionDetails {
  runtype?: string | null;
  features: FeaturesType[];
  privacy?: PrivacyType[] | null;
  cible: CibleType[];
  difficulty?: ObjectifDifficulty[] | null;
}

export interface ActionDetailsType {
  actionType: ObjectifActionType;
  actionDetails: ActionDetails;
}

export interface ObjectifType {
  actionType: ActionDetailsType[];
  groupObjectif: GroupObjectif;
}
