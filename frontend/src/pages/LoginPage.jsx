import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {

    const { login } = useAuth();

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        setLoading(true);

        try {

            await login(email, password);

            navigate("/");

        }

        catch (err) {

            setError(

                err.response?.data?.detail ||

                "Login failed."

            );

        }

        setLoading(false);

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-bg px-4">
    <form
        onSubmit={handleLogin}
        className="bg-surface border border-border p-10 rounded-2xl w-[420px] shadow-2xl shadow-black/40"
    >
        <h1 className="font-display text-4xl font-semibold text-white mb-1">
            Welcome back
        </h1>
        <p className="text-muted text-sm mb-8">
            Log in to keep studying with StudyMate AI.
        </p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg mb-5">
                {error}
            </div>
        )}

        <label className="text-xs text-muted uppercase tracking-wide mb-1 block">Email</label>
        <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-bg border border-border text-white mb-4
                       placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />

        <label className="text-xs text-muted uppercase tracking-wide mb-1 block">Password</label>
        <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-bg border border-border text-white mb-6
                       placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />

        <button
            className="w-full bg-accent hover:bg-accent/90 p-3.5 rounded-lg text-white font-semibold
                       transition-colors disabled:opacity-60"
            disabled={loading}
        >
            {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-muted mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:underline">
                Sign up
            </Link>
        </p>
    </form>
</div>

    );

}

export default LoginPage;