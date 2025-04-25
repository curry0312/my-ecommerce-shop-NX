import React from "react";
import CreateIcon from "@mui/icons-material/Create";
import Image from "next/image";
import CloseIcon from '@mui/icons-material/Close';
import BorderColorIcon from '@mui/icons-material/BorderColor';

type Props = {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove: (index: number) => void;
  defaultImage?: string | null;
  index: any;
  setOpenImageModal: (opemImageModal: boolean) => void;
};

export default function ImagePlaceHolder({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = null,
  index = null,
  setOpenImageModal,
}: Props) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    defaultImage
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index!);
    }
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col items-center justify-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index!)}
            className="absolute w-8 h-8 top-3 right-3 flex justify-center items-center p-2 !rounded bg-red-600 shadow-lg"
          >
            <CloseIcon />
          </button>
          <button
            onClick={() => setOpenImageModal(true)}
            className="absolute top-3 right-[70px] p-2 !rounded bg-gray-600 shadow-lg cursor-pointer"
          >
            <BorderColorIcon sx={{ color: "#fff", fontSize: "1.5rem" }}/>
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer"
        >
          <CreateIcon />
        </label>
      )}

      {imagePreview ? (
        <Image
          src={imagePreview}
          alt="uploaded"
          className="w-full h-full object-cover rounded-lg"
          width={500}
          height={500}
        />
      ) : (
        <>
          <p
            className={`text-gray-400 ${
              small ? "text-xl" : "text-4xl"
            } font-semibold`}
          >
            {size}
          </p>
          <p className="text-center text-gray-400">
            Please choose an image <br />
            according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
}
