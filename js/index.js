document.addEventListener("DOMContentLoaded", () => {
    // Assign animation delays to subtitle letters
    const subtitleLetters = document.querySelectorAll(".subtitle-letter");
    subtitleLetters.forEach((letter, index) => {
        letter.style.setProperty("--letter-index", index);
        // Add 'written' class after animation completes
        setTimeout(() => {
            letter.classList.add("written");
        }, 5100 + index * 100); // 5.1s + 0.1s delay per letter + 0.4s animation
    });

    // Play sound for each title letter
    const titleLetters = document.querySelectorAll(".title-letter");
    titleLetters.forEach((letter, index) => {
        const audio = document.getElementById(`letter-sound-${index + 1}`);
        if (audio) {
            setTimeout(() => {
                audio.play().catch(error => {
                    console.error("Audio playback failed:", error);
                });
                // Stop audio after 0.6s (animation duration)
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, 600);
            }, index * 500); // 0.5s delay per letter
        }
    });

    // Particle system for login button
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let isHovering = false;

    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.size = Math.random() * 4 + 2;
            this.speedX = Math.random() * 1.5 - 0.75;
            this.speedY = Math.random() * -2.5 - 1;
            this.opacity = Math.random() * 0.4 + 0.3;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.008;
            if (this.opacity <= 0) {
                this.reset();
            }
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.opacity = Math.random() * 0.4 + 0.3;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 200, 200, ${this.opacity})`;
            ctx.fill();
            // Add wispy trail
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.speedX * 5, this.y - this.speedY * 5);
            ctx.strokeStyle = `rgba(0, 200, 200, ${this.opacity * 0.5})`;
            ctx.stroke();
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isHovering) {
            if (particles.length < 25) {
                particles.push(new Particle());
            }
            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                if (particle.opacity <= 0) {
                    particles.splice(index, 1);
                }
            });
        } else {
            particles = [];
        }
        requestAnimationFrame(animateParticles);
    }

    const loginBtn = document.querySelector(".login-btn");
    loginBtn.addEventListener("mouseenter", () => {
        isHovering = true;
    });
    loginBtn.addEventListener("mouseleave", () => {
        isHovering = false;
    });

    animateParticles();
});