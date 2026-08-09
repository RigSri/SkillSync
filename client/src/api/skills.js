import api from "./axios";

export const getMySkills = async () => {
    const response = await api.get("/skills/my-skills");
    return response.data;
};

export const addSkill = async (skillData) => {
    const response = await api.post("/skills", skillData);
    return response.data;
};

export const updateSkill = async (skillId, skillData) => {
    const response = await api.put(
        `/skills/${skillId}`,
        skillData
    );

    return response.data;
};

export const deleteSkill = async (skillId) => {
    const response = await api.delete(
        `/skills/${skillId}`
    );

    return response.data;
};