import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('watch_status')
      .select(`
        id,
        user_id,
        watched_at,
        movies (
          name,
          genre
        )
      `)
      .eq('watched', true)
      .order('watched_at', { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (loading) return <div className="font-bold uppercase tracking-wide animate-pulse">Loading history...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black uppercase mb-8 border-b-3 border-brutal-black inline-block pb-1">Watch History</h2>
      
      {history.length === 0 ? (
        <div className="text-center font-bold uppercase py-12 border-3 border-brutal-black bg-brutal-white">
          No watch history recorded yet.
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-brutal-black">
          {history.map((entry) => (
            <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-10 h-10 border-3 border-brutal-black bg-brutal-red text-white font-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#f5f5f0] z-10">
                <span className="text-xs">{entry.user_id[0]}</span>
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border-3 border-brutal-black bg-brutal-white shadow-brutal-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black uppercase">{entry.user_id}</span>
                  <time className="text-xs font-bold">{formatDate(entry.watched_at)}</time>
                </div>
                <div className="text-sm font-medium">
                  Watched <span className="font-black text-brutal-red">{entry.movies.name}</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wide mt-1">{entry.movies.genre}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}