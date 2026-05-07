import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiClient } from "@/lib/api";
import type { Position } from "@/types/position";

export type PositionsState = {
  items: Position[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: PositionsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchPositions = createAsyncThunk("positions/fetch", async () => {
  const response = await apiClient.get<Position[]>("/positions");
  return response.data;
});

export const createPosition = createAsyncThunk(
  "positions/create",
  async (payload: Omit<Position, "id">) => {
    const response = await apiClient.post<Position>("/positions", payload);
    return response.data;
  }
);

export const updatePosition = createAsyncThunk(
  "positions/update",
  async (payload: Position) => {
    const response = await apiClient.put<Position>(
      `/positions/${payload.id}`,
      payload
    );
    return response.data;
  }
);

export const deletePosition = createAsyncThunk(
  "positions/delete",
  async (id: number) => {
    await apiClient.delete(`/positions/${id}`);
    return id;
  }
);

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load positions";
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default positionsSlice.reducer;
