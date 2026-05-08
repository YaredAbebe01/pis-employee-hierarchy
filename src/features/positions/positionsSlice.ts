import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createPosition as createPositionRequest,
  deletePosition as deletePositionRequest,
  fetchPositionById as fetchPositionByIdRequest,
  fetchPositionsFlat as fetchPositionsFlatRequest,
  fetchPositionsTree as fetchPositionsTreeRequest,
  getApiError,
  updatePosition as updatePositionRequest,
} from "@/lib/api";
import type { RootState } from "@/lib/store";
import type { Position, PositionNode } from "@/types/position";

export type PositionsState = {
  items: Position[];
  tree: PositionNode[];
  selected: PositionNode | null;
  listOptions: {
    rootOnly: boolean;
  };
  status: "idle" | "loading" | "succeeded" | "failed";
  treeStatus: "idle" | "loading" | "succeeded" | "failed";
  selectedStatus: "idle" | "loading" | "succeeded" | "failed";
  mutationStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  mutationError: string | null;
  fieldErrors: Record<string, string> | null;
};

const initialState: PositionsState = {
  items: [],
  tree: [],
  selected: null,
  listOptions: {
    rootOnly: false,
  },
  status: "idle",
  treeStatus: "idle",
  selectedStatus: "idle",
  mutationStatus: "idle",
  error: null,
  mutationError: null,
  fieldErrors: null,
};

export const fetchPositions = createAsyncThunk(
  "positions/fetch",
  async (options: { rootOnly?: boolean } | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const resolved = options ?? state.positions.listOptions;
      return await fetchPositionsFlatRequest({
        rootOnly: resolved.rootOnly || undefined,
      });
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const fetchPositionsTree = createAsyncThunk(
  "positions/fetchTree",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPositionsTreeRequest();
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const fetchPositionById = createAsyncThunk(
  "positions/fetchById",
  async (
    payload: { id: string; includeChildren?: boolean },
    { rejectWithValue }
  ) => {
    try {
      return await fetchPositionByIdRequest(
        payload.id,
        payload.includeChildren
      );
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const createPosition = createAsyncThunk(
  "positions/create",
  async (
    payload: { name: string; description: string; parentId: string | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const created = await createPositionRequest(payload);
      await Promise.all([
        dispatch(fetchPositions()),
        dispatch(fetchPositionsTree()),
      ]);
      return created;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const updatePosition = createAsyncThunk(
  "positions/update",
  async (
    payload: { id: string; name: string; description: string; parentId: string | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await updatePositionRequest(payload);
      await Promise.all([
        dispatch(fetchPositions()),
        dispatch(fetchPositionsTree()),
        dispatch(fetchPositionById({ id: payload.id, includeChildren: true })),
      ]);
      return updated;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const deletePosition = createAsyncThunk(
  "positions/delete",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await deletePositionRequest(id);
      await Promise.all([
        dispatch(fetchPositions()),
        dispatch(fetchPositionsTree()),
      ]);
      return id;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    clearMutationErrors: (state) => {
      state.mutationError = null;
      state.fieldErrors = null;
    },
    clearSelected: (state) => {
      state.selected = null;
      state.selectedStatus = "idle";
    },
    setListOptions: (state, action: { payload: { rootOnly: boolean } }) => {
      state.listOptions = action.payload;
    },
  },
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
        const payload = action.payload as ReturnType<typeof getApiError> | undefined;
        state.error =
          payload?.message || action.error.message || "Failed to load positions";
      })
      .addCase(fetchPositionsTree.pending, (state) => {
        state.treeStatus = "loading";
        state.error = null;
      })
      .addCase(fetchPositionsTree.fulfilled, (state, action) => {
        state.treeStatus = "succeeded";
        state.tree = action.payload;
      })
      .addCase(fetchPositionsTree.rejected, (state, action) => {
        state.treeStatus = "failed";
        const payload = action.payload as ReturnType<typeof getApiError> | undefined;
        state.error =
          payload?.message || action.error.message || "Failed to load tree";
      })
      .addCase(fetchPositionById.pending, (state) => {
        state.selectedStatus = "loading";
        state.error = null;
      })
      .addCase(fetchPositionById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchPositionById.rejected, (state, action) => {
        state.selectedStatus = "failed";
        const payload = action.payload as ReturnType<typeof getApiError> | undefined;
        state.error =
          payload?.message || action.error.message || "Failed to load position";
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        const exists = state.items.some((item) => item.id === action.payload.id);
        if (!exists) {
          state.items.push(action.payload);
        }
        state.mutationStatus = "succeeded";
        state.fieldErrors = null;
      })
      .addCase(createPosition.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
        state.fieldErrors = null;
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.mutationStatus = "failed";
        const payload = action.payload as ReturnType<typeof getApiError> | undefined;
        state.mutationError =
          payload?.message || action.error.message || "Failed to create";
        state.fieldErrors = payload?.fieldErrors || null;
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index >= 0) {
          state.items[index] = action.payload;
        }
        state.mutationStatus = "succeeded";
        state.fieldErrors = null;
      })
      .addCase(updatePosition.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
        state.fieldErrors = null;
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.mutationStatus = "failed";
        const payload = action.payload as ReturnType<typeof getApiError> | undefined;
        state.mutationError =
          payload?.message || action.error.message || "Failed to update";
        state.fieldErrors = payload?.fieldErrors || null;
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selected?.id === action.payload) {
          state.selected = null;
          state.selectedStatus = "idle";
        }
        state.mutationStatus = "succeeded";
      })
      .addCase(deletePosition.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.mutationStatus = "failed";
        const payload = action.payload as ReturnType<typeof getApiError> | undefined;
        state.mutationError =
          payload?.message || action.error.message || "Failed to delete";
      });
  },
});

export const {
  clearMutationErrors,
  clearSelected,
  setListOptions,
} = positionsSlice.actions;
export default positionsSlice.reducer;
