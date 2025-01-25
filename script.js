import supabase from './supabase.js';

// // console.log("Supabase Instance: ", supabase);















// --------------------------FUNCTION TO DISPLAY STYLED ALERTS----------------
function showAlert(type, message) {
    const alert = document.getElementById(`alert-${type}`);
    if (alert) {
        alert.querySelector('.message').textContent = message;
        alert.style.display = 'flex';
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }
}



// ---------------------- LOGIN FORM ----------------------
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }

            showAlert('success', 'Login Successful!');
            loginForm.reset();

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/Dashboard/home.html';  // Redirect to dashboard page
            }, 2000);

        } catch (error) {
            showAlert('error', `${error.message}`);
        }
    });
}



// ---------------------- SIGNUP FORM ----------------------


const signupForm = document.getElementById('signup-form');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: { data: { username: username } }
            });

            if (error) {
                throw error;
            }

            showAlert('success', 'Signup Successful! Please check your email for verification.');
            signupForm.reset();

            
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    console.log("Auth State Changed: SIGNED_IN");
            
                    if (session.user.email_verified) {
                        console.log("Email is verified. Redirecting...");
                        setTimeout(() => {
                            window.location.href = '/Dashboard/home.html';
                        }, 100); // Optional delay
                    } else {
                        console.log("Email not verified. Showing alert...");
                        showAlert('warning', 'Please verify your email to continue.');
                    }
                }
            });
            
            
        } catch (error) {
            showAlert('error', `${error.message}`);
        }
    });
}


// Elements
const loginFormBox = document.getElementById('login-form');
const resetPasswordFormBox = document.getElementById('reset-password-form');
const newPasswordFormBox = document.getElementById('new-password-form');
const forgotPasswordLink = document.getElementById('forgot-password-link');




// -----------------SHOW RESET PASSWORD FORM------------------
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault();
        loginFormBox.style.display = 'none';
        resetPasswordFormBox.style.display = 'block';
    });
}



// ---------------HANDLE PASSWORD RESET----------------
if (resetPasswordFormBox) {
    resetPasswordFormBox.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('reset-email').value;
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/new-password.html`,
        });

        if (error) {
            showAlert('error', error.message);
        } else {
            showAlert('success', 'Password reset link sent to your email.');
        }

        // Clear the input fields after submission
        document.getElementById('reset-email').value = '';
    });
}

// ---------------------EXTRACT ACCESS TOKEN-------------------
const urlParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = urlParams.get('access_token');

(async () => {
    if (accessToken && newPasswordFormBox) {
        const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: accessToken,
        });

        if (!error) {
            resetPasswordFormBox.style.display = 'none';
            loginFormBox.style.display = 'none';
            newPasswordFormBox.style.display = 'block';
        } else {
            showAlert('error', 'Session error.');
        }
    }
})();

// ---------------------HANDLE NEW PASSWORD FORM SUBMISSION---------------------------
if (newPasswordFormBox) {
    newPasswordFormBox.addEventListener('submit', async (event) => {
        event.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showAlert('error', 'Passwords do not match.');
            return;
        }

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            showAlert('error', error.message);
        } else {
            showAlert('success', 'Password has been updated. Please log in.');
            window.location.href = '/index.html';
        }

        // Clear the input fields after submission
        document.getElementById('new-password-email').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    });
}

// -------------------------------Show Reset Password Form when 'Forgot Password?' is clicked--------------------

document.addEventListener('DOMContentLoaded', function() {
    // Show Reset Password Form when 'Forgot Password?' is clicked
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('login-form-box').style.display = 'none';
            document.getElementById('reset-password-form-box').style.display = 'block';
            document.getElementById('reset-password-form-box').style.opacity = '1';
            document.getElementById('reset-password-form-box').style.transform = 'translateX(0%)';
        });
    }

    // Show the login form when 'Back to Login' is clicked
    const backToLoginLink = document.getElementById('back-to-login-link');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('reset-password-form-box').style.display = 'none';
            document.getElementById('login-form-box').style.display = 'flex';
            document.getElementById('login-form-box').style.opacity = '1';
            document.getElementById('login-form-box').style.transform = 'translateX(0%)';
        });
    }
});



// --------------------FUNCTION FOR GOOGLE LOGIN--------------------------------





// NEW  UPDATED CODE

document.addEventListener('DOMContentLoaded', function () {
    // Function for Google Login/Signup with Popup
    async function loginWithGoogle() {
        try {
            // Trigger Google OAuth login with Popup using Supabase
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        prompt: 'select_account'
                        
                    },
                    redirectTo: 'http://127.0.0.1:5500/home.html',
                }
            });

            // Handle errors
            if (error) {
                throw new Error(error.message);
            }

            console.log('Authentication Data:', data);

            // Check if user is logged in or signed up
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    console.log('User logged in:', session.user);
                    showAlert('success', 'Login successful with Google!');

                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'dashboard.html'; // Redirect to dashboard after login
                    }, 2000);

                } else if (event === 'USER_UPDATED') {
                    console.log('New user signed up:', session.user);
                    showAlert('success', 'Signup successful with Google!');

                    // Redirect after 3 seconds
                    setTimeout(() => {
                        window.location.href = 'profile-setup.html'; // Redirect to profile setup page after signup
                    }, 3000);
                }
            });

        } catch (error) {
            console.error('Error during Google login/signup:', error);
            showAlert('error', 'Error during Google login/signup: ' + error.message);
        }
    }

    // Add event listeners to the Google login and signup buttons
    document.getElementById('google-signup-btn').addEventListener('click', loginWithGoogle);
    document.getElementById('google-login-btn').addEventListener('click', loginWithGoogle);
});








// ---------------------- SIGN UP / SIGN IN FORM TOGGLE ----------------------
// Toggle between signup and signin forms
const container = document.querySelector('.container');
const signInLink = document.querySelector('.Signin');
const signUpLink = document.querySelector('.Signup');

signUpLink.addEventListener('click', () => {
    container.classList.add('active');
});
signInLink.addEventListener('click', () => {
    container.classList.remove('active');
});
