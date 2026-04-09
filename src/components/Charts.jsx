import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const CHART_DEFAULTS = {
  color: '#8A919E',
  borderColor: 'rgba(80,90,107,0.3)',
  font: { family: "'DM Sans', sans-serif" },
};

export function DonutChart({ data, title }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderColor: '#0A1220',
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              ...CHART_DEFAULTS,
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
            },
          },
          title: {
            display: !!title,
            text: title,
            ...CHART_DEFAULTS,
            font: { ...CHART_DEFAULTS.font, size: 13, weight: 600 },
            padding: { bottom: 16 },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, title]);

  return (
    <div className="chart-container" style={{ height: 260 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export function BarChart({ labels, datasets, title }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              ...CHART_DEFAULTS,
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
            },
          },
          title: {
            display: !!title,
            text: title,
            ...CHART_DEFAULTS,
            font: { ...CHART_DEFAULTS.font, size: 13, weight: 600 },
            padding: { bottom: 16 },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(80,90,107,0.15)' },
            ticks: { ...CHART_DEFAULTS },
          },
          y: {
            grid: { color: 'rgba(80,90,107,0.15)' },
            ticks: { ...CHART_DEFAULTS },
            beginAtZero: true,
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [labels, datasets, title]);

  return (
    <div className="chart-container" style={{ height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export function LineChart({ labels, datasets, title }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              ...CHART_DEFAULTS,
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
            },
          },
          title: {
            display: !!title,
            text: title,
            ...CHART_DEFAULTS,
            font: { ...CHART_DEFAULTS.font, size: 13, weight: 600 },
            padding: { bottom: 16 },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(80,90,107,0.15)' },
            ticks: { ...CHART_DEFAULTS },
          },
          y: {
            grid: { color: 'rgba(80,90,107,0.15)' },
            ticks: { ...CHART_DEFAULTS },
            beginAtZero: true,
          },
        },
        elements: {
          point: { radius: 4, hoverRadius: 6 },
          line: { tension: 0.3 },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [labels, datasets, title]);

  return (
    <div className="chart-container" style={{ height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
