import { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../contexts/SocketContext";
import { logoutUser } from "../features/authSlice.js"; // Pastikan path ini benar

// --- Komponen Panel Admin ---
const AdminControlPanel = () => {
  const { gameSettings, adminUpdateSettings } = useSocket();
  const [settings, setSettings] = useState(gameSettings);

  useEffect(() => {
    setSettings(gameSettings);
  }, [gameSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    adminUpdateSettings(settings);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-yellow-400">
        Admin Controls
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-300">Topic</label>
          <input
            type="text" id="topic" name="topic" value={settings.topic} onChange={handleChange}
            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label htmlFor="rarity" className="block text-sm font-medium text-gray-300">Difficulty</label>
          <input
            type="text" id="rarity" name="rarity" value={settings.rarity} onChange={handleChange}
            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-300">Language</label>
          <input
            type="text" id="language" name="language" value={settings.language} onChange={handleChange}
            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
        <button type="submit" className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors font-semibold">
          Apply Settings & New Round
        </button>
      </form>
    </div>
  );
};

// --- Komponen Utama Halaman ---
export default function HomePage() {
  const { user } = useSelector((state) => state.app);
  const dispatch = useDispatch();
  const socketContext = useSocket();
  
  // [AUTO-SCROLL] 1. Buat Ref untuk chat container
  const chatContainerRef = useRef(null);

  if (!socketContext) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-900 text-white">
        <div className="text-center p-8 bg-red-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Context Error</h2>
          <p>HomePage must be used within a SocketProvider.</p>
        </div>
      </div>
    );
  }

  const {
    isConnected, currentQuestion, notification, chatHistory, onlinePlayers, // [FIX] Menambahkan kembali onlinePlayers
    submitAnswer, voteState, voteForNewQuestion, gameSettings,
  } = socketContext;

  const [answer, setAnswer] = useState("");

  // [AUTO-SCROLL] 2. Buat Effect yang berjalan saat chatHistory berubah
  useEffect(() => {
    if (chatContainerRef.current) {
      const chatContainer = chatContainerRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatHistory]);

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      submitAnswer(answer);
      setAnswer("");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleVoteClick = () => {
    voteForNewQuestion();
  };

  const requiredVotes = Math.ceil(voteState.totalPlayers / 2);
  const votePercentage = requiredVotes > 0 ? (voteState.currentVotes / requiredVotes) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">QuizRush.AI</h1>
            <p className="text-gray-400">
              Welcome,{" "}
              <span className="font-semibold text-white">{user?.username}</span>
              {user?.role === 'admin' && <span className="text-yellow-400 font-bold"> (Admin)</span>}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-semibold">Status: <span className={isConnected ? "text-green-400" : "text-red-400"}>{isConnected ? "Connected" : "Disconnected"}</span></p>
            {/* [DIHAPUS] Tampilan skor dihapus */}
            <a href="/rank" className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-semibold transition-colors">
              Leaderboard
            </a>
            <button onClick={handleLogout} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors">
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* [LAYOUT] Main content area sekarang menampung Question, Answer, dan Live Chat */}
          <main className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-grow flex flex-col">
              {notification && (<div className="bg-yellow-500/20 border border-yellow-400 text-yellow-300 px-4 py-3 rounded-lg mb-4 text-center"><p>{notification}</p></div>)}
              
              <div className="mb-6 text-center bg-gray-900 p-6 rounded-lg min-h-[150px] flex items-center justify-center">
                {currentQuestion ? (<p className="text-2xl lg:text-3xl font-semibold leading-relaxed">{currentQuestion}</p>) : (<p className="text-xl text-gray-500">{isConnected ? "Waiting for the next question..." : "Connecting..."}</p>)}
              </div>
              
              <form onSubmit={handleAnswerSubmit} className="mb-6">
                <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here and press Enter..." className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={!isConnected || !currentQuestion} />
              </form>

              {/* [LAYOUT] Live Chat dipindahkan ke sini */}
              <div className="flex-grow flex flex-col min-h-0">
                  <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Live Chat <span className="text-sm font-normal text-gray-400">(Wrong Answers)</span></h2>
                  {/* [AUTO-SCROLL] 3. Pasang Ref ke container chat */}
                  <div ref={chatContainerRef} className="space-y-3 flex-grow overflow-y-auto pr-2">
                      {chatHistory.map((chat, index) => (
                          <div key={index}>
                              <span className="font-bold text-indigo-400">{chat.username}: </span>
                              <span className="text-gray-300 break-words">{chat.message}</span>
                          </div>
                      ))}
                  </div>
              </div>
            </div>
          </main>

          {/* [LAYOUT] Sidebar sekarang hanya berisi panel-panel info & kontrol */}
          <aside className="space-y-6">
            {user?.role === 'admin' && <AdminControlPanel />}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-3 border-b border-gray-700 pb-2">Game Info</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Topic:</strong> <span className="text-indigo-300">{gameSettings.topic}</span></p>
                <p><strong>Difficulty:</strong> <span className="text-indigo-300">{gameSettings.rarity}</span></p>
                <p><strong>Language:</strong> <span className="text-indigo-300">{gameSettings.language}</span></p>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Vote to Skip</h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-400">If 50% of players vote, the round will restart.</p>
                <div>
                  <div className="flex justify-between items-center mb-1"><span className="text-base font-medium text-indigo-400">Votes</span><span className="text-sm font-medium text-indigo-400">{voteState.currentVotes} / {requiredVotes}</span></div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${votePercentage}%` }}></div></div>
                </div>
                <button onClick={handleVoteClick} disabled={!isConnected || !currentQuestion} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Vote to Skip Question</button>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Online Players</h2>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {onlinePlayers.map((player) => (<li key={player.id} className="text-gray-300 flex justify-between"><span>{player.username}{player.role === 'admin' && ' �'}</span><span className="font-semibold text-green-400">{player.solved}</span></li>))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
