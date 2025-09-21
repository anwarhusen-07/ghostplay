function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password validation function
function validatePassword(password) {
  const minLength = password.length >= 7;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!minLength || !hasSpecialChar || !hasUppercase || !hasNumber) {
    const errors = [];
    if (!minLength) errors.push("at least 7 characters");
    if (!hasSpecialChar) errors.push("at least one special character (!@#$%^&*(),.?\":{}|<>)");
    if (!hasUppercase) errors.push("at least one uppercase letter");
    if (!hasNumber) errors.push("at least one number");
    alert(`Password must include: ${errors.join(", ")}.`);
    return false;
  }
  return true;
}

// Handle signup form submission
document.getElementById('signin-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const username = document.getElementById('signup-username')?.value;
  const password = document.getElementById('signup-password')?.value;
  const email = document.getElementById('email')?.value;
  const otp = document.getElementById('otp')?.value;

  if (!validatePassword(password)) return;

  // Log request data for debugging
  console.log('Signup request data:', { username, password, email, otp, otpType: typeof otp });

  try {
    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, otp: String(otp) }), // Ensure OTP is sent as string
    });

    const result = await response.json();
    console.log('Signup response:', { status: response.status, result }); // Log response

    if (response.ok) {
      alert(result.message);
      window.location.href = 'login.html';
    } else {
      alert(result.message); // Show specific server error (e.g., "Invalid or expired OTP")
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('An error occurred during sign up. Please try again later.');
  }
});

// Handle OTP request
document.getElementById('request-otp')?.addEventListener('click', async () => {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('signup-password')?.value;
  const otpMessage = document.getElementById('otp-message');

  if (!email || !validateEmail(email)) {
    alert('Please enter a valid email address!');
    return;
  }

  if (!validatePassword(password)) return;

  otpMessage.textContent = 'Sending OTP... ⏳';
  otpMessage.style.color = 'white';

  try {
    const response = await fetch('http://localhost:3000/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (response.ok) {
      otpMessage.textContent = result.message + ' ✅';
      otpMessage.style.color = 'green';
      document.getElementById('otp-section').style.display = 'block';
    } else {
      otpMessage.textContent = result.message + ' ❌';
      otpMessage.style.color = 'red';
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    otpMessage.textContent = 'An error occurred while sending OTP. Please try again later. ❌';
    otpMessage.style.color = 'red';
  }

  const resendBtn = document.getElementById('resend-otp');
  if (resendBtn) {
    resendBtn.disabled = true;
    setTimeout(() => {
      resendBtn.disabled = false;
    }, 30000);
  }
});

// Resend OTP functionality
document.getElementById('resend-otp')?.addEventListener('click', async () => {
  const email = document.getElementById('email')?.value;
  const otpMessage = document.getElementById('otp-message');

  if (!email) {
    alert('Please enter your email!');
    return;
  }

  otpMessage.textContent = 'Resending OTP... ⏳';
  otpMessage.style.color = 'white';

  try {
    const response = await fetch('http://localhost:3000/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (response.ok) {
      otpMessage.textContent = 'New OTP sent to your email! ✅';
      otpMessage.style.color = 'green';
    } else {
      otpMessage.textContent = result.message + ' ❌';
      otpMessage.style.color = 'red';
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    otpMessage.textContent = 'An error occurred while resending OTP. ❌';
    otpMessage.style.color = 'red';
  }

  const resendBtn = document.getElementById('resend-otp');
  if (resendBtn) {
    resendBtn.disabled = true;
    setTimeout(() => {
      resendBtn.disabled = false;
    }, 30000);
  }
});

// Login handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    localStorage.setItem('tempUsername', username);
    localStorage.setItem('tempPassword', password);

    const loginMessage = document.getElementById('login-message');
    loginMessage.textContent = '';

    const submitBtn = loginForm.querySelector('.submit-btn');
    submitBtn.disabled = true;
    loginForm.classList.add('submitting');

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('userId', result.userId);
        localStorage.removeItem('tempUsername');
        localStorage.removeItem('tempPassword');
        window.location.href = 'rules.html';
      } else {
        loginMessage.textContent = result.message;
        loginMessage.style.color = 'red';
        usernameInput.value = localStorage.getItem('tempUsername') || username;
        passwordInput.value = localStorage.getItem('tempPassword') || password;
      }
    } catch (error) {
      loginMessage.textContent = 'Something went wrong. Please try again.';
      loginMessage.style.color = 'red';
      usernameInput.value = localStorage.getItem('tempUsername') || username;
      passwordInput.value = localStorage.getItem('tempPassword') || password;
    } finally {
      submitBtn.disabled = false;
      loginForm.classList.remove('submitting');
      if (!localStorage.getItem('userId')) {
        usernameInput.value = localStorage.getItem('tempUsername') || username;
        passwordInput.value = localStorage.getItem('tempPassword') || password;
      }
    }
  });
});