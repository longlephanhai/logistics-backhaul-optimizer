import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, IUser, ILoginResponseData } from '@/types/auth';
import { authService, LoginDto } from '@/services/authService';
import { getAccessToken, setAccessToken } from '@/services/apiClient';

const initialState: AuthState = {
  user: null,
  accessToken: getAccessToken(),
  isAuthenticated: !!getAccessToken(),
  isLoading: false,
  isInitialLoading: true,
  error: null,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

/**
 * Thunk Đăng Nhập
 */
export const loginThunk = createAsyncThunk<
  ILoginResponseData,
  { email: string; pass: string },
  { rejectValue: string }
>('auth/login', async ({ email, pass }, { rejectWithValue }) => {
  try {
    const cleanEmail = email.trim();
    const payload: LoginDto = {
      email: cleanEmail,
      username: cleanEmail,
      password: pass,
    };
    const response = await authService.login(payload);
    return response;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!');
  }
});

/**
 * Thunk Lấy thông tin tài khoản hiện tại khi khởi tạo ứng dụng / F5 trang
 */
export const fetchAccountThunk = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>('auth/fetchAccount', async (_, { rejectWithValue }) => {
  try {
    const token = getAccessToken();
    if (!token) {
      // Thử gọi refresh token nếu còn cookie
      const refreshData = await authService.refreshToken();
      return refreshData.user;
    }
    const data = await authService.getAccount();
    return data.user;
  } catch (err: any) {
    setAccessToken(null);
    return rejectWithValue(err.message || 'Phiên đăng nhập đã hết hạn');
  }
});

/**
 * Thunk Đăng Xuất
 */
export const logoutThunk = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    try {
      await authService.logout();
    } catch {
      setAccessToken(null);
    }
  }
);

// ==========================================
// AUTH SLICE
// ==========================================
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitialLoading = false;
      state.error = null;
      setAccessToken(null);
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: IUser; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      setAccessToken(action.payload.accessToken);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload || 'Đăng nhập thất bại!';
      });

    // Fetch Account
    builder
      .addCase(fetchAccountThunk.pending, (state) => {
        state.isInitialLoading = true;
      })
      .addCase(fetchAccountThunk.fulfilled, (state, action) => {
        state.isInitialLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.accessToken = getAccessToken();
      })
      .addCase(fetchAccountThunk.rejected, (state) => {
        state.isInitialLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

export const { clearError, resetAuth, setCredentials } = authSlice.actions;
export default authSlice.reducer;
