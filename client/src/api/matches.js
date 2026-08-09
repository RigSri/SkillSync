import api from "./axios";

export const getMatches = async () => {
    const response = await api.get("/matches");

    return response.data;
};