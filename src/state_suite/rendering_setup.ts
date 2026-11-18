import { screenTemplates } from "./templates/index.js";

/**
 * Setup and inject required HTML screens into the DOM if they are missing.
 * This allows us to remove large HTML blocks from index.html.
 */
export function setupRequiredScreens() {
  const container = document.body;
  if (!container) return;

  for (const [id, template] of Object.entries(screenTemplates)) {
    if (!document.getElementById(id)) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = template.trim();
      
      // The template itself usually has the ID, so we append its children
      while (wrapper.firstChild) {
        container.appendChild(wrapper.firstChild);
      }
    }
  }
}
