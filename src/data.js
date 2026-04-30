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
    workoutSummary: "Upper Push (Gym, 1 hour)",
    workoutDescription:
      "Chest, shoulders, and triceps focus to start the week with your heaviest pushing work.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Monday - Workout Plan",
    detailWorkout: "Upper Push",
    coachingNote: "Start the week by pushing hard on the big compounds, then chase clean upper-body volume.",
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
    workoutSummary: "Upper Pull (Gym, 1 hour)",
    workoutDescription:
      "Back, rear delts, and biceps focus with plenty of pulling volume for upper-body growth.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Tuesday - Workout Plan",
    detailWorkout: "Upper Pull",
    coachingNote: "Focus on controlled pulling and let your back do the work rather than rushing the reps.",
    detailSections: [
      {
        title: "Warm-up",
        items: [
          "5 minutes of light cardio",
          "Band pull-aparts and scapular mobility",
          "2 lighter ramp-up sets before your first row or pulldown"
        ]
      },
      {
        title: "Main work",
        items: [
          lift(
            "Chest-Supported Row",
            "4 x 6-8",
            "/exercises/row.svg",
            ["Chest fixed to the pad", "Drive elbows back", "Pause the squeeze"],
            "Treat this as your heavy upper-back movement and keep the reps smooth and repeatable.",
            "Seated cable row"
          ),
          lift(
            "Pull-Ups or Lat Pulldown",
            "4 x 8-10",
            "/exercises/pulldown.svg",
            ["Stretch fully at the top", "Drive elbows down", "Keep chest up"],
            "Pick the version that lets you stay in control through the full range instead of chasing sloppy reps.",
            "Neutral-grip pulldown"
          ),
          lift(
            "Single-Arm Dumbbell Row",
            "3 x 8-10",
            "/exercises/row.svg",
            ["Reach long at the bottom", "Pull toward your hip", "Do not twist hard"],
            "Use this to get extra quality lat work without rushing the movement.",
            "Single-arm cable row"
          ),
          lift(
            "Face Pulls or Rear Delt Fly",
            "3 x 12-15",
            "/exercises/raise.svg",
            ["Lead with elbows", "Keep shoulders down", "Squeeze upper back"],
            "Use lighter weight and focus on rear delts and upper-back control rather than momentum.",
            "Cable rear delt fly"
          ),
          lift(
            "Hammer Curls",
            "3 x 10-12",
            "/exercises/arms.svg",
            ["Neutral grip", "Elbows steady", "Squeeze at the top"],
            "Keep these strict and let the forearms and biceps do the work.",
            "Rope hammer curl"
          ),
          lift(
            "Barbell or Dumbbell Curls",
            "3 x 12-15",
            "/exercises/arms.svg",
            ["Keep elbows close", "No swinging", "Full range each rep"],
            "Finish the session with a clean biceps pump rather than cheating the load up.",
            "EZ bar curl"
          ),
          lift(
            "Cable Crunches",
            "3 x 10-15",
            "/exercises/core.svg",
            ["Curl ribs toward hips", "Keep hips still", "Control the return"],
            "Use a full crunch rather than just leaning forward. This gives you one direct ab slot early in the week.",
            "Machine crunch",
            { weight: true, reps: true }
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
    workoutSummary: "Lower + Abs (Gym, 1 hour)",
    workoutDescription:
      "One solid lower-body session to keep your legs progressing without taking over the whole week.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Thursday - Workout Plan",
    detailWorkout: "Lower + Abs",
    coachingNote: "Train legs properly, but keep the session efficient so it supports your upper-body focus rather than draining it.",
    detailSections: [
      {
        title: "Warm-up",
        items: [
          "5 minutes of bike or incline walk",
          "Hip openers and ankle mobility",
          "2 progressive warm-up sets before your first squat pattern"
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
            ["Push hips back", "Soft knees", "Keep the load close"],
            "Chase a strong hamstring stretch and keep the hinge controlled rather than jerky.",
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
            "Hanging Knee Raises",
            "3 x 12-15",
            "/exercises/core.svg",
            ["Brace first", "Move with control", "Do not swing"],
            "Curl the pelvis up at the top instead of just lifting the knees halfway. Keep momentum low.",
            "Reverse crunch",
            { weight: false, reps: true }
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
    workoutSummary: "Upper Mixed / Hypertrophy (Gym, 1 hour)",
    workoutDescription:
      "A high-value upper-body session for shoulders, chest, arms, and extra back work to round out the week.",
    mealsSummary:
      "Muesli with Milk, Egg & Bacon Sandwich, Grilled Chicken with Sweet Potato Mash",
    detailTitle: "Friday - Workout Plan",
    detailWorkout: "Upper Mixed / Hypertrophy",
    coachingNote: "This is your pump-and-progress day. Keep the quality high and leave the gym feeling worked, not trashed.",
    detailSections: [
      {
        title: "Warm-up",
        items: [
          "5 minutes of light cardio",
          "Shoulder circles and band work",
          "1-2 ramp-up sets before your first press"
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
            "Use this as your heavier shoulder movement and keep the reps crisp.",
            "Seated dumbbell shoulder press"
          ),
          lift(
            "Flat Dumbbell Press",
            "3 x 8-10",
            "/exercises/press.svg",
            ["Shoulder blades set", "Control the stretch", "Press smoothly to full lockout"],
            "Treat this as quality chest volume rather than an all-out strength test.",
            "Weighted push-ups"
          ),
          lift(
            "Lat Pulldown",
            "3 x 8-10",
            "/exercises/pulldown.svg",
            ["Chest tall", "Pull elbows down", "Control the return"],
            "This keeps another quality back movement in the week without making Friday a full pull day.",
            "Assisted pull-up"
          ),
          lift(
            "Incline Dumbbell Press",
            "3 x 8-10",
            "/exercises/press.svg",
            ["Keep wrists stacked", "Control the stretch", "Press up and slightly inward"],
            "Keep this moderate and smooth to build more upper chest without beating yourself up.",
            "Machine incline press"
          ),
          lift(
            "Dumbbell Lateral Raises",
            "3 x 12-15",
            "/exercises/raise.svg",
            ["Soft elbows", "Raise to shoulder height", "Keep traps relaxed"],
            "This is pure shoulder cap work, so chase tension and control over load.",
            "Cable lateral raise"
          ),
          lift(
            "Cable or Pec Deck Fly",
            "2 x 12-15",
            "/exercises/fly.svg",
            ["Soft elbows", "Big chest stretch", "Squeeze inward under control"],
            "Use this as a chest finisher with quality reps and a full squeeze.",
            "Dumbbell fly"
          ),
          lift(
            "Overhead Tricep Extensions",
            "3 x 10-12",
            "/exercises/arms.svg",
            ["Elbows point up", "Full stretch", "Extend smoothly"],
            "Use this for long-head triceps work after all the pressing.",
            "Skull crushers"
          ),
          lift(
            "Hammer Curls",
            "3 x 10-12",
            "/exercises/arms.svg",
            ["Neutral grip", "Elbows steady", "Squeeze at the top"],
            "Finish with a controlled arm pump and clean technique.",
            "Rope hammer curl"
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
