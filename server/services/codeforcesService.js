const axios = require("axios");

const CF_API = "https://codeforces.com/api";

/**
 * Codeforces ratings are earned exclusively through live, judge-verified
 * contests scored automatically against real competitors — you cannot buy,
 * farm, or fake one the way a GitHub star or follower count can be gamed.
 * That makes it a genuinely independent, equally "publicly trusted" signal,
 * measuring a different skill (algorithmic problem-solving) than GitHub
 * activity (sustained engineering practice).
 *
 * No API key is required for this endpoint.
 */
async function fetchCodeforcesProfile(handle) {
  let response;
  try {
    response = await axios.get(`${CF_API}/user.info`, {
      params: { handles: handle },
    });
  } catch (err) {
    // Codeforces returns HTTP 400 (not 404) with a JSON body for unknown handles
    if (err.response?.data?.comment) {
      throw new Error(`Codeforces: ${err.response.data.comment}`);
    }
    throw new Error("Codeforces API unavailable");
  }

  const { data } = response;
  if (data.status !== "OK" || !data.result?.length) {
    throw new Error("Codeforces handle not found");
  }

  const user = data.result[0];
  return {
    handle: user.handle,
    rating: user.rating ?? 0,
    maxRating: user.maxRating ?? 0,
    rank: user.rank ?? "unrated",
    maxRank: user.maxRank ?? "unrated",
  };
}

module.exports = { fetchCodeforcesProfile };
