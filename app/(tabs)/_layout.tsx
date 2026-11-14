import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { useUnreadMessagesCount } from '@/features/messaging';
import { useNotificationsBridge } from '@/features/notifications';

export default function TabsLayout() {
  useNotificationsBridge();
  const unread = useUnreadMessagesCount();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} badges={{ messages: unread }} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="publish" options={{ title: 'Publicar' }} />
      <Tabs.Screen name="messages" options={{ title: 'Mensajes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Mi perfil' }} />
    </Tabs>
  );
}
