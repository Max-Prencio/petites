import { Image } from 'expo-image';
import * as ExpoImagePicker from 'expo-image-picker';
import { ImagePlus, Star, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { limits } from '@/constants/config';
import { colors } from '@/constants/theme';
import type { ImageAsset } from '@/schemas/listing';
import { compressImage } from '@/services/imageCompression';
import { toast } from '@/stores/uiStore';
import { Text } from './Text';

const allowed = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AllowedMime = (typeof allowed)[number];

function isAllowed(mime: string | undefined): mime is AllowedMime {
  return allowed.includes(mime as AllowedMime);
}

interface Props {
  label?: string;
  value: ImageAsset[];
  onChange: (value: ImageAsset[]) => void;
  max?: number;
  error?: string;
}

export function ImagePicker({ label, value, onChange, max = limits.maxListingImages, error }: Props) {
  const pick = async () => {
    const permission = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error('Necesitamos permiso para acceder a tus fotos.');
      return;
    }
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: max - value.length,
      quality: 1,
    });
    if (result.canceled) return;

    const accepted: ImageAsset[] = [];
    let rejected = 0;
    for (const asset of result.assets) {
      const mime = asset.mimeType ?? 'image/jpeg';
      if (!isAllowed(mime)) {
        rejected++;
        continue;
      }
      try {
        // Se comprime antes de subir: fotos ligeras = catálogo rápido
        const compressed = await compressImage({ uri: asset.uri, mimeType: mime });
        accepted.push({ uri: compressed.uri, mimeType: 'image/jpeg' });
      } catch {
        if ((asset.fileSize ?? 0) > limits.maxImageBytes) rejected++;
        else accepted.push({ uri: asset.uri, mimeType: mime, fileSize: asset.fileSize });
      }
    }
    if (rejected > 0)
      toast.error(`${rejected} foto(s) no cumplen formato (JPG/PNG/WEBP) o pesan más de 5 MB.`);
    onChange([...value, ...accepted].slice(0, max));
  };

  const remove = (uri: string) => onChange(value.filter((img) => img.uri !== uri));
  const makeCover = (uri: string) => {
    const img = value.find((i) => i.uri === uri);
    if (!img) return;
    onChange([img, ...value.filter((i) => i.uri !== uri)]);
  };

  return (
    <View className="gap-2">
      {label ? <Text variant="label">{label}</Text> : null}
      <View className="flex-row flex-wrap gap-3">
        {value.map((img, index) => (
          <Animated.View
            key={img.uri}
            entering={FadeIn}
            exiting={FadeOut}
            layout={LinearTransition}
            className="h-24 w-24 overflow-hidden rounded-2xl bg-line"
          >
            <Pressable
              onLongPress={() => makeCover(img.uri)}
              accessibilityHint="Mantén presionado para usarla de portada"
            >
              <Image source={{ uri: img.uri }} style={{ width: 96, height: 96 }} contentFit="cover" />
            </Pressable>
            {index === 0 ? (
              <View className="absolute bottom-1 left-1 flex-row items-center gap-1 rounded-full bg-primary px-2 py-0.5">
                <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                <Text className="text-[10px] font-bold text-white">Portada</Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => remove(img.uri)}
              accessibilityLabel="Quitar foto"
              hitSlop={6}
              className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60"
            >
              <X size={14} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        ))}
        {value.length < max ? (
          <Pressable
            testID="image-picker-add"
            onPress={() => void pick()}
            accessibilityRole="button"
            accessibilityLabel="Agregar fotos"
            className={`h-24 w-24 items-center justify-center gap-1 rounded-2xl border-2 border-dashed bg-surface ${
              error ? 'border-danger' : 'border-line'
            }`}
          >
            <ImagePlus size={24} color={colors.primary} />
            <Text className="text-[11px] font-semibold text-ink-muted">
              {value.length}/{max}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text variant="caption">
        Fotos luminosas y claras. Mantén presionada una foto para usarla de portada.
      </Text>
      {error ? <Text className="text-[12px] text-danger">{error}</Text> : null}
    </View>
  );
}
