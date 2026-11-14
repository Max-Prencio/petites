import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { ListingForm } from '@/components/ListingForm';
import { Header, LoadingState, Screen } from '@/components/ui';
import { cta } from '@/constants/brand';
import { useMyProfile } from '@/features/auth';
import { useCreateListing } from '@/features/listings';
import { emptyListingForm } from '@/schemas/listing';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function NewListingScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: 'sale' | 'adoption' }>();
  const me = useMyProfile();
  const create = useCreateListing();

  const initial = useMemo(
    () => ({
      ...emptyListingForm,
      listingType: type === 'sale' ? ('sale' as const) : ('adoption' as const),
      currency: type === 'sale' ? ('DOP' as const) : null,
      provinceId: me.data?.profile.province_id ?? 0,
      city: me.data?.profile.city ?? '',
    }),
    [type, me.data],
  );

  if (me.isPending) return <LoadingState />;

  return (
    <Screen>
      <Header title="Nueva publicación" />
      <ListingForm
        initial={initial}
        submitting={create.isPending}
        submitLabel={cta.publish}
        allowDraft
        onSubmit={(input, asDraft) =>
          create.mutate(
            { input, status: asDraft ? 'draft' : 'available' },
            {
              onSuccess: (id) => {
                toast.success(
                  asDraft ? 'Borrador guardado' : '¡Publicado! Sus patitas ya están en el catálogo.',
                );
                router.replace(asDraft ? '/listings/mine' : `/animals/${id}`);
              },
              onError: (e) => toast.error(errorMessage(e)),
            },
          )
        }
      />
    </Screen>
  );
}
