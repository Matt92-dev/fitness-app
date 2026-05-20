import { useEffect, useRef, useState } from "react";
import { weeklyPlan } from "./data";

const WORKOUT_LOGS_KEY = "fitness-tracker-workout-logs-v1";
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedWorkoutMode, setSelectedWorkoutMode] = useState("gym");
  const carouselRef = useRef(null);
  const currentWeekKey = getWeekKey();
  const currentWeekLogs = workoutLogs[currentWeekKey] ?? {};
  const mainTrainingDays = weeklyPlan.filter((dayPlan) => getExerciseItems(dayPlan).length > 0);
  const completedDays = mainTrainingDays.filter((dayPlan) =>
    getDayProgress(dayPlan, currentWeekLogs).isComplete
  ).length;

  useEffect(() => {
    window.localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return undefined;
    }

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      carousel.scrollBy({
        left: event.deltaY,
        behavior: "smooth"
      });
    };

    carousel.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      carousel.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return undefined;
    }

    const today = DAY_NAMES[new Date().getDay()];
    const activeCard = carousel.querySelector(`[data-day="${today}"]`);

    if (!activeCard) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      activeCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

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
            [field]: value
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

  const activeWorkout =
    selectedDay?.homeAlternative && selectedWorkoutMode === "home"
      ? selectedDay.homeAlternative
      : selectedDay;

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Personal fitness dashboard</p>
          <h1>Weekly Workout Tracker</h1>
          <p className="hero-copy">
            Focus on the workout, log what you lift, and let the app roll into a fresh
            week automatically.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-value">{completedDays}/4</span>
            <span className="stat-label">main training days completed</span>
          </div>
        </div>
      </header>

      <main>
        <section className="carousel" aria-label="Weekly plan" ref={carouselRef}>
          {weeklyPlan.map((item) => {
            const progress = getDayProgress(item, currentWeekLogs);

            return (
              <article className="tile" key={item.day} data-day={item.day}>
                <div className="tile-header">
                  <h2>{item.day}</h2>
                  <span className={progress.isComplete ? "badge done" : "badge"}>
                    {progress.total === 0
                      ? "Open"
                      : progress.isComplete
                        ? "Complete"
                        : "In progress"}
                  </span>
                </div>

                <div className="summary">
                  <p>
                    <strong>Workout:</strong> {item.workoutSummary}
                  </p>
                  <p>{item.workoutDescription}</p>
                </div>

                <div className="tracking">
                  <p className="progress-line">
                    {progress.total > 0
                      ? `${progress.completed}/${progress.total} exercises completed this week`
                      : "Use this day for recovery, mobility, or an optional extra session."}
                  </p>
                </div>

                <button className="primary-button" onClick={() => openWorkoutDay(item)}>
                  View workout
                </button>
              </article>
            );
          })}
        </section>
      </main>

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

                      return (
                        <button
                          className={`exercise-button${complete ? " complete" : ""}`}
                          key={item.name}
                          onClick={() => setSelectedExercise(item)}
                          type="button"
                        >
                          <span className="exercise-name">{item.name}</span>
                          <span className="exercise-meta">{item.sets}</span>
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
                          inputMode="numeric"
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
                      {previousExerciseLog.weekKey ? ` | ${previousExerciseLog.weekKey}` : ""}
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
