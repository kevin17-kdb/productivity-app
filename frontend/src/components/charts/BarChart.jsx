import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLORS = ["#7c6ff0","#f0a857","#34d399","#38bdf8","#e879f9","#fb7185"];

function BarChart({ stats }) {
    const values = [
        stats.uploads, stats.questions, stats.quizzes,
        stats.flashcards, stats.summaries, stats.important_questions,
    ];

    const data = {
        labels: ["Uploads","Questions","Quiz","Flashcards","Summary","Important"],
        datasets: [{
            label: "Count",
            data: values,
            backgroundColor: COLORS.map((c) => c + "99"), // 60% opacity
            borderColor: COLORS,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(14,12,40,0.92)",
                borderColor: "rgba(109,89,238,0.3)",
                borderWidth: 1,
                titleColor: "#a094f8",
                bodyColor: "#e8e4f8",
                padding: 10,
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(109,89,238,0.08)" },
                ticks: { color: "rgba(180,172,230,0.65)", font: { size: 11 } },
                border: { color: "transparent" },
            },
            y: {
                grid: { color: "rgba(109,89,238,0.1)" },
                ticks: { color: "rgba(180,172,230,0.65)", font: { size: 11 }, stepSize: 1 },
                border: { color: "transparent" },
                beginAtZero: true,
            },
        },
    };

    return <Bar data={data} options={options} />;
}

export default BarChart;
