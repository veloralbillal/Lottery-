import "./index.css";
import "./js/preventZoom.js";
import { installUniversalSqlBridgeFetchInterceptor } from "./js/sqlBridgeClient.js";
installUniversalSqlBridgeFetchInterceptor();

import { initApplicationLoader } from "./state_suite";

/**
 * APPLICATION ENTRY POINT
 * 
 * The monolithic StateManager and initialization logic has been modularized
 * into the /src/state_suite/ directory to resolve "file too large" errors 
 * and improve maintainability.
 */

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initApplicationLoader);
} else {
  initApplicationLoader();
}
