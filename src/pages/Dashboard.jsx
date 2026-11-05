import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import MovieCard from '../components/movie/MovieCard';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const GENRES_LIST = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'Documentary', 'Family', 'History',
  'Musical', 'Sport', 'War', 'Western', 'Biography'
];

export default function Dashboard({ currentUser }) {
  const [movies, setMovies] = useState([]);
  const [watchStatuses, setWatchStatuses] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newMovie, setNewMovie] = useState({ name: '', genres: [] });
  const [customGenre, setCustomGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Database se saare genres nikal kar ek dynamic list banana
  const dynamicGenresList = [...new Set([
    ...GENRES_LIST,
    ...movies.flatMap(m => m.genre.split(',').map(g => g.trim())).filter(Boolean)
  ])].sort();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: moviesData } = await supabase
      .from('movies')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
    const { data: statusData } = await supabase.from('watch_status').select('*');
    const { data: wishlistData } = await supabase.from('wishlist').select('*');

    if (moviesData) setMovies(moviesData);
    if (statusData) setWatchStatuses(statusData);
    if (wishlistData) setWishlists(wishlistData);

    setLoading(false);
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();

    // Validation
    if (!newMovie.name.trim() || (newMovie.genres.length === 0 && !customGenre.trim())) {
      alert("Movie name aur kam se kam ek genre zaroori hai!");
      return;
    }

    // Duplicate Check
    const isDuplicate = movies.some(m => m.name.toLowerCase() === newMovie.name.trim().toLowerCase());
    if (isDuplicate) {
      alert("Bhai, ye movie already added hai!");
      return;
    }

    // Checkbox genres aur custom genre ko combine karna
    const finalGenres = [...newMovie.genres];
    if (customGenre.trim()) {
      finalGenres.push(customGenre.trim());
    }

    const { data, error } = await supabase
      .from('movies')
      .insert([{
        name: newMovie.name.trim(),
        genre: finalGenres.join(', '),
        added_by: currentUser
      }])
      .select();

    if (!error && data) {
      fetchData();
      setNewMovie({ name: '', genres: [] });
      setCustomGenre('');
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

  const handleDragEnd = async (result) => {
    if (!result.destination) return; // Agar movie bahar drop ki
    if (result.source.index === result.destination.index) return; // Agar same jagah drop ki

    const items = Array.from(filteredMovies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // UI me turant update dikhane ke liye
    setMovies(items);

    // Backend me naya order save karne ke liye
    const updates = items.map((movie, index) => ({
      id: movie.id,
      name: movie.name,
      genre: movie.genre,
      added_by: movie.added_by,
      order_index: index
    }));

    await supabase.from('movies').upsert(updates);
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

  // Drag sirf tab allowed hai jab list filtered nahi hai (warna baaki movies UI se gayab ho jaati)
  const isFiltering = searchQuery.trim() !== '' || filter !== 'All';

  // Quick stats
  const totalMovies = movies.length;
  const userWatched = watchStatuses.filter(ws => ws.user_id === currentUser && ws.watched).length;
  const userUnwatched = totalMovies - userWatched;

  // Live suggestions for "already added" check
  const nameMatches = newMovie.name.trim().length > 0
    ? movies.filter(m => m.name.toLowerCase().includes(newMovie.name.toLowerCase()))
    : [];

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
        <form onSubmit={handleAddMovie} className="bg-brutal-white border-3 border-brutal-black p-6 shadow-brutal flex flex-col gap-4">

          {/* Movie Title Input with Live Suggestions */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Movie Name (e.g. Interstellar)"
              value={newMovie.name}
              onChange={(e) => setNewMovie({ ...newMovie, name: e.target.value })}
              className="bg-brutal-bg border-2 border-brutal-black px-4 py-2.5 text-brutal-black font-medium w-full focus:outline-none focus:border-brutal-red placeholder:text-neutral-500"
              required
            />

            {/* Live Dropdown Suggestion */}
            {nameMatches.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm max-h-48 overflow-y-auto">
                {nameMatches.map(match => (
                  <div key={match.id} className="px-4 py-2 border-b-2 border-brutal-black last:border-0 flex justify-between items-center">
                    <span className="text-sm font-bold uppercase">{match.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-brutal-red text-white px-2 py-0.5 border-2 border-brutal-black">Already Added</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm font-bold uppercase tracking-wide">Select Genres:</div>

          {/* Genres Container */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border-2 border-brutal-black bg-brutal-bg items-center">
            {dynamicGenresList.map((genre) => (
              <label
                key={genre}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide cursor-pointer border-2 border-brutal-black px-3 py-1.5 transition-colors ${
                  newMovie.genres?.includes(genre)
                    ? 'bg-brutal-black text-white'
                    : 'bg-brutal-white text-brutal-black hover:bg-brutal-red hover:text-white hover:border-brutal-red'
                }`}
              >
                <input
                  type="checkbox"
                  checked={newMovie.genres?.includes(genre) || false}
                  onChange={() => toggleGenre(genre)}
                  className="accent-brutal-red"
                />
                {genre}
              </label>
            ))}

            {/* Custom Genre Input */}
            <input
              type="text"
              placeholder="+ Add custom genre"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              className="bg-brutal-white border-2 border-brutal-black px-3 py-1.5 text-xs font-bold uppercase text-brutal-black w-48 focus:outline-none focus:border-brutal-red placeholder:text-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="bg-brutal-red text-white px-6 py-2.5 border-3 border-brutal-black font-bold uppercase tracking-wide hover:bg-brutal-black transition-colors w-full sm:w-auto self-start"
          >
            Save Movie
          </button>
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

      {/* Movie Grid with Drag and Drop */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 font-bold uppercase tracking-wide border-3 border-brutal-black bg-brutal-white">
          No movies found matching your criteria.
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="movie-list" direction="vertical">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredMovies.map((movie, index) => (
                  <Draggable
                    key={movie.id}
                    draggableId={movie.id.toString()}
                    index={index}
                    isDragDisabled={isFiltering}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="h-full relative group"
                      >
                        {/* Drag Handle */}
                        {!isFiltering && (
                          <div
                            {...provided.dragHandleProps}
                            className="absolute -left-1 md:-left-3 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 bg-brutal-white border-2 border-brutal-black hover:bg-brutal-red z-10"
                            title="Drag to reorder"
                          >
                            ✋
                          </div>

                          
                        )}

                        <MovieCard
                          movie={movie}
                          currentUser={currentUser}
                          allStatuses={watchStatuses.filter(ws => ws.movie_id === movie.id)}
                          isWishlisted={wishlists.some(w => w.movie_id === movie.id && w.user_id === currentUser)}
                          onStatusChange={fetchData}
                          allGenres={dynamicGenresList}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}