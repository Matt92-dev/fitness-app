import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBell,
  faCalendarDays,
  faChartColumn,
  faDumbbell,
  faFireFlameCurved,
  faGear,
  faHouse
} from "@fortawesome/free-solid-svg-icons";
import { weeklyPlan } from "./data";

const WORKOUT_LOGS_KEY = "fitness-tracker-workout-logs-v1";
const WORKOUT_LOGS_API_URL = "/api/workout-logs";
const SESSION_API_URL = "/api/session";
const LOGIN_API_URL = "/api/login";
const LOGOUT_API_URL = "/api/logout";
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
const SHORT_DAY_NAMES = ["M", "T", "W", "T", "F", "S", "S"];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "home" },
  { label: "Progress", icon: "progress" },
  { label: "History", icon: "calendar" },
  { label: "More", icon: "profile" }
];

function getWeekKey(date = new Date()) {
  const current = new Date(date);
  const day = (current.getDay() + 6) % 7;
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() + 3 - day);
  const firstThursday = new Date(current.getFullYear(), 0, 4);
  const firstThursdayDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() + 3 - firstThursdayDay);
  const diff = current - firstThursday;
  const week = 1 + Math.round(diff / 604800000);

  return `${current.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getCurrentWeekRange(date = new Date()) {
  const monday = new Date(date);
  const mondayOffset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const start = sameMonth
    ? `${month.format(monday)} ${monday.getDate()}`
    : `${month.format(monday)} ${monday.getDate()}`;
  const end = sameMonth
    ? `${sunday.getDate()}`
    : `${month.format(sunday)} ${sunday.getDate()}`;

  return sameMonth ? `${start} - ${end}` : `${start} - ${end}`;
}

function getDateForWeekDay(weekKey, dayName) {
  const match = weekKey?.match(/^(\d{4})-W(\d{2})$/);
  const dayIndex = DAY_NAMES.indexOf(dayName);

  if (!match || dayIndex === -1) {
    return null;
  }

  const year = Number(match[1]);
  const week = Number(match[2]);
  const januaryFourth = new Date(year, 0, 4);
  const januaryFourthDay = (januaryFourth.getDay() + 6) % 7;
  const weekOneMonday = new Date(januaryFourth);
  weekOneMonday.setDate(januaryFourth.getDate() - januaryFourthDay);
  weekOneMonday.setHours(0, 0, 0, 0);

  const targetDate = new Date(weekOneMonday);
  const mondayBasedDayIndex = (dayIndex + 6) % 7;
  targetDate.setDate(weekOneMonday.getDate() + (week - 1) * 7 + mondayBasedDayIndex);

  return targetDate;
}

function getRelativeLogLabel(entry, dayName, now = new Date()) {
  const loggedDate = entry?.updatedAt
    ? new Date(entry.updatedAt)
    : getDateForWeekDay(entry?.weekKey, dayName);

  if (!loggedDate || Number.isNaN(loggedDate.getTime())) {
    return entry?.weekKey ?? "";
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  loggedDate.setHours(0, 0, 0, 0);

  const daysAgo = Math.max(0, Math.floor((today - loggedDate) / 86400000));

  if (daysAgo === 0) {
    return "Today";
  }

  if (daysAgo === 1) {
    return "Yesterday";
  }

  if (daysAgo < 7) {
    return `${daysAgo} days ago`;
  }

  if (daysAgo < 14) {
    return "Last week";
  }

  if (daysAgo < 28) {
    return `${Math.floor(daysAgo / 7)} weeks ago`;
  }

  if (daysAgo < 45) {
    return "Last month";
  }

  return "More than a month ago";
}

function getWeightValue(weight = "") {
  const match = String(weight).replace(",", ".").match(/\d+(\.\d+)?/);

  return match ? Number(match[0]) : null;
}

function getBestExerciseLog(workoutLogs, exerciseName) {
  let bestLog = null;
  let bestWeight = -Infinity;

  Object.values(workoutLogs).forEach((weekLog) => {
    Object.values(weekLog ?? {}).forEach((dayLog) => {
      const entry = dayLog?.[exerciseName];
      const weightValue = getWeightValue(entry?.weight);

      if (weightValue !== null && weightValue > bestWeight) {
        bestWeight = weightValue;
        bestLog = entry;
      }
    });
  });

  return bestLog;
}

function formatBestExerciseLog(entry) {
  if (!entry?.weight) {
    return "";
  }

  return entry.reps ? `Best: ${entry.weight} | ${entry.reps}` : `Best: ${entry.weight}`;
}

function getWorkoutLabel(summary) {
  return summary.replace(/\s*\([^)]*\)/, "").replace(" - ", "  •  ");
}

function getWorkoutMeta(summary) {
  const match = summary.match(/\(([^)]*)\)/);

  return match ? match[1].replace(",", "  •") : "Open";
}

function AppIcon({ name }) {
  const icons = {
    home: faHouse,
    progress: faChartColumn,
    calendar: faCalendarDays,
    profile: faGear,
    bell: faBell,
    "calendar-small": faCalendarDays,
    arrow: faArrowRight,
    dumbbell: faDumbbell,
    streak: faFireFlameCurved
  };

  return icons[name] ? <FontAwesomeIcon aria-hidden="true" icon={icons[name]} /> : null;
}

function getMostRecentExerciseLog(workoutLogs, currentWeekKey, day, exerciseName) {
  const weekKeys = Object.keys(workoutLogs)
    .filter((key) => key < currentWeekKey)
    .sort()
    .reverse();

  for (const key of weekKeys) {
    const entry = workoutLogs[key]?.[day]?.[exerciseName];

    if (entry?.weight || entry?.reps || entry?.completed) {
      return { ...entry, weekKey: key };
    }
  }

  return null;
}

function getInitialWorkoutLogs() {
  const saved = window.localStorage.getItem(WORKOUT_LOGS_KEY);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function fetchWorkoutLogsFromApi() {
  const response = await fetch(WORKOUT_LOGS_API_URL);

  if (!response.ok) {
    throw new Error("Could not load workout logs");
  }

  const body = await response.json();

  return isPlainObject(body.workoutLogs) ? body.workoutLogs : {};
}

async function saveWorkoutLogsToApi(workoutLogs) {
  const response = await fetch(WORKOUT_LOGS_API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ workoutLogs })
  });

  if (!response.ok) {
    throw new Error("Could not save workout logs");
  }
}

async function fetchSession() {
  const response = await fetch(SESSION_API_URL);

  if (!response.ok) {
    throw new Error("Could not check login");
  }

  return response.json();
}

async function login(username, password) {
  const response = await fetch(LOGIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error("Incorrect username or password");
  }
}

async function logout() {
  await fetch(LOGOUT_API_URL, { method: "POST" });
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
      onLogin();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <p className="eyebrow">Personal fitness dashboard</p>
        <h1>Welcome back</h1>
        <p className="login-copy">Log in to view your workouts and keep your progress synced.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <button disabled={submitting} type="submit">
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}

function getExerciseItemsFromSections(sections) {
  return sections
    .flatMap((section) => section.items)
    .filter((item) => typeof item === "object");
}

function getExerciseItems(dayPlan) {
  return getExerciseItemsFromSections(dayPlan.detailSections);
}

function areRequiredFieldsFilled(exercise, log = {}) {
  const weightFilled = !exercise.tracking.weight || Boolean(log.weight?.trim());
  const repsFilled = !exercise.tracking.reps || Boolean(log.reps?.trim());

  return weightFilled && repsFilled;
}

function isExerciseComplete(exercise, log = {}) {
  return Boolean(log.completed) || areRequiredFieldsFilled(exercise, log);
}

function getExerciseProgress(day, exercises, weeklyLogs) {
  const completed = exercises.filter((exercise) =>
    isExerciseComplete(exercise, weeklyLogs?.[day]?.[exercise.name])
  ).length;

  return {
    total: exercises.length,
    completed,
    isComplete: exercises.length > 0 && completed === exercises.length
  };
}

function getDayProgress(dayPlan, weeklyLogs) {
  const gymProgress = getExerciseProgress(dayPlan.day, getExerciseItems(dayPlan), weeklyLogs);
  const homeExercises = dayPlan.homeAlternative
    ? getExerciseItemsFromSections(dayPlan.homeAlternative.detailSections)
    : [];
  const homeProgress = getExerciseProgress(dayPlan.day, homeExercises, weeklyLogs);

  if (homeProgress.isComplete || homeProgress.completed > gymProgress.completed) {
    return homeProgress;
  }

  return {
    ...gymProgress,
    isComplete: gymProgress.isComplete || homeProgress.isComplete
  };
}

function getAllExercises() {
  const exercises = new Map();

  weeklyPlan.forEach((dayPlan) => {
    getExerciseItems(dayPlan).forEach((exercise) => {
      exercises.set(exercise.name, exercise);
    });
    if (dayPlan.homeAlternative) {
      getExerciseItemsFromSections(dayPlan.homeAlternative.detailSections).forEach((exercise) => {
        exercises.set(exercise.name, exercise);
      });
    }
  });

  return [...exercises.values()];
}

function getHistoryEntries(workoutLogs) {
  return Object.entries(workoutLogs)
    .flatMap(([weekKey, weekLogs]) => weeklyPlan.flatMap((dayPlan) => {
      const gymExercises = getExerciseItems(dayPlan);
      const homeExercises = dayPlan.homeAlternative
        ? getExerciseItemsFromSections(dayPlan.homeAlternative.detailSections)
        : [];
      const gymProgress = getExerciseProgress(dayPlan.day, gymExercises, weekLogs ?? {});
      const homeProgress = getExerciseProgress(dayPlan.day, homeExercises, weekLogs ?? {});
      const usesHomeWorkout = homeProgress.isComplete || homeProgress.completed > gymProgress.completed;
      const progress = usesHomeWorkout ? homeProgress : gymProgress;

      if (progress.completed === 0) {
        return [];
      }

      const date = getDateForWeekDay(weekKey, dayPlan.day);
      return [{
        dayPlan,
        date,
        exercises: usesHomeWorkout ? homeExercises : gymExercises,
        progress,
        weekKey,
        weekLogs,
        workoutMode: usesHomeWorkout ? "Home" : "Gym"
      }];
    }))
    .sort((first, second) => (second.date?.getTime() ?? 0) - (first.date?.getTime() ?? 0));
}

function getWeeklyStreak(workoutLogs, currentWeekKey) {
  const mainTrainingDays = weeklyPlan.filter((dayPlan) => getExerciseItems(dayPlan).length > 0);
  let streak = 0;
  let weekKey = currentWeekKey;

  while (weekKey) {
    const weekLogs = workoutLogs[weekKey] ?? {};
    const trainedThatWeek = mainTrainingDays.some((dayPlan) =>
      getDayProgress(dayPlan, weekLogs).completed > 0
    );

    if (!trainedThatWeek) {
      break;
    }

    streak += 1;
    const monday = getDateForWeekDay(weekKey, "Monday");
    if (!monday) {
      break;
    }
    weekKey = getWeekKey(new Date(monday.getTime() - 7 * 86400000));
  }

  return streak;
}

function formatWorkoutDate(date) {
  if (!date) {
    return "Earlier workout";
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short"
  }).format(date);
}

function downloadWorkoutBackup(workoutLogs) {
  const backup = new Blob([JSON.stringify(workoutLogs, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(backup);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fitness-workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function ProgressView({ workoutLogs }) {
  const allExercises = getAllExercises();
  const bestLifts = allExercises
    .map((exercise) => ({ exercise, entry: getBestExerciseLog(workoutLogs, exercise.name) }))
    .filter(({ entry }) => entry?.weight)
    .sort(({ exercise: first }, { exercise: second }) => first.name.localeCompare(second.name));
  const historyEntries = getHistoryEntries(workoutLogs);
  const completedSessions = historyEntries.filter(({ progress }) => progress.isComplete).length;
  const activeWeeks = new Set(historyEntries.map(({ weekKey }) => weekKey)).size;

  return (
    <main className="dashboard-main app-view">
      <section className="view-intro">
        <p className="eyebrow">Training insights</p>
        <h2>Progress</h2>
        <p>Your strongest recorded lifts and the consistency you have built so far.</p>
      </section>

      <section className="stats-grid" aria-label="Progress summary">
        <article className="stat-card">
          <strong>{completedSessions}</strong>
          <span>completed workouts</span>
        </article>
        <article className="stat-card">
          <strong>{activeWeeks}</strong>
          <span>active weeks</span>
        </article>
        <article className="stat-card">
          <strong>{bestLifts.length}</strong>
          <span>lifts with a best</span>
        </article>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Personal bests</h2>
          <span>{bestLifts.length} recorded</span>
        </div>
        {bestLifts.length ? (
          <div className="best-list">
            {bestLifts.map(({ exercise, entry }) => (
              <article className="best-row" key={exercise.name}>
                <div>
                  <h3>{exercise.name}</h3>
                  <p>{entry.reps ? `${entry.reps} reps` : "Weight recorded"}</p>
                </div>
                <strong>{entry.weight}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">Log a weighted exercise and your personal bests will appear here.</p>
        )}
      </section>
    </main>
  );
}

function HistoryView({ onSelect, workoutLogs }) {
  const historyEntries = getHistoryEntries(workoutLogs);

  return (
    <main className="dashboard-main app-view">
      <section className="view-intro">
        <p className="eyebrow">Your training record</p>
        <h2>History</h2>
        <p>Every workout you have started, with the details saved exactly as you logged them.</p>
      </section>

      <section className="history-list" aria-label="Workout history">
        {historyEntries.length ? historyEntries.map((entry) => {
          const percent = Math.round((entry.progress.completed / entry.progress.total) * 100);
          return (
            <button className="history-row" key={`${entry.weekKey}-${entry.dayPlan.day}`} onClick={() => onSelect(entry)} type="button">
              <div>
                <p className="history-date">{formatWorkoutDate(entry.date)}</p>
                <h3>{getWorkoutLabel(entry.dayPlan.workoutSummary)}</h3>
                <p>{entry.progress.completed}/{entry.progress.total} exercises logged</p>
              </div>
              <div className="history-status">
                <strong>{percent}%</strong>
                <AppIcon name="arrow" />
              </div>
            </button>
          );
        }) : (
          <p className="empty-state">Your completed and in-progress workouts will appear here once you start logging.</p>
        )}
      </section>
    </main>
  );
}

function MoreView({ onExport, onLogout, onImport }) {
  const importInput = useRef(null);

  return (
    <main className="dashboard-main app-view">
      <section className="view-intro">
        <p className="eyebrow">App settings</p>
        <h2>More</h2>
        <p>Keep a copy of your training record or manage this private app.</p>
      </section>

      <section className="settings-list">
        <button className="settings-row" onClick={onExport} type="button">
          <span><strong>Export workout backup</strong><small>Download all of your saved workout logs.</small></span>
          <AppIcon name="arrow" />
        </button>
        <button className="settings-row" onClick={() => importInput.current?.click()} type="button">
          <span><strong>Restore workout backup</strong><small>Replace local logs with a backup file.</small></span>
          <AppIcon name="arrow" />
        </button>
        <input accept="application/json" className="visually-hidden" onChange={onImport} ref={importInput} type="file" />
        <button className="settings-row danger" onClick={onLogout} type="button">
          <span><strong>Log out</strong><small>End this session on this device.</small></span>
          <AppIcon name="arrow" />
        </button>
      </section>
    </main>
  );
}

function WorkoutTile({ item, onOpen, progress }) {
  const percent = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;
  const statusText = progress.total === 0
    ? "Open"
    : progress.isComplete
      ? "Complete"
      : "In progress";
  return (
    <article
      className="tile clickable"
      data-day={item.day}
      onClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="tile-header">
        <h2>{item.day}</h2>
        <span className={progress.isComplete ? "badge done" : "badge"}>{statusText}</span>
      </div>

      <div className="tile-body">
        <div className="summary">
          <div className="workout-summary-top">
            <span className="workout-symbol"><AppIcon name="dumbbell" /></span>
            <div>
              <p className="workout-title">{getWorkoutLabel(item.workoutSummary)}</p>
              <p className="workout-meta">{getWorkoutMeta(item.workoutSummary)}</p>
            </div>
          </div>
          <p>{item.workoutDescription}</p>
        </div>
        <span className="tile-arrow" aria-hidden="true"><AppIcon name="arrow" /></span>
      </div>

      <div className="tracking">
        <div className="progress-row">
          <p className="progress-line">
            {progress.total > 0 ? `${progress.completed}/${progress.total} exercises completed` : "Recovery or optional session"}
          </p>
          <span>{percent}%</span>
        </div>
        <div className="card-progress"><span style={{ width: `${percent}%` }} /></div>
      </div>
    </article>
  );
}

function App() {
  const [workoutLogs, setWorkoutLogs] = useState(getInitialWorkoutLogs);
  const [authentication, setAuthentication] = useState("checking");
  const [apiSyncReady, setApiSyncReady] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedWorkoutMode, setSelectedWorkoutMode] = useState("gym");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  const currentWeekKey = getWeekKey();
  const currentWeekLogs = workoutLogs[currentWeekKey] ?? {};
  const mainTrainingDays = weeklyPlan.filter((dayPlan) => getExerciseItems(dayPlan).length > 0);
  const completedDays = mainTrainingDays.filter((dayPlan) =>
    getDayProgress(dayPlan, currentWeekLogs).isComplete
  ).length;
  const mainProgressPercent = Math.round((completedDays / mainTrainingDays.length) * 100);
  const currentWeekRange = getCurrentWeekRange();
  const todayName = DAY_NAMES[new Date().getDay()];
  const historyEntries = getHistoryEntries(workoutLogs);
  const completedSessions = historyEntries.filter(({ progress }) => progress.isComplete).length;
  const activeWeeks = new Set(historyEntries.map(({ weekKey }) => weekKey)).size;
  const weeklyStreak = getWeeklyStreak(workoutLogs, currentWeekKey);
  const todayWorkout = weeklyPlan.find((item) => item.day === todayName) ?? weeklyPlan[0];
  const weekWorkouts = [todayWorkout, ...weeklyPlan.filter((item) => item.day !== todayWorkout.day)];

  useEffect(() => {
    fetchSession()
      .then((session) => {
        setAuthentication(session.authenticated ? "authenticated" : "anonymous");
      })
      .catch(() => {
        setAuthentication("authenticated");
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkoutLogs() {
      if (authentication !== "authenticated") {
        return;
      }

      try {
        const remoteWorkoutLogs = await fetchWorkoutLogsFromApi();

        if (!cancelled && Object.keys(remoteWorkoutLogs).length > 0) {
          setWorkoutLogs(remoteWorkoutLogs);
        }
      } catch {
        // The app can still run from localStorage when the API is unavailable.
      } finally {
        if (!cancelled) {
          setApiSyncReady(true);
        }
      }
    }

    loadWorkoutLogs();

    return () => {
      cancelled = true;
    };
  }, [authentication]);

  useEffect(() => {
    window.localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(workoutLogs));

    if (!apiSyncReady) {
      return;
    }

    saveWorkoutLogsToApi(workoutLogs).catch(() => {
      // Keep localStorage as the durable fallback if the API save fails.
    });
  }, [apiSyncReady, workoutLogs]);

  useEffect(() => {
    if (!selectedDay) {
      setSelectedExercise(null);
      setSelectedWorkoutMode("gym");
    }
  }, [selectedDay]);

  const updateExerciseLog = (day, exerciseName, field, value) => {
    setWorkoutLogs((current) => ({
      ...current,
      [currentWeekKey]: {
        ...current[currentWeekKey],
        [day]: {
          ...current[currentWeekKey]?.[day],
          [exerciseName]: {
            ...current[currentWeekKey]?.[day]?.[exerciseName],
            [field]: value,
            updatedAt: new Date().toISOString()
          }
        }
      }
    }));
  };

  const markExerciseComplete = (day, exerciseName) => {
    updateExerciseLog(day, exerciseName, "completed", "true");
  };

  const openWorkoutDay = (dayPlan) => {
    setSelectedDay(dayPlan);
    setSelectedExercise(null);
    setSelectedWorkoutMode("gym");
  };

  const closeWorkoutFlow = () => {
    setSelectedDay(null);
    setSelectedExercise(null);
    setSelectedWorkoutMode("gym");
  };

  const handleLogout = async () => {
    await logout();
    setApiSyncReady(false);
    setAuthentication("anonymous");
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const importedLogs = JSON.parse(await file.text());
      if (!isPlainObject(importedLogs)) {
        throw new Error("Invalid backup");
      }
      if (window.confirm("Replace the workout logs on this device with this backup?")) {
        setWorkoutLogs(importedLogs);
      }
    } catch {
      window.alert("That backup file could not be read.");
    }
  };

  const selectedExerciseLog =
    selectedDay && selectedExercise
      ? currentWeekLogs?.[selectedDay.day]?.[selectedExercise.name] ?? {}
      : {};

  const selectedExerciseComplete =
    selectedExercise && isExerciseComplete(selectedExercise, selectedExerciseLog);

  const previousExerciseLog =
    selectedDay && selectedExercise
      ? getMostRecentExerciseLog(
          workoutLogs,
          currentWeekKey,
          selectedDay.day,
          selectedExercise.name
        )
      : null;
  const previousExerciseLabel =
    selectedDay && previousExerciseLog
      ? getRelativeLogLabel(previousExerciseLog, selectedDay.day)
      : "";

  const activeWorkout =
    selectedDay?.homeAlternative && selectedWorkoutMode === "home"
      ? selectedDay.homeAlternative
      : selectedDay;

  if (authentication === "checking") {
    return <div className="app-loading">Loading...</div>;
  }

  if (authentication === "anonymous") {
    return <LoginScreen onLogin={() => setAuthentication("authenticated")} />;
  }

  return (
    <div className="app-shell">
      {activeTab === "Dashboard" ? <>
        <header className="dashboard-hero">
          <div className="hero-copy-block">
            <p className="eyebrow">Personal fitness dashboard</p>
            <h1>Weekly Workout Tracker</h1>
            <p className="hero-copy">Stay consistent. Log your workouts and make progress week after week.</p>
          </div>
        </header>

        <main className="dashboard-main">
          <section className="overview-card" aria-label="Main training days progress">
           <div className="overview-topline">
             <div className="progress-ring" style={{ "--progress": `${mainProgressPercent}%` }}>
              <div>
                <strong>{completedDays}/{mainTrainingDays.length}</strong>
                <span>days</span>
              </div>
             </div>
             <div className="overview-details">
              <p className="overview-kicker">Weekly goal</p>
              <h2>This week</h2>
              <p>{currentWeekRange}</p>
               <div className="overview-progress">
                 <span style={{ width: `${mainProgressPercent}%` }} />
               </div>
              <p className="overview-progress-label">{completedDays} of {mainTrainingDays.length} workouts completed</p>
             </div>
           </div>
          </section>

          <section className="stats-grid dashboard-stats" aria-label="Training summary">
            <article className="stat-card"><div className="stat-value"><AppIcon name="dumbbell" /><strong>{completedSessions}</strong></div><span>workouts completed</span></article>
            <article className="stat-card"><div className="stat-value"><AppIcon name="calendar" /><strong>{activeWeeks}</strong></div><span>active weeks</span></article>
            <article className="stat-card"><div className="stat-value"><AppIcon name="streak" /><strong>{weeklyStreak}</strong></div><span>week streak</span></article>
          </section>

          <div className="week-dots dashboard-week-dots" aria-label="Week days">
              {SHORT_DAY_NAMES.map((day, index) => {
                const dayPlan = weeklyPlan[(index + 1) % 7];
                const progress = dayPlan ? getDayProgress(dayPlan, currentWeekLogs) : null;
                const classes = [
                  "week-dot",
                  dayPlan?.day === todayName ? "active" : "",
                  progress?.isComplete ? "done" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <span
                    className={classes}
                    key={`${day}-${index}`}
                  >
                  {day}
                </span>
              );
            })}
          </div>

          <section className="week-section" aria-label="This week">
            <div className="section-heading"><h2>This week</h2><span>Swipe to explore</span></div>
           <div className="workout-carousel">
              {weekWorkouts.map((item) => (
                <WorkoutTile item={item} key={item.day} onOpen={openWorkoutDay} progress={getDayProgress(item, currentWeekLogs)} />
              ))}
           </div>
          </section>
        </main>
      </> : null}

      {activeTab === "Progress" ? <ProgressView workoutLogs={workoutLogs} /> : null}
      {activeTab === "History" ? (
        <HistoryView onSelect={setSelectedHistoryEntry} workoutLogs={workoutLogs} />
      ) : null}
      {activeTab === "More" ? (
        <MoreView
          onExport={() => downloadWorkoutBackup(workoutLogs)}
          onImport={handleImportBackup}
          onLogout={handleLogout}
        />
      ) : null}

      <nav className="bottom-nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <button
            aria-current={activeTab === item.label ? "page" : undefined}
            className={activeTab === item.label ? "active" : ""}
            key={item.label}
            onClick={() => {
              closeWorkoutFlow();
              setSelectedHistoryEntry(null);
              setActiveTab(item.label);
            }}
            type="button"
          >
            <AppIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {selectedHistoryEntry ? (
        <div className="screen-backdrop">
          <section className="screen-sheet" role="dialog" aria-modal="true" aria-label="Saved workout details">
            <header className="screen-header">
              <button className="nav-button" onClick={() => setSelectedHistoryEntry(null)} type="button">
                Back
              </button>
              <div>
                <p className="screen-kicker">Saved workout</p>
                <h2>{formatWorkoutDate(selectedHistoryEntry.date)}</h2>
              </div>
            </header>
            <div className="screen-content">
              <div className="workout-title-row">
                <div>
                  <p className="detail-lead">{getWorkoutLabel(selectedHistoryEntry.dayPlan.workoutSummary)}</p>
                  <p className="coaching-note">
                    {selectedHistoryEntry.workoutMode} workout | {selectedHistoryEntry.progress.completed}/{selectedHistoryEntry.progress.total} exercises logged
                  </p>
                </div>
              </div>
              <section className="detail-section">
                <div className="history-exercise-list">
                  {selectedHistoryEntry.exercises.map((exercise) => {
                    const log = selectedHistoryEntry.weekLogs?.[selectedHistoryEntry.dayPlan.day]?.[exercise.name];
                    const isLogged = log?.completed || log?.weight || log?.reps;

                    return (
                      <article className="history-exercise" key={exercise.name}>
                        <div>
                          <h3>{exercise.name}</h3>
                          <p>{exercise.sets}</p>
                        </div>
                        <p className={isLogged ? "history-log" : "history-log muted"}>
                          {isLogged
                            ? [log.weight, log.reps].filter(Boolean).join(" | ") || "Completed"
                            : "Not logged"}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : null}

      {selectedDay ? (
        <div className="screen-backdrop">
          <section className="screen-sheet" role="dialog" aria-modal="true">
            <header className="screen-header">
              <button className="nav-button" onClick={closeWorkoutFlow} type="button">
                Back
              </button>
              <div>
                <p className="screen-kicker">Workout plan</p>
                <h2>{selectedDay.day}</h2>
              </div>
            </header>

            <div className="screen-content">
              <div className="workout-title-row">
                <div>
                  <p className="detail-lead">{activeWorkout.detailWorkout}</p>
                  <p className="coaching-note">{activeWorkout.coachingNote}</p>
                </div>
                {selectedDay.homeAlternative ? (
                  <div className="mode-toggle" aria-label="Workout option">
                    <button
                      className={selectedWorkoutMode === "gym" ? "active" : ""}
                      onClick={() => {
                        setSelectedWorkoutMode("gym");
                        setSelectedExercise(null);
                      }}
                      type="button"
                    >
                      Gym
                    </button>
                    <button
                      className={selectedWorkoutMode === "home" ? "active" : ""}
                      onClick={() => {
                        setSelectedWorkoutMode("home");
                        setSelectedExercise(null);
                      }}
                      type="button"
                    >
                      Home
                    </button>
                  </div>
                ) : null}
              </div>

              {activeWorkout.detailSections.map((section, index) => (
                <div className="detail-section" key={`${selectedDay.day}-${selectedWorkoutMode}-${index}`}>
                  {section.title ? <h3>{section.title}</h3> : null}
                  <div className="exercise-list">
                    {section.items.map((item) => {
                      if (typeof item === "string") {
                        return (
                          <div className="info-row" key={item}>
                            {item}
                          </div>
                        );
                      }

                      const complete = isExerciseComplete(
                        item,
                        currentWeekLogs?.[selectedDay.day]?.[item.name]
                      );
                      const bestExerciseLabel = formatBestExerciseLog(
                        getBestExerciseLog(workoutLogs, item.name)
                      );

                      return (
                        <button
                          className={`exercise-button${complete ? " complete" : ""}`}
                          key={item.name}
                          onClick={() => setSelectedExercise(item)}
                          type="button"
                        >
                          <span className="exercise-name">{item.name}</span>
                          <span className="exercise-meta">{item.sets}</span>
                          {bestExerciseLabel ? (
                            <span className="exercise-best">{bestExerciseLabel}</span>
                          ) : null}
                          <span className="exercise-status">
                            {complete ? (
                              <>
                                <svg
                                  aria-hidden="true"
                                  className="exercise-status-icon"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M5 12.5l4.2 4.2L19 7"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.8"
                                  />
                                </svg>
                                Complete
                              </>
                            ) : (
                              "Not complete"
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {selectedExercise ? (
            <section className="screen-sheet screen-sheet-front" role="dialog" aria-modal="true">
              <header className="screen-header">
                <button className="nav-button" onClick={() => setSelectedExercise(null)} type="button">
                  Back
                </button>
                <div>
                  <p className="screen-kicker">Exercise details</p>
                  <h2>{selectedExercise.name}</h2>
                </div>
              </header>

              <div className="screen-content exercise-screen">
                <p className="exercise-sets">{selectedExercise.sets}</p>
                <p>{selectedExercise.instructions}</p>
                <div className="cue-list">
                  {selectedExercise.cues.map((cue) => (
                    <span className="cue-chip" key={cue}>
                      {cue}
                    </span>
                  ))}
                </div>
                <div className="log-card">
                  <p className="exercise-preview-label">This week</p>
                  <div className="log-grid">
                    {selectedExercise.tracking.weight ? (
                      <label className="log-field">
                        <span>Weight</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="e.g. 22.5kg"
                          value={selectedExerciseLog.weight ?? ""}
                          onChange={(event) =>
                            updateExerciseLog(
                              selectedDay.day,
                              selectedExercise.name,
                              "weight",
                              event.target.value
                            )
                          }
                        />
                      </label>
                    ) : null}
                    {selectedExercise.tracking.reps ? (
                      <label className="log-field">
                        <span>Reps</span>
                        <input
                          type="text"
                          inputMode="text"
                          autoCapitalize="off"
                          autoCorrect="off"
                          placeholder="e.g. 8, 8, 7"
                          value={selectedExerciseLog.reps ?? ""}
                          onChange={(event) =>
                            updateExerciseLog(
                              selectedDay.day,
                              selectedExercise.name,
                              "reps",
                              event.target.value
                            )
                          }
                        />
                      </label>
                    ) : null}
                  </div>
                  <div className="exercise-actions">
                    <span className={selectedExerciseComplete ? "status-pill done" : "status-pill"}>
                      {selectedExerciseComplete ? "Exercise complete" : "Exercise not complete"}
                    </span>
                    {!selectedExerciseComplete ? (
                      <button
                        className="secondary-button mark-complete-button"
                        onClick={() =>
                          markExerciseComplete(selectedDay.day, selectedExercise.name)
                        }
                        type="button"
                      >
                        Mark complete
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="log-card muted">
                  <p className="exercise-preview-label">Most recent previous entry</p>
                  {previousExerciseLog?.weight || previousExerciseLog?.reps ? (
                    <p className="previous-week">
                      {previousExerciseLog.weight ? `Weight: ${previousExerciseLog.weight}` : ""}
                      {previousExerciseLog.weight && previousExerciseLog.reps ? " | " : ""}
                      {previousExerciseLog.reps ? `Reps: ${previousExerciseLog.reps}` : ""}
                      {previousExerciseLabel ? ` | ${previousExerciseLabel}` : ""}
                    </p>
                  ) : (
                    <p className="previous-week">No previous data saved yet.</p>
                  )}
                </div>
                <p className="exercise-alt">
                  <strong>Alternative:</strong> {selectedExercise.alternatives}
                </p>
                <button
                  className="save-button"
                  onClick={() => setSelectedExercise(null)}
                  type="button"
                >
                  Save exercise
                </button>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default App;
