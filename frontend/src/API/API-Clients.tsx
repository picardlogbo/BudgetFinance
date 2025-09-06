// import type { RegisterFormData } from "../pages/resgister";

import type { RegisterData } from "../Pages/Register";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const validateToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Token validation failed: ' + response.statusText);
  }

  return await response.json();
};

export const register = async (userData: RegisterData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error('Failed to register user: ' + (responseBody.message || response.statusText));
  }

  return responseBody;
};

export const login = async (loginData: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    });
    
    const responseBody = await response.json();
    
    if (!response.ok) {
        throw new Error('Failed to login: ' + (responseBody.message || response.statusText));
    }
    
    return responseBody;    
}

export const logout = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to logout: ' + response.statusText);
    }

    return true;
}

export const getUserProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user profile: ' + response.statusText);
    }

    return await response.json();
};

export const updateUserProfile = async (updateData: { firstName?: string; lastName?: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        throw new Error('Failed to update user profile: ' + response.statusText);
    }

    return await response.json();
};

export const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
        throw new Error('Failed to change password: ' + response.statusText);
    }

    return true;
};

export const forgotPassword = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw new Error('Failed to initiate password reset: ' + response.statusText);
    }

    return true;
};

export const resetPassword = async (resetData: { token: string; newPassword: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
    });

    if (!response.ok) {
        throw new Error('Failed to reset password: ' + response.statusText);
    }

    return true;
};


