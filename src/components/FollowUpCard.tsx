import { useState } from 'react';
import { View } from 'react-native';

import { followUpResponseLabel } from '@/constants/labels';
import { useAnswerFollowUp } from '@/features/requests';
import { toast } from '@/stores/uiStore';
import type { Enums, FollowUp } from '@/types/models';
import { errorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ChipGroup } from './ui/Chip';
import { Input } from './ui/Input';
import { Text } from './ui/Text';

const options = (Object.keys(followUpResponseLabel) as Enums<'follow_up_response'>[]).map((value) => ({
  value,
  label: followUpResponseLabel[value],
}));

// Seguimiento post-entrega a los 7 y 30 días.
export function FollowUpCard({ followUp }: { followUp: FollowUp & { animalName: string | null } }) {
  const answer = useAnswerFollowUp();
  const [response, setResponse] = useState<Enums<'follow_up_response'> | null>(null);
  const [notes, setNotes] = useState('');
  const day = followUp.kind === 'day_7' ? '7 días' : '30 días';
  const due = new Date(followUp.due_at) <= new Date();

  if (followUp.answered_at) {
    return (
      <Card>
        <Text variant="label">
          {followUp.animalName ?? 'Tu mascota'} · {day}
        </Text>
        <Text variant="caption">
          Respondiste: {followUp.response ? followUpResponseLabel[followUp.response] : ''} ¡Gracias!
        </Text>
      </Card>
    );
  }
  if (!due) {
    return (
      <Card>
        <Text variant="label">
          {followUp.animalName ?? 'Tu mascota'} · {day}
        </Text>
        <Text variant="caption">Te preguntaremos cómo va el {formatDate(followUp.due_at)}.</Text>
      </Card>
    );
  }
  return (
    <Card title={`¿Cómo está ${followUp.animalName ?? 'tu mascota'}? (${day})`}>
      <ChipGroup options={options} value={response} onChange={setResponse} />
      <Input value={notes} onChangeText={setNotes} multiline placeholder="Cuéntanos un poco (opcional)" />
      <View>
        <Button
          title="Enviar"
          disabled={!response}
          loading={answer.isPending}
          onPress={() =>
            response &&
            answer.mutate(
              { id: followUp.id, response, notes },
              {
                onSuccess: () =>
                  toast.success(
                    response === 'issues'
                      ? 'Gracias. El cuidador y nuestro equipo te contactarán.'
                      : '¡Qué alegría! Gracias por contarnos.',
                  ),
                onError: (e) => toast.error(errorMessage(e)),
              },
            )
          }
        />
      </View>
    </Card>
  );
}
