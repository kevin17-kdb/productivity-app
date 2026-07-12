import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    // -----------------------------
    // Load User
    // -----------------------------

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {

            setLoading(false);

            return;

        }

        axios.get(

            "http://127.0.0.1:8000/me",

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        )

        .then((res) => {

            setUser(res.data);

        })

        .catch(() => {

            localStorage.removeItem("token");

            setUser(null);

        })

        .finally(() => {

            setLoading(false);

        });

    }, []);

    // -----------------------------
    // Login
    // -----------------------------

    const login = async (email, password) => {

        const response = await axios.post(

            "http://127.0.0.1:8000/login",

            {

                email,

                password

            }

        );

        const token = response.data.access_token;

        localStorage.setItem(

            "token",

            token

        );

        const me = await axios.get(

            "http://127.0.0.1:8000/me",

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        setUser(me.data);

    };

    // -----------------------------
    // Signup
    // -----------------------------

    const signup = async (

        name,

        email,

        password

    ) => {

        await axios.post(

            "http://127.0.0.1:8000/signup",

            {

                name,

                email,

                password

            }

        );

    };

    // -----------------------------
    // Logout
    // -----------------------------

    const logout = () => {

        localStorage.removeItem(

            "token"

        );

        setUser(null);

    };

    return (

        <AuthContext.Provider

            value={{

                user,

                loading,

                login,

                signup,

                logout

            }}

        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(

        AuthContext

    );

}