import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const USERS = ['Pratiksha', 'Shahwaz', 'Suryansh'];

export default function MovieCard({ movie, currentUser, allStatuses, onStatusChange }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Check if this movie is in the current user's wishlist
  useEffect(() => {
    checkWishlist();
  }, [currentUser]);

  const checkWishlist = async () => {
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('movie_id', movie.id)
      .eq('user_id', currentUser)
      .single();
      
    if (data) setInWishlist(true);
    else setInWishlist(false);
    
    setWishlistLoading(false);
  };

  const handleToggleWishlist = async () => {
    if (inWishlist) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('movie_id', movie.id)
        .eq('user_id', currentUser);
      setInWishlist(false);
    } else {
      await supabase
        .from('wishlist')
        .insert([{ movie_id: movie.id, user_id: currentUser }]);
      setInWishlist(true);
    }
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

  const isWatchedByMe = allStatuses.find(ws => ws.user_id === currentUser)?.watched;

  return (
    <div className="bg-brutal-white border-3 border-brutal-black p-5 flex flex-col h-full shadow-brutal hover:shadow-brutal-red transition-shadow group">
      
      {/* Header: Title, Genre, Added By, Delete + Wishlist */}
      <div className="flex justify-between items-start mb-6 flex-grow">
        <div className="pr-4">
          <h3 className="text-xl font-black text-brutal-black mb-1 leading-tight uppercase">{movie.name}</h3>
          <p className="text-sm font-bold text-brutal-red uppercase tracking-wide">{movie.genre}</p>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mt-1">Added by: {movie.added_by}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Delete Button - Only visible to the creator */}
          {movie.added_by === currentUser && (
            <button 
              onClick={handleDelete}
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 border-2 border-brutal-black bg-brutal-white text-brutal-black hover:bg-brutal-red hover:text-white hover:border-brutal-red transition-colors"
              title="Delete Movie"
            >
              Delete
            </button>
          )}

          {/* Wishlist Button */}
          <button 
            disabled={wishlistLoading}
            onClick={handleToggleWishlist}
            className="text-2xl focus:outline-none hover:scale-110 transition-transform disabled:opacity-50"
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {inWishlist ? '❤️' : '♡'}
          </button>
        </div>
      </div>
      
      {/* Footer: Watch Status Section */}
      <div className="pt-4 border-t-3 border-brutal-black">
        <div className="flex justify-between items-center mb-3 text-xs font-bold text-brutal-black uppercase tracking-wide">
          <span>Watch Status</span>
          <button 
            onClick={handleToggleWatch}
            className={`transition-colors border-2 border-brutal-black px-2 py-0.5 ${isWatchedByMe ? 'bg-brutal-white text-brutal-black hover:bg-brutal-black hover:text-white' : 'bg-brutal-black text-white hover:bg-brutal-red hover:border-brutal-red'}`}
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