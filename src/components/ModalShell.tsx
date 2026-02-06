import { ReactNode } from "react";

type ModalShellProps = {
  children: ReactNode;
  onClose: () => void;
};

function ModalShell({ children, onClose }: ModalShellProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal-card">{children}</div>
    </div>
  );
}

export default ModalShell;
