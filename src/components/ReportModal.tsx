import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { reportReasonLabel } from '@/constants/labels';
import { useCreateReport, type ReportTarget } from '@/features/reports';
import { reportSchema, type ReportInput } from '@/schemas/report';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { FormChips, FormInput } from './form';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Text } from './ui/Text';

interface Props {
  visible: boolean;
  onClose: () => void;
  target: ReportTarget;
  title?: string;
}

const reasons = Object.entries(reportReasonLabel).map(([value, label]) => ({
  value: value as ReportInput['reason'],
  label,
}));

export function ReportModal({ visible, onClose, target, title = 'Reportar' }: Props) {
  const report = useCreateReport();
  const { control, handleSubmit, reset } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: 'fraud', details: '' },
  });

  const submit = handleSubmit((input) =>
    report.mutate(
      { target, input },
      {
        onSuccess: () => {
          toast.success('Gracias. Nuestro equipo revisará el reporte.');
          reset();
          onClose();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    ),
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      footer={
        <Button
          title="Enviar reporte"
          variant="danger"
          loading={report.isPending}
          onPress={submit}
          fullWidth
        />
      }
    >
      <Text className="text-ink-muted">
        Tu reporte es confidencial. Ayúdanos a mantener Petites seguro para las personas y los animales.
      </Text>
      <FormChips control={control} name="reason" label="Motivo" options={reasons} />
      <FormInput
        control={control}
        name="details"
        label="Detalles (opcional)"
        multiline
        placeholder="Cuéntanos qué pasó"
      />
    </Modal>
  );
}
