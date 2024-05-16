import React from 'react';
import ProfileInfo from '../cards/ProfileInfo';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate(); // Use lowercase 'n' for the hook

  const onLogout = () => {
    navigate("/Login"); // Use lowercase 'n' for the function call
  };

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow-md">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>
      <ProfileInfo onLogout={onLogout}/>
    </div>
  );
};

export default Navbar;