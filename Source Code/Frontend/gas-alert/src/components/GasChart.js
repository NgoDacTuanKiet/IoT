import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function GasChart({ history }) {
    return (
        <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
            <h3>Đồ thị nồng độ khí gas (20 lần gần nhất)</h3>
            <Line
                data={{
                    labels: history.map(h => h.time),
                    datasets: [
                        {
                            label: "Nồng độ (%)",
                            data: history.map(h => h.value),
                            borderColor: "rgba(75,192,192,1)",
                            backgroundColor: "rgba(75,192,192,0.2)",
                            fill: true,
                            tension: 0.4
                        }
                    ]
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                        title: { display: false }
                    },
                    scales: {
                        y: { min: 0, max: 100 }
                    }
                }}
            />
        </div>
    );
}
