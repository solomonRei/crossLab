import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { authApiService, AuthApiError } from "../services/authApi";
import { logAction, logError, devLog } from "../config/devTools";
import {
  isTokenExpired,
  getUserFromToken,
  getTimeUntilExpiration,
} from "../lib/tokenUtils";
import { useProfileStore } from "../store/userStore";

// Auth states
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  LOAD_USER_START: "LOAD_USER_START",
  LOAD_USER_SUCCESS: "LOAD_USER_SUCCESS",
  LOAD_USER_FAILURE: "LOAD_USER_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERRORS: "CLEAR_ERRORS",
  INIT_FROM_TOKEN: "INIT_FROM_TOKEN",
};

// Check if user should be authenticated based on stored token
const getInitialAuthState = () => {
  const token = authApiService.getToken();

  devLog("getInitialAuthState: Checking stored token", {
    hasToken: !!token,
    tokenLength: token?.length,
  });

  if (token && !isTokenExpired(token)) {
    const userFromToken = getUserFromToken(token);
    const timeLeft = getTimeUntilExpiration(token);

    devLog("Found valid stored token:", {
      hasUser: !!userFromToken,
      timeLeft,
      userId: userFromToken?.id,
      userEmail: userFromToken?.email,
    });

    return {
      user: userFromToken, // Pre-populate with token data
      token: token,
      isAuthenticated: true,
      isLoading: false, // Don't automatically verify on start
      error: null,
      errors: [],
    };
  }

  if (token && isTokenExpired(token)) {
    devLog("Found expired token, clearing it");
    authApiService.setToken(null); // Clear expired token
  }

  // No token found or token expired
  devLog("No valid authentication state found");
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    errors: [],
  };
};

const initialState = getInitialAuthState();

function authReducer(state, action) {
  // Log actions to Reactotron
  logAction(action.type, action.payload);

  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        errors: [],
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      devLog("authReducer: Processing LOGIN_SUCCESS", {
        hasToken: !!action.payload.token,
        hasUser: !!action.payload.user,
        userEmail: action.payload.user?.email,
        userId: action.payload.user?.id,
        tokenLength: action.payload.token?.length,
      });

      const newState = {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
        errors: [],
      };

      devLog("authReducer: New state after LOGIN_SUCCESS:", {
        isAuthenticated: newState.isAuthenticated,
        hasToken: !!newState.token,
        hasUser: !!newState.user,
        userEmail: newState.user?.email,
      });

      return newState;

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      devLog("User registered successfully");
      return {
        ...state,
        isLoading: false,
        error: null,
        errors: [],
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      devLog("User data loaded successfully:", {
        userEmail: action.payload.user?.email,
        userId: action.payload.user?.id,
      });
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
        errors: [],
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      logError(action.payload.message, `Auth ${action.type}`);
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload.message,
        errors: action.payload.errors,
      };

    case AUTH_ACTIONS.LOGOUT:
      devLog("User logged out");
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        errors: [],
      };

    case AUTH_ACTIONS.CLEAR_ERRORS:
      // Only clear errors if there are actually errors to clear
      if (state.error || state.errors.length > 0) {
        devLog("Clearing auth errors");
        return {
          ...state,
          error: null,
          errors: [],
        };
      }
      return state;

    default:
      return state;
  }
}

