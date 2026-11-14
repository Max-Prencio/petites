import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { limits } from '@/constants/config';
import { partnerTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { useProvinces } from '@/features/animals';
import { useUpdateAvatar, useUpdateProfile, type MyProfile } from '@/features/auth';
import { profileSchema, type ProfileInput } from '@/schemas/profile';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { FormChips, FormInput, FormSelect } from './form';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Text } from './ui/Text';

interface Props {
  me: MyProfile;
  submitLabel: string;
  markOnboarded?: boolean;
  onSaved?: () => void;
}

const partnerOptions = Object.entries(partnerTypeLabel).map(([value, label]) => ({
  value: value as ProfileInput['partnerType'],
  label,
}));

export function ProfileForm({ me, submitLabel, markOnboarded = false, onSaved }: Props) {
  const provinces = useProvinces();
  const update = useUpdateProfile();
  const avatar = useUpdateAvatar();
  const { control, handleSubmit } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: me.profile.full_name,
      phone: me.private?.phone ?? '',
      provinceId: me.profile.province_id ?? 0,
      city: me.profile.city ?? '',
      addressLine: me.private?.address_line ?? '',
      bio: me.profile.bio ?? '',
      partnerType: me.profile.partner_type,
    },
  });

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    if ((asset.fileSize ?? 0) > limits.maxAvatarBytes) {
      toast.error('La foto debe pesar menos de 2 MB.');
      return;
    }
    avatar.mutate(
      {
        file: { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' },
        previousPath: me.profile.avatar_path,
      },
      { onSuccess: () => toast.success('Foto actualizada'), onError: (e) => toast.error(errorMessage(e)) },
    );
  };

  const submit = handleSubmit((input) =>
    update.mutate(
      { input, markOnboarded },
      {
        onSuccess: () => {
          toast.success(markOnboarded ? '¡Listo! Ya puedes explorar Petites.' : 'Perfil actualizado');
          onSaved?.();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    ),
  );

  return (
    <View className="gap-5">
      <Pressable
        onPress={() => void pickAvatar()}
        accessibilityRole="button"
        accessibilityLabel="Cambiar foto de perfil"
        className="items-center gap-2"
      >
        <View>
          <Avatar uri={me.avatarUrl} name={me.profile.full_name} size={96} />
          <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Camera size={16} color="#FFFFFF" />
          </View>
        </View>
        <Text className="font-semibold" style={{ color: colors.primary }}>
          {avatar.isPending ? 'Subiendo...' : 'Foto de perfil (opcional)'}
        </Text>
      </Pressable>
      <FormInput testID="profile-name" control={control} name="fullName" label="Nombre y apellido" />
      <FormInput
        testID="profile-phone"
        control={control}
        name="phone"
        label="Teléfono"
        keyboardType="phone-pad"
        hint="Privado. Solo tú lo ves."
      />
      <FormSelect
        testID="profile-province"
        control={control}
        name="provinceId"
        label="Provincia"
        placeholder="Elige tu provincia"
        searchable
        options={(provinces.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
      />
      <FormInput
        testID="profile-city"
        control={control}
        name="city"
        label="Ciudad o sector"
        hint="Se muestra como ubicación aproximada."
      />
      <FormInput
        control={control}
        name="addressLine"
        label="Dirección exacta (opcional)"
        hint="Privada. Nunca se muestra públicamente."
      />
      <FormChips control={control} name="partnerType" label="¿Cómo publicas?" options={partnerOptions} />
      <FormInput
        control={control}
        name="bio"
        label="Sobre ti (opcional)"
        multiline
        placeholder="Cuéntale a la comunidad quién eres"
      />
      <Button
        testID="profile-submit"
        title={submitLabel}
        size="lg"
        loading={update.isPending}
        onPress={submit}
        fullWidth
      />
    </View>
  );
}
