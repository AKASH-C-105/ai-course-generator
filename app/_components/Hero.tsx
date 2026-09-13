"use client";
import React from 'react';
import Scene from './Scene';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full h-screen text-white overflow-hidden bg-gray-950 flex items-center justify-center">
      {/* 3D Background */}
      <Scene />
      
      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="max-w-prose text-left">
          <h1 className="text-4xl font-bold sm:text-5xl drop-shadow-lg">
            Generate <strong className="text-yellow-400">AI-powered courses</strong> effortlessly
          </h1>

          <p className="mt-4 text-base text-pretty text-gray-200 sm:text-lg/relaxed drop-shadow-md">
            Create structured, engaging, and personalized learning content in minutes using our AI Course Generator.
            Simply enter a topic — and let artificial intelligence design complete modules, lessons, and assessments for you.
          </p>

          <div className="mt-6 flex gap-4">
            <a
              className="inline-block rounded bg-white text-gray-900 px-5 py-3 font-medium shadow-md transition-all hover:scale-105 hover:shadow-lg hover:opacity-90"
              href="/dashboard"
            >
              Get Started
            </a>

            <a
              className="inline-block rounded border border-white/40 bg-black/20 backdrop-blur-md px-5 py-3 font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg hover:bg-white/10"
              href="/dashboard"
            >
              View Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero