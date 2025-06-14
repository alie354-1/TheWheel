import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '../services/ImageUploadService.ts';
import { useDeck } from '../hooks/useDeck.ts';

interface ImageDropzoneProps {
  onUpload: (imageUrl: string) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onUpload }) => {
  const { deck } = useDeck();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && deck?.id && deck?.user_id) {
        const file = acceptedFiles[0];
        try {
          const imageUrl = await uploadImage(file, deck.user_id);
          if (imageUrl) {
            onUpload(imageUrl);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    },
    [deck, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the image here ...</p>
      ) : (
        <p>Drag 'n' drop an image here, or click to select one</p>
      )}
    </div>
  );
};

export default ImageDropzone;
