import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LocationModal } from '../components/layout/LocationModal';
import { ConflictModal } from '../components/common/ConflictModal';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LocationModal />
      <ConflictModal />
    </div>
  );
};
