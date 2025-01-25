import supabase from '../supabase.js';



// -------------------------Alert---------------------
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



// -----------------Check if user is logged in and fetch user details-----------
async function fetchUserProfile() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('Error fetching user:', error.message);
        window.location.href = '/index.html'; // Redirect to login page
        return;
    }

    const user = data?.user; // Access the user object from data

    if (user) {
        // Display username and email in read-only fields
        const usernameField = document.getElementById('username');
        const emailField = document.getElementById('email');
        
        usernameField.value = user.user_metadata?.username || 'Guest';
        emailField.value = user.email || 'No email provided';

        // Make fields read-only
        usernameField.setAttribute('readonly', true);
        emailField.setAttribute('readonly', true);

        // Optionally, display username on the page
        document.getElementById('username-display').textContent = user.user_metadata?.username || 'Guest';
    } else {
        console.error('No user found');
        window.location.href = '/index.html'; // Redirect to login page
    }
}



// Trigger file input on image click
document.querySelector('.edit-overlay').addEventListener('click', function () {
    document.getElementById('upload-picture').click();
});

// Profile Picture Upload
document.getElementById('upload-picture').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('profile-img').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});



// Password Update Popup
const passwordPopup = document.getElementById('password-popup');
const closePopupButton = document.getElementById('close-popup');

document.getElementById('update-password').addEventListener('click', () => {
    passwordPopup.style.display = 'flex'; // Show popup
});

closePopupButton.addEventListener('click', () => {
    passwordPopup.style.display = 'none'; // Close popup
});

// Logout Functionality
document.getElementById('logout').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        showAlert('success', 'You have been logged out.');
        window.location.href = '/index.html'; // Redirect to login page
    } else {
        console.error('Logout error:', error.message);
    }
});

// Go Back Button
document.getElementById('go-back').addEventListener('click', () => {
    window.history.back();
});

// Password Update Logic
document.getElementById('password-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword === confirmPassword) {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (!error) {
            showAlert('success', 'Password updated successfully!');
            passwordPopup.style.display = 'none';
        } else {
            showAlert('error', 'Error updating password: ' + error.message);
        }
    } else {
        showAlert('warning', 'Passwords do not match. Try again.');
    }
});

// Load user profile on page load
fetchUserProfile();
