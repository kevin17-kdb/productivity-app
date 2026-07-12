import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignupPage() {

    const { signup } = useAuth();

    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {

        e.preventDefault();

        setError("");

        if(password !== confirmPassword){

            setError("Passwords do not match.");

            return;

        }

        setLoading(true);

        try{

            await signup(

                name,

                email,

                password

            );

            navigate("/login");

        }

        catch(err){

            setError(

                err.response?.data?.detail ||

                "Signup failed."

            );

        }

        setLoading(false);

    };

    return(

        <div className="min-h-screen flex items-center justify-center bg-slate-950">

            <form

                onSubmit={handleSignup}

                className="bg-slate-900 p-8 rounded-2xl w-[420px] shadow-xl"

            >

                <h1 className="text-4xl font-bold text-white mb-8">

                    Create Account

                </h1>

                {

                    error &&

                    <div className="bg-red-600 p-3 rounded-lg text-white mb-5">

                        {error}

                    </div>

                }

                <input

                    type="text"

                    placeholder="Full Name"

                    value={name}

                    onChange={(e)=>setName(e.target.value)}

                    className="w-full p-4 rounded-lg bg-slate-800 text-white mb-4"

                />

                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={(e)=>setEmail(e.target.value)}

                    className="w-full p-4 rounded-lg bg-slate-800 text-white mb-4"

                />

                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={(e)=>setPassword(e.target.value)}

                    className="w-full p-4 rounded-lg bg-slate-800 text-white mb-4"

                />

                <input

                    type="password"

                    placeholder="Confirm Password"

                    value={confirmPassword}

                    onChange={(e)=>setConfirmPassword(e.target.value)}

                    className="w-full p-4 rounded-lg bg-slate-800 text-white mb-6"

                />

                <button

                    className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg text-white font-bold"

                >

                    {

                        loading

                        ?

                        "Creating Account..."

                        :

                        "Signup"

                    }

                </button>

                <p className="text-gray-400 mt-6 text-center">

                    Already have an account?

                    <Link

                        to="/login"

                        className="text-blue-400 ml-2"

                    >

                        Login

                    </Link>

                </p>

            </form>

        </div>

    );

}

export default SignupPage;