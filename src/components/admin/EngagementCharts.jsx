import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

const EngagementCharts = ({ data }) => {
    // Custom tooltip for line chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-(--bg-surface) p-2.5 rounded-lg border border-(--border-subtle) shadow-xl">
                    <p className="text-[10px] font-bold text-(--text-primary) mb-1">{new Date(label).toLocaleDateString()}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-(--text-secondary)">{entry.name}:</span>
                            <span className="font-bold text-(--text-primary)">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Main Trend Chart */}
            <div className="xl:col-span-2 bg-(--bg-surface) p-4 md:p-5 rounded-xl border border-(--border-subtle) shadow-sm overflow-hidden min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm font-bold text-(--text-primary)">Engagement Trends</h3>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-(--text-secondary)">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span>Reactions</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-(--text-secondary)">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                            <span>Comments</span>
                        </div>
                    </div>
                </div>
                <div className="h-[220px] md:h-[280px] w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={data.engagementData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={10}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="reactions"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Reactions"
                            />
                            <Line
                                type="monotone"
                                dataKey="comments"
                                stroke="#a855f7"
                                strokeWidth={3}
                                dot={{ fill: '#a855f7', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Comments"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Comparison Pie/Bar Chart Concept */}
            <div className="bg-(--bg-surface) p-4 md:p-5 rounded-xl border border-(--border-subtle) shadow-sm overflow-hidden min-w-0">
                <h3 className="text-sm font-bold text-(--text-primary) mb-4">Content Split</h3>
                <div className="h-[200px] md:h-[250px] w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={[
                            { name: 'Blogs', value: data.totals.blogs },
                            { name: 'Papers', value: data.totals.papers }
                        ]} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                <Cell fill="#3b82f6" />
                                <Cell fill="#10b981" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-(--text-secondary)">Blogs</span>
                        <span className="font-bold text-(--text-primary)">{data.totals.blogs}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-(--text-secondary)">Research Papers</span>
                        <span className="font-bold text-(--text-primary)">{data.totals.papers}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EngagementCharts;
