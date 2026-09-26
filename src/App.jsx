import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import WatchHistory from './pages/WatchHistory';
import Statistics from './pages/Statistics';
import Leaderboard from './pages/Leaderboard';
import Wishlist from './pages/Wishlist';

const USERS = ['Pratiksha', 'Shahwaz', 'Suryansh'];
const TABS = ['Dashboard', 'Watch History', 'Statistics', 'Leaderboard', 'Wishlist'];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('movieLogbookUser');
    if (savedUser && USERS.includes(savedUser)) {
      setCurrentUser(savedUser);
    }
    setIsLoaded(true);
  }, []);

  const handleUserSelect = (user) => {
    localStorage.setItem('movieLogbookUser', user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('movieLogbookUser');
    setCurrentUser(null);
  };

  if (!isLoaded) return (
    <div className="h-screen bg-brutal-bg flex items-center justify-center text-brutal-black font-black uppercase tracking-wider">
      Loading...
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center text-brutal-black font-sans p-6">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tight mb-2 uppercase">🎬 Movie<br/>Logbook</h1>
          <p className="text-brutal-black text-lg font-bold border-t-3 border-brutal-black inline-block pt-2 mt-2 uppercase tracking-widest text-sm">
            Who are you?
          </p>
        </div>

        <div className="flex flex-col gap-5 w-full max-w-xs">
          {USERS.map((user) => (
            <button
              key={user}
              onClick={() => handleUserSelect(user)}
              className="px-6 py-4 bg-brutal-white border-3 border-brutal-black font-bold uppercase tracking-wide shadow-brutal hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150"
            >
              {user}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-black font-sans pb-12">
      <nav className="border-b-3 border-brutal-black bg-brutal-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight uppercase">🎬 Movie Logbook</h1>
            <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wide">
              <span>User: <span className="bg-brutal-red text-white px-2 py-0.5">{currentUser}</span></span>
              <button 
                onClick={handleLogout}
                className="border-2 border-brutal-black px-3 py-1 hover:bg-brutal-black hover:text-white transition-colors"
              >
                Switch
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide text-sm font-bold uppercase tracking-wide pb-3">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-4 py-2 border-2 border-brutal-black whitespace-nowrap transition-colors ${
                  currentTab === tab 
                    ? 'bg-brutal-black text-white' 
                    : 'bg-brutal-white text-brutal-black hover:bg-brutal-red hover:text-white hover:border-brutal-red'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {currentTab === 'Dashboard' && <Dashboard currentUser={currentUser} />}
        {currentTab === 'Watch History' && <WatchHistory />}
        {currentTab === 'Statistics' && <Statistics />}
        {currentTab === 'Leaderboard' && <Leaderboard />}
        {currentTab === 'Wishlist' && <Wishlist currentUser={currentUser} />}
      </main>
    </div>
  );
}

export default App;