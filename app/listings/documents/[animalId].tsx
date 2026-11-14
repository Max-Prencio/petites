import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { FileText, Lock, Trash2, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  Header,
  IconButton,
  Input,
  LoadingState,
  Screen,
  Text,
} from '@/components/ui';
import { limits } from '@/constants/config';
import { colors } from '@/constants/theme';
import {
  openVetDocument,
  useAddVetDocument,
  useRemoveVetDocument,
  useVetDocuments,
} from '@/features/listings';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';

const allowed = ['application/pdf', 'image/jpeg', 'image/png'];

export default function VetDocumentsScreen() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();
  const docs = useVetDocuments(animalId);
  const add = useAddVetDocument(animalId);
  const remove = useRemoveVetDocument(animalId);
  const [label, setLabel] = useState('');

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: allowed, copyToCacheDirectory: true });
    if (result.canceled) return;
    const file = result.assets[0];
    if (!file) return;
    const mimeType = file.mimeType ?? '';
    if (!allowed.includes(mimeType)) return toast.error('Solo PDF, JPG o PNG.');
    if ((file.size ?? 0) > limits.maxVetDocBytes) return toast.error('El archivo debe pesar menos de 10 MB.');
    add.mutate(
      { file: { uri: file.uri, mimeType, fileName: file.name }, label: label.trim() || file.name },
      {
        onSuccess: () => {
          setLabel('');
          toast.success('Documento guardado de forma privada');
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <Screen scroll>
      <Header title="Documentos veterinarios" />
      <Card>
        <View className="flex-row items-center gap-2">
          <Lock size={16} color={colors.secondary} />
          <Text variant="label">Privados por defecto</Text>
        </View>
        <Text variant="caption">
          Solo tú puedes verlos. Compártelos por el chat con quien tú decidas una vez aprobada la solicitud.
        </Text>
        <Input
          placeholder="Nombre del documento (ej. Carnet de vacunas)"
          value={label}
          onChangeText={setLabel}
        />
        <Button
          title="Subir documento"
          icon={Upload}
          loading={add.isPending}
          onPress={() => void pick()}
          fullWidth
        />
      </Card>
      {docs.isPending ? (
        <LoadingState />
      ) : (docs.data ?? []).length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin documentos"
          message="Sube el carnet de vacunas u otros certificados (PDF, JPG o PNG)."
        />
      ) : (
        (docs.data ?? []).map((doc) => (
          <Pressable
            key={doc.id}
            onPress={() =>
              void openVetDocument(doc.storage_path)
                .then((url) => Linking.openURL(url))
                .catch((e: unknown) => toast.error(errorMessage(e)))
            }
            className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            <FileText size={22} color={colors.primary} />
            <View className="flex-1">
              <Text variant="label">{doc.label ?? 'Documento'}</Text>
              <Text variant="caption">{formatDate(doc.created_at)}</Text>
            </View>
            <IconButton
              icon={Trash2}
              label="Eliminar documento"
              variant="ghost"
              color={colors.danger}
              onPress={() => remove.mutate(doc, { onError: (e) => toast.error(errorMessage(e)) })}
            />
          </Pressable>
        ))
      )}
    </Screen>
  );
}
