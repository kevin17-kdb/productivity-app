import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function SettingsPage() {

    const { user, logout } = useAuth();

    const { theme, setTheme } = useTheme();

    const navigate = useNavigate();

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

    return (

        <div className="max-w-5xl mx-auto p-8">

            <h1 className="text-4xl font-bold mb-8">

                ⚙ Settings

            </h1>

            {/* Profile */}

            <div className="bg-slate-900 rounded-xl p-6 mb-6">

                <h2 className="text-2xl font-semibold mb-4">

                    Profile

                </h2>

                <p className="mb-2">

                    <strong>Name:</strong> {user?.name}

                </p>

                <p>

                    <strong>Email:</strong> {user?.email}

                </p>

            </div>

            {/* Theme */}

            <div className="bg-slate-900 rounded-xl p-6 mb-6">

                <h2 className="text-2xl font-semibold mb-4">

                    Appearance

                </h2>

                <select

                    value={theme}

                    onChange={(e)=>setTheme(e.target.value)}

                    className="bg-slate-800 rounded-lg p-3 text-white"

                >

                    <option value="dark">

                        🌙 Dark

                    </option>

                    <option value="light">

                        ☀ Light

                    </option>

                </select>

            </div>

            {/* Account */}

            <div className="bg-slate-900 rounded-xl p-6">

                <h2 className="text-2xl font-semibold mb-4">

                    Account

                </h2>

                <button

                    onClick={handleLogout}

                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl"

                >

                    Logout

                </button>

            </div>

        </div>

    );

}

export default SettingsPage;