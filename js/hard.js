let hearts = 5;
let currentQuestion = 0;
let correctAnswers = 0;
let gameOver = false;
let level = "hard";
let levelsUnlocked = {
  simple: true,
  medium: true,
  hard: true,
};

const questions = [
  {
    question:
      "Which fort in India is believed to be cursed and forbids entry after dark?",
    options: [
      "Golconda Fort",
      "Bhangarh Fort",
      "Nahargarh Fort",
      "Jaisalmer Fort",
    ],
    answer: 1,
  },
  {
    question: "What is said to haunt the Grand Paradi Towers in Mumbai?",
    options: [
      "A weeping woman",
      "The spirit of a builder",
      "Multiple suicides",
      "A crying child",
    ],
    answer: 2,
  },
  {
    question: "Where is the GP Block haunted house located?",
    options: ["Delhi", "Kolkata", "Meerut", "Lucknow"],
    answer: 2,
  },
  {
    question:
      "Which place is associated with the ghost of a woman in red saree on railway tracks?",
    options: [
      "Begunkodor Station",
      "Pune Junction",
      "Churchgate Station",
      "Howrah Station",
    ],
    answer: 0,
  },
  {
    question: "What reportedly happens at Shaniwarwada Fort during full moons?",
    options: [
      "Flickering lights",
      "Echoes of screaming boy",
      "Animal sightings",
      "Blood stains",
    ],
    answer: 1,
  },
  {
    question:
      "Where is the haunted tale of Savoy Hotel and Lady Garnet Orme from?",
    options: ["Darjeeling", "Mussoorie", "Ooty", "Shimla"],
    answer: 1,
  },
  {
    question:
      "Which cemetery in India is believed to have a gate that vanishes at night?",
    options: [
      "Lothian Cemetery",
      "Park Street Cemetery",
      "Scotch Cemetery",
      "South Park Cemetery",
    ],
    answer: 0,
  },
  {
    question:
      "What is the infamous haunted place in West Bengal related to black magic and rituals?",
    options: ["Kurseong", "Jatinga", "Kolkata Dockyard", "Tarapith"],
    answer: 3,
  },
  {
    question:
      "Which Indian hill station has tales of ghosts haunting empty hotels?",
    options: ["Darjeeling", "Lonavala", "Matheran", "Mount Abu"],
    answer: 1,
  },
  {
    question:
      "Where was the ghost of a British soldier reportedly seen standing guard after death?",
    options: ["Lucknow Residency", "Fort William", "Mehrauli", "Savoy Hotel"],
    answer: 0,
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
      `${API_BASE_URL}/get-user-progress?userId=${userId}`
    );
    const result = await response.json();
    if (response.ok) {
      console.log("User progress fetched:", result);
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
    questionText.textContent = `Question ${currentQuestion + 1}: ${questions[currentQuestion].question
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
      badgeText.textContent = `Congratulations! You earned the ${level.charAt(0).toUpperCase() + level.slice(1)
        } Level Badge!`;
      badge.style.display = "block";
      saveUserProgress();
      saveUserScore();
      if (correctAnswers === 10) {
        showFinalBadge();
      }
    }
  } else {
    saveUserScore();
    showGameOver();
  }
}

function unlockNextLevel() {
  // No next level after Hard
}

function proceedToNextLevel() {
  window.location.href = "rules.html";
}

function showFinalBadge() {
  const finalBadge = document.getElementById("final-badge");
  const badge = document.getElementById("badge");
  if (finalBadge) {
    if (badge) badge.style.display = "none"; // Hide regular badge
    finalBadge.style.display = "block";
    saveUserProgress(true); // Save special badge
    saveUserScore(); // Save score when final badge is shown
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

function saveUserProgress(isSpecial = false) {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found in localStorage");
    return;
  }

  const badges = [`${level}-level-badge`];
  if (isSpecial) {
    badges.push("special-badge");
  }

  const userProgress = { userId, badges };

  fetch(`${API_BASE_URL}/save-user-progress`, {
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

  fetch(`${API_BASE_URL}/save-user-score`, {
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