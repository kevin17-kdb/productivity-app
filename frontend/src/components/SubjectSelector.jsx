import { useSubject } from "../context/SubjectContext";

function SubjectSelector() {

    const {

        subject,

        setSubject

    } = useSubject();

    const subjects = [

        "Probability",

        "Signals",

        "Digital Electronics",

        "Operating Systems",

        "Computer Networks",

        "Control Systems",

        "Microprocessors"

    ];

    return (

        <div className="mb-6">

            <label className="block text-lg font-semibold mb-3">

                📚 Current Subject

            </label>

            <select

                value={subject}

                onChange={(e) =>

                    setSubject(e.target.value)

                }

                className="w-full md:w-96 bg-slate-800 text-white border border-slate-700 rounded-xl p-3"

            >

                {

                    subjects.map((sub) => (

                        <option

                            key={sub}

                            value={sub}

                        >

                            {sub}

                        </option>

                    ))

                }

            </select>

        </div>

    );

}

export default SubjectSelector;