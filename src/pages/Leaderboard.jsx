import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const USERS = ['Pratiksha', 'Shahwaz', 'Suryansh'];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data: statuses, error } = await supabase
      .from('watch_status')
      .select('user_id')
      .eq('watched', true);

    if (!error && statuses) {
      // Har user ka watch count calculate karo
      let counts = USERS.map(user => {
        return {
          name: user,
          score: statuses.filter(s => s.user_id === user).length
        };
      });

      // Descending order me sort karo
      counts.sort((a, b) => b.score - a.score);
      setLeaderboard(counts);
    }
    setLoading(false);
  };

  const getMedal = (index, score) => {
    // Handling ties gracefully
    if (score === leaderboard[0]?.score) return '🥇';
    if (score === leaderboard[1]?.score) return '🥈';
    return '🥉';
  };

  if (loading) return <div className="font-bold uppercase tracking-wide animate-pulse flex justify-center py-12">Loading ranks...</div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black uppercase mb-2">Hall of Fame</h2>
        <p className="font-bold uppercase tracking-wide text-sm">Who is leading the movie marathon?</p>
      </div>

      <div className="space-y-4">
        {leaderboard.map((user, index) => (
          <div 
            key={user.name} 
            className={`flex items-center justify-between p-5 border-3 border-brutal-black ${
              index === 0 ? 'bg-brutal-red text-white shadow-brutal' : 'bg-brutal-white text-brutal-black shadow-brutal-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl" role="img" aria-label="medal">
                {getMedal(index, user.score)}
              </span>
              <div>
                <h3 className="text-xl font-black uppercase">
                  {user.name}
                </h3>
                <p className={`text-sm font-bold uppercase tracking-wide ${index === 0 ? 'text-white/80' : 'text-neutral-500'}`}>
                  Rank #{index + 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black">{user.score}</span>
              <p className={`text-xs font-bold uppercase tracking-wider ${index === 0 ? 'text-white/80' : 'text-neutral-500'}`}>Movies</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}