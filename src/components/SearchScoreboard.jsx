import { Fragment, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "./BackButton";

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  ongoing: "bg-blue-100 text-blue-700",
  upcoming: "bg-yellow-100 text-yellow-700",
};

const DARK_STATUS_STYLES = {
  completed: "bg-green-900 text-green-200",
  ongoing: "bg-blue-900 text-blue-200",
  upcoming: "bg-yellow-900 text-yellow-200",
};

export default function SearchScoreboard() {
  const [activePage, setActivePage] = useState("Search Scoreboard");
  const [schoolInput, setSchoolInput] = useState("");
  const [programInput, setProgramInput] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const date = new Date().toISOString().split("T")[0];

  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state.username;
  const users = location.state.users;
  const school = location.state.school;
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
    setDarkMode(darkModeStatus);
    setEditingId(editingId)
  }, [darkModeStatus,editingId]);

  const MOCK_DATA = school;
  // console.log(MOCK_DATA);



  // Dark Mode Classes - EXACT COPY from AddUsers.jsx
  const dm = {
    page: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300",
    title: darkMode ? "border-gray-700 text-white" : "border-gray-200 text-gray-900",
    sidebar: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-400",
    main: darkMode ? "bg-gray-800" : "bg-gray-50",
    card: darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
    text: darkMode ? "text-gray-100" : "text-gray-700",
    subtext: darkMode ? "text-gray-400 " : "text-gray-500",
    input: darkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
      : "bg-white border-gray-300 text-gray-700 focus:ring-blue-300",
    tableHead: darkMode
      ? "bg-gray-700 text-gray-300"
      : "bg-gray-50 text-gray-500",
    row: darkMode
      ? "border-gray-700 hover:bg-gray-700"
      : "border-gray-100 hover:bg-blue-50",
    cell: darkMode
      ? "text-gray-200"
      : "text-gray-800",
  };

  const inputClass = `border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono w-full focus:outline-none focus:ring-2 transition ${dm.input}`;
  const labelClass = `text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2 block ${dm.subtext}`;

  // Backend Logic - UNCHANGED
  const handleSearch = () => {
    const filtered = MOCK_DATA.filter((d) => {
      const schoolMatch = schoolInput.trim() === "" || d.schoolName.toLowerCase().includes(schoolInput.toLowerCase());
      const programMatch = programInput.trim() === "" || d.programName.toLowerCase().includes(programInput.toLowerCase());
      return schoolMatch && programMatch;
    });
    setResults(filtered);
    setSearched(true);
    setSelectedRow(null);
    setEditingId(null);
  };


  return (
    <div className={`min-h-screen border-2 border-dashed rounded-xl font-mono transition-colors duration-300 ${dm.page}`}>

      {/* Top Bar - EXACT COPY from AddUsers */}
      <div className={`flex items-center justify-between px-3 sm:px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b ${dm.title}`}>
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

        <h1 className={`text-sm sm:text-sm sm:text-base md:text-lg font-bold text-center flex-1 ${dm.text}`}>
          Welcome to Entercon Score Page!
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${darkMode
            ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
            : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-73px)] relative">

        {/* Overlay - EXACT COPY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - EXACT COPY from AddUsers */}
        <div className={`
          fixed md:static z-50 top-0 left-0 h-full
          w-64 md:w-56 shrink-0
          flex flex-col gap-3 sm:gap-4 md:gap-2 sm:gap-3 md:gap-4 lg:gap-5 lg:gap-6 px-6 py-8
          border-r transition-transform duration-300
          ${dm.sidebar}
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}>
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
                navigate(filteredUrl[index], { state: { username: username, users: users, school: school, schoolName: location.state.schoolName, programName: location.state.programName, darkMode: darkMode, role: role } });
              }}
              className={`text-left text-sm font-mono transition-all duration-150 hover:text-blue-500 ${activePage === item
                ? "text-blue-500 font-bold"
                : dm.text
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Main Content - EXACT STYLING from AddUsers */}
        <div className={`flex-1 px-4 md:px-10 py-6 md:py-8 flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 md:gap-3 sm:gap-4 md:gap-2 sm:gap-3 md:gap-4 lg:gap-5 lg:gap-6 ${dm.main}`}>

          {/* Header - EXACT COPY structure */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className={`text-sm sm:text-base md:text-lg font-bold ${dm.text}`}>
                Search Scoreboard
              </h2>
              <p className={`text-xs mt-0.5 ${dm.subtext}`}>
                Find schools and programs by name
              </p>
            </div>
            {searched && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${results.length > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-500"
                }`}>
                {results.length > 0 ? `${results.length} Result${results.length > 1 ? "s" : ""} Found` : "No Results"}
              </span>
            )}
          </div>

          {/* Search Card - EXACT card styling */}
          <div className={`border rounded-xl p-4 md:p-6 shadow-sm ${dm.card}`}>
            <h3 className={`text-sm font-bold mb-5 pb-3 border-b ${dm.text} ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              🔍 Search Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-5">
              <div>
                <label className={labelClass}>School Name</label>
                <input
                  type="text"
                  placeholder="e.g. St. Mary's School"
                  value={schoolInput}
                  onChange={(e) => setSchoolInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Program Name</label>
                <input
                  type="text"
                  placeholder="e.g. Program Batch 1"
                  value={programInput}
                  onChange={(e) => setProgramInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end flex-wrap">
              <button
                onClick={() => { setSchoolInput(""); setProgramInput(""); setResults([]); setSearched(false); setSelectedRow(null); }}
                className={`px-5 py-2 text-sm font-bold rounded-lg border active:scale-95 transition-all ${darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                Clear
              </button>
              <button
                onClick={handleSearch}
                className="px-8 py-2 text-sm font-bold rounded-lg text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results Table - EXACT table styling from AddUsers */}
          {searched && (
            <div className={`border rounded-xl shadow-sm overflow-hidden ${dm.card}`}>
              <div className={`px-3 sm:px-4 md:px-6 py-3 border-b flex items-center justify-between flex-wrap gap-2 ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <h3 className={`text-sm font-bold ${dm.text}`}>📋 See Results</h3>
                <span className={`text-xs ${dm.subtext}`}>{results.length} record{results.length !== 1 ? "s" : ""}</span>
              </div>

              {results.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className={`text-sm font-bold ${dm.subtext}`}>No matching schools or programs found.</p>
                  <p className={`text-xs mt-1 ${dm.subtext}`}>Try adjusting your search filters.</p>
                </div>
              ) : (
                <>
                <div className="flex flex-col gap-3 p-3 md:hidden">
                  {results.map((row) => {
                    const status = date > row.endDate
                      ? "Completed"
                      : date >= row.startDate && date <= row.endDate
                        ? "Ongoing"
                        : "Upcoming";

                    return (
                      <article
                        key={`mobile-${row.schoolName}-${row.programName}`}
                        className={`rounded-lg border p-3 ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className={`break-words text-sm font-bold ${dm.cell}`}>
                              {row.schoolName}
                            </h4>
                            <p className={`mt-0.5 break-words text-xs ${dm.subtext}`}>
                              {row.programName}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${(darkMode ? DARK_STATUS_STYLES : STATUS_STYLES)[status.toLowerCase()]}`}>
                            {status}
                          </span>
                        </div>

                        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <dt className={dm.subtext}>Duration</dt>
                            <dd className={`font-bold ${dm.cell}`}>{row.numberOfDays} days</dd>
                          </div>
                          <div>
                            <dt className={dm.subtext}>Participants</dt>
                            <dd className={`font-bold ${dm.cell}`}>{row.participants}</dd>
                          </div>
                          <div>
                            <dt className={dm.subtext}>Starts</dt>
                            <dd className={`font-bold ${dm.cell}`}>{row.startDate}</dd>
                          </div>
                          <div>
                            <dt className={dm.subtext}>Ends</dt>
                            <dd className={`font-bold ${dm.cell}`}>{row.endDate}</dd>
                          </div>
                        </dl>

                        <div className={`mt-3 flex gap-2 border-t pt-3 ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                          <button
                            onClick={() => navigate("/score-details", { state: { schoolName: row.schoolName, programName: row.programName, username: username, users: users, school: school, darkMode: darkMode, role: role } })}
                            className={`min-h-11 flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95 ${darkMode ? "bg-green-900 text-green-200 hover:bg-green-800" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                          >
                            See Score
                          </button>
                          {role === "Admin" && (
                            <button
                              onClick={() => navigate("/add-school", { state: { username: username, users: users, school: school, schoolName: row.schoolName, programName: row.programName, darkMode: darkMode, role: role } })}
                              className={`min-h-11 flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95 ${darkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                              Edit Details
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead className={`uppercase tracking-wide ${dm.tableHead}`}>
                      <tr>
                        <th className="px-5 py-2.5 text-left font-semibold">School Name</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Program</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Number of Days</th>
                        <th className="px-5 py-2.5 text-left font-semibold">Status</th>
                        <th className="px-5 py-2.5 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row) => (
                        <Fragment key={`${row.schoolName}-${row.programName}`}>
                        <tr className={`border-t transition-colors ${dm.row}`}>
                          <td className={`px-5 py-3 font-medium ${dm.cell}`}>{row.schoolName}</td>
                          <td className={`px-5 py-3 ${dm.subtext}`}>{row.programName}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${darkMode ? "bg-gray-700 text-gray-200" : "bg-blue-100 text-blue-700"}`}>
                              {row.numberOfDays} days
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold ${(darkMode ? DARK_STATUS_STYLES : STATUS_STYLES)[(date > row.endDate
                              ? "Completed"
                              : date >= row.startDate && date <= row.endDate
                                ? "Ongoing"
                                : "Upcoming").toLowerCase()]}`}>
                              {date > row.endDate
                                ? "Completed"
                                : date >= row.startDate && date <= row.endDate
                                  ? "Ongoing"
                                  : "Upcoming"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => navigate("/score-details", { state: { schoolName: row.schoolName, programName: row.programName, username: username, users: users, school: school, darkMode: darkMode, role: role } })}
                                className={`text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-all ${darkMode ? "bg-green-900 hover:bg-green-800 text-green-200" : "bg-green-100 hover:bg-green-200 text-green-700"}`}
                              >
                                See
                              </button>
                              {role === "Admin" && (
                                <button
                                  onClick={() => navigate("/add-school", { state: { username: username, users: users, school: school, schoolName: row.schoolName, programName: row.programName, darkMode: darkMode, role: role } })}
                                  className={`text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-all ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                                >
                                  Edit Details
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                          {/* Expanded Detail Row */ }
                          { selectedRow?.id === row.id && (
                          <tr key={`detail-${row.id}`} className={`border-t ${darkMode ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-100"}`}>
                            <td colSpan={5} className="px-6 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  { label: "Participants", value: row.participants },
                                  { label: "Start Date", value: row.startDate },
                                  { label: "End Date", value: row.endDate },
                                  { label: "Teams Count", value: row.teamNames.length },
                                ].map((item) => (
                                  <div key={item.label} className={`rounded-lg px-4 py-3 border ${darkMode ? "bg-gray-600 border-gray-500" : "bg-blue-200 border-blue-100"}`}>
                                    <p className={`text-xs font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{item.label}</p>
                                    <p className={`text-sm font-bold ${darkMode ? "text-gray-100" : "text-gray-600"}`}>{item.value}</p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                    </Fragment>
                      ))}
                  </tbody>
                </table>
                </div>
                </>
          )}
        </div>
          )}

        {/* Empty state */}
        {!searched && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <p className="text-5xl mb-4">🏫</p>
            <p className={`text-sm font-bold ${dm.subtext}`}>Enter a school or program name to search</p>
            <p className={`text-xs mt-1 ${dm.subtext}`}>Results will appear here after you hit Search</p>
          </div>
        )}
      </div>
    </div>
    </div >
  );
}