import { X } from 'lucide-react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, subtitle, icon: Icon, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-fade-in-up">
        <div className="modal-header">
          <div className="modal-header-left">
            {Icon && (
              <div className="modal-icon-wrapper">
                <Icon size={20} className="modal-icon" />
              </div>
            )}
            <div>
              <h2 className="modal-title">{title}</h2>
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
