import { useEffect, useState } from "react";
import axios from "axios";

function ProfilePage() {

    const [user, setUser] = useState(null);

    useEffect(() => {

        loadProfile();

    }, []);

    const loadProfile = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(

                "http://127.0.0.1:8000/me",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setUser(response.data);

        }

        catch(err){

            console.log(err);

        }

    };

    if(!user){

        return(

            <div className="flex justify-center items-center h-screen">

                Loading...

            </div>

        );

    }

    return(

        <div className="max-w-4xl mx-auto p-8">

            <div className="bg-slate-900 rounded-xl p-8">

                <div className="flex items-center gap-6">

                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl">

                        {user.name.charAt(0).toUpperCase()}

                    </div>

                    <div>

                        <h1 className="text-4xl font-bold">

                            {user.name}

                        </h1>

                        <p className="text-gray-400">

                            {user.email}

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ProfilePage;