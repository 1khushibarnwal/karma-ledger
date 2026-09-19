const axios = require("axios");

const GH_API = "https://api.github.com";

// Optional token raises the GitHub API rate limit from 60/hr to 5000/hr.
// Create one at https://github.com/settings/tokens (no scopes needed for public data).
const headers = process.env.GITHUB_TOKEN
  ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
  : {};

async function fetchGithubProfile(username) {
  const [userRes, reposRes, eventsRes] = await Promise.all([
    axios.get(`${GH_API}/users/${username}`, { headers }),
    axios.get(`${GH_API}/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    axios.get(`${GH_API}/users/${username}/events/public?per_page=100`, { headers }),
  ]);

  const user = userRes.data;
  const repos = reposRes.data;
  const events = eventsRes.data;

  // --- Derive raw signals ---
  const languages = new Set(repos.map((r) => r.language).filter(Boolean));
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  const pushEvents = events.filter((e) => e.type === "PushEvent");
  const commitsInWindow = pushEvents.reduce(
    (sum, e) => sum + (e.payload?.commits?.length || 0),
    0
  );

  // Contribution streak approximation from event dates (last ~90 days of public events)
  const activeDays = new Set(
    events.map((e) => new Date(e.created_at).toISOString().slice(0, 10))
  );
  const longestStreak = estimateLongestStreak(Array.from(activeDays));

  const nonForkRepos = repos.filter((r) => !r.fork);
  const avgCommitsPerRepo = nonForkRepos.length
    ? commitsInWindow / Math.max(nonForkRepos.length, 1)
    : 0;

  return {
    username: user.login,
    avatar_url: user.avatar_url,
    name: user.name,
    bio: user.bio,
    public_repos: user.public_repos,
    followers: user.followers,
    account_age_days: Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
    raw: {
      commits_last_90d_sampled: commitsInWindow, // GitHub events API only returns recent ~90 days
      distinct_languages: languages.size,
      avg_commits_per_repo: avgCommitsPerRepo,
      total_stars: totalStars,
      followers: user.followers,
      longest_streak_days: longestStreak,
    },
  };
}

function estimateLongestStreak(dateStrings) {
  const days = dateStrings
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);
  let longest = days.length ? 1 : 0;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (days[i] - days[i - 1]) / (1000 * 60 * 60 * 24);
    if (diff <= 1.5) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

module.exports = { fetchGithubProfile };