// Create Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user data from API to verify token
  const loadUser = useCallback(async () => {
    const token = authApiService.getToken();

    if (!token) {
      devLog("No token found, skipping user load");
      return;
    }

    if (isTokenExpired(token)) {
      devLog("Token is expired, logging out");
      authApiService.setToken(null);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return;
    }

    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

    try {
      const response = await authApiService.getCurrentUser();

      if (response.success && response.data) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: { user: response.data },
        });
      } else {
        throw new Error("Failed to load user data");
      }
    } catch (error) {
      console.error("Load user error:", error);

      // If token is invalid (401/403), clear auth state
      if (error.status === 401 || error.status === 403) {
        devLog("Token appears to be invalid, clearing auth state");
        authApiService.setToken(null);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.error("Your session has expired. Please sign in again.");
      }

      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: {
          message: error.message || "Failed to load user",
          errors: error instanceof AuthApiError ? error.errors : [],
        },
      });
    }
  }, []);

  // Load user on app start if token exists
  useEffect(() => {
    // Don't automatically verify token on app start to prevent 401 loops
    // Token will be verified when user tries to access protected routes
    const token = authApiService.getToken();

    if (token && isTokenExpired(token)) {
      devLog("App started with expired token, clearing auth state");
      authApiService.setToken(null);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } else {
      devLog("App started - skipping automatic token verification");
    }
  }, [loadUser]);

  // Set up token expiration check
  useEffect(() => {
    if (!state.isAuthenticated || !state.token) {
      devLog(
        "Token expiration check: Skipping - not authenticated or no token",
        {
          isAuthenticated: state.isAuthenticated,
          hasToken: !!state.token,
        }
      );
      return;
    }

    const checkTokenExpiration = () => {
      const currentToken = authApiService.getToken();
      const stateToken = state.token;

      devLog("Token expiration check:", {
        hasCurrentToken: !!currentToken,
        hasStateToken: !!stateToken,
        tokensMatch: currentToken === stateToken,
        isStateTokenExpired: isTokenExpired(stateToken),
        isCurrentTokenExpired: currentToken
          ? isTokenExpired(currentToken)
          : "no token",
      });

      // Check both state token and stored token
      const tokenToCheck = currentToken || stateToken;

      if (tokenToCheck && isTokenExpired(tokenToCheck)) {
        devLog("Token expired during session, logging out");
        authApiService.setToken(null);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.error("Your session has expired. Please sign in again.");
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token]);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      devLog("AuthContext: Calling authApiService.login");
      const response = await authApiService.login({ email, password });

      devLog("AuthContext: Raw API response:", response);
      devLog("AuthContext: Response structure check:", {
        success: response.success,
        hasData: !!response.data,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
        tokenLength: response.data?.token?.length,
        userEmail: response.data?.user?.email,
        userId: response.data?.user?.id,
        hasRefreshToken: !!response.data?.refreshToken,
      });

      if (
        response.success &&
        response.data &&
        response.data.token &&
        response.data.user
      ) {
        devLog("AuthContext: All validation passed, dispatching LOGIN_SUCCESS");

        const payload = {
          token: response.data.token,
          user: response.data.user,
        };

        devLog("AuthContext: LOGIN_SUCCESS payload:", payload);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: payload,
        });

        // After a successful login, we load fresh user data
        await loadUser();

        toast.success(
          `Welcome back, ${response.data.user?.firstName || "User"}!`
        );

        devLog("AuthContext: Login process completed successfully");
        return { success: true, data: response.data };
      } else {
        const missingFields = [];
        if (!response.success) missingFields.push("success");
        if (!response.data) missingFields.push("data");
        if (!response.data?.token) missingFields.push("token");
        if (!response.data?.user) missingFields.push("user");

        devLog(
          "AuthContext: Validation failed, missing fields:",
          missingFields
        );
        devLog("AuthContext: Full response structure:", {
          responseSuccess: response.success,
          responseData: response.data,
          fullResponse: response,
        });
        throw new Error(
          `Invalid response: missing ${missingFields.join(", ")}`
        );
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);

      const errorMessage = error.message || "Login failed";
      const errors = error instanceof AuthApiError ? error.errors : [];

      devLog("AuthContext: Login failed with error:", { errorMessage, errors });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { message: errorMessage, errors },
      });

      // Show toast error
      toast.error(errorMessage);

      return { success: false, error: errorMessage, errors };
    }
  };

  // Register function
  const register = async (registerData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authApiService.register(registerData);

      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
        toast.success("Registration successful! Please sign in.");
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);

      const errorMessage = error.message || "Registration failed";
      const errors = error instanceof AuthApiError ? error.errors : [];

      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { message: errorMessage, errors },
      });

      // Show toast error
      toast.error(errorMessage);

      return { success: false, error: errorMessage, errors };
    }
  };

  // Logout function
  const logout = () => {
    // Clear the token from the API service
    authApiService.setToken(null);
    // Clear profile data from store and localStorage
    useProfileStore.getState().clearProfileData();
    // Dispatch the logout action
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    // Show a success message
    toast.success("You have been signed out.");
  };

  // Clear errors function with guard
  const clearErrors = useCallback(() => {
    if (state.error || state.errors.length > 0) {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS });
    }
  }, [state.error, state.errors]);

  // Check if token needs refresh
  const checkTokenHealth = useCallback(() => {
    const token = authApiService.getToken();
    if (!token) return { isValid: false, timeLeft: null };

    const isValid = !isTokenExpired(token);
    const timeLeft = getTimeUntilExpiration(token);

    return { isValid, timeLeft };
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearErrors,
    loadUser,
    checkTokenHealth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
