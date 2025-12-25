import { useEffect } from "react";
import api from "../service/api";

function Dashboard() {

  useEffect(() => {
    api.get("health/")
      .then(res => console.log("API OK:", res.data))
      .catch(err => console.error("API ERROR:", err));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
