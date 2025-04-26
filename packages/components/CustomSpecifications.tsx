import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Input from "./Input";

export default function CustomSpecifications({ control, errors }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });
  return (
    <>
      <label className="block font-semibold text-gray-300 mb-1">Custom Specifications</label>
      <div className="flex flex-col gap-3">
        {fields?.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <Controller
              control={control}
              name={`custom_specifications.${index}.name`}
              render={({ field }) => (
                <Input
                  label="Specification Name"
                  placeholder="e.g., Battery Life, etc."
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name={`custom_specifications.${index}.value`}
              render={({ field }) => (
                <Input
                  label="Specification value"
                  placeholder="e.g., 10 hours, 4000mAh, etc."
                  {...field}
                />
              )}
            />

            <button
              type="button"
              className="flex justify-center items-center text-red-500 hover:text-red-700"
              onClick={() => remove(index)}
            >
              <DeleteIcon />
            </button>
          </div>
        ))}

        <button type="button" onClick={() => append({ name: "", value: "" })} className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
            <AddCircleOutlineIcon /> Add Specification
        </button>
      </div>
      {errors.custom_specifications && (
        <span className="text-red-500">
          {errors.custom_specifications.message}
        </span>
      )}
    </>
  );
}
