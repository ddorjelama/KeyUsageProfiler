import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { baseUrl } from "../../main";
import { RiUser3Line } from "react-icons/ri";

import "./../../utils/styles.css";

import Footer from "../layout/Footer";
import Navbar from "../layout/Navbar";

import refreshToken from "../../utils/refreshToken";

const Leaderboards = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [userType, setUserType] = useState(localStorage.getItem("userType"));
  const location = useLocation();

  useEffect(() => {
    if (!token || !userType) {
      navigate("/login");
    } else if (userType === "USER") {
      navigate("/");
    }

    fetchData();
    var intervalId = setInterval(fetchData, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const fetchData = async () => {
    try {
      var token = localStorage.getItem("authToken");
      setToken(token);
      const teamDataResponse = await fetch(
        `http://${baseUrl}:8080/api/teams/leaderboards`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (teamDataResponse.ok) {
        const teamData = await teamDataResponse.json();
        setTeamName(teamData.name);
        let members = teamData.members.map((member) => {
          return {
            id: member.author.id,
            username: member.author.name,
            email: member.author.email,
            minutesTyping: member.minutesTyping,
            awpm: member.awpm,
            maxWpm: member.maxWpm,
          };
        });
        setUserData(members);
      } else if (teamDataResponse.status === 403) {
        let error = new Error("Forbidden.");
        error.status = 403;
        throw error;
      } else if (teamDataResponse.status === 404) {
        let theme = localStorage.getItem("theme");
        localStorage.clear();
        localStorage.setItem("theme", theme);
        navigate("/");
      }
    } catch (error) {
      console.error("Error in fetchData:", error);

      if (error.status === 403) {
        try {
          const newToken = await refreshToken();

          if (newToken !== null) {
            setToken(newToken);
            fetchData();
            return;
          } else {
            throw new Error("Failed to refresh token");
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError.message);

          // Handle the error appropriately, for now, just log it
          let theme = localStorage.getItem("theme");
          localStorage.clear();
          localStorage.setItem("theme", theme);
          navigate("/login");
        }
      }
    }
  };

  const sortUserData = (data, sortBy) => {
    return data.slice().sort((a, b) => {
      return b[sortBy] - a[sortBy];
    });
  };

  const getMedalStyle = (index) => {
    if (index === 0) return "gold";
    if (index === 1) return "silver";
    if (index === 2) return "bronze";
    return "";
  };

  return (
    <div>
      <Navbar />
      <div id="header" className="flex w-screen gap-5 justify-center mt-4">
        <h1 className="text-3xl font-bold mb-4">Leaderboards of {teamName}</h1>
      </div>
      <div
        id="body"
        className="flex w-screen mt-2 pb-0 flex-row items-center gap-5 min-h-[52.3vh] justify-center"
      >
        <div
          id="leaderboards-awpm"
          className="flex w-3.5/12 mt-3 mx-3 flex-col items-start rounded-lg border shadow-[0_2px_4px_-2px_rgba(16,24,40,0.06)]"
        >
          <div className="flex items-center self-stretch">
            <div className="flex items-center self-stretch px-6 pt-5 pb-5 gap-4 w-full">
              <div className="flex items-center flex-[1_0_0] gap-2">
                <h2 className="text-xl font-normal leading-7">
                  Average Words Per Minute
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-start self-stretch">
            <table
              id="table-name-column"
              className="flex flex-col items-start flex-[1_0_0]"
            >
              <thead className="flex h-10 px-6 py-3 items-center gap-3 self-stretch border-b bg-[#F9FAFB]">
                <tr className="flex items-center gap-1">
                  <th>
                    <span className="text-[#667085]">Member</span>
                  </th>
                </tr>
              </thead>
              <tbody className="w-full">
                {userData &&
                  sortUserData(userData, "awpm").map((user, index) => (
                    <tr
                      key={user.id}
                      className="flex h-16 px-6 py-4 items-center gap-3 self-stretch border-b"
                    >
                      <td
                        className={`medal ${getMedalStyle(
                          index
                        )} flex items-center justify-center text-center`}
                      >
                        <span className="text-center">{index + 1}</span>
                      </td>
                      <td>
                        <Link to={`/user/${user.id}`}>
                          <RiUser3Line className="text-2xl" />
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/user/${user.id}`}
                          className="flex flex-col items-start"
                        >
                          <p className="text-gray-900">{user.username}</p>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <table
              id="table-awpm-column"
              className="flex w-32 flex-col items-start"
            >
              <thead className="flex h-10 px-6 py-3 items-center gap-3 self-stretch border-b bg-[#F9FAFB]">
                <tr className="flex items-center gap-1">
                  <th className="text-[#667085]">Avg. WPM</th>
                </tr>
              </thead>
              <tbody className="w-full">
                {userData &&
                  sortUserData(userData, "awpm").map((user) => (
                    <tr
                      key={user.id}
                      className="flex h-16 px-6 py-4 items-center gap-3 self-stretch border-b justify-center"
                    >
                      <td className="text-gray-500 text-sm items-center">
                        {user ? user.awpm : "Loading..."}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          id="leaderboars-min-typing"
          className="flex w-3.5/12 mt-3 mx-3 flex-col items-start rounded-lg border shadow-[0_2px_4px_-2px_rgba(16,24,40,0.06)]"
        >
          <div className="flex items-center self-stretch">
            <div className="flex items-center self-stretch px-6 pt-5 pb-5 gap-4 w-full">
              <div className="flex items-center flex-[1_0_0] gap-2">
                <h2 className="text-xl font-normal leading-7">
                  Minutes Typing
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-start self-stretch">
            <table
              id="table-name-column"
              className="flex flex-col items-start flex-[1_0_0]"
            >
              <thead className="flex h-10 px-6 py-3 items-center gap-3 self-stretch border-b bg-[#F9FAFB]">
                <tr className="flex items-center gap-1">
                  <th>
                    <span className="text-[#667085]">Member</span>
                  </th>
                </tr>
              </thead>
              <tbody className="w-full">
                {userData &&
                  sortUserData(userData, "minutesTyping").map((user, index) => (
                    <tr
                      key={user.id}
                      className="flex h-16 px-6 py-4 items-center gap-3 self-stretch border-b"
                    >
                      <td
                        className={`medal ${getMedalStyle(
                          index
                        )} flex items-center justify-center text-center`}
                      >
                        <span className="text-center">{index + 1}</span>
                      </td>
                      <td>
                        <Link to={`/user/${user.id}`}>
                          <RiUser3Line className="text-2xl" />
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/user/${user.id}`}
                          className="flex flex-col items-start"
                        >
                          <p className="text-gray-900">{user.username}</p>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <table
              id="table-minutes-typing-column"
              className="flex w-36 flex-col items-start"
            >
              <thead className="flex h-10 px-6 py-3 items-center gap-3 self-stretch border-b bg-[#F9FAFB]">
                <tr className="flex items-center gap-1">
                  <th className="text-[#667085]">Min. Typing</th>
                </tr>
              </thead>
              <tbody className="w-full">
                {userData &&
                  sortUserData(userData, "minutesTyping").map((user) => (
                    <tr
                      key={user.id}
                      className="flex h-16 px-6 py-4 items-center gap-3 self-stretch border-b justify-center"
                    >
                      <td className="text-gray-500 text-sm">
                        {user ? user.minutesTyping : "Loading..."}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          id="leaderboars-max-typing"
          className="flex w-3.5/12 mt-3 mx-3 flex-col items-start rounded-lg border shadow-[0_2px_4px_-2px_rgba(16,24,40,0.06)]"
        >
          <div className="flex items-center self-stretch">
            <div className="flex items-center self-stretch px-6 pt-5 pb-5 gap-4 w-full">
              <div className="flex items-center flex-[1_0_0] gap-2">
                <h2 className="text-xl font-normal leading-7">
                  Max. Words Per Minute
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-start self-stretch">
            <table
              id="table-name-column"
              className="flex flex-col items-start flex-[1_0_0]"
            >
              <thead className="flex h-10 px-6 py-3 items-center gap-3 self-stretch border-b bg-[#F9FAFB]">
                <tr className="flex items-center gap-1">
                  <th>
                    <span className="text-[#667085]">Member</span>
                  </th>
                </tr>
              </thead>
              <tbody className="w-full">
                {userData &&
                  sortUserData(userData, "maxWpm").map((user, index) => (
                    <tr
                      key={user.id}
                      className="flex h-16 px-6 py-4 items-center gap-3 self-stretch border-b"
                    >
                      <td
                        className={`medal ${getMedalStyle(
                          index
                        )} flex items-center justify-center text-center`}
                      >
                        <span className="text-center">{index + 1}</span>
                      </td>
                      <td>
                        <Link to={`/user/${user.id}`}>
                          <RiUser3Line className="text-2xl" />
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/user/${user.id}`}
                          className="flex flex-col items-start"
                        >
                          <p className="text-gray-900">{user.username}</p>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <table
              id="table-minutes-typing-column"
              className="flex w-36 flex-col items-start"
            >
              <thead className="flex h-10 px-6 py-3 items-center gap-3 self-stretch border-b bg-[#F9FAFB]">
                <tr className="flex items-center gap-1">
                  <th className="text-[#667085]">Max. WPM</th>
                </tr>
              </thead>
              <tbody className="w-full">
                {userData &&
                  sortUserData(userData, "maxWpm").map((user) => (
                    <tr
                      key={user.id}
                      className="flex h-16 px-6 py-4 items-center gap-3 self-stretch border-b justify-center"
                    >
                      <td className="text-gray-500 text-sm">
                        {user ? user.maxWpm : "Loading..."}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboards;
