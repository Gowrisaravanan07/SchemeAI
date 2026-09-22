import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials = () => {

  const testimonials = [
    {
      textEn: "I didn't know my father was eligible for the Old-Age Pension. CivicAssist told us in 2 minutes and helped us apply from home.",
      textTa: "என் அப்பாவுக்கு வயோதிக ஓய்வூதியம் கிடைக்கும் என்று தெரியாது. CivicAssist 2 நிமிடத்தில் சொல்லி, வீட்டிலிருந்தே விண்ணப்பிக்க உதவியது.",
      author: "முருகன் ர. / Murugan R.",
      location: "Madurai, Tamil Nadu",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Murugan",
    },
    {
      textEn: "Finding scholarships used to be a nightmare. The AI matched me with three state grants I'd never heard of!",
      textTa: "மாணவி உதவித்தொகை தேடுவது கஷ்டமாக இருந்தது. AI மூன்று மாநில மானியங்களை கண்டுபிடித்தது — நான் கேள்விப்படாதவை!",
      author: "கவிதா ச. / Kavitha S.",
      location: "Coimbatore, Tamil Nadu",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavitha",
    },
    {
      textEn: "The Tamil voice feature is excellent. I don't have to type anything. It's like talking to a helpful government office at home.",
      textTa: "தமிழில் குரல் வசதி சிறப்பாக உள்ளது. டைப் செய்ய வேண்டாம். அரசு அலுவலகம் வீட்டிற்கு வந்தது போல் உள்ளது.",
      author: "செல்வராஜ் ப. / Selvaraj P.",
      location: "Thanjavur, Tamil Nadu",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Selvaraj",
    },
  ];

  return (
    <section className="section-padding bg-slate-50/30">
      <div className="flex justify-between items-end mb-16">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-indian-navy mb-4"
          >
            Real Impact, <span className="text-indian-green">Real Lives</span>
          </motion.h2>
          <p className="text-slate-500">Hear from citizens whose lives changed after finding timely benefits.</p>
        </div>
        <div className="flex gap-4 hidden md:flex">
          <button className="p-4 rounded-full border border-slate-200 hover:bg-white hover:shadow-md transition-all">
            <ChevronLeft className="w-6 h-6 text-slate-400" />
          </button>
          <button className="p-4 rounded-full border border-slate-200 hover:bg-white hover:shadow-md transition-all">
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group"
          >
            <Quote className="w-10 h-10 text-slate-100 group-hover:text-indian-saffron/20 transition-colors mb-6" />
            <p className="text-indian-navy text-base leading-relaxed mb-6 font-semibold">
              "{item.textEn}"
            </p>
            <div className="flex items-center gap-4 mt-4">
              <img src={item.image} alt={item.author} className="w-12 h-12 rounded-full bg-slate-100" />
              <div>
                <h4 className="font-bold text-indian-navy text-sm">{item.author}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span>📍</span> {item.location}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
