import React from 'react';
import { Target, Lightbulb, Users } from 'lucide-react';

const About = () => {
    const cards = [
        {
            title: 'Our Mission',
            description: 'To foster technological innovation and excellence for the benefit of humanity.',
            icon: Target,
            color: 'bg-(--ieee-blue)',
        },
        {
            title: 'Our Vision',
            description: 'To be essential to the global technical community and to technical professionals everywhere.',
            icon: Lightbulb,
            color: 'bg-(--ieee-dark-blue)',
        },
        {
            title: 'Our Community',
            description: 'A vibrant network of students, educators, and industry professionals collaborating for growth.',
            icon: Users,
            color: 'bg-(--ieee-blue)',
        },
    ];

    return (
        <section className="py-20 bg-(--bg-secondary) border-y border-(--border-subtle) transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-(--text-primary) uppercase tracking-tight">
                        Why Join <span className="text-(--ieee-blue)">IEEE {'<NAME>'} SB</span>?
                    </h2>
                    <p className="mt-4 text-lg text-(--text-secondary) max-w-2xl mx-auto font-medium">
                        We provide a professional platform for students to develop their technical and leadership skills through workshops, seminars, and projects.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-(--bg-surface) p-8 rounded-2xl shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-all border border-(--border-subtle)"
                        >
                            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-6 text-white`}>
                                <card.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-(--text-primary) mb-3">
                                {card.title}
                            </h3>
                            <p className="text-(--text-secondary) leading-relaxed">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
