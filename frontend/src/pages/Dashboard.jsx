import { useEffect, useState } from "react";

import api from "../services/api";

import BarChart from "../components/charts/BarChart";
import PieChart from "../components/charts/PieChart";

function Dashboard() {

    const [user, setUser] = useState({
        name: ""
    });

    const [stats, setStats] = useState({

        uploads: 0,
        questions: 0,
        quizzes: 0,
        flashcards: 0,
        summaries: 0,
        important_questions: 0

    });

    const [documents, setDocuments] = useState([]);

    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            // Current User

            const me = await api.get(

                "/me"

            );

            setUser(me.data);

            // Dashboard Statistics

            const dashboard = await api.get(

                "/dashboard"

            );

            setStats(dashboard.data);

            // Recent Documents

            const docs = await api.get(

                "/recent-documents"

            );

            setDocuments(docs.data);

            // Recent Questions

            const chats = await api.get(

                "/recent-questions"

            );

            setQuestions(chats.data);

        }

        catch (err) {

            console.error(err);

            setError("Unable to load dashboard.");

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="flex justify-center items-center h-screen">

                <h1 className="text-2xl">

                    Loading Dashboard...

                </h1>

            </div>

        );

    }

    return (

        <div className="p-6 lg:p-10 bg-bg min-h-screen">

    <div className="mb-10">
        <h1 className="font-display text-4xl font-semibold text-white">
            Welcome, <span className="text-accent">{user.name}</span> 👋
        </h1>
        <p className="text-muted mt-2">
            Here's your StudyMate AI overview.
        </p>
    </div>

    {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
            {error}
        </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <Card title="Uploads" value={stats.uploads} accent="bg-accent" />
        <Card title="Questions" value={stats.questions} accent="bg-warm" />
        <Card title="Quizzes" value={stats.quizzes} accent="bg-emerald-400" />
        <Card title="Flashcards" value={stats.flashcards} accent="bg-sky-400" />
        <Card title="Summaries" value={stats.summaries} accent="bg-fuchsia-400" />
        <Card title="Important" value={stats.important_questions} accent="bg-rose-400" />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8">
        <div className="bg-surface rounded-2xl p-6 border border-border">
            <h2 className="font-display text-xl font-semibold text-white mb-5">Recent Uploads</h2>
            {documents.length === 0 ? (
                <p className="text-muted text-sm">No uploads yet.</p>
            ) : (
                documents.map((doc, i) => (
                    <div key={i} className="border-b border-border py-3 last:border-0">
                        <p className="font-medium text-white">{doc.filename}</p>
                        <p className="text-muted text-sm">{doc.subject}</p>
                    </div>
                ))
            )}
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-border">
            <h2 className="font-display text-xl font-semibold text-white mb-5">Recent Questions</h2>
            {questions.length === 0 ? (
                <p className="text-muted text-sm">No questions yet.</p>
            ) : (
                questions.map((chat, i) => (
                    <div key={i} className="border-b border-border py-3 last:border-0">
                        <p className="font-medium text-white">{chat.question}</p>
                        <p className="text-muted text-sm">{chat.subject}</p>
                    </div>
                ))
            )}
        </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8">
        <div className="bg-surface rounded-2xl p-6 border border-border">
            <h2 className="font-display text-xl font-semibold text-white mb-6">Study Activity</h2>
            <BarChart stats={stats} />
        </div>
        <div className="bg-surface rounded-2xl p-6 border border-border">
            <h2 className="font-display text-xl font-semibold text-white mb-6">AI Usage</h2>
            <PieChart stats={stats} />
        </div>
    </div>
</div>
    );

}

function Card({ title, value, accent }) {
    return (
        <div className="bg-surface rounded-2xl p-5 border border-border relative overflow-hidden hover:bg-surface-hover transition-colors">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
            <p className="text-muted text-xs uppercase tracking-wide">{title}</p>
            <h1 className="font-display text-4xl font-semibold text-white mt-3">{value}</h1>
        </div>
    );
}


export default Dashboard;