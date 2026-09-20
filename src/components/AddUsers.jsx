import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BackButton from "./BackButton";

const CATEGORIES = ["Admin", "Trainer"];

const CATEGORY_STYLES = {
    Admin: "bg-purple-100 text-purple-700",
    Trainer: "bg-yellow-100 text-yellow-700",
};

export default function AddUsers() {

    const [activePage, setActivePage] = useState("Add Users");
    const [form, setForm] = useState({ username: "", password: "", category: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState([]);
    const [editShowPassword, setEditShowPassword] = useState(false);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const saved = false;

    const location = useLocation();
    const username = location.state.username;
    const school = location.state.school;
    const darkModeStatus = location.state.darkMode ?? window.localStorage.getItem("darkMode") === "true";
    const role = location.state?.role || "Admin"; // Default to Admin for backward compatibility

    useEffect(() => {
        setDarkMode(darkModeStatus);
    }, [darkModeStatus]);

    const [users, setUsers] = useState(location.state.users);

    const navItems = ["Dashboard", "Add Schools", "Search Scoreboard", "Add Users"];
    const url = ["/dashboard", "/add-school", "/search-scoreboard", "/add-users"];

    const navigate = useNavigate();

    // ── Dark Mode Classes ──
    const dm = {
        page: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300",

        title: darkMode ? "border-gray-700 text-white" : "border-gray-200 text-gray-900",

        sidebar: darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-400",

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

        cell: darkMode
            ? "text-gray-200"
            : "text-gray-800",
    };

    const inputClass = `border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono w-full focus:outline-none focus:ring-2 transition ${dm.input}`;

    const labelClass = `text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2 block ${dm.subtext}`;

    // ── Backend Logic Untouched ──

    const handleAdd = () => {
        if (!form.username.trim() || !form.password.trim() || !form.category) {
            alert("Please fill in all fields.");
            return;
        }
        else {
            backAdd();
        }
    };

    const backAdd = () => {

        if (users.find((u) => u.name === form.username.trim())) {
            alert("Username already exists.");
            return;
        }
        else {
            axios.get(`https://entercon-backend-1e81.onrender.com/add-users?username=${form.username}&password=${form.password}&role=${form.category}`)
                .then((res) => {
                    setUsers(res.data);
                    navigate("/add-users", {
                        state: {
                            username: username,
                            users: res.data,
                            school: school,
                            darkMode: darkMode,
                            role: role
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                });

            setForm({ username: "", password: "", category: "" });
        }
    };

    const handleEditStart = (user, i) => {
        setEditingId(user.id);
        setEditValues(users);
    };

    const handleEditSave = (i) => {

        if (users.find((u) =>
            u.name === editValues[i].name.trim() &&
            i !== users.findIndex(u => u.name === editValues[i].name.trim())
        )) {
            alert("Username already exists.");
            return;
        }

        else {

            axios.get(`https://entercon-backend-1e81.onrender.com/update-users?name=${editValues[i].name}&password=${editValues[i].password}&role=${editValues[i].role}&i=${i}`)
                .then((res) => {
                    setUsers(res.data);
                    navigate("/add-users", {
                        state: {
                            username: username,
                            users: res.data,
                            school: school,
                            darkMode: darkMode,
                            role: role
                        }
                    });
                    window.localStorage.setItem("darkMode", darkMode);
                })
                .catch(err => {
                    console.log(err);
                });

            setForm({ username: "", password: "", category: "" });
            setShowEditPanel(false);
            setEditingId(null);
        }
    };

    const handleDelete = (user, i) => {

        axios.get(`https://entercon-backend-1e81.onrender.com/delete-users?i=${i}&user=${user}`)
            .then((res) => {
                setUsers(res.data);

                navigate("/add-users", {
                    state: {
                        username: username,
                        users: res.data,
                        school: school,
                        darkMode: darkMode,
                        role: role
                    }
                });
            })
            .catch(err => {
                console.log(err);
            });
    };

    return (

        <div className={`min-h-screen border-2 border-dashed rounded-xl font-mono transition-colors duration-300 ${dm.page}`}>

            {/* ── Top Bar ── */}

            <div className={`flex items-center justify-between px-3 sm:px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b ${dm.title}`}>

                <BackButton />

                {/* Hamburger */}

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

                {/* Dark Mode Toggle */}

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

                {/* Overlay */}

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}

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
                                    state: {
                                        username: username,
                                        users: users,
                                        school: school,
                                        darkMode: darkMode,
                                        role: role
                                    }
                                });
                            }}
                            className={`text-left text-sm font-mono transition-all duration-150 hover:text-blue-500 ${
                                activePage === item
                                    ? "text-blue-500 font-bold"
                                    : dm.text
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* ── Main Content ── */}

                <div className={`flex-1 px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 flex flex-col gap-4 sm:gap-2 sm:gap-3 md:gap-4 lg:gap-5 md:gap-3 sm:gap-4 md:gap-2 sm:gap-3 md:gap-4 lg:gap-5 lg:gap-6 ${dm.main}`}>

                    {/* Header */}

                    <div className="flex items-center justify-between flex-wrap gap-3">

                        <div>
                            <h2 className={`text-sm sm:text-base md:text-lg font-bold ${dm.text}`}>
                                Add Users
                            </h2>

                            <p className={`text-xs mt-0.5 ${dm.subtext}`}>
                                Manage user accounts and permissions
                            </p>
                        </div>

                        <div className="flex gap-2 items-center flex-wrap">

                            {saved && (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                    ✓ User Added
                                </span>
                            )}

                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                {users.length} Users
                            </span>

                        </div>

                    </div>

                    {/* Stats */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3">

                        {CATEGORIES.map((cat) => {

                            const count = users.filter(
                                (u) => u.role.toLowerCase() === cat.toLowerCase()
                            ).length;

                            return (
                                <div
                                    key={cat}
                                    className={`rounded-xl px-4 py-3 border flex flex-col gap-1 ${CATEGORY_STYLES[cat]} border-opacity-30`}
                                >
                                    <span className="text-xl font-bold">{count}</span>

                                    <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                                        {cat}s
                                    </span>
                                </div>
                            );
                        })}

                    </div>

                    {/* Add User Form */}

                    <div className={`border rounded-xl p-3 sm:p-4 md:p-5 md:p-6 shadow-sm ${dm.card}`}>

                        <h3 className={`text-sm sm:text-base font-bold mb-4 sm:mb-5 pb-2 sm:pb-3 border-b ${dm.text} ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                            👤 New User Entry
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-2 sm:gap-3 md:gap-4 lg:gap-5">

                            {/* Username */}

                            <div>
                                <label className={labelClass}>Username</label>

                                <input
                                    type="text"
                                    placeholder="Enter Username"
                                    value={form.username}
                                    onChange={(e) =>
                                        setForm({ ...form, username: e.target.value })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            {/* Password */}

                            <div>

                                <label className={labelClass}>Password</label>

                                <div className="relative">

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                        className={inputClass + " pr-11 sm:pr-12"}
                                    />

                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs font-bold transition-colors px-2 py-1 rounded ${dm.subtext}`}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* Category */}

                            <div>

                                <label className={labelClass}>Category</label>

                                <select
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({ ...form, category: e.target.value })
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select Category</option>

                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}

                                </select>

                            </div>

                        </div>

                        {/* Buttons */}

                        <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5 justify-end flex-wrap sm:flex-nowrap">

                            <button
                                onClick={() =>
                                    setForm({
                                        username: "",
                                        password: "",
                                        category: ""
                                    })
                                }
                                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg border active:scale-95 transition-all ${
                                    darkMode
                                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Clear
                            </button>

                            <button
                                onClick={() => {
                                    setShowEditPanel(true);
                                    setEditingId(null);
                                }}
                                className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-all"
                            >
                                Edit Users
                            </button>

                            <button
                                onClick={handleAdd}
                                className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all"
                            >
                                Add User
                            </button>

                        </div>

                    </div>

                    {/* Edit Users Panel */}

                    {showEditPanel && (

                        <div className={`border rounded-xl shadow-sm overflow-hidden ${dm.card}`}>

                            <div className={`flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 border-b flex-wrap gap-2 ${
                                darkMode ? "border-gray-700" : "border-gray-100"
                            }`}>

                                <h3 className={`text-sm font-bold ${dm.text}`}>
                                    ✏️ Edit Users
                                </h3>

                                <button
                                    onClick={() => {
                                        setShowEditPanel(false);
                                        setEditingId(null);
                                    }}
                                    className={`text-xs font-bold transition-colors ${dm.subtext}`}
                                >
                                    Close ✕
                                </button>

                            </div>

                            {/* Mobile Scroll */}

                            <div className="overflow-x-auto">

                                <table className="w-full text-xs min-w-[700px]">

                                    <thead className={`uppercase tracking-wide ${dm.tableHead}`}>

                                        <tr>
                                            <th className="px-5 py-2.5 text-left font-semibold">#</th>
                                            <th className="px-5 py-2.5 text-left font-semibold">Username</th>
                                            <th className="px-5 py-2.5 text-left font-semibold">Password</th>
                                            <th className="px-5 py-2.5 text-left font-semibold">Category</th>
                                            <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {users.map((user, i) => {

                                            return (

                                                <tr
                                                    key={user.id}
                                                    className={`border-t transition-colors ${dm.row}`}
                                                >

                                                    {/* Number */}

                                                    <td className="px-5 py-3">

                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                            darkMode
                                                                ? "bg-gray-700 text-gray-300"
                                                                : "bg-gray-100 text-gray-600"
                                                        }`}>
                                                            {i + 1}
                                                        </span>

                                                    </td>

                                                    {/* Username */}

                                                    <td className={`px-5 py-3 font-medium ${dm.cell}`}>

                                                        {editingId === user.id ? (

                                                            <input
                                                                type="text"
                                                                value={editValues[i].name}
                                                                onChange={(e) =>
                                                                    setEditValues(
                                                                        editValues.map((item, index) =>
                                                                            index === i
                                                                                ? { ...item, name: e.target.value }
                                                                                : item
                                                                        )
                                                                    )
                                                                }
                                                                className={`border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 w-28 ${
                                                                    darkMode
                                                                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
                                                                        : "bg-white border-blue-300 focus:ring-blue-300"
                                                                }`}
                                                            />

                                                        ) : user.name}

                                                    </td>

                                                    {/* Password */}

                                                    <td className={`px-5 py-3 ${dm.subtext}`}>

                                                        {editingId === user.id ? (

                                                            <div className="relative flex items-center gap-1">

                                                                <input
                                                                    type={editShowPassword ? "text" : "password"}
                                                                    value={editValues[i].password}
                                                                    onChange={(e) =>
                                                                        setEditValues(
                                                                            editValues.map((item, index) =>
                                                                                index === i
                                                                                    ? { ...item, password: e.target.value }
                                                                                    : item
                                                                            )
                                                                        )
                                                                    }
                                                                    className={`border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 w-24 ${
                                                                        darkMode
                                                                            ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
                                                                            : "bg-white border-blue-300 focus:ring-blue-300"
                                                                    }`}
                                                                />

                                                                <button
                                                                    onClick={() =>
                                                                        setEditShowPassword(!editShowPassword)
                                                                    }
                                                                    className={`text-xs font-bold ${dm.subtext}`}
                                                                >
                                                                    {editShowPassword ? "🙈" : "👁"}
                                                                </button>

                                                            </div>

                                                        ) : "••••••••"}

                                                    </td>

                                                    {/* Category */}

                                                    <td className="px-5 py-3">

                                                        {editingId === user.id ? (

                                                            <select
                                                                value={editValues[i].role}
                                                                onChange={(e) => {
                                                                    setEditValues(
                                                                        editValues.map((item, index) =>
                                                                            index === i
                                                                                ? { ...item, role: e.target.value }
                                                                                : item
                                                                        )
                                                                    );
                                                                }}
                                                                className={`border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
                                                                    darkMode
                                                                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
                                                                        : "bg-white border-blue-300 focus:ring-blue-300"
                                                                }`}
                                                            >
                                                                {CATEGORIES.map((c) => (
                                                                    <option key={c}>{c}</option>
                                                                ))}
                                                            </select>

                                                        ) : (

                                                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${CATEGORY_STYLES[user.role]}`}>
                                                                {user.role}
                                                            </span>

                                                        )}

                                                    </td>

                                                    {/* Actions */}

                                                    <td className="px-5 py-3">

                                                        <div className="flex gap-2 justify-end flex-wrap">

                                                            {editingId === user.id ? (

                                                                <>

                                                                    <button
                                                                        onClick={() => handleEditSave(i)}
                                                                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                                                                    >
                                                                        Save
                                                                    </button>

                                                                    <button
                                                                        onClick={() => setEditingId(null)}
                                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all ${
                                                                            darkMode
                                                                                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                                        }`}
                                                                    >
                                                                        Cancel
                                                                    </button>

                                                                </>

                                                            ) : (

                                                                <>

                                                                    <button
                                                                        onClick={() => handleEditStart(user, i)}
                                                                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleDelete(user, i)}
                                                                        className="bg-red-100 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                                                                    >
                                                                        🗑️ Delete
                                                                    </button>

                                                                </>

                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        })}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}
