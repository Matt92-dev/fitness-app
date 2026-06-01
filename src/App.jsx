import { useEffect, useState } from "react";
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
  { label: "Profile", icon: "profile" }
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
  if (name === "home") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 19V11" />
        <path d="M12 19V5" />
        <path d="M19 19v-8" />
        <path d="M4 19h16" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 9h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4.5 20a8 8 0 0 1 15 0" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (name === "calendar-small") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 9h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m9 5 7 7-7 7" />
      </svg>
    );
  }

  return null;
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

function App() {
  const [workoutLogs, setWorkoutLogs] = useState(getInitialWorkoutLogs);
  const [authentication, setAuthentication] = useState("checking");
  const [apiSyncReady, setApiSyncReady] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedWorkoutMode, setSelectedWorkoutMode] = useState("gym");
  const currentWeekKey = getWeekKey();
  const currentWeekLogs = workoutLogs[currentWeekKey] ?? {};
  const mainTrainingDays = weeklyPlan.filter((dayPlan) => getExerciseItems(dayPlan).length > 0);
  const completedDays = mainTrainingDays.filter((dayPlan) =>
    getDayProgress(dayPlan, currentWeekLogs).isComplete
  ).length;
  const mainProgressPercent = Math.round((completedDays / mainTrainingDays.length) * 100);
  const currentWeekRange = getCurrentWeekRange();
  const todayName = DAY_NAMES[new Date().getDay()];

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
      <header className="dashboard-hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Personal fitness dashboard</p>
          <h1>Weekly Workout Tracker</h1>
          <p className="hero-copy">
            Focus on the workout, log what you lift, and let the app roll into a fresh
            week automatically.
          </p>
        </div>
        <button className="logout-button" onClick={handleLogout} type="button">
          Log out
        </button>
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
              <h2>Main training days</h2>
              <p>{completedDays} of {mainTrainingDays.length} completed</p>
              <div className="overview-progress">
                <span style={{ width: `${mainProgressPercent}%` }} />
              </div>
            </div>
          </div>
            <div className="week-dots" aria-label="Week days">
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
        </section>

        <section className="week-section" aria-label="This week">
          <div className="section-heading">
            <h2>This week</h2>
            <span>
              <AppIcon name="calendar-small" />
              {currentWeekRange}
            </span>
          </div>

          <div className="workout-carousel">
          {weeklyPlan.map((item) => {
            const progress = getDayProgress(item, currentWeekLogs);
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
                key={item.day}
                data-day={item.day}
                onClick={() => openWorkoutDay(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openWorkoutDay(item);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="tile-header">
                  <h2>{item.day}</h2>
                  <span className={progress.isComplete ? "badge done" : "badge"}>
                    {statusText}
                  </span>
                  <span className="tile-menu" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>

                <div className="tile-body">
                  <div className="summary">
                    <p className="workout-title">{getWorkoutLabel(item.workoutSummary)}</p>
                    <p className="workout-meta">{getWorkoutMeta(item.workoutSummary)}</p>
                    <p>{item.workoutDescription}</p>
                  </div>
                  <span className="tile-arrow" aria-hidden="true">
                    <AppIcon name="arrow" />
                  </span>
                </div>

                <div className="tracking">
                  <div className="progress-row">
                    <p className="progress-line">
                      {progress.total > 0
                        ? `${progress.completed}/${progress.total} exercises completed`
                        : "Recovery or optional session"}
                    </p>
                    <span>{percent}%</span>
                  </div>
                  <div className="card-progress">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        {NAV_ITEMS.map((item, index) => (
          <button className={index === 0 ? "active" : ""} type="button" key={item.label}>
            <AppIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

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
