# Implementation Plan - Remove Login Header Banner

Remove the top branding banner/header ("Lottery Winner") from the login/auth screen (`screen-auth`) as requested by the user, keeping the login and signup forms intact while removing the header space.

## User Review Required
> [!IMPORTANT]
> - We will remove the top header branding bar from `screen-auth` in `index.html`.
> - The login/signup container forms will remain fully functional and centered.

## Proposed Changes

### `index.html`
- Locate `screen-auth` and remove the top header / logo branding container (`<header>` or top banner element inside `screen-auth`).
- Adjust spacing / padding of `screen-auth` so the form starts cleanly without empty header space.

## Verification Plan

### Automated Tests
- Run `compile_applet` and `lint_applet` to verify zero build errors.

### Manual Verification
- Open the app preview, check the login / auth screen (`screen-auth`), and confirm the top "Lottery Winner" header banner is completely removed while login/signup forms work correctly.
