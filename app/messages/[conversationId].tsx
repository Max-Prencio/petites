import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ban, Flag, MoreVertical, SendHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReportModal } from '@/components/ReportModal';
import {
  Avatar,
  Button,
  ConfirmDialog,
  ErrorState,
  Header,
  IconButton,
  LoadingState,
  Modal,
  Text,
} from '@/components/ui';
import { listingTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { useBlockUser, useConversation, useMessages, useSendMessage } from '@/features/messaging';
import { messageSchema, type MessageInput } from '@/schemas/message';
import { useSessionStore } from '@/stores/sessionStore';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { formatChatTime } from '@/utils/format';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const block = useBlockUser(conversationId);
  const [menu, setMenu] = useState(false);
  const [reportTarget, setReportTarget] = useState<'conversation' | 'user' | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const { control, handleSubmit, reset } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const items = useMemo(() => messages.data?.pages.flat() ?? [], [messages.data]);

  if (conversation.isPending) return <LoadingState />;
  if (conversation.isError)
    return <ErrorState message={errorMessage(conversation.error)} onRetry={() => router.back()} />;

  const c = conversation.data;
  const closed = c.status === 'closed';
  const other = c.other;

  const submit = handleSubmit(({ content }) => {
    reset({ content: '' });
    send.mutate(content, {
      onError: (e) => {
        reset({ content });
        toast.error(errorMessage(e));
      },
    });
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-ivory">
      <Header
        title={other?.full_name ?? 'Conversación'}
        subtitle={`${c.listing.animal.name ?? 'Mascota'} · ${listingTypeLabel[c.listing.listing_type]}`}
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push(`/animals/${c.listing.id}`)}
              accessibilityLabel="Ver publicación"
            >
              <Avatar uri={c.coverUrl} name={c.listing.animal.name ?? 'P'} size={36} />
            </Pressable>
            <IconButton icon={MoreVertical} label="Opciones" variant="ghost" onPress={() => setMenu(true)} />
          </View>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={8}
      >
        {messages.isPending ? (
          <LoadingState />
        ) : (
          <FlatList
            inverted
            data={items}
            keyExtractor={(m) => m.id}
            contentContainerClassName="gap-2 px-4 py-3"
            onEndReachedThreshold={0.3}
            onEndReached={() => {
              if (messages.hasNextPage && !messages.isFetchingNextPage) void messages.fetchNextPage();
            }}
            ListFooterComponent={
              messages.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : undefined
            }
            ListEmptyComponent={
              <View className="items-center gap-2 p-8" style={{ transform: [{ scaleY: -1 }] }}>
                <Text variant="subtitle" className="text-center">
                  Rompe el hielo 🐾
                </Text>
                <Text className="text-center text-ink-muted">
                  Pregunta por su rutina, su salud o cómo coordinar la llegada.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const mine = item.sender_id === userId;
              return (
                <Animated.View
                  entering={FadeInUp.duration(200)}
                  className={`max-w-[80%] ${mine ? 'self-end' : 'self-start'}`}
                >
                  <View
                    className={`rounded-3xl px-4 py-2.5 ${mine ? 'rounded-br-md bg-primary' : 'rounded-bl-md border border-line bg-surface'}`}
                  >
                    <Text className={mine ? 'text-white' : 'text-ink'}>{item.content}</Text>
                  </View>
                  <Text className={`mt-0.5 text-[10px] text-ink-faint ${mine ? 'text-right' : ''}`}>
                    {formatChatTime(item.created_at)}
                    {mine && item.read_at ? ' · Visto' : ''}
                  </Text>
                </Animated.View>
              );
            }}
          />
        )}

        {closed || c.iBlockedOther ? (
          <View className="border-t border-line bg-surface p-4">
            <Text className="text-center text-ink-muted">
              {closed ? 'Esta conversación fue cerrada por moderación.' : 'Bloqueaste a este usuario.'}
            </Text>
            {c.iBlockedOther && other ? (
              <Button
                title="Desbloquear"
                variant="ghost"
                onPress={() => block.mutate({ otherId: other.id, block: false })}
              />
            ) : null}
          </View>
        ) : (
          <View className="flex-row items-end gap-2 border-t border-line bg-surface px-4 py-3">
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <TextInput
                  testID="chat-input"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor={colors.inkFaint}
                  multiline
                  maxLength={2000}
                  className="max-h-32 min-h-[44px] flex-1 rounded-3xl bg-ivory px-4 py-3 text-[15px] text-ink"
                  accessibilityLabel="Mensaje"
                />
              )}
            />
            <IconButton
              testID="chat-send"
              icon={SendHorizontal}
              label="Enviar"
              variant="primary"
              onPress={() => void submit()}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <Modal visible={menu} onClose={() => setMenu(false)} title="Opciones">
        <Button
          title="Ver publicación"
          variant="outline"
          onPress={() => {
            setMenu(false);
            router.push(`/animals/${c.listing.id}`);
          }}
          fullWidth
        />
        {other ? (
          <Button
            title="Ver perfil"
            variant="outline"
            onPress={() => {
              setMenu(false);
              router.push(`/profile/${other.id}`);
            }}
            fullWidth
          />
        ) : null}
        <Button
          title="Reportar conversación"
          icon={Flag}
          variant="ghost"
          onPress={() => {
            setMenu(false);
            setReportTarget('conversation');
          }}
          fullWidth
        />
        {other && !c.iBlockedOther ? (
          <Button
            title="Bloquear usuario"
            icon={Ban}
            variant="ghost"
            onPress={() => {
              setMenu(false);
              setConfirmBlock(true);
            }}
            fullWidth
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        visible={confirmBlock}
        title="¿Bloquear a este usuario?"
        message="No podrá enviarte mensajes ni nuevas solicitudes. Puedes desbloquearlo cuando quieras."
        confirmLabel="Bloquear"
        tone="danger"
        loading={block.isPending}
        onCancel={() => setConfirmBlock(false)}
        onConfirm={() =>
          other &&
          block.mutate(
            { otherId: other.id, block: true },
            {
              onSuccess: () => {
                setConfirmBlock(false);
                toast.info('Usuario bloqueado');
              },
              onError: (e) => toast.error(errorMessage(e)),
            },
          )
        }
      />
      <ReportModal
        visible={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        target={
          reportTarget === 'user' && other
            ? { type: 'user', id: other.id }
            : { type: 'conversation', id: conversationId }
        }
        title="Reportar conversación"
      />
    </SafeAreaView>
  );
}
