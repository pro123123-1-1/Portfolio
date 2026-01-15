import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'info',
        title: 'تنبيه',
        persist: false
    });

    const showNotification = useCallback((message, type = 'info', title = 'تنبيه', persist = false) => {
        setNotification({
            isVisible: true,
            message,
            type,
            title,
            persist
        });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, closeNotification }}>
            {children}
            <Notification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                title={notification.title}
                persist={notification.persist}
                onClose={closeNotification}
            />
        </NotificationContext.Provider>
    );
};
