import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RegionalPieChartProps {
    data: Record<string, number>;
    onSelect?: (region: string) => void;
    selectedRegion?: string | null;
}

const RegionalPieChart = ({ data, onSelect, selectedRegion }: RegionalPieChartProps) => {
    const regions = Object.keys(data);
    const values = Object.values(data);
    const total = values.reduce((a, b) => a + b, 0);

    const colors = [
        '#3b82f6', // Asia - Blue
        '#10b981', // Europe - Emerald
        '#f59e0b', // North America - Amber
        '#6366f1', // South America - Indigo
        '#ec4899', // Africa - Pink
        '#8b5cf6', // Oceania - Violet
    ];

    const chartData = {
        labels: regions,
        datasets: [
            {
                data: values,
                backgroundColor: colors.map((c, i) => {
                    if (!selectedRegion) return c;
                    return selectedRegion === regions[i] ? c : `${c}33`; // 33 is ~20% opacity
                }),
                borderWidth: 0,
                hoverOffset: 15,
            },
        ],
    };

    const options: ChartOptions<'pie'> = {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                    },
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_, elements) => {
            if (elements.length > 0 && onSelect) {
                const index = elements[0].index;
                onSelect(regions[index]);
            }
        },
    };

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="relative w-full h-64 mb-6">
                <Pie data={chartData} options={options} />
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-xs mx-auto">
                {regions.map((region, i) => {
                    const val = data[region];
                    const percentage = ((val / total) * 100).toFixed(1);
                    const isSelected = !selectedRegion || selectedRegion === region;

                    return (
                        <motion.div
                            key={region}
                            className={`flex items-center gap-2 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-30'}`}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => onSelect?.(region)}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: colors[i] }}
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider leading-none">
                                    {region}
                                </span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {percentage}%
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default RegionalPieChart;
