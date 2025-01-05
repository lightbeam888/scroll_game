import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from "./logo.svg";
import "./App.css";
import LandingPage from "./components/LandingPage";
import GameBoard from "./components/GameBoard";
import UserScores from "./UserScores";

// context start
import { WalletProvider } from "./context/WalletContext";
import ShopPage from "./components/ShopPage";

//context ends

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/game" element={<GameBoard />} />
            <Route path="/userscore" element={<UserScores />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </BrowserRouter>
      </div>
      <ToastContainer />
    </WalletProvider>
  );
}

export default App;
