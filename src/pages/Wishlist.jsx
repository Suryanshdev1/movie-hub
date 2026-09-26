import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Wishlist({ currentUser }) {
  const [wishlistMovies, setWishlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, [currentUser]);

  const fetchWishlist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        movies (
          id,
          name,
          genre
        )
      `)
      .eq('user_id', currentUser)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWishlistMovies(data);
    }
    setLoading(false);
  };

  const handleRemove = async (wishlistId) => {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', wishlistId);
      
    if (!error) {
      setWishlistMovies(wishlistMovies.filter(item => item.id !== wishlistId));
    }
  };

  if (loading) return <div className="font-bold uppercase tracking-wide animate-pulse">Loading your wishlist...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-black uppercase mb-2">My Wishlist</h2>
      <p className="font-bold uppercase tracking-wide text-sm mb-8">Movies you want to watch in the future.</p>

      {wishlistMovies.length === 0 ? (
        <div className="text-center font-bold uppercase py-16 border-3 border-brutal-black bg-brutal-white">
          Your wishlist is empty. Add movies from the Dashboard!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistMovies.map((item) => (
            <div key={item.id} className="bg-brutal-white border-3 border-brutal-black p-5 flex flex-col shadow-brutal-sm">
              <div className="flex-grow mb-4">
                <h3 className="text-lg font-black uppercase leading-tight mb-1">{item.movies.name}</h3>
                <p className="text-xs font-bold text-brutal-red uppercase tracking-wide">{item.movies.genre}</p>
              </div>
              <button 
                onClick={() => handleRemove(item.id)}
                className="w-full py-2 bg-brutal-white border-2 border-brutal-black font-bold uppercase text-sm tracking-wide hover:bg-brutal-black hover:text-white transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}