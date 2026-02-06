import ModalShell from "./ModalShell";

type DeletePostModalProps = {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirmDelete: () => Promise<void>;
};

function DeletePostModal({
  isDeleting,
  onCancel,
  onConfirmDelete
}: DeletePostModalProps) {
  return (
    <ModalShell onClose={onCancel}>
      <div className="modal-content">
        <h2 className="title-large">Are you sure you want to delete this item?</h2>
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="button button-danger"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default DeletePostModal;
