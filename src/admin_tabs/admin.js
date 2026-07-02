document.addEventListener("DOMContentLoaded", function() {
    // Dynamic Draw Mode selector event listener for creating lottery pool
    const drawModeSelect = document.getElementById("admin-draw-mode-select");
    if (drawModeSelect) {
        drawModeSelect.addEventListener("change", function(e) {
            const mode = e.target.value;
            const timerContainer = document.getElementById("admin-timer-container");
            const datetimeContainer = document.getElementById("admin-datetime-container");
            
            if (timerContainer && datetimeContainer) {
                if (mode === "auto") {
                    timerContainer.classList.remove("hidden");
                    datetimeContainer.classList.add("hidden");
                } else if (mode === "auto_datetime") {
                    timerContainer.classList.add("hidden");
                    datetimeContainer.classList.remove("hidden");
                } else {
                    timerContainer.classList.add("hidden");
                    datetimeContainer.classList.add("hidden");
                }
            }
        });
    }
});
