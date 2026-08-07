import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

function MainLayout() {
    return (

        <div className="flex h-screen bg-slate-100 overflow-hidden">

            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">

                <Navbar />

                <main
                    className="
                        flex-1
                        overflow-y-auto
                        p-8
                    "
                >
                    <Outlet />
                </main>

            </div>

        </div>

    );
}

export default MainLayout;