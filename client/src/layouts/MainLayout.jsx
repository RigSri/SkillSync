import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">

            <Sidebar
                collapsed={sidebarCollapsed}
            />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                <Navbar
                    onMenuClick={() =>
                        setSidebarCollapsed(
                            (current) => !current
                        )
                    }
                />

                <main
                    className="
                        flex-1
                        overflow-y-auto
                        px-6
                        py-6
                        lg:px-8
                        lg:py-7
                    "
                >
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default MainLayout;