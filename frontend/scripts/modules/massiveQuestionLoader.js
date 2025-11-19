/**
 * Enhanced Question Loader for Massive Question Database
 * Handles 1000+ questions with efficient loading and categorization
 */

import { MASSIVE_QUESTIONS_DATABASE, QUESTION_CATEGORIES, DIFFICULTY_LEVELS } from './massiveQuestionsDatabase.js';

export class MassiveQuestionLoader {
  constructor() {
    this.questions = MASSIVE_QUESTIONS_DATABASE;
    this.cache = new Map();
    this.stats = {
      totalQuestions: this.questions.length,
      categories: this.getCategoryStats(),
      difficulties: this.getDifficultyStats()
    };
  }

  getCategoryStats() {
    const stats = {};
    Object.keys(QUESTION_CATEGORIES).forEach(category => {
      stats[category] = this.questions.filter(q => q.category === category).length;
    });
    return stats;
  }

  getDifficultyStats() {
    const stats = {};
    Object.keys(DIFFICULTY_LEVELS).forEach(difficulty => {
      stats[difficulty] = this.questions.filter(q => q.difficulty === difficulty).length;
    });
    return stats;
  }

  /**
   * Get questions with advanced filtering options
   */
  getQuestions(options = {}) {
    const {
      count = 10,
      category = null,
      difficulty = null,
      excludeIds = [],
      randomize = true
    } = options;

    let filteredQuestions = [...this.questions];

    // Filter by category
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }

