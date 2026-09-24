import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BackButton from "./BackButton";

const MODES = ["Mode 1", "Mode 2", "Mode 3"];

const LevelIcon = ({ level }) => {
  if (level === "up")
    return <span className="text-green-500 text-base">▲</span>;
  if (level === "down")
    return <span className="text-red-500   text-base">▼</span>;
  return <span className="text-gray-400 font-bold text-base">—</span>;
};

// Dense ranking: if 3 teams get rank 1, next team gets rank 2
const assignDenseRanks = (teams, scoreKey) => {
  const uniqueScores = [...new Set(teams.map((t) => t[scoreKey]))].sort(
    (a, b) => b - a,
  );
  return teams.map((team) => ({
    ...team,
    rank: uniqueScores.indexOf(team[scoreKey]) + 1,
  }));
};

export default function ScoreboardMode3() {
  const [session, setSession] = useState("Entercon Session");
  const [editingHeader, setEditingHeader] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [currentMode, setCurrentMode] = useState(2);
  const [tableData, setTableData] = useState([]);
  const [activePage, setActivePage] = useState("Search Scoreboard");
  const [DAYS, setDAYS] = useState([]);

  // ── Your original backend state ──
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;
  const users = location.state?.users;
  const [schools, setSchools] = useState(location.state?.school);
  const darkModeStatus = location.state?.darkMode;
  const schoolName = location.state?.schoolName;
  const programName = location.state?.programName;
  const role = location.state?.role || "Admin"; // Default to Admin for backward compatibility

  // Conditionally set navItems based on role
  const filteredNavItems = role === "Admin" 
    ? ["Dashboard", "Add Schools", "Search Scoreboard", "Add Users"]
    : ["Dashboard", "Search Scoreboard"];
  const filteredUrl = role === "Admin"
    ? ["/dashboard", "/add-school", "/search-scoreboard", "/add-users"]
    : ["/dashboard", "/search-scoreboard"];
  // ─────────────────────────────────

  axios
    .get("https://entercon-backend-1e81.onrender.com/get-data")
    .then((response) => setSchools(response.data))
    .catch((e) => console.log(e));

  useEffect(() => {
    setDarkMode(darkModeStatus);
    setCurrentMode(2);

    // Find matching school
    const matchingSchool = schools.find(
      (s) => s.schoolName === schoolName && s.programName === programName,
    );
    if (!matchingSchool || !matchingSchool.teamNames) return;

    const eventLog = matchingSchool.eventLog || [];
    const teamNames = matchingSchool.teamNames || [];

    // Create days array first
    const days = [];
    for (let i = 1; i <= matchingSchool.numberOfDays; i++) {
      days.push(`Day ${i}`);
    }
    setDAYS(days);

    // ── Build per-day scores for each team ──
    // dayScores[dayIndex][teamName] = total points earned on that day
    // Use local 'days' variable instead of DAYS state (which updates asynchronously)
    const dayScores = days.map((_, dayIndex) => {
      const dayLog = eventLog[dayIndex] || [];
      const scoreMap = {};
      teamNames.forEach((t) => {
        scoreMap[t.name] = 0;
      });
      dayLog.forEach((log) => {
        const key = log.team.trim().toLowerCase();
        const match = teamNames.find(
          (t) => t.name.trim().toLowerCase() === key,
        );
        if (match)
          scoreMap[match.name] = (scoreMap[match.name] || 0) + log.points;
      });
      return scoreMap;
    });

    // ── Build per-day ranked arrays ──
    // ranksPerDay[dayIndex] = { teamName: rank }
    const ranksPerDay = days.map((_, dayIndex) => {
      const scoreMap = dayScores[dayIndex];
      const teamsWithScore = teamNames.map((t) => ({
        name: t.name,
        score: scoreMap[t.name] || 0,
      }));
      const ranked = assignDenseRanks(teamsWithScore, "score");
      const rankMap = {};
      ranked.forEach((t) => {
        rankMap[t.name] = t.rank;
      });
      return rankMap;
    });

    // ── Build final table data ──
    const built = teamNames.map((t) => {
      const teamName = t.name;

      // Score per day (that day only)
      const scores = {};
      days.forEach((_, di) => {
        scores[di + 1] = dayScores[di][teamName] || 0;
      });

      // Total all days
      const total = Object.values(scores).reduce((s, v) => s + v, 0);

      // HW Score = 0 (no HW in backend)
      const hwScore = 0;

      // Current rank (based on currentDay)
      const currentRank = ranksPerDay[currentDay][teamName] || 1;

      // Level: compare current day rank vs previous day rank
      let level = "same";
      if (currentDay > 0) {
        const prevRank = ranksPerDay[currentDay - 1][teamName] || 1;
        if (currentRank < prevRank)
          level = "up"; // lower number = better rank
        else if (currentRank > prevRank) level = "down";
        else level = "same";
      }

      return {
        id: teamName,
        name: teamName,
        scores,
        hwScore,
        total,
        rank: currentRank,
        level,
      };
    });

    // Sort by total descending
    // Sort by total descending
    const sorted = [...built].sort((a, b) => b.total - a.total);

    // Apply dense ranking based on TOTAL
    const rankedSorted = assignDenseRanks(sorted, "total");

    setTableData(rankedSorted);
  }, [darkModeStatus, schools, schoolName, programName, currentDay]);

  // Dark mode classes
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
      : "bg-white border-gray-400 text-gray-700",
    dayBtn: darkMode
      ? "bg-gray-800 border-gray-600"
      : "bg-white border-gray-300",
    tableWrap: darkMode
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-gray-300",
    thead: darkMode
      ? "bg-gray-700 border-gray-600"
      : "bg-gray-100 border-gray-300",
    theadText: darkMode
      ? "text-gray-300 border-gray-600"
      : "text-gray-600 border-gray-200",
    trowEven: darkMode ? "bg-gray-900" : "bg-white",
    trowOdd: darkMode ? "bg-gray-800" : "bg-gray-50",
    trowHover: darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50",
    tcell: darkMode
      ? "border-gray-700 text-gray-200"
      : "border-gray-200 text-gray-700",
    tcellBold: darkMode
      ? "border-gray-700 text-gray-100"
      : "border-gray-200 text-gray-800",
    tfoot: darkMode
      ? "bg-gray-700 border-gray-600"
      : "bg-gray-100 border-gray-300",
    tfootText: darkMode ? "text-gray-300" : "text-gray-600",
    tfootVal: darkMode ? "text-gray-200" : "text-gray-700",
    grandTotal: darkMode
      ? "bg-blue-900 text-blue-300"
      : "bg-blue-50 text-blue-700",
    teamName: darkMode ? "text-gray-200" : "text-gray-800",
    logoCircle: darkMode
      ? "bg-gray-700 border-gray-600"
      : "bg-gray-200 border-gray-300",
  };

  const TotalCell = ({ value }) => {
    return (
      <td
        className={`px-2 md:px-3 py-2 text-center font-bold text-xs md:text-sm border ${dm.tcell}`}
      >
        {value}
      </td>
    );
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
      className={`min-h-screen w-full overflow-x-hidden border-2 border-dashed rounded-lg font-mono transition-colors duration-300 ${dm.page}`}
    >
      {/* ── Top Bar ── */}
      <div
        className={`w-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b gap-2 ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
      >
        <BackButton />
        <button
          onClick={() => setSidebarOpen(true)}
          className={`md:hidden p-2 rounded-lg transition-colors ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
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
          className={`text-sm sm:text-base md:text-lg font-bold text-center flex-1 min-w-0`}
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
                    navigate("/scoreboard-mode1", {
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

          {/* Main Table */}
          {tableData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-center">
              <div>
                <p className="text-4xl mb-3">📋</p>
                <p className={`text-sm font-bold ${dm.subtext}`}>
                  No team data found for this school.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`flex-1 w-full overflow-x-auto rounded-xl border shadow-sm ${dm.tableWrap}`}
            >
              <table
                className="w-full border-collapse text-xs"
                style={{ minWidth: "700px" }}
              >
                <thead>
                  <tr className={`border-b-2 ${dm.thead}`}>
                    <th
                      className={`border px-2 py-2 text-left font-bold w-10 ${dm.theadText}`}
                    >
                      Rank
                    </th>
                    <th
                      className={`border px-2 py-2 text-left font-bold w-8  ${dm.theadText}`}
                    >
                      Lev
                    </th>
                    <th
                      className={`border px-3 py-2 text-left font-bold w-32 ${dm.theadText}`}
                    >
                      Team Name
                    </th>
                    {DAYS.map((d) => (
                      <th
                        key={d}
                        className={`border px-2 md:px-3 py-2 text-center font-bold ${dm.theadText}`}
                      >
                        {d}
                      </th>
                    ))}
                    <th
                      className={`border px-2 md:px-3 py-2 text-center font-bold ${dm.theadText}`}
                    >
                      HW Score
                    </th>
                    <th
                      className={`border px-2 md:px-3 py-2 text-center font-bold ${dm.theadText}`}
                    >
                      Total All Days
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((team, idx) => (
                    <tr
                      key={team.id}
                      className={`border-b transition-colors ${dm.trowHover} ${idx % 2 === 0 ? dm.trowEven : dm.trowOdd}`}
                    >
                      {/* Rank */}
                      <td
                        className={`border px-2 py-2 text-center font-bold ${dm.tcellBold}`}
                      >
                        {team.rank}
                      </td>

                      {/* Level */}
                      <td
                        className={`border px-2 py-2 text-center ${dm.tcell}`}
                      >
                        <LevelIcon level={team.level} />
                      </td>

                      {/* Logo + Team Name */}
                      <td
                        className={`border px-2 py-2 cursor-pointer ${dm.tcell}`}
                        onClick={() =>
                          navigate("/add-points", {
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
                      >
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <div
                            className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${dm.logoCircle}`}
                          >
                            <span className="text-xs">🏫</span>
                          </div>
                          <span
                            className={`font-medium text-xs leading-tight ${dm.teamName}`}
                          >
                            {team.name}
                          </span>
                        </div>
                      </td>

                      {/* Day Scores — read only, from eventLog */}
                      {DAYS.map((_, di) => (
                        <td
                          key={di}
                          className={`border px-1 md:px-2 py-2 text-center text-xs ${dm.tcell}`}
                        >
                          <span className="font-medium">
                            {team.scores[di + 1]}
                          </span>
                        </td>
                      ))}

                      {/* HW Score — always 0 */}
                      <td
                        className={`border px-1 md:px-2 py-2 text-center text-xs ${dm.tcell}`}
                      >
                        <span className="font-medium">{team.hwScore}</span>
                      </td>

                      {/* Total */}
                      <TotalCell value={team.total} rank={team.rank} />
                    </tr>
                  ))}
                </tbody>

                {/* Footer Totals */}
                <tfoot>
                  <tr className={`border-t-2 ${dm.tfoot}`}>
                    <td
                      colSpan={3}
                      className={`border px-3 py-2 font-bold text-xs uppercase tracking-wide ${dm.tfootText}`}
                    >
                      Column Total
                    </td>
                    {DAYS.map((_, di) => (
                      <td
                        key={di}
                        className={`border px-2 md:px-3 py-2 text-center font-bold ${dm.tfootVal}`}
                      >
                        {tableData.reduce(
                          (s, t) => s + (t.scores[di + 1] || 0),
                          0,
                        )}
                      </td>
                    ))}
                    <td
                      className={`border px-2 md:px-3 py-2 text-center font-bold ${dm.tfootVal}`}
                    >
                      0
                    </td>
                    <td
                      className={`border px-2 md:px-3 py-2 text-center font-bold ${dm.grandTotal}`}
                    >
                      {tableData.reduce((s, t) => s + t.total, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
