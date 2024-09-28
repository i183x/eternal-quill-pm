// src/services/workerForImageCompressionService.js

/* eslint-disable no-restricted-globals */

import imageCompression from 'browser-image-compression';

self.addEventListener('message', async (event) => {
  const {
    arrayBuffer,
    fileName,
    fileType,
    maxSize,
    minSize,
    compressionQuality,
  } = event.data;

  if (!arrayBuffer) {
    self.postMessage({
      success: false,
      error: 'Image data is undefined or invalid. Please provide a valid image file.',
    });
    return;
  }

  try {
    // Reconstruct the File object from the arrayBuffer
    const file = new File([arrayBuffer], fileName, { type: fileType });

    const compressedFile = await compressImageInWorker(
      file,
      maxSize,
      minSize,
      compressionQuality
    );

    // Read the compressed file as ArrayBuffer to send back
    const reader = new FileReader();
    reader.onload = function () {
      const compressedArrayBuffer = this.result;
      self.postMessage(
        {
          success: true,
          compressedArrayBuffer,
          fileName: compressedFile.name,
          fileType: compressedFile.type,
        },
        [compressedArrayBuffer] // Transfer compressedArrayBuffer back
      );
    };
    reader.onerror = function () {
      self.postMessage({
        success: false,
        error: 'Failed to read the compressed file.',
      });
    };
    reader.readAsArrayBuffer(compressedFile);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
    });
  }
});

const compressImageInWorker = async (file, maxSize, minSize, compressionQuality) => {
  let options = {
    maxSizeMB: maxSize / 1024 / 1024,
    maxWidthOrHeight: 1920,
    useWebWorker: false, // Already in a worker
    initialQuality: compressionQuality,
    maxIteration: 10,
  };

  let compressedFile = file;
  let iteration = 0;

  while (compressedFile.size > maxSize && iteration < options.maxIteration) {
    compressedFile = await imageCompression(compressedFile, options);
    options.initialQuality *= 0.9; // Reduce quality
    iteration++;
  }

  if (compressedFile.size > maxSize) {
    throw new Error(
      'Unable to compress image to the desired size. Please select a smaller image.'
    );
  }

  return compressedFile;
};

/**
 * NOTE: Future improvement - Debounce/Throttle the compression process within the worker.
 * WARNING: Do not remove this comment until the feature is implemented.
 */
