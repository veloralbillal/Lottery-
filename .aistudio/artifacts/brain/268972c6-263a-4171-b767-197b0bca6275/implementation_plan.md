# Implementation Plan: Fix Social Media Meta Tags

## Problem
The OpenGraph and Twitter meta tags for images are using relative paths (e.g., `content="logo.jpg"`), causing social media platforms (Facebook, Twitter/X, Slack, Discord) to fail in displaying the correct preview image when links are shared.

## Proposed Changes
1.  **Modify `index.html`**:
    -   Extend the existing dynamic initialization IIFE to calculate the absolute URL of the application.
    -   Use `document.getElementById` to target the `og:image`, `twitter:image`, `og:url`, and `twitter:url` meta tags.
    -   Update their `content` attributes with the correctly resolved absolute URLs.
    -   This will use `window.location.origin` combined with `window.APP_BASE` to ensure compatibility with both custom domains and GitHub Pages subpaths.

## Verification
-   After implementation, I will verify that the script correctly updates the meta tags by reviewing the `index.html` structure.
-   The change is non-destructive and preserves all existing SEO, UI, and functionality.
