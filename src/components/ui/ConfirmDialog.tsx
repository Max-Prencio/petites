import { Button } from './Button';
import { Modal } from './Modal';
import { Text } from './Text';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  tone = 'primary',
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      title={title}
      scrollable={false}
      footer={
        <>
          <Button title={confirmLabel} variant={tone} loading={loading} onPress={onConfirm} fullWidth />
          <Button title="Cancelar" variant="ghost" onPress={onCancel} fullWidth />
        </>
      }
    >
      <Text className="text-ink-muted">{message}</Text>
    </Modal>
  );
}
