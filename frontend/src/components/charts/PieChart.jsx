import {

    Chart as ChartJS,

    ArcElement,

    Tooltip,

    Legend

} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(

    ArcElement,

    Tooltip,

    Legend

);

function PieChart({ stats }) {

    const data = {

        labels: [

            "Quiz",

            "Flashcards",

            "Summary",

            "Important"

        ],

        datasets: [

            {

                data: [

                    stats.quizzes,

                    stats.flashcards,

                    stats.summaries,

                    stats.important_questions

                ]

            }

        ]

    };

    return (

        <Pie

            data={data}

        />

    );

}

export default PieChart;
