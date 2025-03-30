// userAuth.js 
// Handles user authentication with modular imports for login and registration

import { setupLogin } from './login.js';
import { setupRegister } from './register.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const screens = {
        mainMenu: document.getElementById('main-menu'),
        register: document.getElementById('register-screen'),
        login: document.getElementById('login-screen'),
        dashboard: document.getElementById('user-dashboard'),
        profile: document.getElementById('user-profile-screen')
    };

    // Core utility functions
    function showScreen(screenName) {
        // Hide all screens
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the requested screen
        screens[screenName].classList.add('active');
    }

    function displayUserProfile(user) {
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-email').textContent = user.email;
    }

    function logout() {
        // Clear user data from local storage
        // localStorage.removeItem('currentUser');
        
        // Redirect to main menu
        showScreen('mainMenu');
    }

    // Initialize login and registration modules
    const { loginUser, resetLoginAttempts } = setupLogin({
        showScreen,
        displayUserProfile
    });
    
    const { registerUser } = setupRegister({
        showScreen
    });

    // Navigation buttons
    document.getElementById('register-btn').addEventListener('click', () => showScreen('register'));
    document.getElementById('login-btn').addEventListener('click', () => {
        resetLoginAttempts(); // Reset attempts when navigating to login screen
        showScreen('login');
    });
    document.getElementById('back-to-menu-from-register').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('back-to-menu-from-login').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('view-profile-btn').addEventListener('click', () => showScreen('profile'));
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => showScreen('dashboard'));

    // Form submission
    document.getElementById('submit-register').addEventListener('click', registerUser);
    document.getElementById('submit-login').addEventListener('click', loginUser);

    // Check if user is already logged in
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    if (loggedInUser) {
        displayUserProfile(loggedInUser);
        showScreen('dashboard');
    }
});