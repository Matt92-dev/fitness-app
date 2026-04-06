import { useEffect, useRef, useState } from "react";
import { weeklyPlan } from "./data";

const STORAGE_KEY = "fitness-tracker-progress-v1";

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

function App() {
  const [progress, setProgress] = useState(getInitialProgress);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const carouselRef = useRef(null);
  const completedDays = Object.values(progress).filter(
    (entry) => entry.workout && entry.meals
  ).length;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (!selectedDay) {
      setSelectedExercise(null);
      return;
    }

    const firstExercise = selectedDay.detailSections
      .flatMap((section) => section.items)
      .find((item) => typeof item === "object");

    setSelectedExercise(firstExercise ?? null);
  }, [selectedDay]);

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

  const closeWorkoutModal = () => {
    setSelectedDay(null);
    setSelectedExercise(null);
  };

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
              <article className="tile" key={item.day}>
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

                <button className="primary-button" onClick={() => setSelectedDay(item)}>
                  View workout
                </button>
              </article>
            );
          })}
        </section>
      </main>

      {selectedDay ? (
        <div className="modal-backdrop" onClick={closeWorkoutModal}>
          <div
            className="modal-card workout-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="close-button"
              onClick={closeWorkoutModal}
              aria-label="Close details"
            >
              x
            </button>

            <h2 id="modal-title">{selectedDay.detailTitle}</h2>
            <p className="detail-lead">{selectedDay.detailWorkout}</p>
            <p className="coaching-note">{selectedDay.coachingNote}</p>

            <div className="workout-layout">
              <div className="workout-plan">
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
                            className={
                              selectedExercise?.name === item.name
                                ? "exercise-button active"
                                : "exercise-button"
                            }
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

              <aside className="exercise-preview">
                {selectedExercise ? (
                  <>
                    <img
                      className="exercise-image"
                      src={selectedExercise.image}
                      alt={selectedExercise.name}
                    />
                    <p className="exercise-preview-label">Selected exercise</p>
                    <h3>{selectedExercise.name}</h3>
                    <p className="exercise-sets">{selectedExercise.sets}</p>
                    <p>{selectedExercise.instructions}</p>
                    <div className="cue-list">
                      {selectedExercise.cues.map((cue) => (
                        <span className="cue-chip" key={cue}>
                          {cue}
                        </span>
                      ))}
                    </div>
                    <p className="exercise-alt">
                      <strong>Alternative:</strong> {selectedExercise.alternatives}
                    </p>
                  </>
                ) : (
                  <div className="empty-preview">
                    <h3>Workout overview</h3>
                    <p>
                      This day is more open-ended, so use the notes on the left as your guide.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
