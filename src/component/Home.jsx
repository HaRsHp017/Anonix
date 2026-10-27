import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const randomNames = [
    "GhostWolf",
    "SilentFox",
    "NightOwl",
    "ChatExplorer",
    "HiddenSoul",
    "MysticUser",
    "ShadowByte",
    "AnonLegend",
  ];

  const [username] = useState(
    randomNames[Math.floor(Math.random() * randomNames.length)] +
      "_" +
      Math.floor(Math.random() * 100)
  );

  const [roomName, setRoomName] = useState("");

  const handleJoin = () => {
    if (!roomName.trim()) {
      alert("Enter a room name");
      return;
    }

    navigate(`/room/${roomName}`, {
      state: {
        username,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-5 relative overflow-hidden">
      
      {/* Background Blur */}
      <div className="absolute w-96 h-96 bg-blue-500/20 blur-[150px] rounded-full top-20 left-20"></div>
      <div className="absolute w-96 h-96 bg-purple-500/20 blur-[150px] rounded-full bottom-20 right-20"></div>

      <div className="w-full max-w-lg z-10">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold">
            <span className="text-blue-500">Anon</span>ix
          </h1>

          <p className="text-gray-400 mt-3">
            Anonymous conversations without signups.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">

          <div className="flex justify-center mb-6">
            <span className="bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm">
              ● Anonymous Chat Active
            </span>
          </div>

          <h2 className="text-3xl font-bold text-center mb-4">
            Join a Chat Room
          </h2>

          <p className="text-gray-400 text-center mb-8">
            Enter any room name and start chatting anonymously.
          </p>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">
              Random Username
            </label>

            <input
              type="text"
              value={username}
              readOnly
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none"
            />
          </div>

          {/* Room Name */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">
              Room Name
            </label>

            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="gaming, cs2, gate2027..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-4 font-semibold text-lg"
          >
            Enter Room →
          </button>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          No login • No signup • Fully anonymous
        </div>
      </div>
    </div>
  );
}

export default Home;