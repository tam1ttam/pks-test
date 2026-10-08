import { useEffect, useRef, type ReactNode } from 'react';

export default function Modal({ open, title, onClose, children, busy = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) ref.current?.showModal(); else ref.current?.close();
  }, [open]);
  return <dialog ref={ref} aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="modal-heading"><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} disabled={busy} aria-label="Đóng">×</button></div>
    {children}
  </dialog>;
}
