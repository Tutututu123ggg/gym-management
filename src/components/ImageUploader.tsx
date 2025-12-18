import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  value: string; // URL ảnh hiện tại
  onChange: (url: string) => void; // Hàm cập nhật state cha
  onUploadFile: (file: File) => Promise<string>; // Hàm gọi API backend upload
}

export default function ImageUploader({ value, onChange, onUploadFile }: ImageUploaderProps) {
  const [mode, setMode] = useState<'UPLOAD' | 'URL'>('UPLOAD');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await onUploadFile(file); // Gọi API upload của bạn
      onChange(url);
    } catch (error) {
      alert("Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Ảnh minh họa</label>
      
      {/* Switch Mode */}
      <div className="flex gap-4 mb-2">
        <button
          type="button"
          onClick={() => setMode('UPLOAD')}
          className={`px-4 py-2 text-sm rounded-lg border ${mode === 'UPLOAD' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300'}`}
        >
          Tải từ máy
        </button>
        <button
          type="button"
          onClick={() => setMode('URL')}
          className={`px-4 py-2 text-sm rounded-lg border ${mode === 'URL' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300'}`}
        >
          Nhập URL
        </button>
      </div>

      {/* Input Area */}
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          {mode === 'UPLOAD' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              {loading ? (
                <span className="text-sm text-gray-500">Đang tải lên...</span>
              ) : (
                <span className="text-sm text-gray-500">Click để chọn ảnh</span>
              )}
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}
        </div>

        {/* Preview */}
        <div className="w-24 h-24 relative rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
          {value ? (
            <Image src={value} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">Preview</div>
          )}
        </div>
      </div>
    </div>
  );
}