document.addEventListener('DOMContentLoaded', () => {
    // Play background music on first user interaction
    document.addEventListener('click', function () {
        const bgMusic = document.getElementById('background-music');
        bgMusic.play().catch(function (error) {
            console.log("Background music autoplay prevented: ", error);
        });
    }, { once: true });

    // Handle form submission
    document.getElementById('contact-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formMessage = document.getElementById('form-message');
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            contactNumber: document.getElementById('contactNumber').value,
            messageType: document.getElementById('messageType').value,
            feedback: document.getElementById('feedback').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                formMessage.style.display = 'block';
                formMessage.textContent = 'Your message has been sent to the spirits!';
                formMessage.style.color = 'rgba(0, 200, 200, 0.9)';
                document.getElementById('contact-form').reset();
                setTimeout(() => { formMessage.style.display = 'none'; }, 3000);
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            formMessage.style.display = 'block';
            formMessage.textContent = 'Error: ' + error.message;
            formMessage.style.color = 'rgba(255, 0, 0, 0.9)';
        }
    });
});