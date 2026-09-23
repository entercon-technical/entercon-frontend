import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import axios from "axios";
import BackButton from "./BackButton";

const PRESETS_URL =
  "https://entercon-backend-1e81.onrender.com/get-data-presets";
const ADD_PRESET_URL =
  "https://entercon-backend-1e81.onrender.com/add-preset";
const UPDATE_PRESET_URL =
  "https://entercon-backend-1e81.onrender.com/update-preset";
const DELETE_PRESET_URL =
  "https://entercon-backend-1e81.onrender.com/delete-preset";
const PRESET_COLOR = "bg-gray-600 hover:bg-gray-700 text-white";

export default function AddPoints() {
  const [activePage, setActivePage] = useState("Search Scoreboard");
  const [selectedTeam, setSelectedTeam] = useState();
  const [activity, setActivity] = useState("");
  const [points, setPoints] = useState("");
  const [currentDay, setCurrentDay] = useState(0);
  const [presets, setPresets] = useState([]);
  const [showEditPresets, setShowEditPresets] = useState(false);
  const [editPreset, setEditPreset] = useState(null);
  const [newPreset, setNewPreset] = useState({ label: "", points: "" });
  const [refreshingPresets, setRefreshingPresets] = useState(false);
  const [flash, setFlash] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [TEAMS, setTEAMS] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [schoolIndex, setSchoolIndex] = useState();
  const [DAYS, setDAYS] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};
  const username = locationState.username || "";
  const users = locationState.users || [];
  const schoolName = locationState.schoolName || "";
  const programName = locationState.programName || "";
  var school = useMemo(() => {
    return locationState.school;
  }, [locationState.school]);
  const darkModeStatus = locationState.darkMode;
  const role = locationState?.role || "Admin"; // Default to Admin for backward compatibility

  const getDataPresets = () => {
    setRefreshingPresets(true);
    axios
      .get(PRESETS_URL)
      .then((res) => {
        const fetchedPresets = Array.isArray(res.data)
          ? res.data.flatMap((preset, index) => {
              if (preset && typeof preset === "object") {
                const [label, points] = Object.entries(preset)[0] || [];

                if (label !== undefined && !isNaN(Number(points))) {
                  return [
                    {
                      id: index + 1,
                      label,
                      points: Number(points),
                      color: PRESET_COLOR,
                    },
                  ];
                }
              }

              return [];
            })
          : [];

        setPresets(fetchedPresets);
      })
      .catch((error) => console.log(error))
      .finally(() => setRefreshingPresets(false));
  };

  useEffect(() => {
    getDataPresets();
  }, []);

  // Conditionally set navItems based on role
  const filteredNavItems = role === "Admin" 
    ? ["Dashboard", "Add Schools", "Search Scoreboard", "Add Users"]
    : ["Dashboard", "Search Scoreboard"];
  const filteredUrl = role === "Admin"
    ? ["/dashboard", "/add-school", "/search-scoreboard", "/add-users"]
    : ["/dashboard", "/search-scoreboard"];

  useEffect(() => {
    setDarkMode(darkModeStatus);

    const matchingSchool = school.find(
      (item, ind) =>
        item.schoolName === schoolName && item.programName === programName,
    );

    var days = [];

    for (var i = 1; i <= matchingSchool.numberOfDays; i++) {
      days.push("Day " + i);
    }

    setDAYS(days);

    setSchoolIndex(
      school.findIndex(
        (item) =>
          item.schoolName === schoolName && item.programName === programName,
      ),
    );
    setEventLog(matchingSchool.eventLog);
    setTEAMS(matchingSchool.teamNames.map((s) => s.name));
  }, [darkModeStatus, programName, schoolName, school]);

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
      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-green-500"
      : "bg-white border-green-300 text-gray-700 focus:ring-green-300",
    select: darkMode
      ? "bg-gray-700 border-gray-600 text-green-300"
      : "bg-green-50 border-green-300 text-green-700",
    row: darkMode
      ? "hover:bg-gray-700 border-gray-700"
      : "hover:bg-gray-50 border-gray-50",
    logRow: darkMode
      ? "border-gray-700 hover:bg-gray-700"
      : "border-gray-50 hover:bg-gray-50",
    presetBg: darkMode ? "bg-gray-700" : "bg-gray-50",
    dayBtn: darkMode
      ? "bg-gray-700 border-gray-600"
      : "bg-white border-green-300",
    thead: darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-500",
    teamRow: darkMode
      ? "bg-gray-700 border-gray-600"
      : "bg-green-50 border-green-300",
  };

  const inputClass = `border rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 transition w-full ${dm.input}`;

  const showFlash = (msg, color) => {
    setFlash({ msg, color });
    setTimeout(() => setFlash(null), 1800);
  };

  const handleAdd = () => {
    const finalPoints = parseInt(points);
    const finalActivity = activity;

    if (!finalActivity || isNaN(finalPoints)) {
      alert("Fill activity and points.");
      return;
    }

    const dayIndex = currentDay;
    const teamName = selectedTeam;
    const event = finalActivity;
    const eventPoints = finalPoints;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    window.localStorage.setItem("darkMode", darkMode);
    axios
      .get(
        `https://entercon-backend-1e81.onrender.com/add-points?dayIndex=${dayIndex}&teamName=${teamName}&event=${event}&points=${eventPoints}&time=${time}&schoolIndex=${schoolIndex}`,
      )
      .then((res) => {
        navigate("/add-points", {
          state: {
            username: username,
            users: users,
            school: res.data,
            darkMode: darkMode,
            schoolName: schoolName,
            programName: programName,
            role: role,
          },
        });
        school = res.data;
      })
      .catch((e) => console.log(e));

    setActivity("");
    setPoints("");

    showFlash(
      `+${finalPoints} pts added to ${selectedTeam}`,
      finalPoints >= 0 ? "bg-green-500" : "bg-red-500",
    );
  };

  const handlePresetClick = (preset) => {
    setActivity(preset.label);
    setPoints(preset.points);
  };

  const getPresetTextSize = (label) => {
    if (label.length >= 30) return "text-[10px] sm:text-xs";
    if (label.length >= 20) return "text-[11px] sm:text-xs";
    return "text-xs sm:text-sm";
  };

  const handleSavePreset = () => {
    const pts = parseInt(newPreset.points);
    if (!newPreset.label || isNaN(pts)) {
      alert("Fill preset fields.");
      return;
    }
    if (editPreset) {
      const presetIndex = presets.findIndex(
        (preset) => preset.id === editPreset.id,
      );
      const preset = { [newPreset.label]: pts };

      axios
        .get(
          `${UPDATE_PRESET_URL}?preset=${encodeURIComponent(JSON.stringify(preset))}&i=${presetIndex}`,
        )
        .then(() => {
          getDataPresets();
          setNewPreset({ label: "", points: "" });
          setEditPreset(null);
        })
        .catch((error) => console.log(error));
      return;
    }

      const preset = { [newPreset.label]: pts };
      axios
        .get(`${ADD_PRESET_URL}?preset=${encodeURIComponent(JSON.stringify(preset))}`)
        .then(() => {
          getDataPresets();
          setNewPreset({ label: "", points: "" });
        })
        .catch((error) => console.log(error));
  };

  const currentDayLogs = eventLog[currentDay] || [];

  const teamTotal = (team) => {
    let total = 0;

    for (let i = 0; i <= currentDay; i++) {
      const dayLogs = eventLog[i] || [];

      total += dayLogs
        .filter((log) => log.team === team)
        .reduce((sum, log) => sum + log.points, 0);
    }

    return total;
  };

  return (
    <div
      className={`min-h-screen border-2 border-dashed rounded-xl font-mono transition-colors duration-300 ${dm.page}`}
    >
      {/* Top Bar */}
      <div
        className={`flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b gap-2 ${dm.title}`}
      >
        <BackButton />
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-highlight"
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
          className={`text-sm sm:text-base md:text-xl font-bold text-center flex-1 min-w-0 ${dm.title}`}
        >
          Welcome to Entercon Score Page!
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 touch-highlight ${
            darkMode
              ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {darkMode ? "☀️" : "🌙"}
          <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-73px)] relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed md:static z-50 top-0 left-0 h-full
          w-64 md:w-56 shrink-0
          flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-8
          border-r transition-transform duration-300
          ${dm.sidebar}
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
        >
          <div className="flex items-center justify-between md:hidden mb-2">
            <span className={`text-xs sm:text-sm font-bold ${dm.text}`}>Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold text-lg touch-highlight"
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
                  state: { username, users, school, darkMode, role },
                });
              }}
              className={`text-left text-xs sm:text-sm font-mono transition-all duration-150 hover:text-blue-500 py-2 px-2 rounded-lg touch-highlight ${
                activePage === item ? "text-blue-500 font-bold bg-opacity-10 bg-blue-500" : dm.text
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 px-2 sm:px-3 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6 flex flex-col gap-3 sm:gap-4 md:gap-5 overflow-x-hidden ${dm.main}`}
        >
          {/* Flash */}
          {flash && (
            <div
              className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg ${flash.color}`}
            >
              {flash.msg}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-pink-500">
                Add Points
              </h2>
              <p className={`text-xs mt-0.5 ${dm.subtext}`}>
                Log scores and activities per team
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
              <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 sm:px-3 py-1 rounded-full shrink-0">
                {currentDayLogs.length} Events
              </span>
              <div
                className={`flex items-center gap-1 border rounded-lg px-2 sm:px-3 py-1.5 ${dm.dayBtn}`}
              >
                <button
                  onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
                  className={`font-bold transition-colors hover:text-blue-500 ${dm.subtext}`}
                >
                  ‹
                </button>
                <span className={`text-xs font-bold mx-1 ${dm.text}`}>
                  {DAYS[currentDay]}
                </span>
                <button
                  onClick={() =>
                    setCurrentDay(Math.min(DAYS.length - 1, currentDay + 1))
                  }
                  className={`font-bold transition-colors hover:text-blue-500 ${dm.subtext}`}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tab Switch */}
          <div
            className={`flex md:hidden gap-2 border rounded-lg p-1.5 ${dm.card}`}
          >
            {["form", "totals"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-highlight ${
                  activeTab === tab
                    ? "bg-pink-500 text-white"
                    : `${dm.text} hover:bg-opacity-50 hover:bg-gray-400`
                }`}
              >
                {tab === "form" ? "➕ Add" : "🏆 Totals"}
              </button>
            ))}
          </div>

          {/* Desktop: 2 col | Mobile: tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {/* LEFT: Form + Presets */}
            <div
              className={`flex flex-col gap-3 sm:gap-4 md:gap-5 ${activeTab === "totals" ? "hidden md:flex" : "flex"}`}
            >
              {/* Entry Card */}
              <div
                className={`border-2 border-green-300 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm ${dm.card}`}
              >
                <h3 className="text-xs sm:text-sm font-bold text-green-500 mb-3 sm:mb-4 pb-2 border-b border-green-200">
                  ➕ Add Points Entry
                </h3>

                {/* Team */}
                <div className="mb-3">
                  <label
                    className={`text-xs font-bold uppercase tracking-wide mb-1 block ${dm.subtext}`}
                  >
                    Team Name
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className={`border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono w-full focus:outline-none focus:ring-2 focus:ring-green-300 transition ${dm.select}`}
                  >
                    <option key="Select">Select</option>
                    {TEAMS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Activity */}
                <div className="mb-3">
                  <label
                    className={`text-xs font-bold uppercase tracking-wide mb-1 block ${dm.subtext}`}
                  >
                    Activity / Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Answering in mic"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Points + Day */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div>
                    <label
                      className={`text-xs font-bold uppercase tracking-wide mb-1 block ${dm.subtext}`}
                    >
                      Points (+/-)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. +5 or -5"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs font-bold uppercase tracking-wide mb-1 block ${dm.subtext}`}
                    >
                      Day
                    </label>
                    <div
                      className={`border rounded-lg px-2 sm:px-3 py-1.5 flex items-center justify-between ${dm.dayBtn}`}
                    >
                      <button
                        onClick={() =>
                          setCurrentDay(Math.max(0, currentDay - 1))
                        }
                        className={`font-bold text-sm transition-colors hover:text-green-500 touch-highlight ${dm.subtext}`}
                      >
                        ‹
                      </button>
                      <span className={`text-xs sm:text-sm font-bold ${dm.text}`}>
                        {DAYS[currentDay]}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentDay(
                            Math.min(DAYS.length - 1, currentDay + 1),
                          )
                        }
                        className={`font-bold text-sm transition-colors hover:text-green-500 touch-highlight ${dm.subtext}`}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-orange-400 hover:bg-orange-500 active:scale-95 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all min-w-[60px] touch-highlight"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setActivity(activity || "+5 Quick");
                      setPoints(5);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 active:scale-95 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all min-w-[60px] touch-highlight"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => {
                      setActivity(activity || "-5 Penalty");
                      setPoints(-5);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all min-w-[60px] touch-highlight"
                  >
                    -5
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm ${dm.card}`}>
                <div className="flex items-center justify-between mb-3 flex-col sm:flex-row gap-2">
                  <h3 className={`text-xs sm:text-sm font-bold ${dm.text}`}>
                    ⚡ Quick Presets
                  </h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={getDataPresets}
                      disabled={refreshingPresets}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 active:scale-95 text-white text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg transition-all flex-1 sm:flex-none touch-highlight"
                    >
                      {refreshingPresets ? "Refreshing..." : "Refresh"}
                    </button>
                    <button
                      onClick={() => setShowEditPresets(!showEditPresets)}
                      className="bg-pink-500 hover:bg-pink-600 active:scale-95 text-white text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg transition-all flex-1 sm:flex-none touch-highlight"
                    >
                      Edit Presets
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className={`${getPresetTextSize(preset.label)} font-bold px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg active:scale-95 transition-all text-left whitespace-normal break-words leading-tight touch-highlight ${preset.color}`}
                    >
                      {preset.label} ({preset.points > 0 ? "+" : ""}
                      {preset.points})
                    </button>
                  ))}
                </div>

                {/* Edit Presets Panel */}
                {showEditPresets && (
                  <div
                    className={`mt-3 sm:mt-4 border-t pt-3 sm:pt-4 ${darkMode ? "border-gray-600" : "border-gray-100"}`}
                  >
                    <h4
                      className={`text-xs font-bold uppercase tracking-wide mb-2 sm:mb-3 ${dm.subtext}`}
                    >
                      {editPreset ? "Edit Preset" : "Add New Preset"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div>
                        <label
                          className={`text-xs font-semibold mb-1 block ${dm.subtext}`}
                        >
                          Label
                        </label>
                        <input
                          type="text"
                          placeholder="Activity name"
                          value={newPreset.label}
                          onChange={(e) =>
                            setNewPreset({
                              ...newPreset,
                              label: e.target.value,
                            })
                          }
                          className={`border rounded-lg px-2 py-1.5 sm:py-2 text-xs w-full focus:outline-none focus:ring-2 focus:ring-pink-300 transition ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-gray-100"
                              : "bg-gray-50 border-gray-200 text-gray-700"
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          className={`text-xs font-semibold mb-1 block ${dm.subtext}`}
                        >
                          Points
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 10 or -5"
                          value={newPreset.points}
                          onChange={(e) =>
                            setNewPreset({
                              ...newPreset,
                              points: e.target.value,
                            })
                          }
                          className={`border rounded-lg px-2 py-1.5 sm:py-2 text-xs w-full focus:outline-none focus:ring-2 focus:ring-pink-300 transition ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-gray-100"
                              : "bg-gray-50 border-gray-200 text-gray-700"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 mb-3 flex-wrap">
                      <button
                        onClick={handleSavePreset}
                        className="bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-bold px-3 py-1.5 sm:py-2 rounded-lg active:scale-95 transition-all touch-highlight"
                      >
                        {editPreset ? "Save Edit" : "Add Preset"}
                      </button>
                      {editPreset && (
                        <button
                          onClick={() => {
                            setEditPreset(null);
                            setNewPreset({ label: "", points: "" });
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm font-bold px-3 py-1.5 sm:py-2 rounded-lg active:scale-95 transition-all touch-highlight"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {presets.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between rounded-lg px-3 py-1.5 gap-2 ${dm.presetBg}`}
                        >
                          <span className={`text-xs font-bold truncate ${dm.text}`}>
                            {p.label} ({p.points > 0 ? "+" : ""}
                            {p.points})
                          </span>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditPreset(p);
                                setNewPreset({
                                  label: p.label,
                                  points: String(p.points),
                                });
                              }}
                              className="text-xs text-yellow-500 hover:text-yellow-400 font-bold px-2 py-0.5 rounded transition-colors touch-highlight"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                const presetIndex = presets.findIndex(
                                  (preset) => preset.id === p.id,
                                );

                                axios
                                  .get(`${DELETE_PRESET_URL}?i=${presetIndex}`)
                                  .then(() => getDataPresets())
                                  .catch((error) => console.log(error));
                              }}
                              className="text-xs text-red-400 hover:text-red-500 font-bold px-2 py-0.5 rounded transition-colors touch-highlight"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Team Totals + Log */}
            <div
              className={`flex flex-col gap-3 sm:gap-4 md:gap-5 ${activeTab === "form" ? "hidden md:flex" : "flex"}`}
            >
              {/* Team Totals */}
              <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm ${dm.card}`}>
                <h3
                  className={`text-xs sm:text-sm font-bold mb-3 pb-2 border-b ${dm.text} ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                >
                  🏆 Team Totals — {DAYS[currentDay]}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {TEAMS.map((team) => {
                    const total = teamTotal(team);
                    const max = Math.max(...TEAMS.map((t) => teamTotal(t)), 1);
                    const pct = Math.round((total / max) * 100);
                    return (
                      <div
                        key={team}
                        onClick={() => setSelectedTeam(team)}
                        className={`flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-all touch-highlight ${
                          selectedTeam === team
                            ? dm.teamRow
                            : `hover:${darkMode ? "bg-gray-700" : "bg-gray-50"}`
                        }`}
                      >
                        <span
                          className={`text-xs sm:text-sm font-bold flex-1 truncate ${dm.text}`}
                        >
                          {team}
                        </span>
                        <div
                          className={`flex-shrink-0 w-12 sm:w-16 md:w-20 rounded-full h-2 ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}
                        >
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${total < 0 ? "bg-red-400" : "bg-green-400"}`}
                            style={{ width: `${Math.abs(pct)}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-bold w-8 text-right shrink-0 ${total < 0 ? "text-red-500" : dm.text}`}
                        >
                          {total > 0 ? "+" : ""}
                          {total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Log */}
              <div
                className={`border rounded-lg sm:rounded-xl shadow-sm overflow-hidden flex-1 ${dm.card}`}
              >
                <div
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b flex items-center justify-between ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                >
                  <h3 className={`text-xs sm:text-sm font-bold ${dm.text}`}>
                    📋 Recent Log
                  </h3>
                </div>
                {currentDayLogs.length === 0 ? (
                  <div
                    className={`px-3 sm:px-4 py-6 sm:py-8 text-center text-xs ${dm.subtext}`}
                  >
                    No points logged yet. Use the form or presets to add entries.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {currentDayLogs.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b transition-colors gap-2 ${dm.logRow}`}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate ${dm.text}`}
                          >
                            {entry.team}
                          </span>
                          <span className={`text-xs truncate ${dm.subtext}`}>
                            {entry.events} · {DAYS[currentDay]}
                          </span>
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-bold px-2 sm:px-2.5 py-0.5 rounded-full shrink-0 ${
                            entry.points >= 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {entry.points > 0 ? "+" : ""}
                          {entry.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
