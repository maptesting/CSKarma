
export enum SubscriptionStatus {
  Free = 'free',
  Paid = 'paid',
}

export interface User {
  id: string;
  steam_id: string;
  username?: string;
  email?: string;
  created_at: Date;
  subscription_status: SubscriptionStatus;
}


export enum VoteTag {
  Toxic = 'Toxic',
  Helpful = 'Helpful',
  NoMic = 'No Mic',
  Rager = 'Rager',
}

export interface Vote {
  id: string;
  reporter_id: string;
  target_id: string;
  match_id?: string;
  tag: VoteTag;
  optional_comment?: string;
  created_at: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_id?: string;
  status: SubscriptionStatus;
  created_at: Date;
}

export interface Mod {
  id: string;
  user_id: string;
  created_at: Date;
  notes?: string;
}

export interface AdminAction {
  id: string;
  admin_id?: string;
  target_user_id?: string;
  action: string;
  details?: string;
  created_at: Date;
}
