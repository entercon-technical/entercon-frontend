import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "./BackButton";

export default function ScoreDetails() {
  const location = useLocation();
  const { schoolName, programName } = location.state || {};

  const [activePage, setActivePage] = useState("Search Scoreboard");
  const [logs, setLogs] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);

  const [currentDate, setCurrentDate] = useState();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [participantsCount, setParticipantsCount] = useState();
  const [schoolData, setSchoolData] = useState([]);

  const totalDays = schoolData.numberOfDays;

  // ── Your original backend state ──

  const navigate = useNavigate();
  const username = location.state?.username;
  const users = location.state?.users;
  var school = location.state?.school;
  const darkModeStatus = location.state.darkMode;
  const role = location.state?.role || "Admin"; // Default to Admin for backward compatibility

  // Conditionally set navItems based on role
  const filteredNavItems = role === "Admin" 
    ? ["Dashboard", "Add Schools", "Search Scoreboard", "Add Users"]
    : ["Dashboard", "Search Scoreboard"];
  const filteredUrl = role === "Admin"
    ? ["/dashboard", "/add-school", "/search-scoreboard", "/add-users"]
    : ["/dashboard", "/search-scoreboard"];

  useEffect(() => {
    school.filter((item) => {
      if (item.schoolName === schoolName) {
        setSchoolData(item);
        setLogs(item.eventLog); // ── logs[0]=Day1, logs[1]=Day2 ...
        setCurrentDate(new Date().toISOString().split("T")[0]);
      }
      return item.schoolName === schoolName;
    });
  }, [schoolName, school]);

  useEffect(() => {
    setDarkMode(darkModeStatus);
  }, [darkModeStatus]);

  useEffect(() => {
    setParticipantsCount(schoolData.participants);
  }, [schoolData]);
  // ─────────────────────────────────

  // ── Safe accessors ──
  // logs[0] = Day 1 entries, logs[1] = Day 2 entries, etc.
  const eventLogExists = logs.length > 0 && Array.isArray(logs[currentDay - 1]);
  const currentDayEntries = eventLogExists ? logs[currentDay - 1] : [];
  const currentDayTotal = currentDayEntries.reduce(
    (sum, entry) => sum + (entry.points || 0),
    0,
  );
  // ───────────────────

  const dm = {
    page: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300",
    title: darkMode
      ? "border-gray-700 text-white"
      : "border-gray-200 text-gray-900",
    sidebar: darkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-gray-400",
    main: darkMode ? "bg-gray-800" : "bg-gray-50",
    card: darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
    text: darkMode ? "text-gray-100" : "text-gray-700",
    subtext: darkMode ? "text-gray-400" : "text-gray-500",
    input: darkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
      : "bg-white border-gray-300 text-gray-700 focus:ring-blue-300",
    tableHead: darkMode
      ? "bg-gray-700 text-gray-300"
      : "bg-gray-50 text-gray-500",
    row: darkMode
      ? "border-gray-700 hover:bg-gray-700"
      : "border-gray-100 hover:bg-blue-50",
    cell: darkMode ? "text-gray-200" : "text-gray-800",
  };

  // ── Your original handlers (untouched) ──
  const handleUndo = (id, index) => {
    const matchingIndex = school.findIndex(
      (s) => s.schoolName === schoolName && s.programName === programName,
    );
    axios
      .get(
        `https://entercon-backend-1e81.onrender.com/undo-points?dayIndex=${currentDay}&index=${index}&matchingIndex=${matchingIndex}`,
      )
      .then((res) => {
        navigate("/score-details", {
          state: {
            username,
            users,
            school: res.data,
            schoolName,
            programName,
            darkMode,
            role,
          },
        });
        school = res.data;
      })
      .catch((e) => console.log(e));
  };

  const handleRestore = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setLogs([...logs, last].sort((a, b) => a.id - b.id));
    setUndoStack(undoStack.slice(0, -1));
  };
  // ────────────────────────────────────────

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
          className={`text-sm sm:text-base md:text-lg font-bold text-center flex-1 min-w-0 ${dm.text}`}
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
        {/* ── Mobile Overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <div
          className={`
          fixed md:static z-50 top-0 left-0 h-full w-64 md:w-56 shrink-0
          flex flex-col gap-3 sm:gap-4 md:gap-5 px-6 py-8 border-r transition-transform duration-300
          ${dm.sidebar} ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
        >
          <div className="flex items-center justify-between md:hidden mb-2">
            <span className={`text-sm font-bold ${dm.text}`}>Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              ×
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
                    school,
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
          className={`flex-1 min-w-0 px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 flex flex-col gap-4 sm:gap-5 md:gap-6 ${dm.main}`}
        >
          {/* Page Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className={`text-sm sm:text-base md:text-lg font-bold ${dm.text}`}>
                Score Details
              </h2>
              <p className={`text-xs mt-0.5 ${dm.subtext}`}>
                Live event log and scoreboard
              </p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {undoStack.length > 0 && (
                <button
                  onClick={handleRestore}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all ${
                    darkMode
                      ? "bg-yellow-900 text-yellow-200 hover:bg-yellow-800"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                >
                  ↩ Restore Last
                </button>
              )}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {currentDayEntries.length} Events Logged
              </span>
            </div>
          </div>

          {/* School Info Banner */}
          <div
            className={`rounded-xl px-5 md:px-6 py-5 text-white shadow-lg transition-all duration-300 ${
              darkMode
                ? "bg-gradient-to-r from-slate-700 to-gray-800 shadow-gray-900/50"
                : "bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/25"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">
              School Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { label: "School Name", value: schoolName },
                { label: "Program Name", value: programName },
                { label: "Participants", value: participantsCount },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg px-4 py-3 backdrop-blur-sm transition-all ${
                    darkMode
                      ? "bg-slate-600/60 shadow-lg shadow-slate-900/30"
                      : "bg-blue-500/80 shadow-md shadow-blue-500/40"
                  }`}
                >
                  <p
                    className={`text-xs mb-1 ${darkMode ? "text-blue-300" : "text-blue-200"}`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`font-bold ${darkMode ? "text-gray-100" : "text-white"}`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* See Scoreboard */}
            <button
              onClick={() =>
                navigate("/scoreboard-mode1", {
                  state: {
                    username,
                    users,
                    school,
                    schoolName,
                    programName,
                    darkMode,
                    role,
                  },
                })
              }
              className={`font-bold text-sm px-6 py-2.5 rounded-full active:scale-95 transition-all shadow-md hover:shadow-lg ${
                darkMode
                  ? "bg-emerald-700 hover:bg-emerald-600 text-gray-100 shadow-emerald-900/30"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
              }`}
            >
              See Scoreboard
            </button>

            {/* Day Navigator */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all ${
                darkMode
                  ? "bg-gray-700 text-gray-200 shadow-gray-900/30"
                  : "bg-orange-400 text-white shadow-orange-400/30"
              }`}
            >
              <button
                onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                className="hover:text-gray-100 transition-colors font-bold text-base"
              >
                ‹
              </button>
              <span>
                Day {currentDay}/{totalDays}
              </span>
              <button
                onClick={() =>
                  setCurrentDay(Math.min(totalDays, currentDay + 1))
                }
                className="hover:text-gray-100 transition-colors font-bold text-base"
              >
                ›
              </button>
            </div>

            {/* Add Points */}
            <div className="ml-auto">
              <button
                onClick={() =>
                  navigate("/add-points", {
                    state: {
                      username,
                      users,
                      school,
                      schoolName,
                      programName,
                      darkMode,
                      role,
                    },
                  })
                }
                className={`text-sm font-bold px-5 py-2 rounded-lg active:scale-95 transition-all shadow-md hover:shadow-lg ${
                  darkMode
                    ? "bg-blue-800 hover:bg-blue-700 text-blue-200 shadow-blue-900/30"
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25"
                }`}
              >
                + Add Points
              </button>
            </div>
          </div>

          {/* Event Log Table */}
          <div
            className={`border rounded-xl shadow-sm overflow-hidden ${dm.card}`}
          >
            {/* Table Header */}
            <div
              className={`px-3 sm:px-4 md:px-6 py-3 border-b flex items-center justify-between flex-wrap gap-2 ${
                darkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <h3 className={`text-sm font-bold ${dm.text}`}>
                📋 Event Log — Day {currentDay}&nbsp;
                <span className={`font-normal text-xs ${dm.subtext}`}>
                  {currentDate}
                </span>
              </h3>
              <span className={`text-xs ${dm.subtext}`}>
                {currentDayEntries.length} entries
              </span>
            </div>

            {/* ── Empty State ── */}
            {currentDayEntries.length === 0 ? (
              <div className="px-6 py-12 text-center flex flex-col items-center gap-3">
                <p className="text-4xl">📋</p>
                <p className={`text-sm font-bold ${dm.text}`}>
                  No events logged for Day {currentDay}.
                </p>
                <p className={`text-xs ${dm.subtext}`}>
                  Go to the{" "}
                  <button
                    onClick={() =>
                      navigate("/add-points", {
                        state: {
                          username,
                          users,
                          school,
                          schoolName,
                          programName,
                          darkMode,
                        },
                      })
                    }
                    className="text-blue-500 font-bold underline hover:text-blue-400 transition-colors"
                  >
                    Add Points
                  </button>{" "}
                  page to log events for this day.
                </p>
              </div>
            ) : (
              /* ── Entries Table ── */
              <>
              <div className="flex flex-col gap-3 p-3 md:hidden">
                {currentDayEntries.map((eLog, index) => (
                  <article
                    key={`mobile-${index}`}
                    className={`rounded-lg border p-3 ${dm.card}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className={`truncate text-sm font-bold ${dm.cell}`}>{eLog.team}</h4>
                        <p className={`mt-0.5 break-words text-xs ${dm.subtext}`}>{eLog.events}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                        eLog.points >= 20
                          ? darkMode ? "bg-emerald-900 text-emerald-200" : "bg-emerald-100 text-emerald-700"
                          : eLog.points >= 10
                            ? darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"
                            : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                      }`}>
                        {eLog.points > 0 ? "+" : ""}{eLog.points}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                      <span className={`text-xs ${dm.subtext}`}>{eLog.time}</span>
                      <button
                        onClick={() => handleUndo(eLog, index)}
                        className={`min-h-11 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                          darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-700 hover:bg-gray-900"
                        }`}
                      >
                        Undo
                      </button>
                    </div>
                  </article>
                ))}
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold ${darkMode ? "bg-indigo-900 text-indigo-200" : "bg-indigo-600 text-white"}`}>
                  <span>Total Points</span>
                  <span>{currentDayTotal} pts</span>
                </div>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-xs min-w-[560px]">
                  <thead className={`uppercase tracking-wide ${dm.tableHead}`}>
                    <tr>
                      <th className="px-5 py-2.5 text-left font-semibold">
                        Time
                      </th>
                      <th className="px-5 py-2.5 text-left font-semibold">
                        Team
                      </th>
                      <th className="px-5 py-2.5 text-left font-semibold">
                        Activity
                      </th>
                      <th className="px-5 py-2.5 text-left font-semibold">
                        Points
                      </th>
                      <th className="px-5 py-2.5 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* logs[currentDay - 1] gives the correct day's array */}
                    {currentDayEntries.map((eLog, index) => (
                      <tr
                        key={index}
                        className={`border-t transition-colors ${dm.row}`}
                      >
                        <td className={`px-5 py-3 text-xs ${dm.subtext}`}>
                          {eLog.time}
                        </td>

                        <td className={`px-5 py-3 font-medium ${dm.cell}`}>
                          {eLog.team}
                        </td>

                        <td className={`px-5 py-3 ${dm.subtext}`}>
                          {eLog.events}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                              eLog.points >= 20
                                ? darkMode
                                  ? "bg-emerald-900 text-emerald-200"
                                  : "bg-emerald-100 text-emerald-700"
                                : eLog.points >= 10
                                  ? darkMode
                                    ? "bg-blue-900 text-blue-200"
                                    : "bg-blue-100 text-blue-700"
                                  : darkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            +{eLog.points}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleUndo(eLog, index)}
                            className={`text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-all shadow-md hover:shadow-lg ${
                              darkMode
                                ? "bg-gray-600 hover:bg-gray-500 text-gray-200 shadow-gray-900/30"
                                : "bg-gray-700 hover:bg-gray-900 text-white shadow-gray-500/25"
                            }`}
                          >
                            Undo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Total Points Footer */}
                  <tfoot
                    className={`border-t ${
                      darkMode
                        ? "border-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <tr>
                      <td
                        colSpan={3}
                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wide ${dm.subtext}`}
                      >
                        Total Points — Day {currentDay}
                      </td>
                      <td colSpan={2} className="px-5 py-2.5">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                            darkMode
                              ? "bg-indigo-900 text-indigo-200 shadow-indigo-900/30"
                              : "bg-indigo-600 text-white shadow-indigo-500/25"
                          }`}
                        >
                          {currentDayTotal} pts
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
