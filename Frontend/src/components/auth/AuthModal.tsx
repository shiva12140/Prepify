// src/components/AuthModal.tsx

import React from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop/Overlay: Fixed position, full screen, dark, and translucent
    <div 
      className="fixed inset-0 z-[100] bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose} // Close the modal when clicking outside
    >
      {/* Modal Content Container: Prevent closing when clicking on the form itself */}
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-blue-500/30 rounded-xl shadow-2xl animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-400 transition-colors z-10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Children (SignIn or SignUp content) */}
        <div className="p-8 pt-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;