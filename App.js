import React from 'react';
import { TokenProvider } from './Context/Context';
import Navigation from './Navigation/Navigation';

export default function App() {
  return (
    <TokenProvider>
      <Navigation />
    </TokenProvider>
  );
}
