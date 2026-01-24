interface Stat {
  value: string;
  label: string;
  icon: string;
}
const stats: Stat[] = [
  { value: '5000+', label: 'Organisations', icon: '🏢' },
  { value: '+35%', label: 'Collecte moyenne', icon: '📈' },
  { value: '2M+', label: 'Donateurs actifs', icon: '💝' },
  { value: '24/7', label: 'Support dédié', icon: '🛠️' },
];
export default function Stats() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-800 dark:to-primary-700">
      {' '}
      <div className="container mx-auto px-4">
        {' '}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {' '}
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-background">
              {' '}
              <div className="text-4xl mb-2">{stat.icon}</div>{' '}
              <div className="text-4xl md:text-5xl font-bold mb-2"> {stat.value} </div>{' '}
              <div className="text-lg opacity-90">{stat.label}</div>{' '}
            </div>
          ))}{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
