import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  var [data, setData] = useState();
  var [user, setUser] = useState();

  axios.get("https://entercon-backend-1e81.onrender.com/")
    .then((d) => {
      setData(d.data[0]);
      setUser(d.data[0].users);
    })
    .catch((e) => console.log(e));

  const handleEnter = () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    const currentUser = user.find(
      (u) => u.name === username && u.password === password
    );

    if (currentUser) {
      navigate("/dashboard", {
        state: {
          username: username,
          users: user,
          data: data,
          school: data.schools,
          darkMode: darkMode,
          role: currentUser.role
        }
      });
    } else {
      alert("Invalid username or password.");
    }
  };

  const dm = {
    bg: darkMode
      ? "bg-gray-950"
      : "bg-blue-50",

    card: darkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-blue-200",

    title: darkMode
      ? "text-white"
      : "text-gray-900",

    label: darkMode
      ? "text-gray-200"
      : "text-gray-900",

    input: darkMode
      ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500"
      : "bg-gray-50 border-gray-400 text-gray-500 focus:border-blue-400",

    toggle: darkMode
      ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
      : "bg-gray-800 text-white hover:bg-gray-700",
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300 ${dm.bg}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-4 sm:top-5 right-4 sm:right-5 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 touch-highlight ${dm.toggle}`}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* Login Card */}
      <div className={`border-2 border-dashed rounded-2xl w-full max-w-sm px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 flex flex-col items-center shadow-sm transition-colors duration-300 ${dm.card}`}>
        {/* Title */}
        <h1 className={`text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 text-center font-mono leading-relaxed ${dm.title}`}>
          Welcome to Entercon Scoreboard Page!
        </h1>

        {/* Username */}
        <div className="flex flex-col w-full mb-4 sm:mb-6">
          <label className={`font-bold w-full font-mono text-xs sm:text-sm mb-2 ${dm.label}`}>
            Username:
          </label>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEnter()}
            className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-mono w-full focus:outline-none focus:ring-2 transition-all ${dm.input}`}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col w-full mb-6 sm:mb-8">
          <label className={`font-bold w-full font-mono text-xs sm:text-sm mb-2 ${dm.label}`}>
            Password:
          </label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleEnter()}
              className={`border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-12 sm:pr-14 text-xs sm:text-sm font-mono w-full focus:outline-none focus:ring-2 transition-all ${dm.input}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded transition-colors touch-highlight ${
                darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          className="bg-sky-400 hover:bg-sky-500 active:scale-95 text-white font-bold font-mono text-sm md:text-base px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 md:py-3.5 rounded-full transition-all duration-150 w-full sm:w-auto min-h-12 touch-highlight"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
