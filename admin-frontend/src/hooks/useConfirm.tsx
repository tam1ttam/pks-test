import { useRef, useState } from 'react';
import Modal from '../components/Modal';

type Confirmation = { title: string; message: string; confirmLabel?: string; danger?: boolean };

export function useConfirm() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const confirmAction = (next: Confirmation) => new Promise<boolean>(resolve => { resolver.current = resolve; setConfirmation(next); });
  const finish = (value: boolean) => { resolver.current?.(value); resolver.current = null; setConfirmation(null); };
  const confirmModal = confirmation ? <Modal title={confirmation.title} onClose={() => finish(false)}><p className="confirm-message">{confirmation.message}</p><div className="modal-actions"><button className="secondary-button" onClick={() => finish(false)}>Hủy</button><button className={confirmation.danger ? 'danger-button' : 'primary-button'} onClick={() => finish(true)}>{confirmation.confirmLabel || 'Xác nhận'}</button></div></Modal> : null;
  return { confirmAction, confirmModal };
}
