import { useEffect, useRef, useState } from "react";
import { weeklyPlan } from "./data";

const STORAGE_KEY = "fitness-tracker-progress-v1";
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

    if (entry?.weight || entry?.reps) {
      return { ...entry, weekKey: key };
    }
  }

  return null;
}

function getInitialProgress() {
  const emptyState = weeklyPlan.reduce((accumulator, day) => {
    accumulator[day.day] = { workout: false, meals: false };
    return accumulator;
  }, {});

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return emptyState;
  }

  try {
    return { ...emptyState, ...JSON.parse(saved) };
  } catch {
    return emptyState;
  }
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

function App() {
  const [progress, setProgress] = useState(getInitialProgress);
  const [workoutLogs, setWorkoutLogs] = useState(getInitialWorkoutLogs);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const carouselRef = useRef(null);
  const currentWeekKey = getWeekKey();
  const completedDays = Object.values(progress).filter(
    (entry) => entry.workout && entry.meals
  ).length;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

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
    }
  }, [selectedDay]);

  const toggleProgress = (day, type) => {
    setProgress((current) => ({
      ...current,
      [day]: {
        ...current[day],
        [type]: !current[day][type]
      }
    }));
  };

  const resetAllProgress = () => {
    setProgress(getInitialProgress());
  };

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

  const openWorkoutDay = (day) => {
    setSelectedDay(day);
    setSelectedExercise(null);
  };

  const closeWorkoutFlow = () => {
    setSelectedDay(null);
    setSelectedExercise(null);
  };

  const selectedExerciseLog =
    selectedDay && selectedExercise
      ? workoutLogs[currentWeekKey]?.[selectedDay.day]?.[selectedExercise.name] ?? {}
      : {};

  const previousExerciseLog =
    selectedDay && selectedExercise
      ? getMostRecentExerciseLog(
          workoutLogs,
          currentWeekKey,
          selectedDay.day,
          selectedExercise.name
        )
      : null;

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Personal fitness dashboard</p>
          <h1>Weekly Workout and Meal Plan</h1>
          <p className="hero-copy">
            Track your training and meals in one place, then pick up exactly where you
            left off on your phone or laptop.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-value">{completedDays}/7</span>
            <span className="stat-label">days fully completed</span>
          </div>
          <button className="secondary-button" onClick={resetAllProgress}>
            Reset progress
          </button>
        </div>
      </header>

      <main>
        <section className="carousel" aria-label="Weekly plan" ref={carouselRef}>
          {weeklyPlan.map((item) => {
            const status = progress[item.day];
            const dayKey = item.day.toLowerCase();

            return (
              <article className="tile" key={item.day} data-day={item.day}>
                <div className="tile-header">
                  <h2>{item.day}</h2>
                  <span className={status.workout && status.meals ? "badge done" : "badge"}>
                    {status.workout && status.meals ? "On track" : "In progress"}
                  </span>
                </div>

                <div className="summary">
                  <p>
                    <strong>Workout:</strong> {item.workoutSummary}
                  </p>
                  <p>{item.workoutDescription}</p>
                  <p>
                    <strong>Meals:</strong> {item.mealsSummary}
                  </p>
                </div>

                <div className="tracking">
                  <label className="checkbox-row" htmlFor={`${dayKey}-workout`}>
                    <input
                      id={`${dayKey}-workout`}
                      type="checkbox"
                      checked={status.workout}
                      onChange={() => toggleProgress(item.day, "workout")}
                    />
                    <span>{item.workoutLabel}</span>
                  </label>

                  <label className="checkbox-row" htmlFor={`${dayKey}-meals`}>
                    <input
                      id={`${dayKey}-meals`}
                      type="checkbox"
                      checked={status.meals}
                      onChange={() => toggleProgress(item.day, "meals")}
                    />
                    <span>{item.mealsLabel}</span>
                  </label>
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
              <p className="detail-lead">{selectedDay.detailWorkout}</p>
              <p className="coaching-note">{selectedDay.coachingNote}</p>

              {selectedDay.detailSections.map((section, index) => (
                <div className="detail-section" key={`${selectedDay.day}-${index}`}>
                  {section.title ? <h3>{section.title}</h3> : null}
                  <div className="exercise-list">
                    {section.items.map((item) =>
                      typeof item === "string" ? (
                        <div className="info-row" key={item}>
                          {item}
                        </div>
                      ) : (
                        <button
                          className="exercise-button"
                          key={item.name}
                          onClick={() => setSelectedExercise(item)}
                          type="button"
                        >
                          <span className="exercise-name">{item.name}</span>
                          <span className="exercise-meta">{item.sets}</span>
                        </button>
                      )
                    )}
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
