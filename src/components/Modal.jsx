import { useEffect } from "react";
import { createPortal } from "react-dom";

const Modal = ({
  visible,
  title,
  children,
  onCancel,
  onOk,
  okText = "OK",
  cancelText = "Cancel",
  footer,
  closable = true,
  maskClosable = true,
  confirmLoading = false,
  width = 300,
  className = "",
  bodyStyle = {},
}) => {
  const handleMaskClick = (e) => {
    e.stopPropagation();
    if (maskClosable) {
      onCancel?.();
    }
  };

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel?.();
      }
      if (event.key === "Enter") {
        onOk?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible, onCancel, onOk]);

  if (!visible) {
    return null;
  }

  const renderFooter = () => {
    if (footer) {
      return footer;
    }

    return (
      <div className="modal-footer">
        <button type="button" className="modal-button" onClick={onCancel}>
          {cancelText}
        </button>
        <button
          type="button"
          className="modal-button primary"
          onClick={onOk}
          disabled={confirmLoading}
        >
          {confirmLoading ? "Loading..." : okText}
        </button>
      </div>
    );
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleMaskClick}>
      <div
        className={`modal-container ${className}`}
        onClick={(event) => event.stopPropagation()}
        style={{ width }}
      >
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          {closable && (
            <button type="button" className="modal-close" onClick={onCancel}>
              ×
            </button>
          )}
        </div>
        <div className="modal-body" style={bodyStyle}>
          {children}
        </div>
        {renderFooter()}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
