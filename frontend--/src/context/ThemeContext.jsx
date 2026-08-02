import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Force dark mode to always be ON
    const darkMode = true;

    useEffect(() => {
        // Always add the 'dark' class to the HTML element
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ darkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};