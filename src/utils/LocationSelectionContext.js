import React, { createContext, useContext, useState } from 'react';

const LocationSelectionContext = createContext({
  onLocationSelected: null,
  setOnLocationSelected: () => {},
});

export const LocationSelectionProvider = ({ children }) => {
  const [onLocationSelected, setOnLocationSelected] = useState(null);
  return (
    <LocationSelectionContext.Provider value={{ onLocationSelected, setOnLocationSelected }}>
      {children}
    </LocationSelectionContext.Provider>
  );
};

export const useLocationSelection = () => useContext(LocationSelectionContext); 