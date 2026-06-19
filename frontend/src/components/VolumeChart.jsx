import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./VolumeChart.css";

const HOUR_LABELS = [
  "12am","1am","2am","3am","4am","5am",
  "6am","7am","8am","9am","10am","11am",
  "12pm","1pm","2pm","3pm","4pm","5pm",
  "6pm","7pm","8pm","9pm","10pm","11pm",
];

export default function VolumeChart({ volumes, capacity, underThreshold }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const barColors = volumes.map((v) => {
      const r = v / capacity;
      if (r > 1) return "#c0392b";
      if (r < underThreshold) return "#2e7d32";
      return "#888780";
    });

    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = volumes;
      chartRef.current.data.datasets[0].backgroundColor = barColors;
      chartRef.current.data.datasets[1].data = Array(24).fill(capacity);
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: HOUR_LABELS,
        datasets: [
          {
            label: "Volume",
            data: volumes,
            backgroundColor: barColors,
            borderWidth: 0,
          },
          {
            label: "Capacity",
            data: Array(24).fill(capacity),
            type: "line",
            borderColor: "#c0392b",
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ctx.datasetIndex === 0
                  ? ` ${ctx.parsed.y} vehicles`
                  : ` capacity: ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: { size: 11 },
              maxRotation: 45,
              autoSkip: false,
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 11 } },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [volumes, capacity, underThreshold]);

  return (
    <div className="chart-wrapper">
      <div className="chart-legend">
        <span className="legend-item legend-toll">Over capacity (toll)</span>
        <span className="legend-item legend-reward">Under threshold (reward)</span>
        <span className="legend-item legend-neutral">Neutral</span>
      </div>
      <div className="chart-canvas-wrapper">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Bar chart of hourly traffic volume. Red bars are over capacity, green bars earn a reward, grey bars are neutral."
        />
      </div>
    </div>
  );
}