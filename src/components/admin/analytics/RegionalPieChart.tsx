import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

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

    const chartData = regions.map((region, i) => ({
        name: region,
        value: data[region],
        color: colors[i]
    }));

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="relative w-full h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                const percentage = ((value / total) * 100).toFixed(1);
                                return [`${value.toLocaleString()} (${percentage}%)`, name];
                            }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            onClick={(data) => {
                                if (data && data.name && onSelect) {
                                    onSelect(data.name);
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    opacity={(!selectedRegion || selectedRegion === entry.name) ? 1 : 0.3}
                                    className="transition-opacity duration-300 outline-none"
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-xs mx-auto">
                {regions.map((region, i) => {
                    const val = data[region];
                    const percentage = ((val / total) * 100).toFixed(1);
                    const isSelected = !selectedRegion || selectedRegion === region;

                    return (
                        <motion.div
                            key={region}
                            className={`flex items-center gap-2 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-30'} cursor-pointer`}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => onSelect?.(region)}
                        >
                            <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
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
