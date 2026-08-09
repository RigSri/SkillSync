import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../api/auth";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await registerUser(
                name,
                email,
                password
            );

            localStorage.setItem("token", result.token);

            if (result.data) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(result.data)
                );
            }

            navigate("/matches", { replace: true });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to create your account.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white p-12">
                <div className="flex flex-col justify-between w-full">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-xl">
                            S
                        </div>

                        <span className="ml-3 text-2xl font-bold">
                            SkillSync
                        </span>
                    </div>

                    <div className="max-w-md">
                        <p className="text-violet-400 text-sm font-medium mb-3">
                            START YOUR JOURNEY
                        </p>

                        <h1 className="text-4xl font-semibold leading-tight">
                            Learn something new.
                            <br />
                            Teach what you know.
                        </h1>

                        <p className="mt-5 text-slate-400 leading-relaxed">
                            Build meaningful learning connections
                            through skill exchange.
                        </p>
                    </div>

                    <p className="text-sm text-slate-500">
                        SkillSync peer-to-peer learning platform
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center mb-10">
                        <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-xl text-white">
                            S
                        </div>

                        <span className="ml-3 text-2xl font-bold text-slate-900">
                            SkillSync
                        </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Join SkillSync and start exchanging
                                skills.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Input
                                    label="Name"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                to="/"
                                className="font-medium text-violet-600 hover:text-violet-700"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;