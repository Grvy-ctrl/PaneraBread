const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const COOKIE = process.env.ROBLOSECURITY;
const SECRET = process.env.SECRET_KEY;

async function getCsrfToken() {
  try {
    await axios.post("https://auth.roblox.com/v2/logout", {}, {
      headers: { Cookie: `.ROBLOSECURITY=${COOKIE}` }
    });
  } catch (e) {
    return e.response.headers["x-csrf-token"];
  }
}

app.post("/rank", async (req, res) => {
  const { secret, userId, rankId, groupId } = req.body;
  if (secret !== SECRET) return res.status(403).json({ error: "Unauthorized" });

  try {
    const csrf = await getCsrfToken();
    await axios.patch(
      `https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`,
      { roleId: rankId },
      { headers: { Cookie: `.ROBLOSECURITY=${COOKIE}`, "X-CSRF-Token": csrf } }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

app.get("/", (_, res) => res.send("Ranking bot online"));
app.listen(3000, () => console.log("Running on port 3000"));
