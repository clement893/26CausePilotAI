import { Building2, TrendingUp, Heart, Headphones } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
  trend?: string;
}

const stats: Stat[] = [
  { 
    value: '5,000+', 
    label: 'Organisations', 
    icon: Building2, 
    description: 'Font confiance à Cause Pilot',
    gradient: 'from-blue-500 to-purple-500',
    trend: '+12%'
  },
  { 
    value: '+35%', 
    label: 'Collecte moyenne', 
    icon: TrendingUp, 
    description: 'Augmentation des dons',
    gradient: 'from-green-500 to-cyan-500',
    trend: '+8%'
  },
  { 
    value: '2M+', 
    label: 'Donateurs actifs', 
    icon: Heart, 
    description: 'Utilisent notre plateforme',
    gradient: 'from-pink-500 to-red-500',
    trend: '+25%'
  },
  { 
    value: '24/7', 
    label: 'Support dédié', 
    icon: Headphones, 
    description: 'Assistance disponible',
    gradient: 'from-orange-500 to-yellow-500',
  },
];

export default function Stats() {
  return (
    <section className="py-24 bg-[#0A0A0F] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="relative group p-6 rounded-2xl bg-[#13131A] border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative">
                  {/* Header with icon and trend */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.trend && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  
                  {/* Value */}
                  <div className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                  
                  {/* Description */}
                  <div className="text-sm text-gray-400">{stat.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
