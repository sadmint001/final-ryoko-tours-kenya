import { useState } from 'react';
import WorldMap from './WorldMap';
import RegionalPieChart from './RegionalPieChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map as MapIcon, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface VisitorAnalyticsByRegionProps {
    data?: Record<string, number>;
}

const VisitorAnalyticsByRegion = ({ data: externalData }: VisitorAnalyticsByRegionProps) => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    const visitorData: Record<string, number> = externalData || {
        Africa: 0,
        Europe: 0,
        Asia: 0,
        "North America": 0,
        "South America": 0,
        Oceania: 0
    };

    const totalVisitors = Object.values(visitorData).reduce((a, b) => a + b, 0);

    return (
        <Card className="bg-white dark:bg-[#0a0a0a] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <MapIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                                Visitor Analytics by Region
                            </CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium pl-1">
                            Interactive geographical breakdown of your global audience
                        </CardDescription>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Impressions</p>
                            <motion.p
                                key={totalVisitors}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="text-2xl font-black text-slate-900 dark:text-white"
                            >
                                {totalVisitors.toLocaleString()}
                            </motion.p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-10 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 h-[450px]">
                        <WorldMap
                            data={visitorData}
                            onSelect={setSelectedRegion}
                            selectedRegion={selectedRegion}
                        />
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-center border-l border-slate-100 dark:border-white/5 pl-0 lg:pl-10">
                        <div className="flex items-center gap-2 mb-8">
                            <PieIcon className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Regional Distribution</h4>
                        </div>

                        <RegionalPieChart
                            data={visitorData}
                            onSelect={setSelectedRegion}
                            selectedRegion={selectedRegion}
                        />

                        {selectedRegion && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-10 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">Selected Focus</span>
                                    <TrendingUp className="w-3 h-3 text-blue-500" />
                                </div>
                                <p className="text-lg font-black text-blue-600">{selectedRegion}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                                    {((visitorData[selectedRegion] / totalVisitors) * 100).toFixed(1)}% of total traffic
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default VisitorAnalyticsByRegion;
