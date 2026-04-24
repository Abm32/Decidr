'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const FEATURES = [
  { icon: '🔮', title: 'Future Scenarios', desc: 'AI generates multiple contrasting futures from your decision' },
  { icon: '🎧', title: 'Immersive Audio', desc: 'Listen to narrated timelines with emotional soundscapes' },
  { icon: '💬', title: 'Talk to Future You', desc: 'Chat with an AI character living inside each scenario' },
  { icon: '📊', title: 'Compare & Decide', desc: 'Visual analytics across dimensions to find your best path' },
];

const STEPS = [
  { num: '01', title: 'Describe your decision', desc: 'Type or speak the choice you\'re facing' },
  { num: '02', title: 'Explore futures', desc: 'Review AI-generated scenarios with timelines' },
  { num: '03', title: 'Experience the audio', desc: 'Immersive narration brings each future to life' },
  { num: '04', title: 'Converse with your future self', desc: 'Ask questions, get perspective' },
  { num: '05', title: 'Compare and choose', desc: 'Data-driven insights to guide your decision' },
];

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950"
    >
      {/* Glow behind logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1.2 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]"
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src="/logo/app-logo.png" alt="Decidr" width={100} height={100} priority />
      </motion.div>

      {/* Text */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-5 text-2xl font-bold tracking-widest text-white"
      >
        DECIDR
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-2 text-sm text-gray-500"
      >
        Decision Intelligence Engine
      </motion.p>

      {/* Loading bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ delay: 0.8, duration: 1.4, ease: 'easeInOut' }}
        className="mt-8 h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500"
      />
    </motion.div>
  );
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <SplashScreen key="splash" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <div className={`relative overflow-hidden ${loading ? 'opacity-0' : ''}`}>
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-[60vh] -right-40 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute top-[120vh] -left-40 h-[400px] w-[400px] rounded-full bg-cyan-600/8 blur-[100px]" />

        {/* Nav */}
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo/app-logo.png" alt="Decidr" width={32} height={32} />
            <span className="text-lg font-bold tracking-tight text-white">Decidr</span>
          </Link>
          <Link
            href="/app"
            className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Launch App
          </Link>
        </nav>

        {/* Hero */}
        <section className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-12 sm:pt-24 pb-16 sm:pb-32 text-center">
          <motion.div {...fade(0)}>
            <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium tracking-wide text-blue-300">
              DECISION INTELLIGENCE ENGINE
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.1)}
            className="mt-6 sm:mt-8 text-3xl sm:text-5xl lg:text-7xl font-bold leading-[1.15] tracking-tight text-white"
          >
            See your future
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              before you decide
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.2)}
            className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-relaxed text-gray-400 px-2"
          >
            Decidr uses AI to generate, narrate, and let you interact with
            multiple possible futures — so you can make life&apos;s biggest
            decisions with clarity.
          </motion.p>

          <motion.div {...fade(0.3)} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto rounded-full bg-blue-600 px-8 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30 text-center"
            >
              Try Decidr Free →
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto rounded-full border border-gray-700 px-8 py-3 sm:py-3.5 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white text-center"
            >
              How it works
            </a>
          </motion.div>

          {/* Hero visual - hidden on very small screens */}
          <motion.div
            {...fade(0.5)}
            className="mx-auto mt-12 sm:mt-20 max-w-3xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 shadow-2xl shadow-black/40 hidden sm:block"
          >
            <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-gray-500">decidr.app</span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-6">
              {['Optimistic', 'Pragmatic', 'Pessimistic'].map((path, i) => (
                <div
                  key={path}
                  className={`rounded-xl border p-4 ${
                    i === 0 ? 'border-blue-500/40 bg-blue-500/5' : 'border-gray-800 bg-gray-800/50'
                  }`}
                >
                  <div className={`mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${
                    i === 0 ? 'bg-green-700/60 text-green-300' : i === 1 ? 'bg-blue-700/60 text-blue-300' : 'bg-red-700/60 text-red-300'
                  }`}>
                    {path}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-2 rounded-full bg-gray-700/60" style={{ width: `${70 + j * 10}%` }} />
                    ))}
                  </div>
                  <div className="mt-3 flex gap-1">
                    {['bg-green-400', 'bg-yellow-400', 'bg-blue-400', 'bg-violet-400'].map((c, k) => (
                      <span key={k} className={`h-1.5 w-1.5 rounded-full ${c} opacity-60`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fade()} viewport={{ once: true }} whileInView="animate" initial="initial" className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white sm:text-4xl">
              Everything you need to decide with confidence
            </h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-gray-400">
              Powered by GPT-5.4 and ElevenLabs, Decidr transforms uncertainty into clarity.
            </p>
          </motion.div>

          <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group rounded-2xl border border-gray-800 bg-gray-900/50 p-4 sm:p-6 transition hover:border-gray-700 hover:bg-gray-900/80"
              >
                <span className="text-2xl sm:text-3xl">{f.icon}</span>
                <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm leading-relaxed text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fade()} viewport={{ once: true }} whileInView="animate" initial="initial" className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-gray-400">Five steps from uncertainty to clarity</p>
          </motion.div>

          <div className="mt-16 space-y-0">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex gap-6 py-6"
              >
                <span className="shrink-0 text-3xl font-bold text-gray-800">{step.num}</span>
                <div>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl sm:rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 px-5 sm:px-8 py-10 sm:py-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white sm:text-4xl">
              Ready to see your future?
            </h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-lg text-sm sm:text-base text-gray-400">
              Stop guessing. Start exploring the futures that await you.
            </p>
            <Link
              href="/app"
              className="mt-8 inline-block rounded-full bg-blue-600 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              Launch Decidr →
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gray-800/50 py-8">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Image src="/logo/app-logo.png" alt="" width={16} height={16} />
            Decidr — Decision Intelligence Engine
          </div>
        </footer>
      </div>
    </>
  );
}
