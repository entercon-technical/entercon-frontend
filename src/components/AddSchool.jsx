import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "./BackButton";

const DEFAULT_TEAMS = [
  "Humble Hyenas",
  "Brave Bisons",
  "Resilient Rhinos",
  "Truthful Tigers",
  "Disciplined Dragons",
  "Kind Kangaroos",
  "Compassionate Cobras",
  "Grateful Gorillas",
  "Positive Peacocks",
  "Loyal Lions",
  "Fierce Falcons",
  "Sharp Sharks",
];

export default function AddSchools() {
  const [activePage, setActivePage] = useState("Add Schools");
  const [schoolName, setSchoolName] = useState("");
  const [programName, setProgramName] = useState("");
  const [dayCount, setDayCount] = useState("");
  const [participants, setParticipants] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [customTeam, setCustomTeam] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [i, setI] = useState(null);

  // ── Your original backend state ──
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state.username;
  const users = location.state.users;
  const role = location.state?.role || "Admin"; // Default to Admin for backward compatibility
  const navItems = [
    "Dashboard",
    "Add Schools",
    "Search Scoreboard",
    "Add Users",
  ];
  const url = ["/dashboard", "/add-school", "/search-scoreboard", "/add-users"];
  const [schools, setSchools] = useState([]);
  const darkModeStatus =
    location.state?.darkMode ?? localStorage.getItem("darkMode") === "true";
  const [entry, setEntry] = useState({});

  useEffect(() => {
    setDarkMode(darkModeStatus);
    setSchools(location.state.school || []);
  }, [darkModeStatus, location.state.school]);
  // ─────────────────────────────────

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
      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-700 focus:ring-blue-300",
    thead: darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-500",
    trow: darkMode
      ? "border-gray-700 hover:bg-gray-700"
      : "border-gray-100 hover:bg-blue-50",
    tcell: darkMode ? "text-gray-200" : "text-gray-800",
    tabActive: "bg-blue-500 text-white shadow",
    tabInactive: darkMode
      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    teamCell: darkMode
      ? "border-gray-600 hover:bg-gray-700 text-gray-300"
      : "hover:bg-gray-50 text-gray-700",
    teamSelected: darkMode
      ? "bg-blue-900 text-blue-300 font-bold border-gray-600"
      : "bg-blue-50 text-blue-600 font-bold",
    selectedCell: darkMode
      ? "border-gray-600 bg-blue-900 text-blue-300 font-bold"
      : "border-gray-200 bg-blue-50 text-blue-600 font-bold",
    emptyCell: darkMode
      ? "border-gray-600 bg-gray-800"
      : "border-gray-200 bg-gray-50",
    customBg: darkMode
      ? "bg-red-950 border-red-800"
      : "bg-red-50 border-red-100",
  };

  const inputClass = `border rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-mono w-full focus:outline-none focus:ring-2 transition ${dm.input}`;
  const labelClass = `text-xs sm:text-sm font-semibold uppercase tracking-wide mb-1 sm:mb-2 block ${dm.subtext}`;

  // ── Your original handlers (untouched) ──
  const resetForm = () => {
    setSchoolName("");
    setProgramName("");
    setDayCount("");
    setParticipants("");
    setStartDate("");
    setEndDate("");
    setEditingIndex(null);
  };

  const handleAddSchool = () => {
    if (
      !schoolName ||
      !programName ||
      !dayCount ||
      !participants ||
      !startDate ||
      !endDate
    ) {
      alert("Please fill in all school fields.");
      return;
    }
    setEntry({
      ...entry,
      schoolName,
      programName,
      numberOfDays: dayCount,
      participants,
      startDate,
      endDate,
      teamNames: selectedTeams,
    });
    if (editingIndex !== null) {
      //console.log(participants);
    } else {
      // axios.get(`https://entercon-backend-1e81.onrender.com/add-school?...`).then(...).catch(...)
    }
  };

  const handleEditSchool = (index) => {
    const s = schools[index];
    setSchoolName(s.schoolName);
    setProgramName(s.programName);
    setDayCount(s.numberOfDays);
    setParticipants(s.participants);
    setStartDate(s.startDate);
    setEndDate(s.endDate);
    setEditingIndex(index);
    setActiveStep(1);
    setI(index);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // ── FIX: teamNames is [{name, points}] so extract just the name strings ──
    const teamNameStrings = (s.teamNames || []).map((t) => t.name);
    setSelectedTeams(teamNameStrings);
  };

  const handleDeleteSchool = (index) => {
    axios
      .get(`https://entercon-backend-1e81.onrender.com/delete-school?i=${index}`)
      .then((d) => {
        navigate("/add-school", {
          state: { username, users, school: d.data, darkMode, role },
        });
        window.location.reload();
      })
      .catch((e) => console.log(e));
  };

  // selectedTeams is plain strings — no change needed
  const toggleTeam = (team) => {
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter((t) => t !== team));
    } else {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const handleAddCustomTeam = () => {
    const trimmed = customTeam.trim();
    if (!trimmed) return;
    if (teams.includes(trimmed)) {
      alert("Team already exists!");
      return;
    }
    setTeams([...teams, trimmed]);
    setSelectedTeams([...selectedTeams, trimmed]);
    setCustomTeam("");
    setShowCustomInput(false);
  };

  const handleRemoveSelected = (team) =>
    setSelectedTeams(selectedTeams.filter((t) => t !== team));

  // teams is plain strings — grid works as before
  const teamGrid = [];
  const cols = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  for (let i = 0; i < teams.length; i += cols)
    teamGrid.push(teams.slice(i, i + cols));

  // selectedTeams is plain strings — grid works as before
  const selectedGrid = [];
  for (let i = 0; i < selectedTeams.length; i += cols)
    selectedGrid.push(selectedTeams.slice(i, i + cols));

  const handleFinalSave = () => {
    if (selectedTeams.length === 0) {
      alert("Please select at least one team.");
      return;
    }
    if (editingIndex !== null) {
      localStorage.setItem("darkMode", darkMode);
      axios
        .get(
          `https://entercon-backend-1e81.onrender.com/update-school?i=${i}&schoolName=${schoolName}&programName=${programName}&numberOfDays=${dayCount}&participants=${participants}&startDate=${startDate}&endDate=${endDate}&selectedTeams=${selectedTeams}&darkMode=${darkMode}`,
        )
        .then((d) => {
          navigate("/add-school", {
            state: { username, users, school: d.data, darkMode, role },
          });
          window.location.reload();
        })
        .catch((e) => console.log(e));
    } else {
      localStorage.setItem("darkMode", darkMode);
      axios
        .get(
          `https://entercon-backend-1e81.onrender.com/add-school?schoolName=${schoolName}&programName=${programName}&numberOfDays=${dayCount}&participants=${participants}&startDate=${startDate}&endDate=${endDate}&selectedTeams=${selectedTeams}&eventlog=${[]}&darkMode=${darkMode}`,
        )
        .then((d) => {
          navigate("/add-school", {
            state: { username, users, school: d.data, darkMode, role },
          });
          window.location.reload();
        })
        .catch((e) => console.log(e));
      alert(
        `✅ Saved!\nSchools: ${schools.length}\nTeams: ${selectedTeams.join(", ")}`,
      );
      resetForm();
      setActiveStep(1);
    }
  };
  // ────────────────────────────────────────

  return (
    <div
      className={`min-h-screen border-2 border-dashed rounded-xl font-mono transition-colors duration-300 ${dm.page}`}
    >
      {/* ── Top Bar ── */}
      <div
        className={`flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b gap-2 ${dm.title}`}
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
          className={`text-sm sm:text-base md:text-lg font-bold text-center flex-1 ${dm.title}`}
        >
          Welcome to Entercon Score Page!
        </h1>
        <button
          onClick={() => {
            const newMode = !darkMode;
            setDarkMode(newMode);
            localStorage.setItem("darkMode", newMode);
          }}
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

        <div
          className={`
          fixed md:static z-50 top-0 left-0 h-full
          w-64 md:w-56 shrink-0 flex flex-col gap-6 px-6 py-8
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
          {navItems.map((item, index) => (
            <button
              key={item}
              onClick={() => {
                setActivePage(item);
                setSidebarOpen(false);
                navigate(url[index], {
                  state: { username, users, school: schools, darkMode, role },
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

        <div
          className={`flex-1 px-4 md:px-10 py-6 md:py-8 flex flex-col gap-5 md:gap-6 ${dm.main}`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className={`text-base md:text-lg font-bold ${dm.text}`}>
                Add Schools & Teams
              </h2>
              <p className={`text-xs mt-0.5 ${dm.subtext}`}>
                Register school details and assign teams in one place
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {schools.length} Schools
              </span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                {selectedTeams.length} Teams Selected
              </span>
            </div>
          </div>

          <div
            className={`flex gap-2 border rounded-xl p-1.5 shadow-sm w-fit ${dm.card}`}
          >
            {[
              { step: 1, label: "🏫 School Details" },
              { step: 2, label: "🏷️ Team Selection" },
            ].map(({ step, label }) => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={`px-4 md:px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeStep === step ? dm.tabActive : dm.tabInactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── STEP 1 ── */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-5">
              <div
                className={`border rounded-xl p-4 md:p-6 shadow-sm ${dm.card}`}
              >
                <h3
                  className={`text-sm font-bold mb-5 pb-3 border-b ${dm.text} ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                >
                  {editingIndex !== null
                    ? "✏️ Edit School Details"
                    : "🏫 New School Entry"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className={labelClass}>School Name</label>
                    <input
                      type="text"
                      placeholder="Enter School Name"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Program Name</label>
                    <input
                      type="text"
                      placeholder="Enter Program Name"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Number of Days</label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      value={dayCount}
                      onChange={(e) => setDayCount(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Participants</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end flex-wrap sm:flex-nowrap">
                  {editingIndex !== null && (
                    <button
                      onClick={resetForm}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg border active:scale-95 transition-all ${
                        darkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleAddSchool();
                      setActiveStep(2);
                    }}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg text-white active:scale-95 transition-all flex-grow sm:flex-grow-0 ${
                      editingIndex !== null
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {editingIndex !== null
                      ? "Save Changes"
                      : "Save & Add Teams →"}
                  </button>
                </div>
              </div>

              {schools.length > 0 && (
                <div
                  className={`border rounded-xl overflow-hidden shadow-sm ${dm.card}`}
                >
                  <div
                    className={`px-4 sm:px-5 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                  >
                    <h3 className={`text-sm sm:text-base font-bold ${dm.text}`}>
                      Registered Schools
                    </h3>
                  </div>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm min-w-[560px]">
                      <thead className={`uppercase tracking-wide ${dm.thead}`}>
                        <tr>
                          <th className="px-4 sm:px-5 py-2.5 text-left font-semibold">
                            School
                          </th>
                          <th className="px-4 sm:px-5 py-2.5 text-left font-semibold">
                            Program
                          </th>
                          <th className="px-4 sm:px-5 py-2.5 text-left font-semibold">
                            Days
                          </th>
                          <th className="px-4 sm:px-5 py-2.5 text-left font-semibold">
                            Participants
                          </th>
                          <th className="px-4 sm:px-5 py-2.5 text-left font-semibold">
                            Duration
                          </th>
                          <th className="px-4 sm:px-5 py-2.5 text-left font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {schools.map((s, i) => (
                          <tr
                            key={i}
                            className={`border-t transition-colors ${dm.trow}`}
                          >
                            <td
                              className={`px-4 sm:px-5 py-2.5 font-medium ${dm.tcell}`}
                            >
                              {s.schoolName}
                            </td>
                            <td className={`px-4 sm:px-5 py-2.5 ${dm.subtext}`}>
                              {s.programName}
                            </td>
                            <td className={`px-4 sm:px-5 py-2.5 ${dm.subtext}`}>
                              {s.numberOfDays}
                            </td>
                            <td className="px-4 sm:px-5 py-2.5">
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-xs">
                                {s.participants}
                              </span>
                            </td>
                            <td className={`px-4 sm:px-5 py-2.5 ${dm.subtext}`}>
                              {s.startDate} → {s.endDate}
                            </td>
                            <td className="px-4 sm:px-5 py-2.5">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditSchool(i)}
                                  className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-yellow-200 active:scale-95 transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteSchool(i)}
                                  className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold text-xs hover:bg-red-200 active:scale-95 transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 p-3 sm:p-4">
                    {schools.map((s, i) => (
                      <div key={i} className={`border rounded-lg p-4 ${darkMode ? "border-gray-700 bg-gray-700 bg-opacity-50" : "border-gray-200 bg-gray-50"}`}>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className={`text-xs font-semibold ${dm.subtext}`}>School</p>
                            <p className={`text-sm font-bold ${dm.text}`}>{s.schoolName}</p>
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${dm.subtext}`}>Program</p>
                            <p className={`text-sm font-bold ${dm.text}`}>{s.programName}</p>
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${dm.subtext}`}>Days</p>
                            <p className={`text-sm font-bold ${dm.text}`}>{s.numberOfDays}</p>
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${dm.subtext}`}>Participants</p>
                            <p className={`text-sm font-bold ${dm.text}`}>{s.participants}</p>
                          </div>
                        </div>
                        <div className="mb-3 pb-3 border-t" style={{borderColor: darkMode ? "#4B5563" : "#e5e7eb"}}>
                          <p className={`text-xs font-semibold ${dm.subtext} mt-3 mb-1`}>Duration</p>
                          <p className={`text-sm ${dm.text}`}>{s.startDate} → {s.endDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSchool(i)}
                            className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg font-bold text-xs hover:bg-yellow-200 active:scale-95 transition-all"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSchool(i)}
                            className="flex-1 bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold text-xs hover:bg-red-200 active:scale-95 transition-all"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2 ── */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-5">
              {/* Team Names Card */}
              <div
                className={`border rounded-xl shadow-sm overflow-hidden ${dm.card}`}
              >
                <div
                  className={`flex items-center justify-between px-5 py-3 border-b flex-wrap gap-2 ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                >
                  <h3 className={`text-sm font-bold ${dm.text}`}>
                    🏷️ Team Names
                  </h3>
                  <button
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                  >
                    + Custom Team
                  </button>
                </div>

                {showCustomInput && (
                  <div
                    className={`flex items-center gap-3 px-5 py-3 border-b flex-wrap ${dm.customBg}`}
                  >
                    <input
                      type="text"
                      placeholder="Enter custom team name..."
                      value={customTeam}
                      onChange={(e) => setCustomTeam(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddCustomTeam()
                      }
                      className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 min-w-0 ${
                        darkMode
                          ? "bg-gray-700 border-red-700 text-gray-100"
                          : "bg-white border-red-200 text-gray-700"
                      }`}
                      autoFocus
                    />
                    <button
                      onClick={handleAddCustomTeam}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-all shrink-0"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className={`text-xs font-bold px-2 py-1.5 rounded-lg transition-all shrink-0 ${dm.subtext}`}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Team Grid — teams is plain strings ✓ */}
                <div className="p-2 sm:p-3 md:p-4 overflow-x-auto">
                  <table
                    className="w-full border rounded-lg overflow-hidden text-xs sm:text-sm min-w-full"
                    style={{ borderColor: darkMode ? "#374151" : "#e5e7eb" }}
                  >
                    <tbody>
                      {teamGrid.map((row, ri) => (
                        <tr
                          key={ri}
                          className={`border-t first:border-0 ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                        >
                          {row.map((team, ci) => {
                            const idx = ri * cols + ci;
                            // team is a plain string ✓
                            const isSelected = selectedTeams.includes(team);
                            return (
                              <td
                                key={ci}
                                onClick={() => toggleTeam(team)}
                                className={`border px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-center cursor-pointer transition-all duration-150 select-none ${
                                  isSelected ? dm.teamSelected : dm.teamCell
                                } ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                              >
                                <span className={`text-xs mr-0.5 sm:mr-1 ${dm.subtext}`}>
                                  {idx + 1}.
                                </span>
                                <span className="text-xs sm:text-sm">{team}</span>
                                {isSelected && (
                                  <span className="ml-0.5 sm:ml-1 text-blue-400 text-xs">
                                    ✓
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {row.length < cols &&
                            Array(cols - row.length)
                              .fill(null)
                              .map((_, i) => (
                                <td
                                  key={`empty-${i}`}
                                  className={`border px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
                                />
                              ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className={`text-xs mt-2 text-center ${dm.subtext}`}>
                    Click a team to select / deselect it
                  </p>
                </div>
              </div>

              {/* Added Teams Card — selectedTeams is plain strings ✓ */}
              <div
                className={`border rounded-xl shadow-sm overflow-hidden ${dm.card}`}
              >
                <div
                  className={`flex items-center justify-between px-5 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                >
                  <h3 className={`text-sm font-bold ${dm.text}`}>
                    ✅ Added Teams
                    <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {selectedTeams.length}
                    </span>
                  </h3>
                  {selectedTeams.length > 0 && (
                    <button
                      onClick={() => setSelectedTeams([])}
                      className="text-xs text-red-400 hover:text-red-500 font-bold transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedTeams.length === 0 ? (
                  <div
                    className={`px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm ${dm.subtext}`}
                  >
                    No teams selected yet. Click teams above to add them.
                  </div>
                ) : (
                  <div className="p-2 sm:p-3 md:p-4 overflow-x-auto">
                    <table
                      className="w-full border rounded-lg overflow-hidden text-xs sm:text-sm min-w-full"
                      style={{ borderColor: darkMode ? "#374151" : "#e5e7eb" }}
                    >
                      <tbody>
                        {selectedGrid.map((row, ri) => (
                          <tr
                            key={ri}
                            className={`border-t first:border-0 ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                          >
                            {row.map((team, ci) => {
                              const idx = ri * cols + ci;
                              // team is a plain string ✓ — no .name needed
                              return (
                                <td
                                  key={ci}
                                  className={`border px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-center ${dm.selectedCell}`}
                                >
                                  <span className="text-xs text-blue-300 mr-0.5 sm:mr-1">
                                    {idx + 1}.
                                  </span>
                                  <span className="text-xs sm:text-sm">{team}</span>
                                  <button
                                    onClick={() => handleRemoveSelected(team)}
                                    className="ml-1 text-red-300 hover:text-red-500 text-xs transition-colors"
                                  >
                                    ✕
                                  </button>
                                </td>
                              );
                            })}
                            {row.length < cols &&
                              Array(cols - row.length)
                                .fill(null)
                                .map((_, i) => (
                                  <td
                                    key={`empty-${i}`}
                                    className={`border px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 ${dm.emptyCell}`}
                                  />
                                ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-between flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveStep(1)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg border active:scale-95 transition-all flex-1 sm:flex-none ${
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  ← Back to School Details
                </button>
                <div className="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedTeams([])}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg border active:scale-95 transition-all flex-1 sm:flex-none ${
                      darkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Reset Teams
                  </button>
                  <button
                    onClick={handleFinalSave}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-all flex-1 sm:flex-none"
                  >
                    ✓ Save All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
