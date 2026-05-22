import { FaQuoteLeft } from 'react-icons/fa';

export default function TestimonialCard({ quote, author, role }) {
  return (
    <div className="glass p-6 relative group hover:border-brand-cyan/30 transition-all duration-300">
      <FaQuoteLeft className="text-brand-cyan/30 text-2xl mb-4" />
      <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">{quote}</p>
      <div className="border-t border-white/10 pt-4">
        <div className="text-gray-100 text-sm font-semibold">{author}</div>
        <div className="text-gray-500 text-xs mt-1">{role}</div>
      </div>
    </div>
  );
}
