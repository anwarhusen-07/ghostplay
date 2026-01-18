document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);  // Success message
            window.location.href = 'login.html';  // Redirect to login page
        } else {
            // Show the error message returned by the backend
            alert(result.message);  // Display error message to user
        }

    } catch (error) {
        console.error('Error signing up:', error);
        alert('An error occurred. Please try again later.');
    }
});

document.getElementById('request-otp').addEventListener('click', async () => {
    const email = document.getElementById('email').value;

    if (!email) {
        alert('Please enter your email!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);  // OTP sent message
            document.getElementById('otp-section').style.display = 'block';  // Show OTP section
        } else {
            alert(result.message);  // Display error message to user
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('An error occurred while sending OTP. Please try again later.');
    }
});
