// register.js 
// Handles user registration functionality

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result
 */
function validateEmail(email) {
    // Check if email starts with lowercase letter
    if (!/^[a-z]/.test(email)) {
        return { valid: false, message: 'Email must start with a lowercase letter' };
    }
    
    // Check if email contains @ symbol
    if (!email.includes('@')) {
        return { valid: false, message: 'Email must contain an @ symbol' };
    }
    
    return { valid: true };
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
function validatePassword(password) {
    // Check for at least 2 uppercase letters
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    if (uppercaseCount < 2) {
        return { valid: false, message: 'Password must contain at least 2 uppercase letters' };
    }
    
    // Check for at least 2 numbers
    const numbersCount = (password.match(/[0-9]/g) || []).length;
    if (numbersCount < 2) {
        return { valid: false, message: 'Password must contain at least 2 numbers' };
    }
    
    // Check for at least 1 symbol
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        return { valid: false, message: 'Password must contain at least 1 special character' };
    }
    
    return { valid: true };
}

/**
 * Sets up the registration functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.showScreen - Function to switch screens
 * @returns {Function} - The registration handler function
 */
export function setupRegister(options) {
    const { showScreen } = options;
    
    async function registerUser() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const messageElement = document.getElementById('register-message');
        
        // Basic validation
        if (!name || !email || !password) {
            messageElement.textContent = 'All fields are required';
            messageElement.className = 'error';
            return;
        }
        
        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            messageElement.textContent = emailValidation.message;
            messageElement.className = 'error';
            return;
        }
        
        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            messageElement.textContent = passwordValidation.message;
            messageElement.className = 'error';
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                messageElement.textContent = data.message;
                messageElement.className = 'success';
                
                // Clear form fields
                document.getElementById('register-name').value = '';
                document.getElementById('register-email').value = '';
                document.getElementById('register-password').value = '';
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    showScreen('login');
                }, 1500);
            } else {
                messageElement.textContent = data.message;
                messageElement.className = 'error';
            }
        } catch (error) {
            messageElement.textContent = 'Connection error. Please try again.';
            messageElement.className = 'error';
            console.error('Registration error:', error);
        }
    }
    
    // Export the validation functions for potential reuse
    return {
        registerUser,
        validateEmail,
        validatePassword
    };
}