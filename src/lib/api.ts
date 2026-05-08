import axios, { AxiosError } from "axios";

import type { Position, PositionNode } from "@/types/position";

type ApiValidationErrors = Record<string, string>;

export type ApiError = {
  status: number;
  message: string;
  fieldErrors?: ApiValidationErrors;
};

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: `${normalizedBaseUrl}/api/positions`,
  headers: {
    "Content-Type": "application/json",
  },
});

function parseValidationErrors(message: unknown): ApiValidationErrors | undefined {
  if (!message) {
    return undefined;
  }

  if (Array.isArray(message)) {
    const errors: ApiValidationErrors = {};
    message
      .filter((entry) => typeof entry === "string")
      .forEach((entry) => {
        const lower = entry.toLowerCase();
        if (lower.includes("name")) {
          errors.name = entry;
        }
        if (lower.includes("description")) {
          errors.description = entry;
        }
        if (lower.includes("parent")) {
          errors.parentId = entry;
        }
      });
    return Object.keys(errors).length ? errors : undefined;
  }

  if (typeof message === "object") {
    return message as ApiValidationErrors;
  }

  return undefined;
}

export function getApiError(error: unknown): ApiError {
  const fallback: ApiError = {
    status: 0,
    message: "Unexpected error",
  };

  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const axiosError = error as AxiosError<{ message?: unknown }>;
  const status = axiosError.response?.status ?? 0;
  const message =
    (typeof axiosError.response?.data?.message === "string"
      ? axiosError.response?.data?.message
      : "Request failed") || "Request failed";

  return {
    status,
    message,
    fieldErrors: parseValidationErrors(axiosError.response?.data?.message),
  };
}

export async function fetchPositionsFlat(options?: {
  rootOnly?: boolean;
}): Promise<Position[]> {
  const response = await apiClient.get<Position[]>("/", {
    params: options,
  });
  return response.data;
}

export async function fetchPositionsRootOnly(): Promise<Position[]> {
  return fetchPositionsFlat({ rootOnly: true });
}

export async function fetchPositionsTree(): Promise<PositionNode[]> {
  const response = await apiClient.get<PositionNode[]>("/tree");
  return response.data;
}

export async function fetchPositionById(
  id: string,
  includeChildren = false
): Promise<PositionNode> {
  const response = await apiClient.get<PositionNode>(`/${id}`, {
    params: includeChildren ? { includeChildren: true } : undefined,
  });
  return response.data;
}

export async function fetchPositionChildren(id: string): Promise<Position[]> {
  const response = await apiClient.get<Position[]>(`/${id}/children`);
  return response.data;
}

export async function createPosition(payload: {
  name: string;
  description: string;
  parentId: string | null;
}): Promise<Position> {
  const response = await apiClient.post<Position>("/", payload);
  return response.data;
}

export async function updatePosition(payload: {
  id: string;
  name?: string;
  description?: string;
  parentId?: string | null;
}): Promise<Position> {
  const response = await apiClient.put<Position>(`/${payload.id}`, payload);
  return response.data;
}

export async function deletePosition(id: string): Promise<void> {
  await apiClient.delete(`/${id}`);
}
