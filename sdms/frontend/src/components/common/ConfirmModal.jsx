import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({ open, onClose, onConfirm, title = 'Are you sure?', message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 h-10 w-10 rounded-full bg-danger-50 text-danger-500 flex items-center justify-center">
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-300 pt-1.5">{message}</p>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
