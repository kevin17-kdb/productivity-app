import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

function BarChart({ stats }) {

    const data = {

        labels: [

            "Uploads",

            "Questions",

            "Quiz",

            "Flashcards",

            "Summary",

            "Important"

        ],

        datasets: [

            {

                label: "Study Activity",

                data: [

                    stats.uploads,

                    stats.questions,

                    stats.quizzes,

                    stats.flashcards,

                    stats.summaries,

                    stats.important_questions

                ]

            }

        ]

    };

    return (

        <Bar

            data={data}

        />

    );

}

export default BarChart;
