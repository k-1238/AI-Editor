import { NodeViewWrapper } from "@tiptap/react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Mode } from "chartjs-plugin-zoom/types/options";
import { useEffect, useState } from "react";
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const optionsChart = ["Bar", "Line", "Pie"];

const GenerateChart = ({ node }: any) => {
  const chartData = node.attrs.data;
  const [randomChart, setRandomChart] = useState<JSX.Element | null>(null);
  const aggregateData = (data: number[], interval: number) => {
    return data.reduce((acc, value, index) => {
      if (index % interval === 0) {
        acc.push({ label: `Point ${index}`, value });
      }
      return acc;
    }, [] as { label: string; value: number }[]);
  };

  const options = {
    responsive: true,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x" as Mode,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as Mode,
        },
        callbacks: {
          zoom: ({ chart }: any) => {
            const visibleRange = chart.scales.x.max - chart.scales.x.min;
            const data = chart.data.datasets[0].data as number[];
            const interval = Math.max(
              1,
              Math.floor(data.length / visibleRange)
            );
            const aggregated = aggregateData(data, interval);
            chart.data.labels = aggregated.map((point) => point.label);
            chart.data.datasets[0].data = aggregated.map(
              (point) => point.value
            );
            chart.update();
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    const generateChart = () => {
      const randomIdx = Math.floor(Math.random() * optionsChart.length);
      switch (randomIdx) {
        case 0:
          return <Bar data={chartData} options={options} />;
        case 1:
          return <Line data={chartData} options={options} />;
        case 2:
          return <Pie data={chartData} options={options} />;
        default:
          return null;
      }
    };

    if (chartData?.labels?.length > 0) {
      setRandomChart(generateChart());
    }
  }, [chartData]); // Run effect only when chartData changes
  return (
    <NodeViewWrapper>
      <div className="flex w-full items-center gap-2">{randomChart}</div>
    </NodeViewWrapper>
  );
};

export default GenerateChart;
