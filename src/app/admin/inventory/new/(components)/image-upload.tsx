import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import useToast from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[], files?: File[]) => void | Promise<void>;
  isLoading?: boolean;
  isRealtime?: boolean;
}

export default function ImageUpload({ value = [], onChange, isLoading = false, isRealtime = false }: Readonly<ImageUploadProps>) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isRealtime) {
      await onChange(value, acceptedFiles);
    } else {
      // For new product, just store the URLs as data URLs temporarily
      const urls = await Promise.all(
        acceptedFiles.map(file => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }))
      );
      onChange([...value, ...urls], acceptedFiles);
    }
  }, [onChange, value, isRealtime]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => { void onDrop(acceptedFiles); },
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      );
      useToast({
        type: 'error',
        message: `Failed to upload images: ${errors.join('; ')}`,
        title: 'Error uploading images'
      });
    },
    accept: { 'image/*': [] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
    disabled: isLoading
  });

  const removeImage = async (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    if (isRealtime) {
      await onChange(newImages);
    } else {
      onChange(newImages);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-6 text-center
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="size-4 animate-spin" />
            <p className="text-gray-600">Processing images...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600">
              {isDragActive ? 
                'Drop the files here...' : 
                'Drag & drop images here, or click to select files'
              }
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Maximum 5 images, up to 10MB each
            </p>
          </>
        )}
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
                disabled={isLoading}
                onClick={() => removeImage(index)}
                className={`
                  absolute right-2 top-2 rounded-full bg-red-500 p-1 
                  text-white opacity-0 transition-opacity group-hover:opacity-100
                  ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                `}
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
