/**
 * A small reusable confirmation dialog to replace window.confirm().
 *
 * Usage:
 *   <ConfirmModal
 *     show={showModal}
 *     title="Delete this job?"
 *     message="This action cannot be undone."
 *     confirmText="Delete"
 *     variant="danger"
 *     onConfirm={() => { ...actually delete... }}
 *     onCancel={() => setShowModal(false)}
 *   />
 */
function ConfirmModal({
  show,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "primary"
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div className="jp-modal-backdrop" onClick={onCancel}>
      <div className="jp-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={`jp-modal-icon jp-modal-icon-${variant}`}>
          <i className={`bi ${variant === "danger" ? "bi-exclamation-triangle-fill" : "bi-question-circle-fill"}`}></i>
        </div>

        <h5 className="mb-2">{title}</h5>
        {message && <p className="text-muted mb-4">{message}</p>}

        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-jp-outline btn-lift" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={variant === "danger" ? "btn btn-jp-danger btn-lift" : "btn btn-jp-primary btn-lift"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

