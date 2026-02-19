import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface PerformanceCardProps {
    title: string;
    value: string | number;
    change?: string | number;
    changeType?: 'positive' | 'negative' | 'neutral';
    data?: any[];
    className?: string;
    color?: string;
}

const PerformanceCard = ({
    title,
    value,
    change,
    changeType = 'neutral',
    data = [],
    className,
    color = "#3b82f6"
}: PerformanceCardProps) => {
    return (
        <Card className={cn(
            "border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden group transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
            className
        )}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                            {title}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <motion.h4
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white"
                            >
                                {value}
                            </motion.h4>
                            {change && (
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    changeType === 'positive' ? "bg-emerald-500/10 text-emerald-600" :
                                        changeType === 'negative' ? "bg-rose-500/10 text-rose-600" :
                                            "bg-slate-100 text-slate-500"
                                )}>
                                    {change}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-16 w-full -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line
                                type="monotone"
                                dataKey="val"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={true}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceCard;
