import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import MovieCard from '../components/movie/MovieCard';

const GENRES_LIST = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'Documentary', 'Family', 'History',
  'Musical', 'Sport', 'War', 'Western', 'Biography'
];

export default function Dashboard({ currentUser }) {
  const [movies, setMovies] = useState([]);
  const [watchStatuses, setWatchStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newMovie, setNewMovie] = useState({ name: '', genres: [] });
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // 'All', 'Watched', 'Unwatched'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: moviesData } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });
      
    const { data: statusData } = await supabase
      .from('watch_status')
      .select('*');

    if (moviesData) setMovies(moviesData);
    if (statusData) setWatchStatuses(statusData);
    setLoading(false);
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!newMovie.name.trim() || newMovie.genres.length === 0) return;

    const { data, error } = await supabase
      .from('movies')
      .insert([{ 
        name: newMovie.name.trim(), 
        genre: newMovie.genres.join(', '), // Database me comma-separated string jayega
        added_by: currentUser 
      }])
      .select();

    if (!error && data) {
      // Refresh list
      fetchData(); 
      setNewMovie({ name: '', genres: [] });
      setIsAdding(false);
    }
  };

  const toggleGenre = (genre) => {
    setNewMovie(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  // Smart Search & Filtering Logic
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = 
      movie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const isWatchedByMe = watchStatuses.some(
      ws => ws.movie_id === movie.id && ws.user_id === currentUser && ws.watched
    );

    if (filter === 'Watched') return matchesSearch && isWatchedByMe;
    if (filter === 'Unwatched') return matchesSearch && !isWatchedByMe;
    return matchesSearch;
  });

  // Quick stats
  const totalMovies = movies.length;
  const userWatched = watchStatuses.filter(ws => ws.user_id === currentUser && ws.watched).length;
  const userUnwatched = totalMovies - userWatched;

  if (loading) return <div className="text-brutal-black font-bold uppercase tracking-wide animate-pulse">Loading movies...</div>;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-3 border-brutal-black bg-brutal-white p-5 shadow-brutal">
        <div>
          <h2 className="text-2xl font-black uppercase mb-2">Good evening, {currentUser} 👋</h2>
          <div className="flex gap-4 text-sm font-bold uppercase tracking-wide">
            <span><strong className="text-brutal-red">{totalMovies}</strong> Movies</span>
            <span><strong className="text-brutal-red">{userUnwatched}</strong> Unwatched</span>
            <span><strong className="text-brutal-red">{userWatched}</strong> Watched</span>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brutal-black text-white px-5 py-2.5 border-3 border-brutal-black font-bold uppercase tracking-wide hover:bg-brutal-red hover:border-brutal-red transition-colors whitespace-nowrap"
        >
          {isAdding ? 'Cancel' : '+ Add Movie'}
        </button>
      </div>

      {/* Add Movie Form */}
      {isAdding && (
        <form onSubmit={handleAddMovie} className="bg-brutal-white border-3 border-brutal-black p-6 shadow-brutal">
          <div className="flex flex-col gap-4 w-full">
            <input 
              type="text" 
              placeholder="Movie Name (e.g. Interstellar)" 
              value={newMovie.name}
              onChange={(e) => setNewMovie({ ...newMovie, name: e.target.value })}
              className="bg-brutal-bg border-2 border-brutal-black px-4 py-2.5 text-brutal-black font-medium w-full focus:outline-none focus:border-brutal-red placeholder:text-neutral-500"
              required
            />

            <div className="text-sm font-bold uppercase tracking-wide">Select Genres:</div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border-2 border-brutal-black bg-brutal-bg">
              {GENRES_LIST.map((genre) => (
                <label 
                  key={genre} 
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide cursor-pointer border-2 border-brutal-black px-3 py-1.5 transition-colors ${
                    newMovie.genres.includes(genre) 
                      ? 'bg-brutal-black text-white' 
                      : 'bg-brutal-white text-brutal-black hover:bg-brutal-red hover:text-white hover:border-brutal-red'
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={newMovie.genres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                    className="accent-brutal-red"
                  />
                  {genre}
                </label>
              ))}
            </div>

            <button 
              type="submit" 
              className="bg-brutal-red text-white px-6 py-2.5 border-3 border-brutal-black font-bold uppercase tracking-wide hover:bg-brutal-black transition-colors self-start"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Smart Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-brutal-white p-3 border-3 border-brutal-black">
        <div className="w-full sm:w-1/2 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔎</span>
          <input 
            type="text"
            placeholder="Search by movie name or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brutal-bg border-2 border-brutal-black pl-10 pr-4 py-2 text-brutal-black font-medium focus:outline-none focus:border-brutal-red transition-colors"
          />
        </div>
        <div className="flex bg-brutal-bg border-2 border-brutal-black p-1 w-full sm:w-auto">
          {['All', 'Watched', 'Unwatched'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors ${
                filter === f ? 'bg-brutal-black text-white' : 'text-brutal-black hover:text-brutal-red'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 font-bold uppercase tracking-wide border-3 border-brutal-black bg-brutal-white">
          No movies found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              currentUser={currentUser}
              allStatuses={watchStatuses.filter(ws => ws.movie_id === movie.id)}
              onStatusChange={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );
}