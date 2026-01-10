'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Check } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { ImageCropper } from './ImageCropper';

interface ImageUploaderProps {
    currentImageUrl?: string;
    onUploadComplete: (url: string) => void;
    storagePath: string; // e.g. 'users/{uid}/profile' or 'students/{studentId}/photo'
    maxSizeMB?: number;
    label?: string;
}

export function ImageUploader({
    currentImageUrl,
    onUploadComplete,
    storagePath,
    maxSizeMB = 5,
    label = 'Mynd'
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cropper State
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Vinsamlegast veldu mynd (JPG, PNG)');
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Mynd of stór. Hámark er ${maxSizeMB}MB`);
            return;
        }

        // Show cropper
        const reader = new FileReader();
        reader.onloadend = () => {
            setCropImageSrc(reader.result as string);
            // Reset input so same file can be selected again if cancelled
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropImageSrc(null);
        await uploadToFirebase(croppedBlob);
    };

    const handleCropCancel = () => {
        setCropImageSrc(null);
    };

    const uploadToFirebase = async (fileBlob: Blob) => {
        // Show preview immediately
        const previewReader = new FileReader();
        previewReader.onloadend = () => {
            setPreviewUrl(previewReader.result as string);
        };
        previewReader.readAsDataURL(fileBlob);

        // Upload to Firebase Storage
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Create unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}_profile.jpg`; // Always save as jpg from cropper
            const storageRef = ref(storage, `${storagePath}/${filename}`);

            const uploadTask = uploadBytesResumable(storageRef, fileBlob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                },
                (error) => {
                    console.error('Upload error:', error);
                    setError('Villa kom upp við upphleðslu');
                    setIsUploading(false);
                },
                async () => {
                    // Upload completed
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setIsUploading(false);
                    onUploadComplete(downloadURL);
                }
            );
        } catch (error) {
            console.error('Upload error:', error);
            setError('Villa kom upp');
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onUploadComplete('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            {/* Cropper Modal */}
            {cropImageSrc && (
                <ImageCropper
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            {/* Preview or Upload Area */}
            <div className="relative">
                {previewUrl ? (
                    <div className="relative inline-block">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        {!isUploading && (
                            <button
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                                title="Fjarlægja mynd"
                            >
                                <X size={16} />
                            </button>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="animate-spin mx-auto mb-1" size={24} />
                                    <p className="text-xs font-medium">{uploadProgress}%</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                        <Upload size={24} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 text-center px-2">
                            Smella til að velja
                        </span>
                    </div>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Success Message */}
            {!isUploading && previewUrl && currentImageUrl === previewUrl && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                    <Check size={16} />
                    <span>Mynd vistuð</span>
                </div>
            )}

            {/* Help Text */}
            <p className="text-xs text-gray-500">
                JPG eða PNG, hámark {maxSizeMB}MB
            </p>
        </div>
    );
}

