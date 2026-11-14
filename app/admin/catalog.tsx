import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Switch, View } from 'react-native';

import { CategoryIcon } from '@/components/CategoryIcon';
import { FormInput } from '@/components/form';
import { Button, Card, ErrorState, Header, Input, LoadingState, Screen, Text } from '@/components/ui';
import { colors } from '@/constants/theme';
import {
  useAdminCategories,
  useCreateBreed,
  useCreateCategory,
  useToggleBreed,
  useToggleCategory,
} from '@/features/administration';
import { breedSchema, categorySchema, type CategoryInput } from '@/schemas/catalog';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function AdminCatalogScreen() {
  const categories = useAdminCategories();
  const createCategory = useCreateCategory();
  const toggleCategory = useToggleCategory();
  const createBreed = useCreateBreed();
  const toggleBreed = useToggleBreed();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [breedName, setBreedName] = useState('');
  const { control, handleSubmit, reset } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', icon: '' },
  });
  const onError = (e: unknown) => toast.error(errorMessage(e));

  if (categories.isPending) return <LoadingState />;
  if (categories.isError)
    return <ErrorState message={errorMessage(categories.error)} onRetry={() => void categories.refetch()} />;

  const addCategory = handleSubmit((input) =>
    createCategory.mutate(
      { input, sortOrder: categories.data.length + 1 },
      {
        onSuccess: () => {
          toast.success('Categoría creada');
          reset();
        },
        onError,
      },
    ),
  );

  return (
    <Screen scroll>
      <Header title="Categorías y razas" />
      <Text variant="caption">
        Habilita solo especies permitidas por la normativa aplicable. Desactivar una categoría la oculta del
        catálogo y de los formularios.
      </Text>
      {categories.data.map((c) => (
        <Card key={c.id}>
          <View className="flex-row items-center gap-3">
            <CategoryIcon name={c.icon} color={colors.secondary} />
            <Pressable className="flex-1" onPress={() => setExpanded(expanded === c.id ? null : c.id)}>
              <Text variant="label">{c.name}</Text>
              <Text variant="caption">
                {c.breeds.length} razas · /{c.slug}
              </Text>
            </Pressable>
            <Switch
              value={c.active}
              onValueChange={(active) => toggleCategory.mutate({ id: c.id, active }, { onError })}
              trackColor={{ true: colors.primary, false: colors.line }}
              accessibilityLabel={`Activar ${c.name}`}
            />
            {expanded === c.id ? (
              <ChevronUp size={18} color={colors.inkMuted} />
            ) : (
              <ChevronDown size={18} color={colors.inkMuted} />
            )}
          </View>
          {expanded === c.id ? (
            <View className="gap-2">
              {c.breeds.map((b) => (
                <View
                  key={b.id}
                  className="flex-row items-center justify-between rounded-xl bg-ivory px-3 py-2"
                >
                  <Text className={b.active ? '' : 'text-ink-faint line-through'}>{b.name}</Text>
                  <Switch
                    value={b.active}
                    onValueChange={(active) => toggleBreed.mutate({ id: b.id, active }, { onError })}
                    trackColor={{ true: colors.primary, false: colors.line }}
                  />
                </View>
              ))}
              <View className="flex-row gap-2">
                <Input
                  containerClassName="flex-1"
                  placeholder="Nueva raza"
                  value={breedName}
                  onChangeText={setBreedName}
                />
                <Button
                  title="Agregar"
                  loading={createBreed.isPending}
                  onPress={() => {
                    const parsed = breedSchema.safeParse({ categoryId: c.id, name: breedName });
                    if (!parsed.success)
                      return toast.error(parsed.error.issues[0]?.message ?? 'Nombre inválido');
                    createBreed.mutate(parsed.data, { onSuccess: () => setBreedName(''), onError });
                  }}
                />
              </View>
            </View>
          ) : null}
        </Card>
      ))}
      <Card title="Nueva categoría">
        <FormInput control={control} name="name" label="Nombre" />
        <FormInput
          control={control}
          name="slug"
          label="Identificador"
          autoCapitalize="none"
          placeholder="ej. tortugas"
        />
        <FormInput
          control={control}
          name="icon"
          label="Ícono (opcional)"
          autoCapitalize="none"
          hint="dog, cat, bird, fish, rabbit, squirrel, turtle, paw-print"
        />
        <Button
          title="Crear categoría"
          loading={createCategory.isPending}
          onPress={() => void addCategory()}
        />
      </Card>
    </Screen>
  );
}
