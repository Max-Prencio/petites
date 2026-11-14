import { useRouter, type Href } from 'expo-router';
import { ChevronRight, Flag, History, LayoutGrid, Tags, Users, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Header, PressableScale, Screen, Skeleton, Text } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAdminStats } from '@/features/administration';

const links: { href: Href; icon: LucideIcon; label: string; hint: string }[] = [
  {
    href: '/admin/reports',
    icon: Flag,
    label: 'Reportes',
    hint: 'Denuncias de publicaciones, usuarios y chats',
  },
  {
    href: '/admin/listings',
    icon: LayoutGrid,
    label: 'Publicaciones',
    hint: 'Ocultar o restaurar contenido',
  },
  { href: '/admin/users', icon: Users, label: 'Usuarios', hint: 'Suspender o reactivar cuentas' },
  {
    href: '/admin/catalog',
    icon: Tags,
    label: 'Categorías y razas',
    hint: 'Especies habilitadas en la plataforma',
  },
  {
    href: '/admin/audit',
    icon: History,
    label: 'Auditoría',
    hint: 'Trazabilidad de acciones administrativas',
  },
];

export default function AdminHome() {
  const router = useRouter();
  const stats = useAdminStats();
  const tiles = [
    { label: 'Reportes abiertos', value: stats.data?.openReports },
    { label: 'Publicaciones', value: stats.data?.listings },
    { label: 'Usuarios', value: stats.data?.users },
    { label: 'Solicitudes', value: stats.data?.requests },
  ];
  return (
    <Screen scroll>
      <Header title="Administración" />
      <View className="flex-row flex-wrap gap-3">
        {tiles.map((t) => (
          <View key={t.label} className="min-w-[45%] flex-1 rounded-3xl border border-line bg-surface p-4">
            {t.value === undefined ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <Text className="text-[28px] font-extrabold text-secondary">{t.value}</Text>
            )}
            <Text variant="caption">{t.label}</Text>
          </View>
        ))}
      </View>
      <View className="overflow-hidden rounded-3xl border border-line bg-surface">
        {links.map(({ href, icon: Icon, label, hint }) => (
          <PressableScale
            key={label}
            onPress={() => router.push(href)}
            className="flex-row items-center gap-3 border-b border-line px-4 py-3.5"
          >
            <Icon size={20} color={colors.secondary} />
            <View className="flex-1">
              <Text variant="label">{label}</Text>
              <Text variant="caption">{hint}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkFaint} />
          </PressableScale>
        ))}
      </View>
    </Screen>
  );
}
