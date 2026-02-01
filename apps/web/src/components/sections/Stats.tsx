interface Stat {
  value: string;
  label: string;
  icon: string;
  description: string;
}
const stats: Stat[] = [
  { value: '5000+', label: 'Organisations', icon: '🏢', description: 'Font confiance à Cause Pilot' },
  { value: '+35%', label: 'Collecte moyenne', icon: '📈', description: 'Augmentation des dons' },
  { value: '2M+', label: 'Donateurs actifs', icon: '💝', description: 'Utilisent notre plateforme' },
  { value: '24/7', label: 'Support dédié', icon: '🛠️', description: 'Assistance disponible' },
];
export default function Stats() {
  return (
    <section className="py-24 bg-[#1a4d2e] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center text-white p-8 rounded-2xl backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all group hover:scale-105"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-5xl md:text-6xl font-black mb-3 text-[#cc5500]">
                {stat.value}
              </div>
              <div className="text-xl font-bold mb-2 text-white">{stat.label}</div>
              <div className="text-sm text-emerald-100 opacity-90">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
