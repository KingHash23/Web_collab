// login.js  
// Handles user login functionality

// Track login attempts
let loginAttempts = 0;

/**
 * Validates user credentials and handles the login process
 * @param {Object} options - Configuration options
 * @param {Function} options.showScreen - Function to switch screens
 * @param {Function} options.displayUserProfile - Function to display user profile
 * @returns {Function} - The login handler function
 */
export function setupLogin(options) {
    const { showScreen, displayUserProfile } = options;
    
    // Reset login attempts when entering login screen
    function resetLoginAttempts() {
        loginAttempts = 0;
    }
    
    async function loginUser() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const messageElement = document.getElementById('login-message');
        
        // Basic validation
        if (!email || !password) {
            messageElement.textContent = 'Email and password are required';
            messageElement.className = 'error';
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Reset login attempts on successful login
                loginAttempts = 0;
                
                messageElement.textContent = data.message;
                messageElement.className = 'success';
                
                // Store user info in local storage
                // localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // Display user profile
                displayUserProfile(data.user);
                
                // Clear form fields
                document.getElementById('login-email').value = '';
                document.getElementById('login-password').value = '';
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    showScreen('dashboard');
                }, 1000);
            } else {
                // Increment failed login attempts
                loginAttempts++;
                
                if (loginAttempts >= 3) {
                    // After 3 failed attempts, suggest registration
                    messageElement.innerHTML = 'Too many failed attempts. <a href="#" id="suggest-register">Register a new account?</a>';
                    messageElement.className = 'error';
                    
                    // Add click event for the registration suggestion
                    document.getElementById('suggest-register').addEventListener('click', (e) => {
                        e.preventDefault();
                        loginAttempts = 0; // Reset counter
                        showScreen('register');
                    });
                } else {
                    // Regular error for attempts 1-2
                    messageElement.textContent = `Invalid credentials! Attempt ${loginAttempts} of 3.`;
                    messageElement.className = 'error';
                }
            }
        } catch (error) {
            messageElement.textContent = 'Connection error. Please try again.';
            messageElement.className = 'error';
            console.error('Login error:', error);
        }
    }
    
    return {
        loginUser,
        resetLoginAttempts
    };
}