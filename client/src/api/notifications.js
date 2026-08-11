import api from "./axios";

export const getMyNotifications = async () => {
    const response = await api.get(
        "/notifications"
    );

    return response.data;
};

export const markNotificationAsRead = async (
    notificationId
) => {
    const response = await api.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.patch(
        "/notifications/read-all"
    );

    return response.data;
};