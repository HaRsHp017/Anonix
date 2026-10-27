import Home from "./component/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatRoom from "./component/ChatRoom"
import { useParams } from "react-router-dom";
function App() {
  const { roomName } = useParams();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomName" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;