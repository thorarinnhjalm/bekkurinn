'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';
import getCroppedImg from '@/lib/canvasUtils';
import { Loader2, Check, X } from 'lucide-react';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImageBlob: Blob) => void;
    onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        setIsProcessing(true);
        try {
            if (!croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
                    <h3 className="font-bold text-on-surface">Skerða mynd</h3>
                    <button onClick={onCancel} className="text-on-surface-variant hover:text-on-surface">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative w-full h-80 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface flex justify-between">
                            <span>Aðdráttur</span>
                            <span className="text-on-surface-variant">{Math.round(zoom * 100)}%</span>
                        </label>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(vals: number[]) => setZoom(vals[0])}
                            className="w-full"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 text-on-surface font-medium bg-surface-container-high rounded-lg hover:bg-surface-container-high transition"
                        >
                            Hætta við
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isProcessing}
                            className="flex-1 py-2.5 text-white font-bold bg-[#4A7C9E] rounded-lg hover:bg-[#2E5A75] transition flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                            Staðfesta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
