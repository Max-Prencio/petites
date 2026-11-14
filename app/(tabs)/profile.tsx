import { useRouter, type Href } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Heart,
  Inbox,
  Info,
  LayoutGrid,
  LogOut,
  Pencil,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  Avatar,
  Badge,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PressableScale,
  Screen,
  Text,
} from '@/components/ui';
import { fadeUp } from '@/constants/motion';
import { partnerTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { useIsAdmin, useMyProfile, useSignOut } from '@/features/auth';
import { useUnreadNotificationsCount } from '@/features/notifications';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { memberSince } from '@/utils/format';

const roleLabel = {
  buyer: 'Comprador',
  adopter: 'Adoptante',
  seller: 'Vendedor',
  adoption_publisher: 'Da en adopción',
  admin: 'Administración',
} as const;

function Row({
  icon: Icon,
  label,
  onPress,
  badge,
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  badge?: number;
  index?: number;
}) {
  return (
    <Animated.View entering={fadeUp(index)}>
      <PressableScale
        onPress={onPress}
        className="flex-row items-center gap-3 px-4 py-3.5"
        accessibilityRole="button"
      >
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-ivory">
          <Icon size={18} color={colors.secondary} />
        </View>
        <Text className="flex-1 font-semibold">{label}</Text>
        {badge ? (
          <View className="h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-1.5">
            <Text className="text-[11px] font-bold text-white">{badge}</Text>
          </View>
        ) : null}
        <ChevronRight size={18} color={colors.inkFaint} />
      </PressableScale>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const me = useMyProfile();
  const isAdmin = useIsAdmin();
  const signOut = useSignOut();
  const unread = useUnreadNotificationsCount();
  const [confirm, setConfirm] = useState(false);

  if (me.isPending) return <LoadingState />;
  if (me.isError) return <ErrorState message={errorMessage(me.error)} onRetry={() => void me.refetch()} />;
  const { profile, roles, avatarUrl, email } = me.data;
  const go = (href: Href) => () => router.push(href);

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-5 px-5 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <Text variant="title">Mi perfil</Text>
        <View className="items-center gap-2 rounded-3xl border border-line bg-surface p-5">
          <Avatar uri={avatarUrl} name={profile.full_name} size={84} />
          <Text variant="subtitle">{profile.full_name}</Text>
          <Text variant="caption">{email}</Text>
          <Text variant="caption">
            {partnerTypeLabel[profile.partner_type]} · {memberSince(profile.created_at)}
          </Text>
          <View className="flex-row flex-wrap justify-center gap-1.5">
            {roles.map((r) => (
              <Badge key={r} label={roleLabel[r]} tone={r === 'admin' ? 'sale' : 'secondary'} />
            ))}
          </View>
          <View className="mt-1 flex-row gap-4">
            <Text className="font-semibold text-primary" onPress={go('/profile/edit')}>
              Editar perfil
            </Text>
            <Text className="font-semibold text-primary" onPress={go(`/profile/${profile.id}`)}>
              Ver perfil público
            </Text>
          </View>
        </View>

        <View className="overflow-hidden rounded-3xl border border-line bg-surface">
          <Row icon={Heart} index={1} label="Mi lista" onPress={go('/profile/favorites')} />
          <Row icon={Send} index={2} label="Mis solicitudes" onPress={go('/requests')} />
          <Row icon={Inbox} index={3} label="Solicitudes recibidas" onPress={go('/requests/received')} />
          <Row icon={LayoutGrid} index={4} label="Mis publicaciones" onPress={go('/listings/mine')} />
          <Row
            icon={Bell}
            index={5}
            label="Notificaciones"
            onPress={go('/profile/notifications')}
            badge={unread}
          />
          <Row icon={Pencil} index={6} label="Editar perfil" onPress={go('/profile/edit')} />
        </View>

        <View className="overflow-hidden rounded-3xl border border-line bg-surface">
          {isAdmin ? (
            <Row icon={ShieldCheck} index={7} label="Panel de administración" onPress={go('/admin')} />
          ) : null}
          <Row icon={Info} index={8} label="Bienestar animal y normas" onPress={go('/profile/about')} />
          <Row icon={LogOut} index={9} label="Cerrar sesión" onPress={() => setConfirm(true)} />
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={confirm}
        title="¿Cerrar sesión?"
        message="Podrás volver a entrar cuando quieras con tu correo y contraseña."
        confirmLabel="Cerrar sesión"
        loading={signOut.isPending}
        onCancel={() => setConfirm(false)}
        onConfirm={() => signOut.mutate(undefined, { onError: (e) => toast.error(errorMessage(e)) })}
      />
    </Screen>
  );
}
