import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageCircle, PawPrint } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { Avatar, EmptyState, ErrorState, LoadingState, PressableScale, Screen, Text } from '@/components/ui';
import { listingTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { avatarUrl, conversationCover, useConversations } from '@/features/messaging';
import { errorMessage } from '@/utils/errors';
import { formatChatTime } from '@/utils/format';

export default function MessagesScreen() {
  const router = useRouter();
  const conversations = useConversations();

  return (
    <Screen>
      <View className="px-5 pb-3 pt-2">
        <Text variant="title">Mensajes</Text>
      </View>
      {conversations.isPending ? (
        <LoadingState />
      ) : conversations.isError ? (
        <ErrorState
          message={errorMessage(conversations.error)}
          onRetry={() => void conversations.refetch()}
        />
      ) : (
        <FlatList
          data={conversations.data}
          keyExtractor={(c) => c.id}
          contentContainerClassName="px-5 pb-32 gap-2"
          refreshing={conversations.isRefetching}
          onRefresh={() => void conversations.refetch()}
          renderItem={({ item }) => {
            const unread = Number(item.unread_count);
            const cover = conversationCover(item);
            return (
              <PressableScale
                testID={`conversation-${item.id}`}
                onPress={() => router.push(`/messages/${item.id}`)}
                className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-3"
              >
                <View>
                  <Avatar uri={avatarUrl(item.other_user_avatar)} name={item.other_user_name} size={50} />
                  <View className="absolute -bottom-1 -right-1 h-7 w-7 overflow-hidden rounded-xl border-2 border-surface bg-primary-light">
                    {cover ? (
                      <Image source={{ uri: cover }} style={{ width: 24, height: 24 }} contentFit="cover" />
                    ) : (
                      <PawPrint size={14} color={colors.primary} style={{ margin: 3 }} />
                    )}
                  </View>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text variant="label" numberOfLines={1} className="flex-1">
                      {item.other_user_name}
                    </Text>
                    <Text className="text-[11px] text-ink-faint">
                      {formatChatTime(item.last_message_at ?? item.created_at)}
                    </Text>
                  </View>
                  <Text variant="caption" numberOfLines={1}>
                    {item.animal_name ?? 'Mascota'} · {listingTypeLabel[item.listing_type]}
                  </Text>
                  <Text
                    className={`text-[13px] ${unread > 0 ? 'font-bold text-ink' : 'text-ink-muted'}`}
                    numberOfLines={1}
                  >
                    {item.status === 'closed'
                      ? 'Conversación cerrada'
                      : (item.last_message_preview ?? 'Inicia la conversación')}
                  </Text>
                </View>
                {unread > 0 ? (
                  <View className="h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-1.5">
                    <Text className="text-[11px] font-bold text-white">{unread}</Text>
                  </View>
                ) : null}
              </PressableScale>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={MessageCircle}
              title="Sin conversaciones todavía"
              message="Cuando preguntes por una mascota o alguien pregunte por la tuya, el chat aparecerá aquí."
              actionLabel="Explorar"
              onAction={() => router.push('/explore')}
            />
          }
        />
      )}
    </Screen>
  );
}
