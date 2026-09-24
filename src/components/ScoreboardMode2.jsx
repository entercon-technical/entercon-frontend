import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BackButton from "./BackButton";

const MODES = ["Mode 1", "Mode 2", "Mode 3"];

export default function ScoreboardMode2() {
  const [currentDay, setCurrentDay] = useState(0);
  const [currentMode, setCurrentMode] = useState(1);
  const [session, setSession] = useState("Entercon Session");
  const [editingHeader, setEditingHeader] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [DAYS, setDAYS] = useState([]);

  // ── Your original backend state ──

  const [activePage, setActivePage] = useState("Search Scoreboard");  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;
  const users = location.state?.users;
  const [schools, setSchools] = useState(location.state?.school);
  const darkModeStatus = location.state?.darkMode || window.localStorage.getItem("darkMode") === "true";
  const schoolName = location.state?.schoolName;
  const programName = location.state?.programName;
  const role = location.state?.role || "Admin"; // Default to Admin for backward compatibility

  axios
    .get("https://entercon-backend-1e81.onrender.com/get-data")
    .then((response) => setSchools(response.data))
    .catch((e) => console.log(e));

  // Conditionally set navItems based on role
  const filteredNavItems = role === "Admin" 
    ? ["Dashboard", "Add Schools", "Search Scoreboard", "Add Users"]
    : ["Dashboard", "Search Scoreboard"];
  const filteredUrl = role === "Admin"
    ? ["/dashboard", "/add-school", "/search-scoreboard", "/add-users"]
    : ["/dashboard", "/search-scoreboard"];

  useEffect(() => {
    setCurrentMode(1);
    setDarkMode(darkModeStatus);
    const matchingSchool = schools?.find(
      (s) => s.schoolName === schoolName && s.programName === programName,
    );
    var days = [];
    for (let i = 1; i <= matchingSchool.numberOfDays; i++) {
      days.push(`Day ${i}`);
    }
    setDAYS(days);
  }, [schools, schoolName, programName, darkModeStatus]);

  // Find matching school
  const matchingSchool = schools?.find(
    (s) => s.schoolName === schoolName && s.programName === programName,
  );
  const TEAMS = matchingSchool?.teamNames || [];
  const eventLog = matchingSchool?.eventLog || [];

  // Build TASKS from unique event names in eventLog
  const taskColors = [
    "bg-pink-400 text-white",
    "bg-yellow-400 text-gray-800",
    "bg-cyan-400 text-white",
    "bg-green-400 text-white",
    "bg-purple-400 text-white",
  ];

  const allEvents = new Set();
  eventLog.forEach((dayLogs) => {
    dayLogs.forEach((log) => allEvents.add(log.events));
  });
  const TASKS = [...allEvents].map((name, i) => ({
    id: i + 1,
    name,
    color: taskColors[i % taskColors.length],
  }));

  // Get score for a team on a specific task for current day
  const cumulativeLogs = eventLog
  .slice(0, currentDay + 1)
  .flat();

const getScore = (teamName, taskName) => {
  const entries = cumulativeLogs.filter(
    (l) =>
      l.team.trim().toLowerCase() ===
        teamName.trim().toLowerCase() &&
      l.events === taskName
  );

  return entries.length > 0
    ? entries.reduce((s, l) => s + l.points, 0)
    : null;
};

const getTotal = (teamName) => {
  return cumulativeLogs
    .filter(
      (l) =>
        l.team.trim().toLowerCase() ===
        teamName.trim().toLowerCase()
    )
    .reduce((s, l) => s + l.points, 0);
};

const taskTotal = (taskName) => {
  return cumulativeLogs
    .filter((l) => l.events === taskName)
    .reduce((s, l) => s + l.points, 0);
};

const grandTotal = () => {
  return cumulativeLogs.reduce(
    (s, l) => s + l.points,
    0
  );
};

  const dm = {
    page: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300",
    title: darkMode
      ? "border-gray-700 text-white"
      : "border-gray-200 text-gray-900",
    sidebar: darkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-gray-400",
    text: darkMode ? "text-gray-100" : "text-gray-800",
    subtext: darkMode ? "text-gray-400" : "text-gray-500",
    mainBg: darkMode ? "bg-gray-800" : "bg-gray-200",
    headerBar: darkMode ? "bg-gray-700" : "bg-gray-300",
    headerField: darkMode
      ? "bg-gray-800 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-700",
    teamHead: darkMode
      ? "bg-gray-600 border-gray-500 text-gray-100"
      : "bg-gray-300 border-gray-400 text-gray-700",
    logoCell: darkMode
      ? "bg-gray-600 border-gray-500"
      : "bg-gray-300 border-gray-400",
    logoCircle: darkMode
      ? "bg-gray-800 border-gray-500"
      : "bg-white border-gray-400",
    scoreCell: darkMode
      ? "bg-gray-800 border-gray-600 hover:bg-gray-700"
      : "bg-white border-gray-300 hover:bg-blue-50",
    scoreNull: darkMode ? "text-gray-600" : "text-gray-300",
    scoreVal: darkMode ? "text-gray-100" : "text-gray-800",
    totalRow: darkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-gray-800 border-gray-600",
    footerBar: darkMode ? "bg-gray-900" : "bg-gray-800",
    grandLabel: darkMode ? "text-gray-500" : "text-gray-400",
    dayBtn: darkMode
      ? "bg-gray-800 border-gray-600"
      : "bg-white border-gray-300",
  };

  const HeaderField = ({ field, value, center }) => (
    <div
      onClick={() => setEditingHeader(field)}
      className={`rounded-lg px-3 py-2 flex items-center border cursor-pointer gap-1 ${dm.headerField} ${center ? "justify-center" : "justify-between"}`}
    >
      {editingHeader === field ? (
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => {
            if (field === "session") setSession(e.target.value);
          }}
          onBlur={() => setEditingHeader(null)}
          onKeyDown={(e) => e.key === "Enter" && setEditingHeader(null)}
          className={`text-xs font-bold w-full focus:outline-none bg-transparent text-center ${darkMode ? "text-gray-100" : "text-gray-700"}`}
        />
      ) : (
        <span
          className={`text-xs font-bold truncate ${darkMode ? "text-gray-100" : "text-gray-700"} ${center ? "text-center w-full" : ""}`}
        >
          {field === "school"
            ? schoolName
            : field === "program"
              ? programName
              : value}
        </span>
      )}
      
        <span className="text-gray-400 text-xs shrink-0"></span>
    </div>
  );

  return (
    <div
      className={`min-h-screen border-2 border-dashed rounded-xl font-mono transition-colors duration-300 ${dm.page}`}
    >
      {/* ── Top Bar ── */}
      <div
        className={`flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b ${dm.title}`}
      >
        <BackButton />
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1
          className={`text-sm sm:text-base md:text-lg font-bold text-center flex-1 min-w-0 ${dm.title}`}
        >
          Welcome to Entercon Score Page!
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            darkMode
              ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-73px)] relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <div
          className={`
          fixed md:static z-50 top-0 left-0 h-full
          w-64 md:w-56 shrink-0 flex flex-col gap-3 sm:gap-4 md:gap-5 px-6 py-8
          border-r transition-transform duration-300
          ${dm.sidebar}
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
        >
          <div className="flex items-center justify-between md:hidden mb-2">
            <span className={`text-sm font-bold ${dm.text}`}>Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              ✕
            </button>
          </div>
          {filteredNavItems.map((item, index) => (
            <button
              key={item}
              onClick={() => {
                setActivePage(item);
                setSidebarOpen(false);
                navigate(filteredUrl[index], {
                  state: {
                    username,
                    users,
                    school: schools,
                    schoolName,
                    programName,
                    darkMode,
                    role,
                  },
                });
              }}
              className={`text-left text-sm font-mono transition-all duration-150 hover:text-blue-500 ${
                activePage === item ? "text-blue-500 font-bold" : dm.text
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div
          className={`flex-1 min-w-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 flex flex-col gap-3 sm:gap-4 ${dm.mainBg}`}
        >
          {/* Header Bar */}
          <div className={`rounded-xl p-3 flex flex-col gap-2 ${dm.headerBar}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <HeaderField field="session" value={session} />
              <HeaderField field="school" value={schoolName} center />
              <div className="flex items-center gap-2">
                <div
                  className={`flex-1 rounded-lg px-3 py-2 border flex items-center justify-between ${dm.dayBtn}`}
                >
                  <button
                    onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
                    className={`font-bold hover:text-blue-500 transition-colors ${dm.subtext}`}
                  >
                    ‹
                  </button>
                  <span
                    className={`text-xs font-bold ${darkMode ? "text-gray-100" : "text-gray-700"}`}
                  >
                    {DAYS[currentDay]}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentDay(Math.min(DAYS.length - 1, currentDay + 1))
                    }
                    className={`font-bold hover:text-blue-500 transition-colors ${dm.subtext}`}
                  >
                    ›
                  </button>
                </div>
                <button
                  onClick={() =>
                    navigate("/scoreboard-mode3", {
                      state: {
                        username,
                        users,
                        school: schools,
                        schoolName,
                        programName,
                        darkMode,
                        role,
                      },
                    })
                  }
                  className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all whitespace-nowrap"
                >
                  {MODES[currentMode]} ↺
                </button>
              </div>
            </div>
            <div className="mx-0 md:mx-20">
              <HeaderField field="program" value={programName} center />
            </div>
          </div>

          {/* ── Scoreboard Table ── */}
          <div className="flex-1 w-full overflow-x-auto rounded-xl">
            <div style={{ minWidth: `${TEAMS.length * 80 + 120}px` }}>
              <table className="w-full border-collapse text-xs">
                {/* Team Header + Logo */}
                <thead onClick={() => navigate("/add-points", {state: { username, users, school: schools, schoolName, programName, darkMode, role }})} className="cursor-pointer">
                  <tr>
                    {TEAMS.map((team, i) => (
                      <th
                        key={i}
                        className={`border px-1 py-1.5 text-center font-bold text-xs ${dm.teamHead}`}
                        style={{ minWidth: "70px" }}
                      >
                        <span className="block truncate">
                          Team {i + 1}:
                          {` `+team.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 4)}
                        </span>
                      </th>
                    ))}
                    <th
                      className="bg-pink-500 border border-pink-600 px-2 py-1.5 text-white font-bold text-xs"
                      style={{ minWidth: "90px" }}
                    >
                      Tasks
                    </th>
                  </tr>

                  {/* Logo Row */}
                  <tr>
                    {TEAMS.map((team, i) => (
                      <td
                        key={i}
                        className={`border px-1 py-2 text-center ${dm.logoCell}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto shadow-sm ${dm.logoCircle}`}
                        >
                          <span className="text-sm">🏫</span>
                        </div>
                      </td>
                    ))}
                    <td className="bg-pink-500 border border-pink-600" />
                  </tr>
                </thead>

                {/* Score Rows */}
                <tbody>
                  {TASKS.map((task) => (
                    <tr key={task.id}>
                      {TEAMS.map((team, i) => {
                        const val = getScore(team.name, task.name);
                        return (
                          <td
                            key={i}
                            className={`border px-1 py-2 text-center ${dm.scoreCell}`}
                          >
                            <span
                              className={`font-bold ${val === null ? dm.scoreNull : dm.scoreVal}`}
                            >
                              {val === null ? "—" : val}
                            </span>
                          </td>
                        );
                      })}
                      <td
                        className={`border px-2 py-2 font-bold text-xs ${task.color}`}
                      >
                        {task.name}
                      </td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr>
                    {TEAMS.map((team, i) => (
                      <td
                        key={i}
                        className={`border px-1 py-2 text-center ${dm.totalRow}`}
                      >
                        <span className="font-bold text-white text-sm">
                          {getTotal(team.name)}
                        </span>
                      </td>
                    ))}
                    <td className="bg-orange-500 border border-orange-600 px-2 py-2 text-center">
                      <span className="font-bold text-white text-sm">
                        Total
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Summary — 2 cols on mobile, auto on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {TASKS.map((task) => (
              <div
                key={task.id}
                className={`rounded-xl px-3 py-2.5 flex items-center justify-between ${task.color}`}
              >
                <span className="text-xs font-bold leading-tight truncate mr-2">
                  {task.name}
                </span>
                <span className="text-sm font-bold shrink-0">
                  {taskTotal(task.name)}
                </span>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div
            className={`rounded-xl px-4 md:px-5 py-3 flex items-center justify-between text-white ${dm.footerBar}`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-widest ${dm.grandLabel}`}
            >
              Grand Total
            </span>
            <span className="text-lg md:text-xl font-bold">
              {grandTotal()} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
