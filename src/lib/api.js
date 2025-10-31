// Prefer env override; fallback to Render deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body) {
      if (typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
        console.log('Request body (stringified):', config.body);
      } else {
        config.body = options.body;
      }
    }

    console.log('Final config:', { url, method: config.method, headers: config.headers, body: config.body });

    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || `HTTP ${response.status}`;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Habits
  async getHabits(token) {
    return this.request('/api/habits', {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async createHabit(habitData, token) {
    return this.request('/api/habits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: habitData
    });
  }

  async updateHabit(id, habitData, token) {
    return this.request(`/api/habits/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: habitData
    });
  }

  async deleteHabit(id, token) {
    return this.request(`/api/habits/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async toggleHabitCompletion(id, date, token) {
    return this.request(`/api/habits/${id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { date }
    });
  }

  async getHabitCompletions(id, token) {
    return this.request(`/api/habits/${id}/completions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async getDashboardStats(token) {
    return this.request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Calendar API methods
  async getCompletionsForDate(date, token) {
    return this.request(`/api/completions/${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async getCalendarCompletions(token) {
    return this.request('/api/calendar/completions', {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async updateCompletionsForDate(date, habitIds, token) {
    return this.request(`/api/completions/${date}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { habitIds }
    });
  }
}

export const api = new ApiClient();