    // Filter by difficulty
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }

    // Exclude specific question IDs
    if (excludeIds.length > 0) {
      filteredQuestions = filteredQuestions.filter(q => !excludeIds.includes(q.id));
    }

    // Randomize if requested
    if (randomize) {
      filteredQuestions = this.shuffleArray(filteredQuestions);
    }

    // Return requested count
    return filteredQuestions.slice(0, count);
  }

  /**
   * Get questions for a specific mission with balanced difficulty
   */
  getMissionQuestions(missionCount = 10, category = null) {
    const questions = [];
    const difficulties = ['easy', 'medium', 'hard'];
    
    // Calculate distribution (40% easy, 40% medium, 20% hard)
    const easyCount = Math.ceil(missionCount * 0.4);
    const mediumCount = Math.ceil(missionCount * 0.4);
    const hardCount = missionCount - easyCount - mediumCount;

    // Get questions for each difficulty level
    if (easyCount > 0) {
      const easyQuestions = this.getQuestions({
        count: easyCount,
        difficulty: 'easy',
        category: category
      });
      questions.push(...easyQuestions);
    }

    if (mediumCount > 0) {
      const mediumQuestions = this.getQuestions({
        count: mediumCount,
        difficulty: 'medium',
        category: category
      });
      questions.push(...mediumQuestions);
    }

    if (hardCount > 0) {
      const hardQuestions = this.getQuestions({
        count: hardCount,
        difficulty: 'hard',
        category: category
      });
      questions.push(...hardQuestions);
    }

    // Shuffle the final selection
    return this.shuffleArray(questions);
  }

  /**
   * Get questions by category with balanced difficulty
   */
  getCategoryQuestions(category, count = 20) {
    return this.getMissionQuestions(count, category);
  }

  /**
   * Get random questions from all categories
   */
  getRandomQuestions(count = 15) {
    return this.getQuestions({ count, randomize: true });
  }

  /**
   * Get questions for a specific difficulty level
   */
  getDifficultyQuestions(difficulty, count = 10) {
    return this.getQuestions({ count, difficulty, randomize: true });
  }

  /**
   * Get question by ID
   */
  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  }

  /**
   * Get questions similar to a given question
   */
  getSimilarQuestions(questionId, count = 5) {
    const question = this.getQuestionById(questionId);
    if (!question) return [];

    return this.getQuestions({
      count,
      category: question.category,
      difficulty: question.difficulty,
      excludeIds: [questionId]
    });
  }

  /**
   * Get statistics about the question database
   */
  getStats() {
    return {
      total: this.stats.totalQuestions,
      categories: this.stats.categories,
      difficulties: this.stats.difficulties,
      categoryDetails: QUESTION_CATEGORIES,
      difficultyDetails: DIFFICULTY_LEVELS
    };
  }

  /**
   * Search questions by text
   */
  searchQuestions(searchTerm, limit = 20) {
    const term = searchTerm.toLowerCase();
    return this.questions
      .filter(q => 
        q.prompt.toLowerCase().includes(term) ||
        q.fact.toLowerCase().includes(term) ||
        q.options.some(opt => opt.toLowerCase().includes(term))
      )
      .slice(0, limit);
  }

  /**
   * Get questions for a custom quiz configuration
   */
  getCustomQuiz(config) {
    const {
      categories = [],
      difficulties = [],
      count = 10,
      balance = true
    } = config;

    let questions = [];

    if (balance && categories.length > 0) {
      // Distribute questions evenly across categories
      const questionsPerCategory = Math.ceil(count / categories.length);
      
      categories.forEach(category => {
        const categoryQuestions = this.getQuestions({
          count: questionsPerCategory,
          category: category,
          difficulty: difficulties.length > 0 ? difficulties[Math.floor(Math.random() * difficulties.length)] : null
        });
        questions.push(...categoryQuestions);
      });
    } else {
      // Get questions with simple filtering
      questions = this.getQuestions({
        count,
        category: categories.length === 1 ? categories[0] : null,
        difficulty: difficulties.length === 1 ? difficulties[0] : null
      });
    }

    return this.shuffleArray(questions).slice(0, count);
  }

  /**
   * Utility function to shuffle an array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get questions for different game modes
   */
  getQuestionsForMode(mode, count = 10) {
    switch (mode) {
      case 'quick':
        return this.getQuestions({ count, difficulty: 'easy' });
      
      case 'challenge':
        return this.getQuestions({ count, difficulty: 'hard' });
      
      case 'mixed':
        return this.getRandomQuestions(count);
      
      case 'category':
        const categories = Object.keys(QUESTION_CATEGORIES);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        return this.getCategoryQuestions(randomCategory, count);
      
      default:
        return this.getMissionQuestions(count);
    }
  }

  /**
   * Validate question data
   */
  validateQuestion(question) {
    return question &&
           question.id &&
           question.category &&
           question.difficulty &&
           question.prompt &&
           question.options &&
           question.options.length === 4 &&
           typeof question.answer === 'number' &&
           question.answer >= 0 &&
           question.answer < 4 &&
           question.fact;
  }

  /**
   * Add new questions to the database
   */
  addQuestions(newQuestions) {
    const validQuestions = newQuestions.filter(q => this.validateQuestion(q));
    this.questions.push(...validQuestions);
    this.stats.totalQuestions = this.questions.length;
    this.stats.categories = this.getCategoryStats();
    this.stats.difficulties = this.getDifficultyStats();
    return validQuestions.length;
  }

  /**
   * Export questions for backup or sharing
   */
  exportQuestions(format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(this.questions, null, 2);
      case 'csv':
        return this.convertToCSV(this.questions);
      default:
        return this.questions;
    }
  }

  /**
   * Convert questions to CSV format
   */
  convertToCSV(questions) {
    const headers = ['id', 'category', 'difficulty', 'prompt', 'option1', 'option2', 'option3', 'option4', 'answer', 'fact'];
    const csvRows = [headers.join(',')];
    
    questions.forEach(q => {
      const row = [
        q.id,
        q.category,
        q.difficulty,
        `"${q.prompt.replace(/"/g, '""')}"`,
        `"${q.options[0].replace(/"/g, '""')}"`,
        `"${q.options[1].replace(/"/g, '""')}"`,
        `"${q.options[2].replace(/"/g, '""')}"`,
        `"${q.options[3].replace(/"/g, '""')}"`,
        q.answer,
        `"${q.fact.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}
