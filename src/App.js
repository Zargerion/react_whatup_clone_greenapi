import './tailwind.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/home_page.jsx';
import ChatPage from './pages/chat_page.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/react_whatup_clone_greenapi" element={<HomePage/>} />
        <Route path="/react_whatup_clone_greenapi/chat" element={<ChatPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
