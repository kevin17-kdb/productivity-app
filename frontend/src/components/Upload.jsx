import { useState } from "react";

import api from "../services/api";

import SubjectSelector from "./SubjectSelector";

import { useSubject } from "../context/SubjectContext";

function Upload() {

    const { subject } = useSubject();

    const [file, setFile] = useState(null);

    const [message, setMessage] = useState("");

    const [uploading, setUploading] = useState(false);

    const uploadPDF = async () => {

        if (!subject) {

            setMessage("Please select a subject.");

            return;

        }

        if (!file) {

            setMessage("Please select a PDF.");

            return;

        }

        const formData = new FormData();

        formData.append(

            "subject",

            subject

        );

        formData.append(

            "file",

            file

        );

        setUploading(true);

        setMessage("");

        try {

            const response = await api.post(

                "/upload",

                formData,

                {

                    headers: {

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            setMessage(

                response.data.message

            );

            setFile(null);

        }

        catch (err) {

            setMessage(

                err.response?.data?.detail ||

                "Upload failed."

            );

        }

        finally {

            setUploading(false);

        }

    };

    return (

        <div className="max-w-3xl mx-auto text-white">

            <h1 className="text-5xl font-bold mb-8">

                📄 Upload Notes

            </h1>

            <SubjectSelector />

            <div className="bg-slate-900 rounded-2xl p-8 mt-6">

                <p className="mb-4 text-gray-300">

                    Uploading to:

                    <span className="font-bold text-blue-400">

                        {" "}

                        {subject || "No Subject Selected"}

                    </span>

                </p>

                <input

                    type="file"

                    accept=".pdf"

                    onChange={(e) =>

                        setFile(

                            e.target.files[0]

                        )

                    }

                    className="mb-6"

                />

                <button

                    onClick={uploadPDF}

                    disabled={uploading}

                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 px-6 py-3 rounded-xl transition"

                >

                    {

                        uploading

                            ?

                            "Uploading..."

                            :

                            "Upload PDF"

                    }

                </button>

                {

                    message &&

                    <div className="mt-6 bg-slate-800 rounded-xl p-4">

                        {message}

                    </div>

                }

            </div>

        </div>

    );

}

export default Upload;