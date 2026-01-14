import React, { useEffect } from 'react';

const Notification = ({ message, type = 'info', title = 'تنبيه', isVisible, onClose, persist = false }) => {
    useEffect(() => {
        if (isVisible && !persist) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, persist]);

    if (!isVisible) return null;

    return (
        <div className={`notification-toast ${type}`}>
            <div className="notification-icon">
                <i className={type === 'warning' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'}></i>
            </div>
            <div className="notification-content">
                <h4>{title}</h4>
                <p>{message}</p>
            </div>
            <button className="notification-close" onClick={onClose}>
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export default Notification;
