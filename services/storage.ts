import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload an image to Firebase Storage
 * @param file The file or blob to upload
 * @param path The storage path (e.g. 'users/123/profile.jpg')
 * @param onProgress Optional callback for upload progress (0-100)
 * @returns Promise resolving to the download URL
 */
export async function uploadImage(
    file: Blob | File,
    path: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    if (!file) throw new Error('No file provided');

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                if (onProgress) {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(Math.round(progress));
                }
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}
