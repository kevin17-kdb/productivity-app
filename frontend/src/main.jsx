import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { SubjectProvider } from "./context/SubjectContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(

    document.getElementById("root")

).render(

    <React.StrictMode>

        <ThemeProvider>

            <AuthProvider>

                <SubjectProvider>

                    <App />

                </SubjectProvider>

            </AuthProvider>

        </ThemeProvider>

    </React.StrictMode>

);