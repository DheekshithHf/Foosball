const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        // Try to extract a detailed error message from the backend
        let errorMsg = 'HTTP error! status: ' + response.status;
        if (data) {
          if (typeof data === 'string') {
            errorMsg = data;
          } else if (data.detail) {
            errorMsg = data.detail;
          } else if (data.error) {
            errorMsg = data.error;
          } else {
            // Show first field error if available
            const firstKey = Object.keys(data)[0];
            if (firstKey && Array.isArray(data[firstKey])) {
              errorMsg = `${firstKey}: ${data[firstKey][0]}`;
            }
          }
        }
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Employee endpoints
  async getEmployees() {
    return this.request('/employees/');
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}/`);
  }

  // Booking endpoints
  async getBookings(date = null) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/bookings/${params}`);
  }

  async createBooking(bookingData) {
    return this.request('/bookings/', {
      method: 'POST',
      body: bookingData,
    });
  }

  async updateBooking(id, bookingData) {
    return this.request(`/bookings/${id}/`, {
      method: 'PUT',
      body: bookingData,
    });
  }

  async deleteBooking(id) {
    return this.request(`/bookings/${id}/`, {
      method: 'DELETE',
    });
  }

  // Availability endpoint
  async getAvailability(date) {
    return this.request(`/availability/?date=${date}`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats/');
  }

  async getUserBookings(employeeId) {
    return this.request(`/users/${employeeId}/bookings/`);
  }

  // Tournament endpoints
  async getTournaments() {
    return this.request('/tournaments/');
  }

  async createTournament(tournamentData) {
    return this.request('/tournaments/', {
      method: 'POST',
      body: tournamentData,
    });
  }

  // Player request endpoints
  async getPlayerRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/player-requests/${queryString ? `?${queryString}` : ''}`);
  }

  async createPlayerRequest(requestData) {
    return this.request('/player-requests/', {
      method: 'POST',
      body: requestData,
    });
  }

  async joinPlayerRequest(requestId, employeeId) {
    return this.request(`/player-requests/${requestId}/join/`, {
      method: 'POST',
      body: { employee_id: employeeId },
    });
  }

  async leavePlayerRequest(requestId, employeeId) {
    return this.request(`/player-requests/${requestId}/leave/`, {
      method: 'POST',
      body: { employee_id: employeeId },
    });
  }

  // Notification endpoints
  async getNotificationSettings(employeeId) {
    return this.request(`/notifications/${employeeId}/`);
  }

  async updateNotificationSettings(employeeId, settings) {
    return this.request(`/notifications/${employeeId}/`, {
      method: 'PUT',
      body: settings,
    });
  }
}

export default new ApiService();
