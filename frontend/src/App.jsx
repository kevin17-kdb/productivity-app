import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import QuizPage from "./pages/QuizPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import SummaryPage from "./pages/SummaryPage";
import ImportantQuestionsPage from "./pages/ImportantQuestionsPage";
import ChatHistoryPage from "./pages/ChatHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Public Routes */}

                <Route

                    path="/login"

                    element={<LoginPage />}

                />

                <Route

                    path="/signup"

                    element={<SignupPage />}

                />

                {/* Protected Routes */}

                <Route

                    path="/"

                    element={

                        <ProtectedRoute>

                            <Layout />

                        </ProtectedRoute>

                    }

                >

                    <Route

                        index

                        element={<Dashboard />}

                    />

                    <Route

                        path="upload"

                        element={<UploadPage />}

                    />

                    <Route

                        path="chat"

                        element={<ChatPage />}

                    />

                    <Route

                        path="history"

                        element={<ChatHistoryPage />}

                    />

                    <Route

                        path="quiz"

                        element={<QuizPage />}

                    />

                    <Route

                        path="flashcards"

                        element={<FlashcardsPage />}

                    />

                    <Route

                        path="summary"

                        element={<SummaryPage />}

                    />

                    <Route

                        path="important"

                        element={<ImportantQuestionsPage />}

                    />

                    <Route

                        path="profile"

                        element={<ProfilePage />}

                    />

                    <Route

                        path="settings"

                        element={<SettingsPage />}

                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}

export default App;