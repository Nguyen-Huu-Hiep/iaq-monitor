import React from "react";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ThemeButton = ({ theme = "dark", onToggleTheme }) => {
  return (
    <div>
      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
      </button>
    </div>
  );
};

export default ThemeButton;
