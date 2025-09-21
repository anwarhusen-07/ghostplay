let hearts = 5;
let currentQuestion = 0;
let correctAnswers = 0;
let gameOver = false;
let level = "medium";
let levelsUnlocked = {
  simple: true,
  medium: true,
  hard: false,
};

const questions = [
  {
    question:
      "Which haunted Indian place is associated with the legend of a wizard and a princess?",
    options: [
      "Kuldhara Village",
      "Bhangarh Fort",
      "Shaniwarwada",
      "GP Block Meerut",
    ],
    answer: 1,
  },
  {
    question:
      "What is special about Dumas Beach that makes it famous among ghost hunters?",
    options: [
      "Black sand and paranormal sounds",
      "White sand and dolphin sightings",
      "Temples with no idols",
      "Lighthouse that flickers mysteriously",
    ],
    answer: 0,
  },
  {
    question:
      "Which Indian prison is considered one of the most haunted places?",
    options: [
      "Tihar Jail",
      "Rajahmundry Jail",
      "Yerwada Jail",
      "Cellular Jail",
    ],
    answer: 3,
  },
  {
    question:
      "Which road in India is believed to be haunted and drivers are warned not to stop?",
    options: [
      "Sathyamangalam Forest Road",
      "Delhi Cantonment Road",
      "East Coast Road",
      "NH-17 Mumbai-Goa Highway",
    ],
    answer: 1,
  },
  {
    question:
      "Where in Rajasthan is the 'curse of the Paliwal Brahmins' said to exist?",
    options: ["Barmer", "Pushkar", "Kuldhara", "Jodhpur"],
    answer: 2,
  },
  {
    question:
      "Which haunted building in Meerut is known for ghostly sightings of men drinking beer?",
    options: [
      "GP Block",
      "SP Bungalow",
      "Civil Lines House",
      "Cantt Mess House",
    ],
    answer: 0,
  },
  {
    question:
      "Which Indian film was inspired by the real-life haunted house in Rajasthan?",
    options: ["Stree", "1920", "Bhoot", "Phoonk"],
    answer: 1,
  },
  {
    question:
      "Which palace in Pune is believed to be haunted by a young prince?",
    options: [
      "Aga Khan Palace",
      "Shaniwarwada",
      "Lal Mahal",
      "Vishrambaug Wada",
    ],
    answer: 1,
  },
  {
    question: "In which Indian city is the haunted 'Tower of Silence' located?",
    options: ["Chennai", "Hyderabad", "Mumbai", "Ahmedabad"],
    answer: 2,
  },
  {
    question: "Which former hospital in Delhi is now said to be haunted?",
    options: [
      "Safdarjung Hospital",
      "Lady Hardinge",
      "Delhi Ridge TB Hospital",
      "Sanjay Van Hospital",
    ],
    answer: 2,
  },
];

async function fetchUserProgress() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found in localStorage");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/get-user-progress?userId=${userId}`
    );
    const result = await response.json();
    if (response.ok) {
      const badges = result.badges || [];
      levelsUnlocked.hard = badges.includes("medium-level-badge");
    } else {
      console.error("Error fetching user progress:", result.message);
    }
  } catch (error) {
    console.error("Error fetching user progress:", error);
  }
}

function startQuiz(selectedLevel) {
  if (levelsUnlocked[selectedLevel]) {
    window.location.href = `${selectedLevel}.html`;
  } else {
    alert(
      `You need to solve at least 7 questions in the previous level to unlock ${selectedLevel}!`
    );
  }
}

function updateQuestion() {
  const questionText = document.getElementById("question-text");
  const scoreText = document.getElementById("score-text");
  if (questionText) {
    questionText.textContent = `Question ${currentQuestion + 1}: ${
      questions[currentQuestion].question
    }`;
    let buttons = document.querySelectorAll(".options button");
    buttons.forEach((button, index) => {
      button.textContent = `${questions[currentQuestion].options[index]}`;
    });
  }
  if (scoreText) {
    scoreText.textContent = `Score: ${correctAnswers}/10`;
  }
}

