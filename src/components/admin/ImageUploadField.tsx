'use client';

import Image from 'next/image';
import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react';
import styles from './ImageUploadField.module.css';

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  folder: 'products' | 'categories' | 'general';
  placeholder?: string;
  required?: boolean;
  hint?: string;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  placeholder,
  required,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    setIsUploading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || typeof data?.url !== 'string') {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Upload failed.');
      }

      onChange(data.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'Upload failed. Please retry.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelection = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFileSelection(event.dataTransfer.files);
  };

  return (
    <div className={styles.wrapper}>
      <label className="form-label">{label}</label>
      <input
        type="text"
        className="form-input"
        required={required}
        value={value}
        onChange={(event) => {
          setError('');
          onChange(event.target.value);
        }}
        placeholder={placeholder}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        hidden
        onChange={(event) => {
          void handleFileSelection(event.target.files);
          event.currentTarget.value = '';
        }}
      />

      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          void handleDrop(event);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {value ? (
          <div className={styles.preview}>
            <Image src={value} alt={label} width={1200} height={720} className={styles.previewImage} />
          </div>
        ) : (
          <div className={styles.emptyState}>
            {isUploading ? <Loader2 size={24} className={styles.spinner} /> : <ImagePlus size={24} />}
            <div className={styles.emptyTitle}>
              {isUploading ? 'Uploading image...' : 'Drag and drop image here'}
            </div>
            <div className={styles.emptyHint}>or click to choose a file</div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 size={14} /> : <UploadCloud size={14} />} Upload Image
          </button>
          {value && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={(event) => {
                event.stopPropagation();
                setError('');
                onChange('');
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {hint ? <div className={styles.helpText}>{hint}</div> : null}
      {error ? <div className={styles.errorText}>{error}</div> : null}
    </div>
  );
}
