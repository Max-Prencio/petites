import { buckets } from '@/constants/config';
import type { ProfileInput } from '@/schemas/profile';
import { publicUrl, uploadFile, type LocalFile } from '@/services/storage';
import { supabase } from '@/services/supabase';
import type { AppRole, ListingCard, Profile, ProfilePrivate } from '@/types/models';

export interface MyProfile {
  profile: Profile;
  private: ProfilePrivate | null;
  roles: AppRole[];
  email: string;
  avatarUrl: string | null;
}

export async function fetchMyProfile(userId: string, email: string): Promise<MyProfile> {
  const [profile, priv, roles] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('profile_private').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', userId),
  ]);
  if (profile.error) throw profile.error;
  if (priv.error) throw priv.error;
  if (roles.error) throw roles.error;
  return {
    profile: profile.data,
    private: priv.data,
    roles: roles.data.map((r) => r.role),
    email,
    avatarUrl: publicUrl(buckets.avatars, profile.data.avatar_path),
  };
}

export async function updateMyProfile(
  userId: string,
  input: ProfileInput,
  markOnboarded: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName,
      province_id: input.provinceId,
      city: input.city,
      bio: input.bio || null,
      partner_type: input.partnerType,
      ...(markOnboarded ? { onboarded_at: new Date().toISOString() } : {}),
    })
    .eq('id', userId);
  if (error) throw error;

  const { error: privError } = await supabase
    .from('profile_private')
    .update({ phone: input.phone, address_line: input.addressLine || null })
    .eq('user_id', userId);
  if (privError) throw privError;
}

export async function updateAvatar(
  userId: string,
  file: LocalFile,
  previousPath: string | null,
): Promise<void> {
  const path = await uploadFile(buckets.avatars, userId, 'avatar', file);
  const { error } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', userId);
  if (error) throw error;
  if (previousPath) await supabase.storage.from(buckets.avatars).remove([previousPath]);
}

export interface PublicProfile {
  profile: Profile;
  avatarUrl: string | null;
  provinceName: string | null;
  contactVerified: boolean;
  listings: ListingCard[];
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  const [profile, verified, listings] = await Promise.all([
    supabase.from('profiles').select('*, province:provinces(name)').eq('id', userId).single(),
    supabase.rpc('is_contact_verified', { p_user: userId }),
    supabase
      .from('listing_cards')
      .select('*')
      .eq('owner_id', userId)
      .eq('moderation_status', 'visible')
      .in('status', ['available', 'reserved'])
      .order('published_at', { ascending: false }),
  ]);
  if (profile.error) throw profile.error;
  if (listings.error) throw listings.error;
  const { province, ...rest } = profile.data;
  return {
    profile: rest,
    avatarUrl: publicUrl(buckets.avatars, rest.avatar_path),
    provinceName: province?.name ?? null,
    contactVerified: verified.data === true,
    listings: listings.data,
  };
}
