import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/home/home.tsx';
import SignIn from './components/sign-in/SignIn.tsx';

function App() {
  return (
    
      <Router>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<div>Acerca de nosotros</div>} />
      </Routes>
      </Router>
    
  );
}
export default App;




