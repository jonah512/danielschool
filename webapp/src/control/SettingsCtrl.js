// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";
import Resource from "../framework/resource/Resource";
export default class SettingsCtrl {
  constructor() {
    this.baseURL = window.APIURL || 'http://localhost:8080';
  }

  /**
   * Get information about all images
   */
  async getImagesInfo() {
    try {
      Logger.debug('Getting images info from:', `${this.baseURL}/settings/images`);
      const response = await axios.get(`${this.baseURL}/settings/images`);
      Logger.debug('Images info response:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('Error getting images info:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get images info');
    }
  }

  /**
   * Upload a file to replace an existing image
   */
  async uploadImage(filename, file) {
    try {
      Logger.debug('Uploading image:', filename, file.name, file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${this.baseURL}/settings/upload/${filename}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Add progress tracking if needed
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            Logger.debug(`Upload progress for ${filename}: ${percentCompleted}%`);
          }
        }
      );

      Logger.debug('Upload response:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('Error uploading image:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to upload image');
    }
  }

  /**
   * Restore an image from backup
   */
  async restoreImage(filename) {
    try {
      Logger.debug('Restoring image:', filename);
      const response = await axios.post(`${this.baseURL}/settings/restore/${filename}`);
      Logger.debug('Restore response:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('Error restoring image:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to restore image');
    }
  }

  /**
   * Clean up old backup files
   */
  async cleanupBackups(keepCount = 3) {
    try {
      Logger.debug('Cleaning up backups, keeping:', keepCount);
      const response = await axios.delete(`${this.baseURL}/settings/cleanup-backups?keep_count=${keepCount}`);
      Logger.debug('Cleanup response:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('Error cleaning up backups:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to cleanup backups');
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG and PNG files are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB.');
    }

    return true;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get allowed image filenames
   */
  getAllowedImages() {
    return [
      'register01.jpg',
      'register02.jpg',
      'register03.jpg',
      'register04.jpg',
      'register05.jpg',
      'daniel_logo.png',
      'intro.png'
    ];
  }

  /**
   * Get display title for image filename
   */
  getImageTitle(filename) {
    const titles = {
      'register01.jpg': Resource.get('settings.registrationstep1'),
      'register02.jpg': Resource.get('settings.registrationstep2'), 
      'register03.jpg': Resource.get('settings.registrationstep3'),
      'register04.jpg': Resource.get('settings.registrationstep4'),
      'register05.jpg': Resource.get('settings.registrationstep5'),
      'daniel_logo.png': Resource.get('settings.schoollogo'),
      'intro.png': Resource.get('settings.welcomeimage')
    };
    
    return titles[filename] || filename;
  }
}