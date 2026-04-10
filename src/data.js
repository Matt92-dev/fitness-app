const mealPlan = {
  breakfast: "Muesli with Milk",
  lunch: "Egg & Bacon Sandwich",
  dinner: "Grilled Chicken with Sweet Potato Mash"
};

function lift(
  name,
  sets,
  image,
  cues,
  instructions,
  alternatives,
  tracking = { weight: true, reps: true }
) {
  return { name, sets, image, cues, instructions, alternatives, tracking };
}

export const weeklyPlan = [
  {
    day: "Monday",
    workoutLabel: "Workout Completed",
    mealsLabel: "Meal Plan Followed",
    workoutSummary: "Upper A (Gym, 1 hour)",
    workoutDescription:
      "Horizontal push and pull focus with shoulders and arms to start the week strong.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Monday - Workout Plan",
    detailWorkout: "Upper A",
    coachingNote: "Aim for smooth reps and leave one or two reps in reserve on the compounds.",
    detailSections: [
      {
        title: "Warm-up",
        items: [
          "5 minutes of light cardio",
          "Band pull-aparts or shoulder mobility",
          "2 lighter ramp-up sets before your first press and first row"
        ]
      },
      {
        title: "Main work",
        items: [
          lift(
            "Bench Press",
            "4 x 6-8",
            "/exercises/press.svg",
            ["Plant feet firmly", "Lower to mid chest", "Drive up without flaring elbows"],
            "Use a steady lower, light pause, and controlled press. Add weight once all sets feel solid.",
            "Machine chest press or dumbbell bench press"
          ),
          lift(
            "Chest-Supported Row",
            "4 x 8-10",
            "/exercises/row.svg",
            ["Keep chest glued to pad", "Pull elbows toward hips", "Pause briefly at the top"],
            "Focus on upper-back tension instead of yanking the weight. Let the shoulder blades move naturally.",
            "Seated cable row"
          ),
          lift(
            "Incline Dumbbell Press",
            "3 x 8-10",
            "/exercises/press.svg",
            ["Keep wrists stacked", "Control the stretch", "Press up and slightly inward"],
            "Use a moderate bench angle and keep the movement smooth rather than chasing heavy reps.",
            "Incline machine press"
          ),
          lift(
            "Lat Pulldown",
            "3 x 8-10",
            "/exercises/pulldown.svg",
            ["Chest tall", "Pull elbows down", "Avoid leaning way back"],
            "Pull to the upper chest and control the return so your lats stay working the whole time.",
            "Assisted pull-up"
          ),
          lift(
            "Dumbbell Lateral Raises",
            "3 x 12-15",
            "/exercises/raise.svg",
            ["Soft elbows", "Raise to shoulder height", "Keep traps relaxed"],
            "Use lighter weight than you think and keep tension on the side delts throughout.",
            "Cable lateral raise"
          ),
          lift(
            "Cable Tricep Pushdowns",
            "3 x 10-12",
            "/exercises/arms.svg",
            ["Upper arms still", "Lock out hard", "Control the return"],
            "Think about extending through the elbow rather than just moving the handle.",
            "Overhead rope extensions"
          ),
          lift(
            "Barbell or Dumbbell Curls",
            "3 x 10-12",
            "/exercises/arms.svg",
            ["Keep elbows close", "No swinging", "Squeeze at the top"],
            "Use a full range and keep the movement strict so the biceps do the work.",
            "EZ bar curl"
          )
        ]
      }
    ],
    meals: mealPlan
  },
  {
    day: "Tuesday",
    workoutLabel: "Workout Completed",
    mealsLabel: "Meal Plan Followed",
    workoutSummary: "Lower A (Gym, 1 hour)",
    workoutDescription:
      "Quad-focused lower body session with hinge work, calves, and a short core finish.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Tuesday - Workout Plan",
    detailWorkout: "Lower A",
    coachingNote: "Stay disciplined on rest times so the lower session fits neatly into the hour.",
    detailSections: [
      {
        title: "Warm-up",
        items: [
          "5 minutes of bike or incline walk",
          "Hip openers and ankle mobility",
          "2 progressive warm-up sets before squats"
        ]
      },
      {
        title: "Main work",
        items: [
          lift(
            "Back Squat or Leg Press",
            "4 x 6-8",
            "/exercises/squat.svg",
            ["Brace before each rep", "Drive knees over toes", "Keep reps consistent"],
            "Pick the option you can progress steadily with good form. Prioritize depth you can own.",
            "Hack squat"
          ),
          lift(
            "Romanian Deadlift",
            "3 x 8-10",
            "/exercises/hinge.svg",
            ["Push hips back", "Soft knees", "Keep the bar close"],
            "Chase a strong hamstring stretch and keep your back position fixed throughout.",
            "Dumbbell RDL"
          ),
          lift(
            "Walking Lunges or Split Squats",
            "3 x 10 each leg",
            "/exercises/lunge.svg",
            ["Take a stable step", "Stay balanced", "Drive through full foot"],
            "Use a controlled tempo and keep the torso steady instead of rushing the set.",
            "Reverse lunges"
          ),
          lift(
            "Leg Curl",
            "3 x 10-12",
            "/exercises/hinge.svg",
            ["Hips pinned down", "Curl fully", "Lower slowly"],
            "Think about squeezing the hamstrings hard at the back of each rep.",
            "Seated or lying variation"
          ),
          lift(
            "Standing Calf Raises",
            "3 x 12-15",
            "/exercises/calves.svg",
            ["Pause at the top", "Deep stretch at the bottom", "Stay controlled"],
            "Slow reps work best here. Let the calf actually stretch before driving back up.",
            "Leg press calf raise"
          ),
          lift(
            "Plank",
            "3 x 45-60 sec",
            "/exercises/core.svg",
            ["Ribs down", "Glutes squeezed", "Keep body in one line"],
            "Make it hard by bracing hard rather than simply surviving the clock.",
            "Dead bug",
            { weight: false, reps: false }
          )
        ]
      }
    ],
    meals: mealPlan
  },
  {
    day: "Wednesday",
    workoutLabel: "Recovery Completed",
    mealsLabel: "Meal Plan Followed",
    workoutSummary: "Active Recovery",
    workoutDescription:
      "A lighter day to recover between lower and upper sessions while still staying moving.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Wednesday - Workout Plan",
    detailWorkout: "Active Recovery",
    coachingNote: "The goal is to feel better leaving the session than when you started.",
    detailSections: [
      {
        title: "Recovery ideas",
        items: [
          "20-30 minute brisk walk, easy cycle, or light jog",
          "10-15 minutes of mobility or stretching",
          "Optional posture, shoulder, or core work if energy is good"
        ]
      }
    ],
    meals: mealPlan
  },
  {
    day: "Thursday",
    workoutLabel: "Workout Completed",
    mealsLabel: "Meal Plan Followed",
    workoutSummary: "Upper B (Gym, 1 hour)",
    workoutDescription:
      "Second upper session with more vertical pressing and pulling plus chest and arm support work.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Thursday - Workout Plan",
    detailWorkout: "Upper B",
    coachingNote: "Keep the pressing crisp and avoid grinding every set this close to the end of the week.",
    detailSections: [
      {
        title: "Warm-up",
        items: [
          "5 minutes of light cardio",
          "Band pull-aparts and shoulder circles",
          "2 ramp-up sets before overhead press"
        ]
      },
      {
        title: "Main work",
        items: [
          lift(
            "Overhead Press",
            "4 x 6-8",
            "/exercises/press.svg",
            ["Brace abs hard", "Press straight up", "Keep glutes squeezed"],
            "Keep the bar path tight and avoid turning it into a standing incline press.",
            "Seated dumbbell shoulder press"
          ),
          lift(
            "Pull-Ups or Lat Pulldown",
            "4 x 8-10",
            "/exercises/pulldown.svg",
            ["Start from a dead hang or full stretch", "Drive elbows down", "Stay smooth"],
            "Pick the variation that lets you stay in the target rep range with solid control.",
            "Neutral-grip pulldown"
          ),
          lift(
            "Flat Dumbbell Press",
            "3 x 8-10",
            "/exercises/press.svg",
            ["Shoulder blades set", "Control the stretch", "Press smoothly to full lockout"],
            "This gives you chest volume without repeating the same incline pattern from Monday.",
            "Weighted push-ups"
          ),
          lift(
            "Single-Arm Dumbbell Row",
            "3 x 8-10",
            "/exercises/row.svg",
            ["Long reach at bottom", "Drive elbow back", "Do not twist hard"],
            "Keep the torso stable and use the back to pull instead of jerking with momentum.",
            "Single-arm cable row"
          ),
          lift(
            "Cable or Pec Deck Fly",
            "2 x 12-15",
            "/exercises/fly.svg",
            ["Soft elbows", "Big chest stretch", "Squeeze inward under control"],
            "Treat this as controlled chest isolation rather than a heavy press.",
            "Dumbbell fly"
          ),
          lift(
            "Hammer Curls",
            "3 x 10-12",
            "/exercises/arms.svg",
            ["Neutral grip", "Elbows steady", "Squeeze at the top"],
            "Keep these strict and let the forearms and brachialis do the work.",
            "Rope hammer curl"
          ),
          lift(
            "Overhead Tricep Extensions",
            "3 x 10-12",
            "/exercises/arms.svg",
            ["Elbows point up", "Full stretch", "Extend smoothly"],
            "This pairs well after pressing because it trains the long head in a stretched position.",
            "Skull crushers"
          )
        ]
      }
    ],
    meals: mealPlan
  },
  {
    day: "Friday",
    workoutLabel: "Workout Completed",
    mealsLabel: "Meal Plan Followed",
    workoutSummary: "Lower B (Gym, 1 hour)",
    workoutDescription:
      "Second lower day with unilateral work, glutes and hamstrings, calves, and abs.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Friday - Workout Plan",
    detailWorkout: "Lower B",
    coachingNote: "This day should feel productive, not wrecking. Stay consistent and finish the week well.",
    detailSections: [
      {
        title: "Warm-up",
        items: [
          "5 minutes of light cardio",
          "Hip openers and bodyweight squats",
          "1-2 ramp-up sets before your first squat pattern"
        ]
      },
      {
        title: "Main work",
        items: [
          lift(
            "Front Squat, Hack Squat, or Goblet Squat",
            "3 x 8-10",
            "/exercises/squat.svg",
            ["Stay upright", "Brace before each rep", "Own the bottom position"],
            "Choose the variation that feels best on your joints and lets you train hard without rushing.",
            "Leg press"
          ),
          lift(
            "Bulgarian Split Squats",
            "3 x 8-10 each leg",
            "/exercises/lunge.svg",
            ["Long enough stance", "Stay balanced", "Push through front leg"],
            "These are tough, so start lighter and keep the reps controlled and even side to side.",
            "Rear-foot elevated split squat machine if available"
          ),
          lift(
            "Hip Thrust or Glute Bridge",
            "3 x 8-10",
            "/exercises/hinge.svg",
            ["Chin tucked", "Posterior tilt at top", "Pause on lockout"],
            "Drive through the heels and finish with glutes rather than overextending the lower back.",
            "Smith machine hip thrust"
          ),
          lift(
            "Seated or Lying Leg Curl",
            "3 x 10-12",
            "/exercises/hinge.svg",
            ["Control the lowering", "Squeeze hard", "Stay planted"],
            "Use this to finish the hamstrings properly after the bigger lifts.",
            "Single-leg curl"
          ),
          lift(
            "Seated Calf Raises",
            "3 x 12-15",
            "/exercises/calves.svg",
            ["Full range", "Pause at top", "Do not bounce"],
            "Take your time and make every rep look the same.",
            "Standing calf raise"
          ),
          lift(
            "Hanging Knee Raises or Cable Crunches",
            "3 x 12-15",
            "/exercises/core.svg",
            ["Brace first", "Move with control", "Do not swing"],
            "Finish with deliberate core work rather than racing through the reps.",
            "Reverse crunch",
            { weight: false, reps: true }
          )
        ]
      }
    ],
    meals: mealPlan
  },
  {
    day: "Saturday",
    workoutLabel: "Optional Session Completed",
    mealsLabel: "Meal Plan Followed",
    workoutSummary: "Optional Cardio or Bonus Session",
    workoutDescription:
      "Use the weekend for cardio, extra steps, mobility, or a short bonus gym session if you have time.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Saturday - Workout Plan",
    detailWorkout: "Optional Cardio or Bonus Session",
    coachingNote: "This is a bonus day, not a requirement. Use it to support the week rather than dig a recovery hole.",
    detailSections: [
      {
        title: "Good options",
        items: [
          "30-45 minutes of steady cardio",
          "Short arms, shoulders, or core pump session",
          "Extra mobility and recovery work if energy is low"
        ]
      }
    ],
    meals: mealPlan
  },
  {
    day: "Sunday",
    workoutLabel: "Recovery Completed",
    mealsLabel: "Meal Plan Followed",
    workoutSummary: "Rest or Light Recovery",
    workoutDescription: "Keep Sunday relaxed so you start Monday fresh and ready to train again.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Sunday - Workout Plan",
    detailWorkout: "Rest or Light Recovery",
    coachingNote: "Think sleep, food, hydration, and a bit of light movement if it feels good.",
    detailSections: [
      {
        title: "Simple plan",
        items: [
          "Full rest if needed",
          "Easy walk and light stretching",
          "Keep the day low effort and recovery focused"
        ]
      }
    ],
    meals: mealPlan
  }
];
