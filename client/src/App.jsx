import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import AdminRoute from "./components/common/AdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import Skills from "./pages/Skills";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import Sessions from "./pages/Sessions";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    element={
                        <ProtectedRoute>

                            <MainLayout />

                        </ProtectedRoute>
                    }
                >
                    <Route
                    path="/admin"
                    element={
                    <AdminRoute>
                    <Admin />
                    </AdminRoute>
                    }
                />
                    <Route
                        path="/matches"
                        element={<Matches />}
                    />

                    <Route
                        path="/skills"
                        element={<Skills />}
                    />

                    <Route
                        path="/requests"
                        element={<Requests />}
                    />

                    <Route
                    path="/profile"
                    element={<Profile />}
                    />

                    <Route
                    path="/profile/:userId"
                    element={<Profile />}
                    />

                    <Route
                        path="/chat"
                        element={<Chat />}
                    />
                    <Route
                        path="/sessions"
                        element={<Sessions />}
                    />

                </Route>

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;