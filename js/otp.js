// Handle the sign-up form submission
document.getElementById('signin-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Alert for sign-up success
    alert("Sign-up successful! OTP sent.");

    // Hide the sign-up form and display OTP input field
    document.querySelector('.signin-container').innerHTML = `
        <h1>Enter OTP</h1>
        <form id="otp-form">
            <input type="text" id="otp" placeholder="Enter OTP" required>
            <button type="submit">Verify OTP</button>
        </form>
    `;
    
    // Generate OTP for simulation (This is just a simulation, in real cases, the OTP will be sent via email or SMS)
    let generatedOtp = Math.floor(1000 + Math.random() * 9000);  // Generate a 4-digit OTP
    console.log("Generated OTP: ", generatedOtp); // For testing purposes (You can remove this line in production)

    // Handle OTP form submission
    document.getElementById('otp-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get the entered OTP
        let enteredOtp = document.getElementById('otp').value;

        // Validate OTP
        if (enteredOtp == generatedOtp) {
            alert("OTP verified successfully! Welcome to GHOST PLAY.");
            // Redirect to home page or next page after OTP verification
            window.location.href = 'index.html';  // Change this URL as needed
        } else {
            alert("Invalid OTP! Please try again.");
        }
    });
});
