const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("pointerdown", () => {
  startBtn.classList.add("is-pressed");
});

startBtn.addEventListener("pointerup", () => {
  startBtn.classList.remove("is-pressed");
});

startBtn.addEventListener("pointerleave", () => {
  startBtn.classList.remove("is-pressed");
});

startBtn.addEventListener("click", () => {
  // Placeholder — le jeu sera branché ici
  startBtn.animate(
    [
      { transform: "scale(0.97)" },
      { transform: "scale(1.02)" },
      { transform: "scale(1)" },
    ],
    { duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
  );
});
