"use client";

import { Button, Group, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import * as yup from "yup";

import type { Position } from "@/types/position";

type PositionFormValues = {
  name: string;
  description: string;
  parentId: string | null;
};

const schema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be at most 120 characters")
      .required("Name is required"),
    description: yup
      .string()
      .trim()
      .min(2, "Description must be at least 2 characters")
      .max(500, "Description must be at most 500 characters")
      .required("Description is required"),
    parentId: yup.string().nullable().defined(),
  })
  .required();

type PositionFormProps = {
  positions: Position[];
  initialValues?: PositionFormValues;
  excludeId?: string;
  excludeIds?: string[];
  isSubmitting?: boolean;
  onSubmit: (
    values: PositionFormValues
  ) => void | Promise<{ fieldErrors?: Record<string, string> } | void>;
  serverErrors?: Record<string, string> | null;
  submitLabel: string;
  cancelLabel?: string;
  onCancel?: () => void;
  parentHelpText?: string;
};

export default function PositionForm({
  positions,
  initialValues,
  excludeId,
  excludeIds,
  isSubmitting,
  onSubmit,
  serverErrors,
  submitLabel,
  cancelLabel = "Cancel",
  onCancel,
  parentHelpText,
}: PositionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PositionFormValues>({
    defaultValues: initialValues || {
      name: "",
      description: "",
      parentId: null,
    },
    resolver: yupResolver(schema),
  });

  const applyFieldErrors = (errorsMap?: Record<string, string>) => {
    if (!errorsMap) {
      return;
    }
    Object.entries(errorsMap).forEach(([field, message]) => {
      if (!message) {
        return;
      }
      if (field === "name" || field === "description" || field === "parentId") {
        setError(field, { message });
      }
    });
  };

  useEffect(() => {
    applyFieldErrors(serverErrors || undefined);
  }, [serverErrors]);

  const blockedIds = new Set([...(excludeIds || []), ...(excludeId ? [excludeId] : [])]);

  const options = positions
    .filter((item) => !blockedIds.has(item.id))
    .map((item) => ({
      value: String(item.id),
      label: item.name,
    }));

  return (
    <form
      onSubmit={handleSubmit(async (values: PositionFormValues) => {
        const result = await onSubmit(values);
        applyFieldErrors(result?.fieldErrors);
      })}
    >
      <Stack gap="md">
        <TextInput
          label="Position name"
          placeholder="e.g. CTO"
          {...register("name")}
          error={errors.name?.message}
          withAsterisk
        />
        <Textarea
          label="Description"
          placeholder="Short description"
          minRows={3}
          {...register("description")}
          error={errors.description?.message}
          withAsterisk
        />
        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <Select
              label="Parent position"
              placeholder="No parent (root)"
              data={options}
              description={parentHelpText}
              clearable
              value={field.value}
              onChange={(value) => field.onChange(value || null)}
            />
          )}
        />
        <Group justify={onCancel ? "space-between" : "flex-end"}>
          {onCancel ? (
            <Button variant="outline" color="red" onClick={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button type="submit" color="blue" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
