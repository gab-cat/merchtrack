import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[], files?: File[]) => void;
}

export default function ImageUpload({ value = [], onChange }: Readonly<ImageUploadProps>) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Create local URLs for preview
    const localUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    // Combine with existing URLs if any
    const newUrls = [...value, ...localUrls];
    onChange(newUrls, acceptedFiles);
  }, [onChange, value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => { void onDrop(acceptedFiles); },
    accept: { 'image/*': [] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`
        cursor-pointer rounded-lg border-2 border-dashed p-6 text-center
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      `}>
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive ? 
            'Drop the files here...' : 
            'Drag & drop images here, or click to select files'
          }
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Maximum 5 images, up to 10MB each
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <div key={index} className="group relative">
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                width={200}
                height={200}
                className="h-40 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 
                         text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
