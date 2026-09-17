// profile.js - Client-side interactive features for user profile management

let developerKey = ''; // Optional API Key
let clientId = '537748328831-dev.apps.googleusercontent.com'; // Extracted client ID
let scope = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';

let oauthToken;

function loadPicker() {
    gapi.load('auth', {'callback': onAuthApiLoad});
    gapi.load('picker', {'callback': onPickerApiLoad});
}

function onAuthApiLoad() {
    // Prepared to authorize
}

function onPickerApiLoad() {
    // Loading complete
}

const googlePickerBtn = document.getElementById('google-picker-avatar-btn');
if (googlePickerBtn) {
    googlePickerBtn.addEventListener('click', () => {
        // Trigger authentic Google Identity service token request
        const client = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: scope,
            callback: (response) => {
                if (response.error !== undefined) {
                    alert("Google auth failed. Please try again.");
                    return;
                }
                oauthToken = response.access_token;
                createPicker();
            },
        });
        client.requestAccessToken();
    });
}

function createPicker() {
    if (oauthToken) {
        // Open real images only picker from Drive
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp");
        
        const picker = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(oauthToken)
            .setDeveloperKey(developerKey)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }
}

function pickerCallback(data) {
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        const doc = data[google.picker.Response.DOCUMENTS][0];
        const fileId = doc[google.picker.Document.ID];
        
        // Construct beautiful direct static view link using Google Drive access token
        const directUrl = "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media&access_token=" + oauthToken;
        
        document.getElementById('google-photo-url-field').value = directUrl;
        
        // Show instant client image change feedback
        const avatarImg = document.getElementById('avatar-image-ref');
        if (avatarImg) {
            avatarImg.src = directUrl;
        } else {
            const avatarPlaceholder = document.getElementById('avatar-icon-placeholder');
            if (avatarPlaceholder) {
                avatarPlaceholder.innerHTML = '<img src="' + directUrl + '" class="w-full h-full object-cover" id="avatar-image-ref" />';
            }
        }
        
        // Auto submit profile edit form to commit changes dynamically
        document.getElementById('profile-edit-form').submit();
    }
}

// Render visual player spending profile statistics breakdown
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('profile-chart');
    if (!ctx) return;

    const spent = parseFloat(ctx.getAttribute('data-spent')) || 0;
    const profit = parseFloat(ctx.getAttribute('data-profit')) || 0;
    const winnings = Math.max(0, spent + profit);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Spent', 'Winnings'],
            datasets: [{
                data: [spent, winnings],
                backgroundColor: ['#f43f5e', '#10b981'],
                borderWidth: 1,
                borderColor: '#0f172a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            size: 9,
                            family: 'JetBrains Mono'
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
});

window.addEventListener('load', loadPicker);
