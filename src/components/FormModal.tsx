import React from "react";
import { Button, Modal } from "@/components/ui";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitting = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  children,
}: FormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          {children}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {submitting ? `${submitLabel}...` : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
