import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../contexts/SocketContext";

import { logoutUser } from "../features/authSlice";

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
    <div className="bg-[#1c1c2b] p-6 rounded-3xl shadow-[0_0_30px_rgba(128,0,255,0.3)] border border-purple-800 relative overflow-hidden">
      <h2 className="text-xl font-bold mb-4 border-b border-purple-700 pb-2 text-yellow-400">
        Admin Controls
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["topic", "rarity", "language"].map((field) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block text-sm font-medium text-gray-300"
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="text"
              id={field}
              name={field}
              value={settings[field] || ""}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-[#2a2a40] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 rounded-md font-semibold text-white"
        >
          Apply Settings
        </button>
      </form>
    </div>
  );
};

export default function HomePage() {
  const { user } = useSelector((state) => state.app);
  const dispatch = useDispatch();
  const socketContext = useSocket();

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
    isConnected,
    currentQuestion,
    notification,
    chatHistory,
    onlinePlayers,
    submitAnswer,
    voteState,
    voteForNewQuestion,
    gameSettings,
  } = socketContext;

  const [answer, setAnswer] = useState("");

  const myScore = useMemo(() => {
    const me = onlinePlayers.find((p) => p.id === user?.id);
    return me?.solved ?? 0;
  }, [onlinePlayers, user?.id]);

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
  const votePercentage =
    requiredVotes > 0 ? (voteState.currentVotes / requiredVotes) * 100 : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4 py-8 font-orbitron">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-widest drop-shadow-lg">
              🚀 QuizRush.AI
            </h1>
            <p className="text-gray-300">
              Welcome,{" "}
              <span className="font-semibold text-white">{user?.username}</span>
              {user?.role === "admin" && (
                <span className="text-yellow-400 font-bold"> (Admin)</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              Status:{" "}
              <span className={isConnected ? "text-green-400" : "text-red-400"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </p>
            <p className="font-semibold">
              Solved: <span className="text-green-400">{myScore}</span>
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2 bg-[#1c1c2b] p-6 rounded-3xl shadow-[0_0_30px_rgba(128,0,255,0.3)] border border-purple-800">
            {notification && (
              <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-300 px-4 py-3 rounded-lg mb-4 text-center">
                <p>{notification}</p>
              </div>
            )}
            <div className="mb-6 text-center bg-[#2a2a40] p-6 rounded-lg min-h-[150px] flex items-center justify-center">
              {currentQuestion ? (
                <p className="text-2xl lg:text-3xl font-semibold leading-relaxed">
                  {currentQuestion}
                </p>
              ) : (
                <p className="text-xl text-gray-500">
                  {isConnected
                    ? "Waiting for the next question..."
                    : "Connecting..."}
                </p>
              )}
            </div>
            <form onSubmit={handleAnswerSubmit}>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here and press Enter..."
                className="w-full p-4 bg-[#2a2a40] border border-gray-600 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                disabled={!isConnected || !currentQuestion}
              />
            </form>
          </main>

          <aside className="space-y-6">
            {user?.role === "admin" && <AdminControlPanel />}

            <div className="bg-[#1c1c2b] p-6 rounded-3xl shadow-[0_0_30px_rgba(128,0,255,0.3)] border border-purple-800">
              <h2 className="text-xl font-bold mb-3 border-b border-purple-700 pb-2">
                Game Info
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Topic:</strong>{" "}
                  <span className="text-cyan-300">{gameSettings.topic}</span>
                </p>
                <p>
                  <strong>Difficulty:</strong>{" "}
                  <span className="text-cyan-300">{gameSettings.rarity}</span>
                </p>
                <p>
                  <strong>Language:</strong>{" "}
                  <span className="text-cyan-300">{gameSettings.language}</span>
                </p>
              </div>
            </div>

            <div className="bg-[#1c1c2b] p-6 rounded-3xl shadow-[0_0_30px_rgba(128,0,255,0.3)] border border-purple-800">
              <h2 className="text-xl font-bold mb-4 border-b border-purple-700 pb-2">
                Vote to Skip
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Need a new question? If 50% of players vote, the round will
                  restart.
                </p>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base font-medium text-indigo-400">
                      Votes
                    </span>
                    <span className="text-sm font-medium text-indigo-400">
                      {voteState.currentVotes} / {requiredVotes}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${votePercentage}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={handleVoteClick}
                  disabled={!isConnected || !currentQuestion}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:brightness-110 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Vote to Skip Question
                </button>
              </div>
            </div>

            <div className="bg-[#1c1c2b] p-6 rounded-3xl shadow-[0_0_30px_rgba(128,0,255,0.3)] border border-purple-800">
              <h2 className="text-xl font-bold mb-4 border-b border-purple-700 pb-2">
                Online Players ({onlinePlayers.length})
              </h2>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {onlinePlayers.map((player) => (
                  <li
                    key={player.id}
                    className="text-gray-300 flex justify-between"
                  >
                    <span>
                      {player.username}
                      {player.role === "admin" && " 👑"}
                    </span>
                    <span className="font-semibold text-green-400">
                      {player.solved}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1c1c2b] p-6 rounded-3xl shadow-[0_0_30px_rgba(128,0,255,0.3)] border border-purple-800">
              <h2 className="text-xl font-bold mb-4 border-b border-purple-700 pb-2">
                Live Chat (Wrong Answers)
              </h2>
              <div className="space-y-3 h-64 overflow-y-auto pr-2">
                {chatHistory.map((chat, index) => (
                  <div key={index}>
                    <span className="font-bold text-cyan-400">
                      {chat.username}:{" "}
                    </span>
                    <span className="text-gray-300 break-all">
                      {chat.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
