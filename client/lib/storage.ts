import { TestRecord, ApiResponse, DeleteResponse } from "@shared/api";

// API Base URL - will be relative in development, absolute in production
const API_BASE = import.meta.env.DEV ? '' : '';

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Load all test records from the database
export async function loadTests(): Promise<TestRecord[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/tests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await handleApiResponse<TestRecord[]>(response);
  } catch (error) {
    console.error('Failed to load tests:', error);
    return [];
  }
}

// Save a new test record to the database
export async function saveTest(record: TestRecord): Promise<TestRecord> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    });
    return await handleApiResponse<TestRecord>(response);
  } catch (error) {
    console.error('Failed to save test:', error);
    throw error;
  }
}

// Update an existing test record
export async function updateTest(id: string, record: Partial<TestRecord>): Promise<TestRecord> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/tests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    });
    return await handleApiResponse<TestRecord>(response);
  } catch (error) {
    console.error('Failed to update test:', error);
    throw error;
  }
}

// Delete a specific test record
export async function deleteTest(id: string): Promise<void> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/tests/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    await handleApiResponse<DeleteResponse>(response);
  } catch (error) {
    console.error('Failed to delete test:', error);
    throw error;
  }
}

// Clear all test records from the database
export async function clearAllTests(): Promise<void> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/tests`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    await handleApiResponse<DeleteResponse>(response);
  } catch (error) {
    console.error('Failed to clear all tests:', error);
    throw error;
  }
}

// Get a specific test record by ID
export async function getTestById(id: string): Promise<TestRecord> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/tests/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await handleApiResponse<TestRecord>(response);
  } catch (error) {
    console.error('Failed to get test:', error);
    throw error;
  }
}

// Send test results via email
export async function sendTestEmail(id: string): Promise<void> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/tests/${id}/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
}
