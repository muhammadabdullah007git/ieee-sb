import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/hero-image.png';

const Hero = () => {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-(--bg-primary) transition-colors duration-300">
            {/* Background Abstract Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-(--bg-secondary) blur-3xl transition-colors duration-300" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8 text-center lg:text-left"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-lg bg-(--bg-secondary) border border-(--border-subtle) transition-colors duration-300">
                            <span className="text-(--ieee-blue) font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                Welcome to IEEE {'<NAME>'} Student Branch
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-(--text-primary) leading-tight">
                            Advancing <br />
                            <span className="text-(--ieee-blue)">
                                Technology for Humanity
                            </span>
                        </h1>

                        <p className="text-lg text-(--text-secondary) max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Join the largest technical professional organization dedicated to advancing technology for the benefit of humanity.
                            Be part of a community that fosters growth, learning, and leadership.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                to="/events"
                                className="px-8 py-3 rounded-xl bg-(--ieee-blue) text-white font-bold hover:bg-(--ieee-dark-blue) transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                                EXPLORE EVENTS <Calendar size={18} />
                            </Link>
                            <Link
                                to="/about"
                                className="px-8 py-3 rounded-xl border-2 border-(--ieee-blue) text-(--ieee-blue) font-bold hover:bg-(--ieee-blue) hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                LEARN MORE
                            </Link>
                        </div>
                    </motion.div>

                    {/* Visual/Image Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-full max-w-xl mx-auto lg:mx-0"
                    >
                        <div className="relative z-10">
                            {heroImage ? (
                                <img
                                    src={heroImage}
                                    alt="IEEE <NAME> Branch"
                                    className="w-full h-auto rounded-2xl"
                                />
                            ) : null}
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-(--ieee-blue) rounded-full blur-3xl opacity-10" />
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-(--ieee-dark-blue) rounded-full blur-3xl opacity-10" />
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Hero;
