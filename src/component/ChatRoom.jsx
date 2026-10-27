
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import socket from "../socket/socket";

export default function ChatRoom() {
  const navigate = useNavigate();
  const { roomName } = useParams();
  const location = useLocation();

  const username = location.state?.username || "Anonymous";

  const [copied, setCopied] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Connect to socket and join the current room
  useEffect(() => {
    if (!roomName) return;

    setMessages([]);
    setOnlineCount(0);

    const handleConnect = () => {
      console.log("Connected:", socket.id);
      socket.emit("join_room", roomName);
    };

    const handleHistory = (history) => {
      setMessages(
        history.map((msg) => ({
          ...msg,
          own: msg.user === username,
        }))
      );
    };

    const handleReceiveMessage = (data) => {
      if (data.room !== roomName) return;

      setMessages((prev) => [
        ...prev,
        { ...data, own: data.user === username },
      ]);
    };

    const handleRoomUsers = (data) => {
      if (data.room === roomName) {
        setOnlineCount(data.count);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("message_history", handleHistory);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("room_users", handleRoomUsers);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("message_history", handleHistory);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("room_users", handleRoomUsers);
      socket.disconnect();
    };
  }, [roomName, username]);

  // Auto-scroll whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message to the backend
  const sendMessage = () => {
    const text = message.trim();

    if (!text || !roomName || !socket.connected) return;

    const msg = {
      room: roomName,
      user: username,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", msg);
    setMessage("");
    setEmoji(false);
    inputRef.current?.focus();
  };

  // Copy current room URL
  const copyRoom = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy room link:", error);
    }
  };

  // Switch rooms without returning to the home page
  const switchRoom = (e) => {
    e.preventDefault();

    const targetRoom = newRoom.trim().replace(/^#+/, "");
    if (!targetRoom) return;

    navigate(`/room/${encodeURIComponent(targetRoom)}`, {
      state: { username },
    });

    setNewRoom("");
    setEmoji(false);
  };

  return (
    
<div
  className="h-screen text-white flex flex-col overflow-hidden"
  style={{
    backgroundImage:
      "linear-gradient(rgba(2, 6, 23, 0.45), rgba(2, 6, 23, 0.65)), url('/midnight-city.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  }}
>

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-blue-500 text-3xl font-bold">#</span>
              <h1 className="text-2xl sm:text-3xl font-bold break-all">
                {roomName}
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-slate-400">
                Public Anonymous Room · {onlineCount}{" "}
                {onlineCount === 1 ? "user" : "users"} online
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyRoom}
              className="bg-slate-800 hover:bg-slate-700 transition px-4 py-2 rounded-xl"
            >
              {copied ? "✅ Copied" : "📋 Copy Link"}
            </button>

            <form onSubmit={switchRoom} className="flex gap-2">
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="Switch room..."
                className="w-36 sm:w-44 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition px-4 py-2 rounded-xl font-semibold"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8">
            Loading messages or no messages yet...
          </div>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.user === username;
          const isSystem = msg.user === "System";

          return (
            <div
              key={msg._id || `${msg.user}-${msg.time}-${index}`}
              className={`flex ${
                isSystem ? "justify-center" : isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {isSystem ? (
                <div className="text-xs text-slate-500 bg-slate-900 px-4 py-2 rounded-full">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] sm:max-w-lg flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwn && (
                    <span className="text-xs text-slate-500 mb-1 px-1">
                      {msg.user}
                    </span>
                  )}

                  <div
                    className={`rounded-2xl px-5 py-3 shadow-lg break-words whitespace-pre-wrap ${
                      isOwn
                        ? "bg-blue-600 rounded-br-md"
                        : "bg-slate-800 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>

                  <span className="text-[10px] text-slate-500 mt-1">
                    {msg.time}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </main>

      {/* EMOJI PICKER */}
      {emoji && (
        <div className="absolute bottom-24 left-4 z-50">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              setMessage((prev) => prev + emojiData.emoji);
              inputRef.current?.focus();
            }}
          />
        </div>
      )}

      {/* MESSAGE INPUT */}
      <footer className="border-t border-slate-800 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-2xl px-3 sm:px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEmoji((prev) => !prev)}
            className="text-2xl hover:scale-110 transition"
            aria-label="Toggle emoji picker"
          >
            😀
          </button>

          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder={`Message #${roomName}...`}
            className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder:text-slate-500"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-4 sm:px-5 py-2 transition font-medium"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
