import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContextInstance';

export const useTheme = () => useContext(ThemeContext);
