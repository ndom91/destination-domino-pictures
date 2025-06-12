import { useState, useEffect } from 'react';

function useLocalStorage(key: string, defaultValue: string | null, generator?: () => string) {
  // Initialize state with value from localStorage or default/generated value
  const [value, setValue] = useState(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return generator ? generator() : defaultValue;
      }

      // Try to get existing value from localStorage
      const item = window.localStorage.getItem(key);

      if (item !== null) {
        // Parse and return existing value
        return JSON.parse(item);
      } else {
        // Generate new value if generator function provided
        const initialValue = generator ? generator() : defaultValue;

        // Save the initial value to localStorage
        window.localStorage.setItem(key, JSON.stringify(initialValue));

        return initialValue;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return generator ? generator() : defaultValue;
    }
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  // Custom setter that also updates localStorage
  const setStoredValue = (newValue: string) => {
    try {
      setValue(newValue);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue];
}

export default useLocalStorage;

// Example usage:

// Basic usage with default value
// const [name, setName] = useLocalStorage('userName', 'Anonymous');

// Usage with generator function for complex initial values
// const [userSettings, setUserSettings] = useLocalStorage(
//   'userSettings', 
//   null, 
//   () => ({
//     theme: 'dark',
//     language: 'en',
//     preferences: {
//       notifications: true,
//       autoSave: true
//     }
//   })
// );

// Usage with ID generation
// const [userId, setUserId] = useLocalStorage(
//   'userId', 
//   null, 
//   () => crypto.randomUUID()
// );
