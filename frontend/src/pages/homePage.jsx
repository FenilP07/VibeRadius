import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <center>
        <h1>Host Homepage</h1>
        <div></div>
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="text-[#E07A3D] hover:text-[#C4612A] font-medium"
        >
          dashboard
        </button>
      </center>
    </div>
  );
};

export default HomePage;