const bgMusic = document.getElementById("background-music");
function checkAnswer(selected) {
  if (gameOver) return;

  let correctAnswer = questions[currentQuestion].answer;
  let winningSound = document.getElementById("winning-sound");
  let scarySound = document.getElementById("scary-sound");

  if (selected === correctAnswer) {
    scarySound.pause();
    scarySound.currentTime = 0;

    winningSound.play().catch(function (error) {
      console.log("Winning sound playback failed: ", error);
    });

    if (bgMusic) {
      bgMusic.play().catch(function (error) {
        console.log("Background music resume failed: ", error);
      });
    }

    correctAnswers++;
    nextQuestion();
  } else {
    winningSound.pause();
    winningSound.currentTime = 0;

    scarySound.play().catch(function (error) {
      console.log("Scary sound playback failed: ", error);
    });

    if (bgMusic) {
      bgMusic.play().catch(function (error) {
        console.log("Background music resume failed: ", error);
      });
    }

    hearts--;
    showScaryEffect();

    const heart = document.getElementById(`heart${hearts + 1}`);
    if (heart) {
      heart.style.transform = "scale(1.5)";
      heart.style.transition = "transform 0.2s ease";
      setTimeout(() => {
        heart.style.display = "none";
      }, 200);
    }

    if (hearts <= 0) {
      gameOver = true;
      showGameOver();
    }
  }
}

function showScaryEffect() {
  const scaryEffect = document.getElementById("scary-effect");
  const scaryImage = document.getElementById("scary-image");
  const wrongText = document.getElementById("wrong-answer-text");

  scaryEffect.style.display = "flex";

  setTimeout(() => {
    scaryImage.classList.add("zoom");

    setTimeout(() => {
      wrongText.style.opacity = "1";
    }, 800);

    setTimeout(() => {
      scaryImage.classList.remove("zoom");
      wrongText.style.opacity = "0";

      setTimeout(() => {
        scaryEffect.style.display = "none";
      }, 500);
    }, 3000);
  }, 10);
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    updateQuestion();
  } else {
    showBadgeAndLevelTransition();
  }
}

function showBadgeAndLevelTransition() {
  if (correctAnswers >= 7) {
    allowVisibilityCheck = false;
    const badge = document.getElementById("badge");
    const badgeText = document.getElementById("badge-text");
    if (badge && badgeText) {
      badgeText.textContent = `Congratulations! You earned the ${
        level.charAt(0).toUpperCase() + level.slice(1)
      } Level Badge!`;
      badge.style.display = "block";
      unlockNextLevel();
      saveUserProgress();
      saveUserScore();
    }
  } else {
    saveUserScore();
    showGameOver();
  }
}

function unlockNextLevel() {
  if (correctAnswers >= 7) {
    if (level === "medium") {
      levelsUnlocked.hard = true;
    }
  }
}

function proceedToNextLevel() {
  if (level === "simple") {
    window.location.href = "medium.html";
  } else if (level === "medium") {
    window.location.href = "hard.html";
  } else {
    window.location.href = "rules.html";
  }
}

function showGameOver() {
  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverImage = document.getElementById("game-over-image");
  const gameOverText = document.getElementById("game-over-text");
  const rulesButton = document.getElementById("rules-button");

  gameOverScreen.style.display = "flex";

  setTimeout(() => {
    gameOverImage.classList.add("zoom");

    setTimeout(() => {
      gameOverText.style.opacity = "1";
    }, 1000);

    setTimeout(() => {
      rulesButton.style.opacity = "1";
      rulesButton.style.transform = "translateY(0)";
    }, 1500);
  }, 10);

  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}

function saveUserProgress() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found in localStorage");
    return;
  }

  const userProgress = {
    userId,
    badges: [`${level}-level-badge`],
  };

  fetch("http://localhost:3000/save-user-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userProgress),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("User progress saved:", data);
    })
    .catch((error) => {
      console.error("Error saving user progress:", error);
    });
}

function saveUserScore() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found in localStorage");
    return;
  }

  const userScore = {
    userId,
    level,
    score: correctAnswers,
  };

  fetch("http://localhost:3000/save-user-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userScore),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("User score saved:", data);
    })
    .catch((error) => {
      console.error("Error saving user score:", error);
    });
}

let allowVisibilityCheck = true;

function handleVisibilityChange() {
  if (document.hidden && allowVisibilityCheck && !gameOver) {
    alert("You switched windows! Returning to rules page.");
    window.location.href = "rules.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateQuestion();
  const heartsElements = document.querySelectorAll(".heart");
  if (heartsElements) {
    heartsElements.forEach((heart) => heart.classList.add("active"));
  }
  fetchUserProgress();

  document.addEventListener("visibilitychange", handleVisibilityChange);
});