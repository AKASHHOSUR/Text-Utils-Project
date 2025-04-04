import './App.css';
import React, { useState } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Alert from "./components/Alert";
import About from "./components/About";
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
function App() {
  const [mode, setMode] = useState("light");
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => setAlert(null), 1500);
  };

  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "#042743";
      showAlert("Dark mode has been enabled", "success");
    } else {
      setMode("light");
      document.body.style.backgroundColor = '#d8e4d0';
      showAlert("Light mode has been enabled", "success");
    }
  };
  React.useEffect(() => {
    document.body.style.backgroundColor = '#d8e4d0';
  }, []);

  return (
    <>
    <Router>
      <Navbar mode={mode} toggleMode={toggleMode} />
      <Alert alert={alert} />
      <div className="container">
      <Routes>
        <Route path="/about" element={<About mode={mode} />} />
        <Route path="/" element={<Home mode={mode} showAlert={showAlert} />} />
      </Routes>
      </div>
    </Router>
    </>
  );
}

export default App;
