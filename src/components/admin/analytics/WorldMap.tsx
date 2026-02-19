import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'framer-motion';

interface WorldMapProps {
    data: Record<string, number>;
    onSelect?: (region: string) => void;
    selectedRegion?: string | null;
}

const WorldMap = ({ data, onSelect, selectedRegion }: WorldMapProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string, visible: boolean }>({ x: 0, y: 0, text: '', visible: false });
    const [geoData, setGeoData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const colors: Record<string, string> = {
        'Asia': '#3b82f6',
        'Europe': '#10b981',
        'North America': '#f59e0b',
        'South America': '#6366f1',
        'Africa': '#ec4899',
        'Oceania': '#8b5cf6',
    };

    useEffect(() => {
        // Fetch continent TopoJSON
        fetch('https://raw.githubusercontent.com/BolajiBI/topojson-maps/master/world-continents.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch map data');
                return res.json();
            })
            .then(json => {
                setGeoData(json);
            })
            .catch(err => {
                console.error("Failed to fetch Map data", err);
                setError(err.message);
            });
    }, []);

    useEffect(() => {
        if (!geoData || !svgRef.current) return;

        try {
            const svg = d3.select(svgRef.current);
            const width = 800;
            const height = 450;

            svg.selectAll("*").remove();

            const projection = d3.geoNaturalEarth1()
                .scale(width / 1.5 / Math.PI)
                .translate([width / 2, height / 2]);

            const d3Path = d3.geoPath().projection(projection);

            // Convert TopoJSON to GeoJSON
            // The object name in that specific repo is usually 'continent'
            const featureCollection: any = feature(geoData, geoData.objects.continent || Object.values(geoData.objects)[0] as any);

            const container = svg.append("g");

            container.selectAll("path")
                .data(featureCollection.features)
                .enter()
                .append("path")
                .attr("d", d3Path as any)
                .attr("fill", (d: any) => {
                    const region = d.properties.continent || d.properties.CONTINENT;
                    const color = colors[region] || '#cbd5e1';
                    if (!selectedRegion) return color;
                    return selectedRegion === region ? color : `${color}33`;
                })
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.5)
                .style("cursor", "pointer")
                .style("transition", "fill 0.3s ease, opacity 0.3s ease")
                .on("mouseover", function (event, d: any) {
                    const region = d.properties.continent || d.properties.CONTINENT;
                    const visitors = data[region] || 0;
                    const total = Object.values(data).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? ((visitors / total) * 100).toFixed(1) : '0';

                    d3.select(this)
                        .attr("opacity", 0.8);

                    setTooltip({
                        x: event.clientX, // Using clientX for more reliable positioning
                        y: event.clientY,
                        text: `${region}: ${visitors.toLocaleString()} (${pct}%)`,
                        visible: true
                    });
                })
                .on("mousemove", (event) => {
                    setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("opacity", 1);
                    setTooltip(prev => ({ ...prev, visible: false }));
                })
                .on("click", (event, d: any) => {
                    const region = d.properties.continent || d.properties.CONTINENT;
                    if (onSelect) onSelect(region);
                });

        } catch (e) {
            console.error("D3 rendering error", e);
            setError("Map rendering failed");
        }

    }, [geoData, selectedRegion, data]);

    return (
        <div className="relative w-full h-full bg-slate-50/50 dark:bg-white/[0.02] rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 flex items-center justify-center">
            {error ? (
                <div className="text-center p-6">
                    <p className="text-sm text-red-500 font-bold uppercase tracking-widest mb-2">Notice</p>
                    <p className="text-xs text-slate-500 font-medium">{error}</p>
                    <p className="text-[10px] text-slate-400 mt-4 italic">Check your internet connection for map assets.</p>
                </div>
            ) : !geoData ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 animate-pulse flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Geospatial Data...</p>
                </div>
            ) : null}

            <svg
                ref={svgRef}
                viewBox="0 0 800 450"
                className={`w-full h-full drop-shadow-2xl transition-opacity duration-700 ${geoData ? 'opacity-100' : 'opacity-0'}`}
            />

            <AnimatePresence>
                {tooltip.visible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        style={{
                            position: 'fixed',
                            left: tooltip.x + 15,
                            top: tooltip.y - 45,
                            pointerEvents: 'none',
                            zIndex: 9999
                        }}
                        className="bg-[#0a0a0a] text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-3 backdrop-blur-md"
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {tooltip.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-6 left-8 pointer-events-none">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400/80 mb-1">Global Impression Map</h3>
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
            </div>

            {selectedRegion && (
                <button
                    onClick={() => onSelect?.(null as any)}
                    className="absolute bottom-6 right-8 bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 hover:scale-105 transition-all"
                >
                    Clear Filter
                </button>
            )}
        </div>
    );
};

export default WorldMap;
