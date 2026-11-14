import { Check } from 'lucide-react-native';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { fadeUp } from '@/constants/motion';
import { deliveryTrack, pickupTrack, requestStatusCopy, type RequestStatus } from '@/constants/requestStatus';
import type { RequestEvent, Enums } from '@/types/models';
import { formatDateTime } from '@/utils/format';
import { Text } from './ui/Text';

interface Props {
  status: RequestStatus;
  method: Enums<'delivery_method'>;
  events: RequestEvent[];
}

// "Seguir sus patitas": recorrido de la solicitud con el copy de marca.
export function RequestTimeline({ status, method, events }: Props) {
  const track = method === 'delivery' ? deliveryTrack : pickupTrack;
  const closedBadly = status === 'rejected' || status === 'cancelled';
  const reachedIndex = Math.max(
    ...events.map((e) => track.indexOf(e.status)),
    track.indexOf(status === 'videocall_requested' ? 'in_review' : status),
  );
  const timeFor = (s: RequestStatus) => events.filter((e) => e.status === s).at(-1)?.created_at;

  return (
    <View className="gap-0">
      {track.map((step, i) => {
        const done = i <= reachedIndex && !(closedBadly && i > reachedIndex);
        const current = i === reachedIndex && !closedBadly && status !== 'delivered';
        const at = timeFor(step);
        return (
          <Animated.View key={step} entering={fadeUp(i)} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  done ? 'bg-primary' : 'border-2 border-line bg-surface'
                } ${current ? 'border-4 border-primary-light' : ''}`}
              >
                {done ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              {i < track.length - 1 ? (
                <View className={`w-0.5 flex-1 ${i < reachedIndex ? 'bg-primary' : 'bg-line'}`} />
              ) : null}
            </View>
            <View className="flex-1 pb-5">
              <Text className={`font-semibold ${done ? 'text-ink' : 'text-ink-faint'}`}>
                {requestStatusCopy[step].label}
              </Text>
              {current || (step === 'delivered' && done) ? (
                <Text variant="caption">{requestStatusCopy[step].message}</Text>
              ) : null}
              {at ? <Text className="text-[11px] text-ink-faint">{formatDateTime(at)}</Text> : null}
            </View>
          </Animated.View>
        );
      })}
      {closedBadly ? (
        <View className="rounded-2xl bg-[#F8E1DF] p-3">
          <Text className="font-semibold text-danger">{requestStatusCopy[status].label}</Text>
          <Text variant="caption">{requestStatusCopy[status].message}</Text>
        </View>
      ) : null}
    </View>
  );
}
