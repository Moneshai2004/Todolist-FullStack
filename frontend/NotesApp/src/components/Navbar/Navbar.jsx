import React, { useState } from "react";
import ProfileInfo from "../cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = () => {
  const [SearchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); // Use lowercase 'n' for the hook

  const onLogout = () => {
    navigate("/Login"); // Use lowercase 'n' for the function call
  };
  const handleSearch = ()=>{
    
  }
  const onClearSearch=()=>{
    setSearchQuery("")
  }

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow-md">
      <h2 className="text-xl font-medium text-black py-2">MyNotes</h2>
      <SearchBar
        value={SearchQuery}
        onChange={({ target }) => {
          setSearchQuery(target.value);
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      <ProfileInfo onLogout={onLogout} />
    </div>
  );
};

export default Navbar;
