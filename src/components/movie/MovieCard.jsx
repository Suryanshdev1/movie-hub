import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const USERS = ['Pratiksha', 'Shahwaz', 'Suryansh'];

// ✅ isWishlisted ko props me add kiya, state aur useEffect hata diya
export default function MovieCard({ movie, currentUser, allStatuses, isWishlisted, onStatusChange }) {

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
    onStatusChange(); // ✅ Toggle hone par dashboard ko refresh karne bol do
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col h-full hover:border-neutral-700 transition-colors group">
      
      {/* Header: Title, Genre, and Wishlist Heart */}
      <div className="flex justify-between items-start mb-6 flex-grow">
        <div className="pr-4">
          <h3 className="text-xl font-medium text-white mb-1 leading-tight">{movie.name}</h3>
          <p className="text-sm text-neutral-500">{movie.genre}</p>
          <p className="text-[10px] text-neutral-600 mt-1">Added by: {movie.added_by}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {movie.added_by === currentUser && (
            <button 
              onClick={handleDelete} // Tumhara delete function
              className="text-red-500/70 hover:text-red-500 text-xs font-medium px-2 py-1 bg-red-500/10 rounded-md transition-colors"
            >
              Delete
            </button>
          )}
          
          <button 
            onClick={handleToggleWishlist}
            className="text-2xl focus:outline-none hover:scale-110 transition-transform"
          >
            {isWishlisted ? '❤️' : '♡'}
          </button>
        </div>
      </div>
      
      {/* Footer wala Watch Status Section waise hi chhod do */}
      {/* ... */}
    </div>
  );
}