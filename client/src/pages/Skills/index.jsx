import { useEffect, useState } from "react";

import {
    getMySkills,
    addSkill,
    updateSkill,
    deleteSkill,
} from "../../api/skills";

import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";

function Skills() {
    const [skills, setSkills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);

    const [name, setName] = useState("");
    const [type, setType] = useState("teach");
    const [level, setLevel] = useState("Beginner");
    const [category, setCategory] = useState("");
    const [proof, setProof] = useState("");

    const [saving, setSaving] = useState(false);

    useEffect(() => {
    let cancelled = false;

    const load = async () => {
        try {
            setError("");

            const result = await getMySkills();

            if (cancelled) return;

            setSkills(result.data || []);
        } catch (error) {
            if (cancelled) return;

            setError(
                error.response?.data?.message ||
                    "Unable to load your skills."
            );
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    load();

    return () => {
        cancelled = true;
    };
}, []);

    const resetForm = () => {
        setName("");
        setType("teach");
        setLevel("Beginner");
        setCategory("");
        setProof("");
        setEditingSkill(null);
        setShowForm(false);
    };

    const handleAdd = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEdit = (skill) => {
        setEditingSkill(skill);

        setName(skill.name);
        setType(skill.type);
        setLevel(skill.level);
        setCategory(skill.category || "");
        setProof(skill.proof || "");

        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Please enter a skill name.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const skillData = {
                name,
                type,
                level,
                category,
                proof,
            };

            if (editingSkill) {
                await updateSkill(
                    editingSkill._id,
                    skillData
                );
            } else {
                await addSkill(skillData);
            }

            const result = await getMySkills();
            setSkills(result.data || []);
            resetForm();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to save skill."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (skillId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this skill?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteSkill(skillId);

            setSkills((currentSkills) =>
                currentSkills.filter(
                    (skill) => skill._id !== skillId
                )
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to delete skill."
            );
        }
    };

    const teachSkills = skills.filter(
        (skill) => skill.type === "teach"
    );

    const learnSkills = skills.filter(
        (skill) => skill.type === "learn"
    );

    const renderSkillList = (skillList) => {
        if (skillList.length === 0) {
            return (
                <div className="py-10 text-center">
                    <p className="text-base text-slate-500">
                        No skills added yet.
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Add a skill to get started.
                    </p>
                </div>
            );
        }

        return (
            <div className="divide-y divide-slate-100">
                {skillList.map((skill) => (
                    <div
                        key={skill._id}
                        className="
                            flex
                            items-center
                            justify-between
                            gap-6
                            py-5
                        "
                    >
                        <div className="min-w-0">
                            <h3 className="text-lg font-medium text-slate-900">
                                {skill.name}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span
                                    className="
                                        rounded-full
                                        bg-violet-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-medium
                                        text-violet-700
                                    "
                                >
                                    {skill.level}
                                </span>

                                <span
                                    className="
                                        rounded-full
                                        bg-slate-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-medium
                                        text-slate-600
                                    "
                                >
                                    {skill.category || "General"}
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-4">
                            <button
                                type="button"
                                onClick={() => handleEdit(skill)}
                                className="
                                    text-sm
                                    font-medium
                                    text-violet-600
                                    hover:text-violet-700
                                "
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleDelete(skill._id)
                                }
                                className="
                                    text-sm
                                    font-medium
                                    text-slate-500
                                    hover:text-red-600
                                "
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-6xl">
            {/* Page heading */}

            <div className="flex items-start justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-900">
                        Skills
                    </h1>

                    <p className="mt-3 text-lg text-slate-500">
                        Manage the skills you can teach and the skills
                        you want to learn.
                    </p>
                </div>

                <Button onClick={handleAdd}>
                    Add skill
                </Button>
            </div>

            {/* Error */}

            {error && (
                <div
                    className="
                        mt-6
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        text-red-700
                    "
                >
                    {error}
                </div>
            )}

            {/* Form */}

            {showForm && (
                <Card className="mt-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingSkill
                                    ? "Edit skill"
                                    : "Add skill"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Add information about this skill.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="
                                text-sm
                                font-medium
                                text-slate-500
                                hover:text-slate-800
                            "
                        >
                            Cancel
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Skill name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="e.g. React"
                                    className="
                                        mt-2
                                        h-11
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        px-4
                                        outline-none
                                        transition
                                        focus:border-violet-500
                                        focus:ring-2
                                        focus:ring-violet-200
                                    "
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Type
                                </label>

                                <select
                                    value={type}
                                    onChange={(event) =>
                                        setType(event.target.value)
                                    }
                                    className="
                                        mt-2
                                        h-11
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        bg-white
                                        px-4
                                        outline-none
                                        focus:border-violet-500
                                        focus:ring-2
                                        focus:ring-violet-200
                                    "
                                >
                                    <option value="teach">
                                        I can teach this
                                    </option>

                                    <option value="learn">
                                        I want to learn this
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Level
                                </label>

                                <select
                                    value={level}
                                    onChange={(event) =>
                                        setLevel(event.target.value)
                                    }
                                    className="
                                        mt-2
                                        h-11
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        bg-white
                                        px-4
                                        outline-none
                                        focus:border-violet-500
                                        focus:ring-2
                                        focus:ring-violet-200
                                    "
                                >
                                    <option value="Beginner">
                                        Beginner
                                    </option>

                                    <option value="Intermediate">
                                        Intermediate
                                    </option>

                                    <option value="Advanced">
                                        Advanced
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                    placeholder="e.g. Programming"
                                    className="
                                        mt-2
                                        h-11
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        px-4
                                        outline-none
                                        transition
                                        focus:border-violet-500
                                        focus:ring-2
                                        focus:ring-violet-200
                                    "
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="text-sm font-medium text-slate-700">
                                Proof
                                <span className="ml-1 font-normal text-slate-400">
                                    (optional)
                                </span>
                            </label>

                            <input
                                type="text"
                                value={proof}
                                onChange={(event) =>
                                    setProof(event.target.value)
                                }
                                placeholder="Certificate, portfolio link, etc."
                                className="
                                    mt-2
                                    h-11
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-300
                                    px-4
                                    outline-none
                                    transition
                                    focus:border-violet-500
                                    focus:ring-2
                                    focus:ring-violet-200
                                "
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetForm}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingSkill
                                        ? "Save changes"
                                        : "Add skill"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Skills */}

            {loading ? (
                <div className="mt-12 text-center">
                    <p className="text-slate-500">
                        Loading your skills...
                    </p>
                </div>
            ) : (
                <div className="mt-10 grid gap-8 lg:grid-cols-2">
                    {/* Teach */}

                    <section>
                        <div className="mb-4">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                What I Teach
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Skills you can help other people learn.
                            </p>
                        </div>

                        <Card>
                            {renderSkillList(teachSkills)}
                        </Card>
                    </section>

                    {/* Learn */}

                    <section>
                        <div className="mb-4">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                What I Want To Learn
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Skills you are looking to learn.
                            </p>
                        </div>

                        <Card>
                            {renderSkillList(learnSkills)}
                        </Card>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Skills;