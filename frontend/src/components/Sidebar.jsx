import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {

    const location = useLocation();

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const links = [

        {
            name: "🏠 Dashboard",
            path: "/"
        },

        {
            name: "📤 Upload",
            path: "/upload"
        },

        {
            name: "💬 AI Chat",
            path: "/chat"
        },

        {
            name: "📜 Chat History",
            path: "/history"
        },

        {
            name: "📝 Quiz",
            path: "/quiz"
        },

        {
            name: "🗂 Flashcards",
            path: "/flashcards"
        },

        {
            name: "📄 Summary",
            path: "/summary"
        },

        {
            name: "⭐ Important Questions",
            path: "/important"
        },


    ];

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

    return (

        <aside className="w-64 min-h-screen sticky top-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 overflow-y-auto">

            {/* Logo */}

            <div>

                <div className="p-6 border-b border-slate-800">

                    <h1 className="text-2xl font-bold text-blue-400 whitespace-nowrap">

                        📚 StudyMate AI

                    </h1>

                    <p className="text-gray-400 text-sm mt-2">

                        Learn Smarter with AI

                    </p>

                </div>

                {/* Navigation */}

                <nav className="px-3 py-4 space-y-1">

                    {

                        links.map((link) => (

                            <Link

                                key={link.path}

                                to={link.path}

                                className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                                location.pathname===link.path
                                ?"bg-blue-600 text-white"
                                :"text-gray-300 hover:bg-slate-800"
                                }`}

                            >

                                {link.name}

                            </Link>

                        ))

                    }

                </nav>

            </div>

            {/* User Section */}

            <div className="border-t border-slate-800 p-4">

            {/* User Card */}

            <div className="bg-slate-800 rounded-xl p-3 mb-4">

                <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">

                        {user?.name
                            ? user.name.charAt(0).toUpperCase()
                            : "G"}

                    </div>

                    <div className="flex-1 overflow-hidden">

                        <h3 className="font-semibold text-white truncate">

                            {user?.name || "Guest"}

                        </h3>

                        <p className="text-sm text-gray-400 truncate">

                            {user?.email || "No email"}

                        </p>

                    </div>

                </div>

            </div>

            {/* Logout Button */}

            <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 rounded-lg py-3 font-semibold transition"
            >
            🚪 Logout
            </button>

        </div>

        </aside>

    );

}

export default Sidebar;