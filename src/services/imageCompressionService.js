// src/services/imageCompressionService.js

/**
 * Image Compression Service
 * Handles image compression and assigning default profile pictures.
 */

import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Compress the image using the Web Worker.
 * @param {File} file - The image file to compress.
 * @returns {Promise<File>} - The compressed image file.
 */
export const handleImageUpload = async (file) => {
  const maxUploadSize = 7 * 1024 * 1024; // 7MB
  if (file.size > maxUploadSize) {
    throw new Error(
      `Image size should not exceed 7MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    );
  }

  try {
    const compressedImage = await compressImageWithDeviceOptimization(file);
    return compressedImage;
  } catch (error) {
    console.error('Error during image compression:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Compress the image based on device performance and network conditions.
 * @param {File} file - The image file to compress.
 * @returns {Promise<File>} - The compressed image file.
 */
const compressImageWithDeviceOptimization = async (file) => {
  // Check for device performance and network conditions
  const userAgent = navigator.userAgent || '';
  const connection = navigator.connection || { effectiveType: '4g' }; // Default to 4G if unavailable

  let compressionQuality = 0.8; // Default quality
  let maxSize = 500 * 1024; // Default max size (500KB)
  const minSize = 250 * 1024; // Minimum size limit in bytes for lossless compression (250KB)

  // Adjust compression quality based on network and device
  if (/Mobi|Android/i.test(userAgent) || connection.effectiveType.includes('3g')) {
    compressionQuality = 0.5; // Lower quality for mobile devices or slow networks
    maxSize = 400 * 1024; // 400KB
  } else if (connection.effectiveType.includes('2g')) {
    compressionQuality = 0.3; // Aggressive compression for very slow networks
    maxSize = 300 * 1024; // 300KB
  }

  console.log(
    `Device: ${userAgent}, Network: ${connection.effectiveType}, Compression Quality: ${compressionQuality}`
  );

  return await compressImage(file, maxSize, minSize, compressionQuality);
};

/**
 * Compress image based on provided parameters.
 * Uses Web Worker to offload the compression process.
 * @param {File} file - The image file to compress.
 * @param {number} maxSize - Maximum size limit in bytes for the compressed image.
 * @param {number} minSize - Minimum size limit in bytes for lossless compression.
 * @param {number} compressionQuality - Compression quality factor.
 * @returns {Promise<File>} - A promise that resolves with the compressed image file.
 */
const compressImage = (file, maxSize, minSize, compressionQuality) => {
  return new Promise((resolve, reject) => {
    if (file.size <= minSize) {
      console.log('File size is small, applying only lossless compression.');
      resolve(file); // No compression needed
      return;
    }

    // Create a Web Worker for image compression
    const worker = new Worker(
      new URL('./workerForImageCompressionService.js', import.meta.url),
      { type: 'module' } // Specify the worker as a module
    );

    // Read the file as an ArrayBuffer
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const arrayBuffer = this.result;

      // Send the file data and compression parameters to the worker
      worker.postMessage(
        {
          arrayBuffer,
          fileName: file.name,
          fileType: file.type,
          maxSize,
          minSize,
          compressionQuality,
        },
        [arrayBuffer] // Transfer arrayBuffer to the worker
      );

      // Listen for the result from the Web Worker
      worker.onmessage = (event) => {
        const { success, compressedArrayBuffer, error, fileName, fileType } =
          event.data;
        if (success) {
          // Reconstruct the File object from the ArrayBuffer
          const compressedFile = new File([compressedArrayBuffer], fileName, {
            type: fileType,
          });
          resolve(compressedFile);
        } else {
          reject(new Error(error));
        }
        worker.terminate(); // Clean up worker
      };

      worker.onerror = (error) => {
        reject(new Error(`Worker Error: ${error.message}`));
        worker.terminate(); // Clean up worker
      };
    };

    fileReader.onerror = function () {
      reject(new Error('Failed to read the file.'));
    };

    fileReader.readAsArrayBuffer(file);
  });
};

/**
 * NOTE: Future enhancement - Debounce/Throttle the compression process to avoid frequent calls when users upload many files at once.
 * WARNING: Do not remove this comment until the feature is implemented.
 */

/**
 * NOTE: Real-time feedback - Implement progress bars or loading indicators for users while compression is happening.
 * WARNING: Do not remove this comment until the feature is implemented.
 */

/**
 * Fetch the list of default profile pictures from Firebase Storage.
 * Caches the list to avoid redundant network requests.
 * @returns {Promise<string[]>} - An array of default profile picture URLs.
 */
let cachedDefaultPictures = null;

export const getRandomDefaultProfilePicture = async () => {
  if (cachedDefaultPictures) {
    // If already cached, return a random one
    return getRandomImage(cachedDefaultPictures);
  }

  try {
    const defaultPicsRef = ref(storage, 'defaultPics');
    const list = await listAll(defaultPicsRef);

    const urlPromises = list.items.map((itemRef) => getDownloadURL(itemRef));
    const urls = await Promise.all(urlPromises);

    cachedDefaultPictures = urls; // Cache the URLs

    return getRandomImage(cachedDefaultPictures);
  } catch (error) {
    console.error("Error fetching default profile pictures:", error);
    // Return a fallback URL if fetching fails
    return 'https://firebasestorage.googleapis.com/v0/b/eternalquill-pm.appspot.com/o/profilePictures%2Fanonymous_tie_profile_pic.jpeg?alt=media'; // Ensure this image exists
  }
};

/**
 * Select a random image URL from an array of URLs.
 * @param {string[]} urls - Array of image URLs.
 * @returns {string} - Randomly selected image URL.
 */
const getRandomImage = (urls) => {
  if (urls.length === 0) {
    return 'https://firebasestorage.googleapis.com/v0/b/eternalquill-pm.appspot.com/o/profilePictures%2Fanonymous_tie_profile_pic.jpeg?alt=media'; // Fallback
  }
  const randomIndex = Math.floor(Math.random() * urls.length);
  return urls[randomIndex];
};
