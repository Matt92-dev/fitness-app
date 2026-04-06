import { useEffect, useState } from "react";
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
  const completedDays = Object.values(progress).filter(
    (entry) => entry.workout && entry.meals
  ).length;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

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
        <section className="carousel" aria-label="Weekly plan">
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
                  View full details
                </button>
              </article>
            );
          })}
        </section>
      </main>

      {selectedDay ? (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="close-button"
              onClick={() => setSelectedDay(null)}
              aria-label="Close details"
            >
              x
            </button>

            <h2 id="modal-title">{selectedDay.detailTitle}</h2>
            <h3>Workout</h3>
            <p className="detail-lead">{selectedDay.detailWorkout}</p>

            {selectedDay.detailSections.map((section, index) => (
              <div className="detail-section" key={`${selectedDay.day}-${index}`}>
                {section.title ? <h4>{section.title}</h4> : null}
                <ul>
                  {section.items.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}

            <h3>Meals</h3>
            <p>
              <strong>Breakfast:</strong> {selectedDay.meals.breakfast}
            </p>
            <p>
              <strong>Lunch:</strong> {selectedDay.meals.lunch}
            </p>
            <p>
              <strong>Dinner:</strong> {selectedDay.meals.dinner}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
