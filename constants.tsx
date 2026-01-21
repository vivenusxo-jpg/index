
import React from 'react';

export const THEMES = {
  peach: {
    bg: '#FFF5F5',
    accent: '#FF5E78',
    primary: '#FF4D6D',
    secondary: '#FFE3E3',
    text: '#4A1D1D',
    card: '#ffffff',
    ring: 'ring-pink-100',
    border: 'border-pink-50'
  },
  lavender: {
    bg: '#FAF5FF',
    accent: '#9F7AEA',
    primary: '#B794F4',
    secondary: '#E9D8FD',
    text: '#2D3748',
    card: '#ffffff',
    ring: 'ring-purple-100',
    border: 'border-purple-50'
  },
  mint: {
    bg: '#F0FFF4',
    accent: '#38B2AC',
    primary: '#4FD1C5',
    secondary: '#B2F5EA',
    text: '#234E52',
    card: '#ffffff',
    ring: 'ring-teal-100',
    border: 'border-teal-50'
  },
  sky: {
    bg: '#EBF8FF',
    accent: '#4299E1',
    primary: '#63B3ED',
    secondary: '#BEE3F8',
    text: '#2A4365',
    card: '#ffffff',
    ring: 'ring-blue-100',
    border: 'border-blue-50'
  }
};

export const ICONS = {
  frog: '🍓', // Index 🍓 uses strawberries as the 'frog'
  book: '📖',
  tea: '🍵',
  water: '💧',
  rest: '✨',
  stretch: '🧘‍♀️',
  meditate: '🕯️',
  food: '🍽️',
  check: '✅',
  star: '⭐',
  peach: '🍑',
  alarm: '⏰',
  heart: '💖',
  trophy: '🏆',
  notes: '📝'
};

export const POMODORO_TIMES = {
  WORK: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 20 * 60
};
