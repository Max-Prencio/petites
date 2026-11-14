import type { Database, Enums, Tables } from './database.types';

export type { Enums, Tables };

export type Profile = Tables<'profiles'>;
export type ProfilePrivate = Tables<'profile_private'>;
export type AppRole = Enums<'app_role'>;
export type ListingCard = Database['public']['Views']['listing_cards']['Row'];
export type ConversationSummary = Database['public']['Functions']['my_conversations']['Returns'][number];
export type Category = Tables<'categories'>;
export type Breed = Tables<'breeds'>;
export type Province = Tables<'provinces'>;
export type Message = Tables<'messages'>;
export type Notification = Tables<'notifications'>;
export type RequestRow = Tables<'requests'>;
export type RequestEvent = Tables<'request_events'>;
export type FollowUp = Tables<'follow_ups'>;
export type Report = Tables<'reports'>;
