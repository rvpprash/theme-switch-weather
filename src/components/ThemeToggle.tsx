import { FiMoon, FiSun } from "react-icons/fi";

import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="theme-toggle"
    >
      {theme === "dark" ? (
        <>
          <FiMoon size={18} />
          <span>Dark</span>
        </>
      ) : (
        <>
          <FiSun size={18} />
          <span>Light</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
