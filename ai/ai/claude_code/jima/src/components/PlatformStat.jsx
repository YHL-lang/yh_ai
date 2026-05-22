export default function PlatformStat({ icon, name, count, label }) {
  return (
    <div className="glass p-6 text-center group hover:border-brand-cyan/30 hover:shadow-lg hover:shadow-brand-cyan/5 transition-all duration-300">
      <div className="text-gray-400 group-hover:text-brand-cyan transition-colors duration-300 mb-3 flex justify-center">
        {icon}
      </div>
      <div className="text-2xl font-bold gradient-text">{count}</div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
      <div className="text-gray-400 text-xs mt-2">{name}</div>
    </div>
  );
}
