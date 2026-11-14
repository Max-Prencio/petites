import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { ListingForm } from '@/components/ListingForm';
import { ErrorState, Header, LoadingState, Screen } from '@/components/ui';
import { useListingForEdit, useUpdateListing } from '@/features/listings';
import type { ListingInput } from '@/schemas/listing';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listing = useListingForEdit(id);
  const update = useUpdateListing(id);

  const initial = useMemo<ListingInput | null>(() => {
    const l = listing.data;
    if (!l) return null;
    return {
      listingType: l.listing_type,
      name: l.animal.name ?? '',
      categoryId: l.animal.category_id,
      breedId: l.animal.breed_id,
      ageValue: l.animal.age_value,
      ageUnit: l.animal.age_unit,
      sex: l.animal.sex,
      size: l.animal.size,
      description: l.animal.description,
      personalityTags: l.animal.personality_tags,
      goodForApartment: l.animal.good_for_apartment,
      vaccinated: l.animal.vaccinated,
      vaccinationComplete: l.animal.vaccination_complete,
      dewormed: l.animal.dewormed,
      sterilized: l.animal.sterilized,
      hasVetDocuments: l.animal.has_vet_documents,
      medicalNotes: l.animal.medical_notes ?? '',
      price: l.price,
      currency: l.currency,
      provinceId: l.province_id,
      city: l.city,
      conditions: l.conditions ?? '',
      contractTerms: l.contract_terms ?? '',
      transferFee: l.transfer_fee,
      allowsDelivery: l.allows_delivery,
      allowsPickup: l.allows_pickup,
      deliveryWindow: l.delivery_window ?? '',
      images: l.images,
    };
  }, [listing.data]);

  if (listing.isPending) return <LoadingState />;
  if (listing.isError || !initial) {
    return <ErrorState message={errorMessage(listing.error)} onRetry={() => void listing.refetch()} />;
  }

  return (
    <Screen>
      <Header title="Editar publicación" />
      <ListingForm
        initial={initial}
        submitting={update.isPending}
        submitLabel="Guardar cambios"
        onSubmit={(input) =>
          update.mutate(input, {
            onSuccess: () => {
              toast.success('Publicación actualizada');
              router.back();
            },
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </Screen>
  );
}
