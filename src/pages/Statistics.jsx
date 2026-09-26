import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const USERS = ['Pratiksha', 'Shahwaz', 'Suryansh'];

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    const { data: movies } = await supabase.from('movies').select('*');
    const { data: statuses } = await supabase.from('watch_status').select('*').eq('watched', true);

    if (movies && statuses) {
      const totalMovies = movies.length;
      const totalWatches = statuses.length;

      // Calculate individual stats
      const userStats = USERS.map(user => {
        const watched = statuses.filter(s => s.user_id === user).length;
        const progress = totalMovies === 0 ? 0 : Math.round((watched / totalMovies) * 100);
        return { user, watched, progress };
      });

      // Calculate genre breakdown
      const genreCounts = movies.reduce((acc, movie) => {
        const genre = movie.genre.trim();
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});

      // Sort genres by count (highest first)
      const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      setStats({ totalMovies, totalWatches, userStats, sortedGenres });
    }
    setLoading(false);
  };

  if (loading) return <div className="font-bold uppercase tracking-wide animate-pulse">Calculating statistics...</div>;
  if (!stats) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-brutal-white border-3 border-brutal-black p-6 text-center shadow-brutal">
          <p className="font-bold uppercase tracking-wide text-sm mb-1">Total Movies</p>
          <p className="text-4xl font-black text-brutal-red">{stats.totalMovies}</p>
        </div>
        <div className="bg-brutal-white border-3 border-brutal-black p-6 text-center shadow-brutal">
          <p className="font-bold uppercase tracking-wide text-sm mb-1">Total Watches</p>
          <p className="text-4xl font-black text-brutal-red">{stats.totalWatches}</p>
        </div>
      </div>

      {/* Individual Progress */}
      <div>
        <h3 className="text-lg font-black uppercase mb-4 border-b-3 border-brutal-black inline-block pb-1">Individual Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.userStats.map(({ user, watched, progress }) => (
            <div key={user} className="bg-brutal-white border-3 border-brutal-black p-5 shadow-brutal-sm">
              <div className="flex justify-between items-end mb-4">
                <span className="font-black uppercase">{user}</span>
                <span className="text-2xl font-black text-brutal-red">{progress}%</span>
              </div>
              <div className="w-full bg-brutal-bg h-3 mb-4 border-2 border-brutal-black overflow-hidden">
                <div 
                  className="bg-brutal-black h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm font-bold flex justify-between uppercase tracking-wide">
                <span>Watched: <strong className="text-brutal-red">{watched}</strong></span>
                <span>Left: <strong className="text-brutal-red">{stats.totalMovies - watched}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Genre Breakdown */}
      <div>
        <h3 className="text-lg font-black uppercase mb-4 border-b-3 border-brutal-black inline-block pb-1">Genre Breakdown</h3>
        <div className="bg-brutal-white border-3 border-brutal-black p-5 shadow-brutal">
          {stats.sortedGenres.length === 0 ? (
            <p className="font-bold uppercase text-sm text-center py-4">No genres available yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.sortedGenres.map((genre) => (
                <div key={genre.name} className="flex items-center justify-between text-sm">
                  <span className="font-bold uppercase tracking-wide">{genre.name}</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="flex-1 bg-brutal-bg h-2.5 border-2 border-brutal-black overflow-hidden">
                      <div 
                        className="bg-brutal-red h-full" 
                        style={{ width: `${(genre.count / stats.totalMovies) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-black w-6 text-right">{genre.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}