import React from 'react';
import './Modal.css';

export default function Modal({ title, onClose, onSave, saveLabel = 'Save', children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>
            <i className="ti ti-check" aria-hidden="true" /> {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
