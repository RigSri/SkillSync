import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import Skills from "./pages/Skills";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
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