import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS      = ["#7c6ff0","#38bdf8","#e879f9","#fb7185"];
const COLORS_HOVER= ["#9d93f8","#60cefa","#f0a0ff","#fc9daa"];

function PieChart({ stats }) {
    const data = {
        labels: ["Quiz","Flashcards","Summary","Important"],
        datasets: [{
            data: [stats.quizzes, stats.flashcards, stats.summaries, stats.important_questions],
            backgroundColor: COLORS.map((c) => c + "cc"), // 80% opacity
            hoverBackgroundColor: COLORS_HOVER,
            borderColor: "rgba(14,12,40,0.6)",
            borderWidth: 3,
            hoverOffset: 8,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "rgba(180,172,230,0.75)",
                    font: { size: 12 },
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 10,
                },
            },
            tooltip: {
                backgroundColor: "rgba(14,12,40,0.92)",
                borderColor: "rgba(109,89,238,0.3)",
                borderWidth: 1,
                titleColor: "#a094f8",
                bodyColor: "#e8e4f8",
                padding: 10,
            },
        },
    };

    return <Pie data={data} options={options} />;
}

export default PieChart;
