import { useEffect, useState } from "react";

import { getCurrentUser } from "../../api/users";

function UserAvatar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            try {
                const result = await getCurrentUser();

                if (!cancelled) {
                    setUser(result.data);
                }
            } catch (error) {
                console.error(
                    "Unable to load current user:",
                    error
                );
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const name = user?.name || "User";
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="flex items-center gap-3">

            <div className="text-right">

                <p className="text-sm text-slate-500">
                    Welcome back
                </p>

                <h3 className="font-semibold text-slate-800">
                    {name}
                </h3>

            </div>

            <div
                className="
                    w-10
                    h-10
                    rounded-full
                    bg-violet-600
                    text-white
                    flex
                    items-center
                    justify-center
                    font-semibold
                "
            >
                {initial}
            </div>

        </div>
    );
}

export default UserAvatar;