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

export const getUserProfile = async (userId) => {
    const response = await api.get(
        `/users/${userId}/profile`
    );

    return response.data;
};
export const searchUsers = async (query) => {
    const response = await api.get(
        `/users/search?q=${encodeURIComponent(query)}`
    );

    return response.data;
};
export const searchSkillPartners = async ({
    q,
    mode = "learn",
    level = "",
    peerRated = false,
    verifiedTeacher = false,
}) => {
    const response = await api.get(
        "/users/skill-search",
        {
            params: {
                q,
                mode,
                level,
                peerRated,
                verifiedTeacher,
            },
        }
    );

    return response.data;
};