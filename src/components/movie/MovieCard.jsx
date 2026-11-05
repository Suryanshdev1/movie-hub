import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const USERS = ['Pratiksha', 'Shahwaz', 'Suryansh'];

export default function MovieCard({ movie, currentUser, allStatuses, isWishlisted, onStatusChange, allGenres }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(movie.name);

  // Edit genres ke liye states (Array me store karne ke liye)
  const [editGenres, setEditGenres] = useState([]);
  const [customEditGenre, setCustomEditGenre] = useState('');

  // Jab bhi isEditing true ho, current genres ko array me convert karke state me set karo
  useEffect(() => {
    if (isEditing) {
      setEditGenres(movie.genre.split(',').map(g => g.trim()).filter(Boolean));
      setCustomEditGenre('');
    }
  }, [isEditing, movie.genre]);

  const toggleEditGenre = (genre) => {
    setEditGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleToggleWishlist = async () => {
    if (isWishlisted) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('movie_id', movie.id)
        .eq('user_id', currentUser);
    } else {
      await supabase
        .from('wishlist')
        .insert([{ movie_id: movie.id, user_id: currentUser }]);
    }
    onStatusChange(); // Toggle hone par dashboard ko refresh karne bol do
  };

  const handleToggleWatch = async () => {
    const existingStatus = allStatuses.find(ws => ws.user_id === currentUser);
    if (existingStatus) {
      const { error } = await supabase
        .from('watch_status')
        .update({
          watched: !existingStatus.watched,
          watched_at: !existingStatus.watched ? new Date().toISOString() : null
        })
        .eq('id', existingStatus.id);
      if (!error) onStatusChange();
    } else {
      const { error } = await supabase
        .from('watch_status')
        .insert([{
          movie_id: movie.id,
          user_id: currentUser,
          watched: true,
          watched_at: new Date().toISOString()
        }]);
      if (!error) onStatusChange();
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${movie.name}"?`);
    if (isConfirmed) {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movie.id);

      if (!error) {
        onStatusChange(); // Ye dashboard ko refresh kar dega
      }
    }
  };

  const handleUpdate = async () => {
    const finalGenres = [...editGenres];
    if (customEditGenre.trim()) {
      finalGenres.push(customEditGenre.trim());
    }

    if (!editName.trim() || finalGenres.length === 0) return;

    const { error } = await supabase
      .from('movies')
      .update({
        name: editName.trim(),
        genre: finalGenres.join(', ') // Wapas string me convert karke save
      })
      .eq('id', movie.id);

    if (!error) {
      setIsEditing(false);
      onStatusChange(); // Dashboard refresh karega
    }
  };

  const isWatchedByMe = allStatuses.find(ws => ws.user_id === currentUser)?.watched;

  return (
    <div className="bg-brutal-white border-3 border-brutal-black p-5 flex flex-col h-full shadow-brutal hover:shadow-brutal-red transition-shadow group">

      {/* Header: Title, Genre, and Buttons */}
      <div className="flex justify-between items-start mb-6 flex-grow">
        <div className="pr-4 w-full">
          {isEditing ? (
            <div className="flex flex-col gap-3 mb-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Movie Title"
                className="bg-brutal-bg border-2 border-brutal-black px-3 py-1.5 text-brutal-black w-full focus:outline-none focus:border-brutal-red text-lg font-black uppercase"
              />

              {/* Edit Genres Checkboxes */}
              <div className="text-xs font-bold uppercase tracking-wide">Select Genres:</div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border-2 border-brutal-black bg-brutal-bg items-center">
                {allGenres?.map((genre) => (
                  <label
                    key={genre}
                    className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide cursor-pointer border-2 border-brutal-black px-2 py-1 transition-colors ${
                      editGenres.includes(genre)
                        ? 'bg-brutal-black text-white'
                        : 'bg-brutal-white text-brutal-black hover:bg-brutal-red hover:text-white hover:border-brutal-red'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={editGenres.includes(genre)}
                      onChange={() => toggleEditGenre(genre)}
                      className="accent-brutal-red w-3 h-3"
                    />
                    {genre}
                  </label>
                ))}
                <input
                  type="text"
                  placeholder="+ Custom genre"
                  value={customEditGenre}
                  onChange={(e) => setCustomEditGenre(e.target.value)}
                  className="bg-brutal-white border-2 border-brutal-black px-2 py-1 text-[11px] font-bold uppercase text-brutal-black w-32 focus:outline-none focus:border-brutal-red placeholder:text-neutral-500"
                />
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleUpdate}
                  className="text-xs font-bold uppercase tracking-wide bg-brutal-red text-white px-4 py-1.5 border-2 border-brutal-black hover:bg-brutal-black transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(movie.name);
                  }}
                  className="text-xs font-bold uppercase tracking-wide bg-brutal-white text-brutal-black px-4 py-1.5 border-2 border-brutal-black hover:bg-brutal-black hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-black text-brutal-black mb-1 leading-tight uppercase">{movie.name}</h3>
              <p className="text-sm font-bold text-brutal-red uppercase tracking-wide">{movie.genre}</p>
            </>
          )}
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mt-2">Added by: {movie.added_by}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {movie.added_by === currentUser && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 border-2 border-brutal-black bg-brutal-white text-brutal-black hover:bg-brutal-black hover:text-white transition-colors"
            >
              Edit
            </button>
          )}

          {movie.added_by === currentUser && !isEditing && (
            <button
              onClick={handleDelete}
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 border-2 border-brutal-black bg-brutal-white text-brutal-black hover:bg-brutal-red hover:text-white hover:border-brutal-red transition-colors"
            >
              Delete
            </button>
          )}

          <button
            disabled={isEditing}
            onClick={handleToggleWishlist}
            className={`text-2xl focus:outline-none transition-transform ${isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            {isWishlisted ? '❤️' : '♡'}
          </button>
        </div>
      </div>

      {/* Footer: Watch Status Section */}
      <div className="pt-4 border-t-3 border-brutal-black">
        <div className="flex justify-between items-center mb-3 text-xs font-bold text-brutal-black uppercase tracking-wide">
          <span>Watch Status</span>
          <button
            onClick={handleToggleWatch}
            className={`transition-colors border-2 border-brutal-black px-2 py-0.5 ${
              isWatchedByMe
                ? 'bg-brutal-white text-brutal-black hover:bg-brutal-black hover:text-white'
                : 'bg-brutal-black text-white hover:bg-brutal-red hover:border-brutal-red'
            }`}
          >
            {isWatchedByMe ? 'Unwatch' : 'Watched'}
          </button>
        </div>

        <div className="flex justify-between items-center bg-brutal-bg border-2 border-brutal-black p-3">
          {USERS.map(user => {
            const isWatched = allStatuses.find(ws => ws.user_id === user)?.watched;
            return (
              <div key={user} className="flex flex-col items-center gap-1.5 w-1/3">
                <span className={`text-[11px] uppercase tracking-wider font-bold ${user === currentUser ? 'text-brutal-red' : 'text-brutal-black'}`}>
                  {user}
                </span>
                <span className={`text-sm font-black ${isWatched ? 'text-brutal-black' : 'text-neutral-400'}`}>
                  {isWatched ? '✓' : '○'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}