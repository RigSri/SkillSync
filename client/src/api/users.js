import api from "./axios";

export const getCurrentUser = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put(
        "/users/me",
        profileData
    );

    return response.data;
};

export const updateAvailability = async (availability) => {
    const response = await api.put(
        "/users/me/availability",
        { availability }
    );

    return response.data;
};

export const getUserCredibility = async (userId) => {
    const response = await api.get(
        `/users/${userId}/credibility`
    );

    return response.data;
};