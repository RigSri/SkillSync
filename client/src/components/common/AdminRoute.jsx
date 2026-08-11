import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getCurrentUser } from "../../api/users";

function AdminRoute({ children }) {
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkAdmin = async () => {
            if (!token) {
                if (!cancelled) {
                    setLoading(false);
                }

                return;
            }

            try {
                const result = await getCurrentUser();

                if (!cancelled) {
                    setIsAdmin(
                        result.data?.role === "admin"
                    );
                }
            } catch {
                if (!cancelled) {
                    setIsAdmin(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        checkAdmin();

        return () => {
            cancelled = true;
        };
    }, [token]);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <p className="text-sm text-slate-500">
                    Checking admin access...
                </p>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/matches" replace />;
    }

    return children;
}

export default AdminRoute;