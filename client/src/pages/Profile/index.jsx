import { useEffect, useState } from "react";

import {
    getCurrentUser,
    updateProfile,
    updateAvailability,
} from "../../api/users";

import { getMySkills } from "../../api/skills";

import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";
import Badge from "../../components/UI/Badge";

function Profile() {
    const [user, setUser] = useState(null);
    const [skills, setSkills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editing, setEditing] = useState(false);
    const [availability, setAvailability] = useState([]);
const [editingAvailability, setEditingAvailability] =
    useState(false);

const [availabilityForm, setAvailabilityForm] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "17:00",
});
    const [form, setForm] = useState({
        name: "",
        bio: "",
        city: "",
        timezone: "",
    });

    useEffect(() => {
    let cancelled = false;

    const load = async () => {
        try {
            setError("");

            const [userResult, skillsResult] =
                await Promise.all([
                    getCurrentUser(),
                    getMySkills(),
                ]);

            if (cancelled) return;

            setUser(userResult.data);
            setSkills(skillsResult.data || []);
            setAvailability(
    userResult.data.availability || []
);
            setForm({
                name: userResult.data.name || "",
                bio: userResult.data.bio || "",
                city: userResult.data.city || "",
                timezone: userResult.data.timezone || "",
            });
        } catch (error) {
            if (cancelled) return;

            setError(
                error.response?.data?.message ||
                    "Unable to load your profile."
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
    const handleAvailabilityChange = (event) => {
    const { name, value } = event.target;

    setAvailabilityForm((current) => ({
        ...current,
        [name]: value,
    }));
};

const handleAddAvailability = async (event) => {
    event.preventDefault();

    try {
        setError("");

        const updatedAvailability = [
            ...availability,
            availabilityForm,
        ];

        const result = await updateAvailability(
            updatedAvailability
        );

        setAvailability(result.data || []);
        setAvailabilityForm({
            day: "Monday",
            startTime: "09:00",
            endTime: "17:00",
        });
        setEditingAvailability(false);
    } catch (error) {
        setError(
            error.response?.data?.message ||
                "Unable to update availability."
        );
    }
};

const handleDeleteAvailability = async (index) => {
    try {
        setError("");

        const updatedAvailability =
            availability.filter(
                (_, currentIndex) => currentIndex !== index
            );

        const result = await updateAvailability(
            updatedAvailability
        );

        setAvailability(result.data || []);
    } catch (error) {
        setError(
            error.response?.data?.message ||
                "Unable to update availability."
        );
    }
};
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        try {
            setError("");

            const result = await updateProfile(form);

            setUser(result.data);
            setEditing(false);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to update your profile."
            );
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-slate-500">
                Loading profile...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-sm text-red-600">
                {error || "Unable to load profile."}
            </div>
        );
    }

    const teachingSkills = skills.filter(
        (skill) => skill.type === "teach"
    );

    const learningSkills = skills.filter(
        (skill) => skill.type === "learn"
    );

    return (
        <div className="max-w-5xl space-y-6">

            {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Profile header */}

            <Card>
                <div className="flex items-start justify-between">

                    <div className="flex items-center gap-4">

                        <div className="
                            w-16
                            h-16
                            rounded-full
                            bg-violet-600
                            text-white
                            flex
                            items-center
                            justify-center
                            text-xl
                            font-semibold
                        ">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {user.name}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {user.email}
                            </p>
                        </div>

                    </div>

                    {!editing && (
                        <Button
                            variant="secondary"
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </Button>
                    )}

                </div>
            </Card>

            {/* Profile information */}

            <Card>

                <div className="flex items-center justify-between mb-6">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            About
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Your profile information
                        </p>
                    </div>

                </div>

                {editing ? (

                    <form
                        onSubmit={handleSave}
                        className="space-y-5"
                    >

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Name
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="
                                    w-full
                                    h-11
                                    rounded-lg
                                    border
                                    border-slate-300
                                    px-4
                                    outline-none
                                    focus:border-violet-500
                                "
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Bio
                            </label>

                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                rows="3"
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-300
                                    px-4
                                    py-3
                                    outline-none
                                    resize-none
                                    focus:border-violet-500
                                "
                                placeholder="Tell people a little about yourself"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    City
                                </label>

                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    className="
                                        w-full
                                        h-11
                                        rounded-lg
                                        border
                                        border-slate-300
                                        px-4
                                        outline-none
                                        focus:border-violet-500
                                    "
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Timezone
                                </label>

                                <input
                                    name="timezone"
                                    value={form.timezone}
                                    onChange={handleChange}
                                    className="
                                        w-full
                                        h-11
                                        rounded-lg
                                        border
                                        border-slate-300
                                        px-4
                                        outline-none
                                        focus:border-violet-500
                                    "
                                />
                            </div>

                        </div>

                        <div className="flex gap-3">

                            <Button type="submit">
                                Save Changes
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </Button>

                        </div>

                    </form>

                ) : (

                    <div className="space-y-5">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Bio
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                                {user.bio || "No bio added yet."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    City
                                </p>

                                <p className="mt-1 text-sm text-slate-700">
                                    {user.city || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Timezone
                                </p>

                                <p className="mt-1 text-sm text-slate-700">
                                    {user.timezone || "Not provided"}
                                </p>
                            </div>

                        </div>

                    </div>

                )}

            </Card>

            {/* Skills */}

            <Card>

                <div className="mb-6">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Your Skills
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Skills you teach and want to learn
                    </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div>

                        <h3 className="text-sm font-medium text-slate-700 mb-3">
                            Teaching
                        </h3>

                        {teachingSkills.length === 0 ? (

                            <p className="text-sm text-slate-400">
                                No teaching skills added.
                            </p>

                        ) : (

                            <div className="space-y-3">

                                {teachingSkills.map((skill) => (

                                    <div
                                        key={skill._id}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            border-b
                                            border-slate-100
                                            pb-3
                                        "
                                    >

                                        <span className="text-sm font-medium text-slate-800 capitalize">
                                            {skill.name}
                                        </span>

                                        <Badge>
                                            {skill.level}
                                        </Badge>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                    <div>

                        <h3 className="text-sm font-medium text-slate-700 mb-3">
                            Learning
                        </h3>

                        {learningSkills.length === 0 ? (

                            <p className="text-sm text-slate-400">
                                No learning skills added.
                            </p>

                        ) : (

                            <div className="space-y-3">

                                {learningSkills.map((skill) => (

                                    <div
                                        key={skill._id}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            border-b
                                            border-slate-100
                                            pb-3
                                        "
                                    >

                                        <span className="text-sm font-medium text-slate-800 capitalize">
                                            {skill.name}
                                        </span>

                                        <Badge variant="success">
                                            {skill.level}
                                        </Badge>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>

            </Card>
<Card>
    <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-lg font-semibold text-slate-900">
                Availability
            </h2>

            <p className="text-sm text-slate-500 mt-1">
                Let others know when you're available for
                learning sessions.
            </p>
        </div>

        {!editingAvailability && (
            <Button
                variant="secondary"
                onClick={() =>
                    setEditingAvailability(true)
                }
            >
                Add Time
            </Button>
        )}
    </div>

    {editingAvailability && (
        <form
            onSubmit={handleAddAvailability}
            className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Day
                    </label>

                    <select
                        name="day"
                        value={availabilityForm.day}
                        onChange={handleAvailabilityChange}
                        className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3"
                    >
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Start Time
                    </label>

                    <input
                        type="time"
                        name="startTime"
                        value={availabilityForm.startTime}
                        onChange={handleAvailabilityChange}
                        className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        End Time
                    </label>

                    <input
                        type="time"
                        name="endTime"
                        value={availabilityForm.endTime}
                        onChange={handleAvailabilityChange}
                        className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3"
                    />
                </div>

            </div>

            <div className="flex gap-3 mt-4">

                <Button type="submit">
                    Add Availability
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        setEditingAvailability(false)
                    }
                >
                    Cancel
                </Button>

            </div>
        </form>
    )}

    {availability.length === 0 ? (

        <p className="text-sm text-slate-400">
            No availability added yet.
        </p>

    ) : (

        <div className="space-y-3">

            {availability.map((slot, index) => (
                <div
                    key={`${slot.day}-${slot.startTime}-${index}`}
                    className="
                        flex
                        items-center
                        justify-between
                        border
                        border-slate-200
                        rounded-xl
                        px-4
                        py-3
                    "
                >
                    <div>
                        <p className="font-medium text-slate-800">
                            {slot.day}
                        </p>

                        <p className="text-sm text-slate-500">
                            {slot.startTime} - {slot.endTime}
                        </p>
                    </div>

                    <Button
                        variant="danger"
                        onClick={() =>
                            handleDeleteAvailability(index)
                        }
                    >
                        Remove
                    </Button>
                </div>
            ))}

        </div>
    )}
</Card>
        </div>
    );
}

export default Profile;