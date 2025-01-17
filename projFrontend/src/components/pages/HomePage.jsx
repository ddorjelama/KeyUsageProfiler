import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import typing_image from "../../assets/home_typing_image.png";
import { baseUrl } from "../../main.jsx";

import "./../../utils/styles.css";

import Footer from "../layout/Footer";
import Navbar from "../layout/Navbar";

import refreshToken from "../../utils/refreshToken";

const HomePage = () => {
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState("");
  const [teamName, setTeamName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [userType, setUserType] = useState(localStorage.getItem("userType"));
  const [errorMessage, setErrorMessage] = useState("");
  const storageInviteToken = localStorage.getItem("inviteToken");

  useEffect(() => {
    if (!token || !userType) {
      navigate("/login");
    } else if (userType === "TEAM_MEMBER") {
      navigate("/profile"); // TODO maybe change to profile
    } else if (userType === "TEAM_LEADER") {
      navigate("/dashboard");
    }
    if (storageInviteToken !== null) {
      joinTeamHandler();
    }
  }, []);

  const joinTeamHandler = async () => {
    let link = "";
    if (storageInviteToken !== null) {
      localStorage.removeItem("inviteToken");
      link = storageInviteToken;
    } else link = inviteLink;

    var token = localStorage.getItem("authToken");

    if (!link) {
      setErrorMessage("Please enter an invite link and try again.");
      return;
    }
    var realLink = link.substring(link.lastIndexOf("/")+1, link.length);
    try {
      const response = await fetch(
        `http://${baseUrl}:8080/api/teams/join/${realLink}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Handle successful response (team joining)
        console.log("Team joined successfully!");
        localStorage.setItem("userType", "TEAM_MEMBER");
        navigate("/profile");
      } else if (response.status == 403) {
        const newToken = await refreshToken();

        if (newToken !== null) {
          setToken(newToken);
          joinTeamHandler();
          return;
        } else {
          throw new Error("Failed to refresh token");
        }
      } else {
        // Handle error response
        console.error("Failed to join team:", response.statusText);
        setErrorMessage("Failed to join team. Please try again.");
      }
    } catch (error) {
      console.error("Error joining team:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const createTeamHandler = async () => {
    if (!teamName) {
      setErrorMessage("Please enter a team name and try again.");
      return;
    }
    try {
      var token = localStorage.getItem("authToken");
      // Now that sign-in is complete, proceed with team creation
      const response = await fetch(`http://${baseUrl}:8080/api/teams/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: teamName,
        }),
      });

      if (response.status === 403) {
        const newToken = await refreshToken();

        if (newToken !== null) {
          setToken(newToken);
          createTeamHandler();
          return;
        }
        console.error("Error refreshing token:", refreshError.message);

        // Handle the error appropriately, for now, just log it
        let theme = localStorage.getItem("theme");
        localStorage.clear();
        localStorage.setItem("theme", theme);
        navigate("/login");
      }

      if (response.ok) {
        // Handle successful response (team creation)
        console.log("Team created successfully!");
        localStorage.setItem("userType", "TEAM_LEADER");
        navigate("/dashboard");
      } else {
        // Handle error response
        console.error("Failed to create team:", response.statusText);
        setErrorMessage("Failed to create team. Please try again.");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex w-screen flex-col items-start gap-2.5">
        <div className="w-full h-[63rem] bg-white">
          <div className="w-[35rem] h-[31.5rem] absolute left-[9.5rem] top-[14.4rem]">
            <p className="font-sans text-6xl font-extrabold bg-gradient-to-b from-[#6941C6] to-[#27164F] bg-clip-text text-transparent">
              A service made for teams and groups of friends.
            </p>
            <p className="text-base text-gray-600 mt-2 mb-4">
              Join the community and start tracking your statistics as well!
            </p>
            {/* Opções de juntar e criar equipa */}
            <form className="w-[34.5rem] shrink-0">
              <div className="flex flex-col justify-center items-start shrink-0">
                <div className="flex p-5 pr-6 items-center flex-[1_0_0] self-stretch rounded-2xl border border-gray-400 bg-gray-50 mt-4">
                  <input
                    placeholder="Enter invite link"
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                  ></input>
                  <button
                    type="button"
                    onClick={joinTeamHandler}
                    className="flex w-[13rem] h-[3.35rem] p-4 flex-col justify-center items-center gap-2.5 shrink-0 rounded-[0.625rem] bg-gray-950"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <p className="text-white text-base font-bold text-white">
                        Join a Team
                      </p>
                    </div>
                  </button>
                </div>
                <div className="flex p-5 pr-6 items-center flex-[1_0_0] self-stretch rounded-2xl border border-gray-400 bg-gray-50 mt-4">
                  <input
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  ></input>
                  <button
                    type="button"
                    onClick={createTeamHandler}
                    className="flex w-[13rem] h-[3.35rem] p-4 flex-col justify-center items-center gap-2.5 shrink-0 rounded-[0.625rem] bg-gray-950"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <p className="text-white text-base font-bold text-white">
                        Create a Team
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-5">
              {errorMessage && (
                <div className="text-red-500 p-3 border border-red-500 rounded">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
        <img
          className="w-[22rem] h-[22rem] absolute right-80 top-56"
          src={typing_image}
          alt="Typing"
        />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
