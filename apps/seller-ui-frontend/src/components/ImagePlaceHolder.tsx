import React from "react";
import CreateIcon from "@mui/icons-material/Create";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  size: string;
  onImageChange: (file: File | null) => void;
  onRemove: (index: number) => void;
  defaultImage?: string | null;
  index: any;
  setOpenImageModal: (opemImageModal: boolean) => void;
};

export default function ImagePlaceHolder({
  size,
  onImageChange,
  onRemove,
  defaultImage = null,
  index = null,
}: Props) {


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div
      className={`relative aspect-square w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col items-center justify-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {defaultImage ? (
        <button
          type="button"
          onClick={() => onRemove?.(index!)}
          className="absolute w-8 h-8 top-3 right-3 flex justify-center items-center p-2 !rounded bg-red-600 shadow-lg"
        >
          <CloseIcon />
        </button>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer"
        >
          <CreateIcon />
        </label>
      )}

      {defaultImage ? (
        <Image
          src={defaultImage}
          alt="uploaded"
          className="w-full h-full object-cover rounded-lg"
          width={500}
          height={500}
        />
      ) : (
        <>
          <p className={`text-gray-400 font-semibold`}>{size}</p>
          <p className="text-center text-gray-400 text-xs">
            Please choose an image <br />
            according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
}
