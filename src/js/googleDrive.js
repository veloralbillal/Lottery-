// ============================================================================
// GOOGLE DRIVE & PICKER INTEGRATION MODULE
// ============================================================================

export const GoogleDriveModule = {
  // Google Platform access token request
  authenticateGoogle(onSuccess) {
    if (this.googleAuthToken) {
      if (onSuccess) onSuccess();
      return;
    }

    const clientId = "537748328831-dev.apps.googleusercontent.com";
    const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly";

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: scope,
      callback: (response) => {
        if (response.error !== undefined) {
          this.showToast("Google Authentication declined.", "error");
          return;
        }
        this.googleAuthToken = response.access_token;
        this.showToast("Google account successfully linked!", "success");

        // Sync visual panels
        const notAuthZone = document.getElementById("gdrive-not-auth");
        const authZone = document.getElementById("gdrive-auth-zone");
        if (notAuthZone && authZone) {
          notAuthZone.classList.add("hidden");
          authZone.classList.remove("hidden");
        }

        if (onSuccess) onSuccess();
      },
    });

    client.requestAccessToken();
  },

  // Disconnect Google account
  disconnectGoogle() {
    this.googleAuthToken = null;
    this.selectedReceiptFile = null;
    this.showToast("Google account credentials detached successfully.", "info");

    const notAuthZone = document.getElementById("gdrive-not-auth");
    const authZone = document.getElementById("gdrive-auth-zone");
    if (notAuthZone && authZone) {
      notAuthZone.classList.remove("hidden");
      authZone.classList.add("hidden");
    }
  },

  // Choose profile photo using Google Picker
  launchGooglePickerForAvatar() {
    this.authenticateGoogle(() => {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      view.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp");

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.googleAuthToken)
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            const fileId = doc[google.picker.Document.ID];
            
            // Build direct view url
            const directUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${this.googleAuthToken}`;
            
            this.currentUser.photo = directUrl;
            this.saveDB();
            this.showToast("Google Drive image assigned as profile avatar!", "success");
            this.render();
          }
        })
        .build();
      picker.setVisible(true);
    });
  },

  // Select Deposit proof receipt with Google Picker
  launchGooglePickerForReceipt() {
    this.authenticateGoogle(() => {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      view.setMimeTypes("image/png,image/jpeg,image/jpg,application/pdf");

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.googleAuthToken)
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            this.selectedReceiptFile = {
              id: doc[google.picker.Document.ID],
              name: doc[google.picker.Document.NAME],
              thumb: doc[google.picker.Document.ICON_URL] || "https://img.icons8.com/color/48/000000/google-drive--v1.png"
            };

            // Display selection indicator
            const holder = document.getElementById("dep-selected-receipt-holder");
            const thumbImg = document.getElementById("dep-selected-receipt-thumb");
            const nameSpan = document.getElementById("dep-selected-receipt-name");

            if (thumbImg && nameSpan && holder) {
              thumbImg.src = this.selectedReceiptFile.thumb;
              nameSpan.innerText = this.selectedReceiptFile.name;
              holder.classList.remove("hidden");
            }

            this.showToast("Deposit verification receipt attached!", "success");
          }
        })
        .build();
      picker.setVisible(true);
    });
  },

  // Backup logs as statements CSV file to Drive
  backupLedgersToDrive() {
    this.authenticateGoogle(() => {
      const userDepos = this.db.deposits.filter(d => d.username === this.currentUser.username);
      const userWds = this.db.withdrawals.filter(w => w.username === this.currentUser.username);

      let textContent = "Type,Amount,Gateway,TrxID/Account,Status,Date\n";
      userDepos.forEach(d => {
        textContent += `Deposit,${d.amount},${d.method},${d.trxId},${d.status},${d.date}\n`;
      });
      userWds.forEach(w => {
        textContent += `Withdrawal,${w.amount},${w.method},${w.targetAccount},${w.status},${w.date}\n`;
      });

      const fileMetadata = {
        name: `Statements_Ledger_Backups_${this.currentUser.username}.csv`,
        mimeType: 'text/csv'
      };

      const boundary = '314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: text/csv\r\n\r\n' +
        textContent +
        close_delim;

      fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.googleAuthToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      })
      .then(res => {
        if (res.ok) {
          this.showToast("Transaction history backed up securely to your Google Drive!", "success");
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        this.showToast("Failed to compile cloud file to Drive.", "error");
      });
    });
  },

  // Browse files from user's Drive folder backups
  browseDriveStatementsPicker() {
    this.authenticateGoogle(() => {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      
      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.googleAuthToken)
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            this.showToast(`Selected statement backup: ${doc[google.picker.Document.NAME]}`, "success");
          }
        })
        .build();
      picker.setVisible(true);
    });
  }
};
