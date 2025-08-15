import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/home/home.tsx';
import SignIn from './components/sign-in/SignIn.tsx';

function App() {
  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', backgroundColor: '#141926' }}>
      <Router>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<div>Acerca de nosotros</div>} />
      </Routes>
      </Router>
    </div>
  );
}
export default App;




