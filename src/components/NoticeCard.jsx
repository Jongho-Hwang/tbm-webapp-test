// File: src/components/ImageUpload.jsx
import React from 'react';
import { PhotoIcon, XIcon } from 'lucide-react';

export default function ImageUpload({ images, onChange }) {
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const items = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...images, ...items]);
  };

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-soft cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50">
        <PhotoIcon className="w-5 h-5 mr-2 text-primary" />
        <span className="text-primary font-medium">사진 선택</span>
        <input type="file" className="hidden" multiple accept="image/*" onChange={handleFiles} />
      </label>
      <div className="flex space-x-2 mt-2 overflow-x-auto">
        {images.map((img, idx) => (
          <div key={idx} className="relative">
            <img
              src={img.preview}
              alt=""
              className="w-32 h-32 object-cover rounded-xl shadow-soft"
            />
            <button
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-white p-1 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <XIcon className="w-4 h-4 text-secondary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}