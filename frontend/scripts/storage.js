// Local storage utility for scores, statistics, and achievements
// Now with robust multi-layer backup system!

import robustStorage from './robustStorage.js';

const STORAGE_KEYS = {
  LEADERBOARD: 'stem-kiosk-leaderboard',
  STATISTICS: 'stem-kiosk-statistics',
  ACHIEVEMENTS: 'stem-kiosk-achievements',
};

// Initialize storage structure
async function initStorage() {
  const leaderboard = await robustStorage.load(STORAGE_KEYS.LEADERBOARD);
  if (!leaderboard) {
    await robustStorage.save(STORAGE_KEYS.LEADERBOARD, {});
  }

  const statistics = await robustStorage.load(STORAGE_KEYS.STATISTICS);
  if (!statistics) {
    await robustStorage.save(STORAGE_KEYS.STATISTICS, {
      totalPlayTime: 0,
      gamesPlayed: 0,
      lastPlayed: null,
      gameStats: {}
    });
  }

  const achievements = await robustStorage.load(STORAGE_KEYS.ACHIEVEMENTS);
  if (!achievements) {
    await robustStorage.save(STORAGE_KEYS.ACHIEVEMENTS, []);
  }
}

// Leaderboard functions
export async function saveScore(gameId, score, playerName = 'Player') {
  await initStorage();
  const leaderboard = await robustStorage.load(STORAGE_KEYS.LEADERBOARD) || {};

  if (!leaderboard[gameId]) {
    leaderboard[gameId] = [];
  }

  const entry = {
    score,
    playerName,
    date: new Date().toISOString(),
    timestamp: Date.now()
  };

  leaderboard[gameId].push(entry);
  // Keep top 50 scores per game
  leaderboard[gameId].sort((a, b) => b.score - a.score);
  leaderboard[gameId] = leaderboard[gameId].slice(0, 50);

  await robustStorage.save(STORAGE_KEYS.LEADERBOARD, leaderboard);
  console.log(`✅ Score saved: ${gameId} - ${score} points`);
  return entry;
}

export async function getLeaderboard(gameId) {
  await initStorage();
  const leaderboard = await robustStorage.load(STORAGE_KEYS.LEADERBOARD) || {};
  return leaderboard[gameId] || [];
}

export async function getAllLeaderboards() {
  await initStorage();
  return await robustStorage.load(STORAGE_KEYS.LEADERBOARD) || {};
}

export async function getBestScore(gameId) {
  const scores = await getLeaderboard(gameId);
  return scores.length > 0 ? scores[0].score : 0;
}

// Statistics functions
export async function updateStatistics(gameId, stats) {
  await initStorage();
  const statistics = await robustStorage.load(STORAGE_KEYS.STATISTICS) || {
    totalPlayTime: 0,
    gamesPlayed: 0,
    lastPlayed: null,
    gameStats: {}
  };

  statistics.gamesPlayed += 1;
  statistics.lastPlayed = new Date().toISOString();

  if (!statistics.gameStats[gameId]) {
    statistics.gameStats[gameId] = {
      gamesPlayed: 0,
      totalPlayTime: 0,
      bestScore: 0,
      totalScore: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
  }

  const gameStats = statistics.gameStats[gameId];
  gameStats.gamesPlayed += 1;

  if (stats.playTime) {
    statistics.totalPlayTime += stats.playTime;
    gameStats.totalPlayTime += stats.playTime;
  }

  if (stats.score !== undefined) {
    gameStats.totalScore += stats.score;
    if (stats.score > gameStats.bestScore) {
      gameStats.bestScore = stats.score;
    }
  }

  if (stats.result === 'win') gameStats.wins += 1;
  if (stats.result === 'loss') gameStats.losses += 1;
  if (stats.result === 'draw') gameStats.draws += 1;

  await robustStorage.save(STORAGE_KEYS.STATISTICS, statistics);
  console.log(`📊 Statistics updated: ${gameId}`);
  return statistics;
}

export async function getStatistics() {
  await initStorage();
  return await robustStorage.load(STORAGE_KEYS.STATISTICS) || {
    totalPlayTime: 0,
    gamesPlayed: 0,
    lastPlayed: null,
    gameStats: {}
  };
}

export async function getGameStatistics(gameId) {
  const stats = await getStatistics();
  return stats.gameStats[gameId] || {
    gamesPlayed: 0,
    totalPlayTime: 0,
    bestScore: 0,
    totalScore: 0,
    wins: 0,
    losses: 0,
    draws: 0
  };
}

// Achievement functions
export async function unlockAchievement(achievementId, name, description) {
  await initStorage();
  const achievements = await robustStorage.load(STORAGE_KEYS.ACHIEVEMENTS) || [];

  const exists = achievements.find(a => a.id === achievementId);
  if (!exists) {
    achievements.push({
      id: achievementId,
      name,
      description,
      unlockedAt: new Date().toISOString(),
      timestamp: Date.now()
    });
    await robustStorage.save(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    console.log(`🏆 Achievement unlocked: ${name}`);
    return true;
  }
  return false;
}

export async function getAchievements() {
  await initStorage();
  return await robustStorage.load(STORAGE_KEYS.ACHIEVEMENTS) || [];
}

export async function hasAchievement(achievementId) {
  const achievements = await getAchievements();
  return achievements.some(a => a.id === achievementId);
}

// Format time helper
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Format date helper
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
