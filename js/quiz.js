let hearts =5;
let currentQuestion = 0;
let correctAnswers = 0;
let gameOver = false;
let level = "simple";
let levelsUnlocked = {
  simple: true,
  medium: false,
  hard: false,
};

const questions = [
  {
    question: "What is the name of the haunted place in Bhangarh Fort?",
    options: ["Bhangarh", "Bhool Bhulaiyaa", "Dholpur", "Kuldhara"],
    answer: 0,
  },
  {
    question:
      "Which city in India is famously associated with black magic and occult practices?",
    options: ["Kolkata", "Delhi", "Mumbai", "Jaipur"],
    answer: 0,
  },
  {
    question:
      "Which village in Rajasthan is believed to be cursed and abandoned overnight?",
    options: ["Pushkar", "Osian", "Kuldhara", "Bhangarh"],
    answer: 2,
  },
  {
    question: "Which fort is commonly believed to be haunted in India?",
    options: ["Amer Fort", "Chand Baori", "Jaigarh", "Bhangarh"],
    answer: 3,
  },
  {
    question: "What is said to happen if you visit Bhangarh Fort after sunset?",
    options: [
      "You get blessed",
      "You will be cursed",
      "You meet locals",
      "You will hear music",
    ],
    answer: 1,
  },
  {
    question: "Which beach in Gujarat is known for its haunted reputation?",
    options: ["Chorwad Beach", "Mandvi Beach", "Tithal Beach", "Dumas Beach"],
    answer: 3,
  },
  {
    question: "Which hotel in Shimla is believed to have ghost sightings?",
    options: [
      "Hotel Marina",
      "The Oberoi Cecil",
      "Woodville Palace Hotel",
      "Hotel Combermere",
    ],
    answer: 2,
  },
  {
    question:
      "Which place in Delhi is associated with ghostly legends and executions?",
    options: ["Jama Masjid", "Khooni Darwaza", "Lal Qila", "Purana Qila"],
    answer: 1,
  },
  {
    question:
      "Which colonial-era mansion in Pune is known for paranormal reports?",
    options: ["Lal Mahal", "Shaniwarwada", "Aga Khan Palace", "Bungalow No. 3"],
    answer: 1,
  },
  {
    question:
      "Which hill station in India is rumored to have haunted roads and ghost sightings?",
    options: ["Matheran", "Mussoorie", "Ooty", "Lonavala"],
    answer: 1,
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
      levelsUnlocked.medium = badges.includes("simple-level-badge");
      levelsUnlocked.hard = badges.includes("medium-level-badge");
    } else {
      console.error("Error fetching user progress:", result.message);
    }
  } catch (error) {
    console.error("Error fetching user progress:", error);
  }
}

function startQuiz(selectedLevel) {
  if (selectedLevel === "simple") {
    window.location.href = "simple.html";
  } else if (selectedLevel === "medium") {
    if (levelsUnlocked.medium) {
      window.location.href = "medium.html";
    } else {
      alert(
        "You must solve at least 7 questions in the Simple level to unlock Medium."
      );
    }
  } else if (selectedLevel === "hard") {
    if (levelsUnlocked.hard) {
      window.location.href = "hard.html";
    } else {
      alert(
        "You must solve at least 7 questions in the Medium level to unlock Hard."
      );
    }
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
  
  // Display the container but keep image at scale(0)
  scaryEffect.style.display = "flex";
  
  // Force browser to recognize the element before animating
  setTimeout(() => {
    // Add the zoom class to trigger the animation
    scaryImage.classList.add("zoom");
    
    // Display the wrong answer text with delay
    setTimeout(() => {
      wrongText.style.opacity = "1";
    }, 800);
    
    // Hide the scary effect after 3 seconds
    setTimeout(() => {
      scaryImage.classList.remove("zoom");
      wrongText.style.opacity = "0";
      
      // Wait for animation to complete before hiding
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
      badge.style.display = "flex";
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
    if (level === "simple") {
      levelsUnlocked.medium = true;
    } else if (level === "medium") {
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
  
  // First, make the container visible
  gameOverScreen.style.display = "flex";
  
  // Force browser to recognize the element before animating
  setTimeout(() => {
    // Animate the image - it starts slightly zoomed in and then settles to normal size
    gameOverImage.classList.add("zoom");
    
    // After image appears, fade in the text with a slight delay
    setTimeout(() => {
      gameOverText.style.opacity = "1";
      gameOverText.style.transform = "translateY(0)";
    }, 1000);
    
    // Animate the button last
    setTimeout(() => {
      rulesButton.style.opacity = "1";
      rulesButton.style.transform = "translateY(0)";
    }, 1500);
  }, 10);
  
  // Stop any background music
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  
  // Optional: Play a game over sound here
  // const gameOverSound = document.getElementById("game-over-sound");
  // if (gameOverSound) {
  //   gameOverSound.play().catch(function(error) {
  //     console.log("Game over sound playback failed: ", error);
  //   });
  // }
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

let allowVisibilityCheck = false;

function handleVisibilityChange() {
  if (
    allowVisibilityCheck &&
    !gameOver &&
    document.hidden &&
    ["simple.html", "medium.html", "hard.html"].includes(
      window.location.pathname.split("/").pop()
    )
  ) {
    alert("You switched windows! Returning to rules page.");
    window.location.href = "rules.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (
    ["simple.html", "medium.html", "hard.html"].includes(
      window.location.pathname.split("/").pop()
    )
  ) {
    allowVisibilityCheck = true;
    updateQuestion();
    const heartsElements = document.querySelectorAll(".heart");
    if (heartsElements) {
      heartsElements.forEach((heart) => heart.classList.add("active"));
    }
  } else {
    fetchUserProgress();
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
});