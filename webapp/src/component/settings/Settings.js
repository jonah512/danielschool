// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Typography, 
  Button, 
  Stack,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestoreIcon from '@mui/icons-material/Restore';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import Resource from '../../framework/resource/Resource';
import Logger from '../../framework/logger/Logger';
import SettingsCtrl from '../../control/SettingsCtrl';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Settings(props) {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [uploadMessage, setUploadMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [showAlert, setShowAlert] = useState(false);
  const fileInputRefs = useRef({});
  const settingsCtrl = new SettingsCtrl();

  // Load images info on component mount
  useEffect(() => {
    loadImagesInfo();
  }, []);

  const loadImagesInfo = async () => {
    setLoading(true);
    try {
      // Try to load from API first, fallback to defaults
      try {
        const response = await settingsCtrl.getImagesInfo();
        const imageMap = {};
        response.images.forEach(img => {
          imageMap[img.filename] = `${settingsCtrl.baseURL}${img.path}`;
        });
        setImages(imageMap);
        Logger.debug('Loaded images info from API:', imageMap);
      } catch (apiError) {
        // Fallback to service URLs for all allowed images
        Logger.error('API not available, using service URLs:', apiError.message);
        const defaultImages = {};
        settingsCtrl.getAllowedImages().forEach(filename => {
          defaultImages[filename] = `${settingsCtrl.baseURL}/settings/image/${filename}`;
        });
        setImages(defaultImages);
        Logger.debug('Using fallback images:', defaultImages);
      }
    } catch (error) {
      Logger.error('Error loading images info:', error);
      setUploadMessage(Resource.get('common.failedloadimages'));
      setAlertSeverity('error');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (imageName, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Add to uploading files
    setUploadingFiles(prev => new Set([...prev, imageName]));

    try {
      // Validate file using controller
      settingsCtrl.validateFile(file);

      // Try to upload via API
      try {
        const response = await settingsCtrl.uploadImage(imageName, file);
        
        // Reload images info to get updated path with cache busting
        await loadImagesInfo();
        
        // Add cache busting timestamp to force browser refresh
        const timestamp = new Date().getTime();
        setImages(prev => ({
          ...prev,
          [imageName]: `${settingsCtrl.baseURL}/settings/image/${imageName}?t=${timestamp}`
        }));
        
        setUploadMessage(Resource.get('common.uploadedsuccessfully', file.name, imageName));
        setAlertSeverity('success');
        setShowAlert(true);
        
      } catch (apiError) {
        // Fallback to local preview
        Logger.error('API upload failed, using local preview:', apiError.message);
        
        const fileURL = URL.createObjectURL(file);
        setImages(prev => ({
          ...prev,
          [imageName]: fileURL
        }));
        
        setUploadMessage(Resource.get('common.uploadedlocally', file.name, imageName));
        setAlertSeverity('warning');
        setShowAlert(true);
      }

    } catch (error) {
      Logger.error('Error uploading file:', error);
      setUploadMessage(error.message || Resource.get('common.failedupload'));
      setAlertSeverity('error');
      setShowAlert(true);
    } finally {
      // Remove from uploading files
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageName);
        return newSet;
      });
      
      // Reset the file input
      if (fileInputRefs.current[imageName]) {
        fileInputRefs.current[imageName].value = '';
      }
    }
  };

  const handleRestoreImage = async (imageName) => {
    try {
      setUploadingFiles(prev => new Set([...prev, imageName]));
      
      try {
        await settingsCtrl.restoreImage(imageName);
        
        // Reload images info to get updated path with cache busting
        await loadImagesInfo();
        
        // Add cache busting timestamp to force browser refresh
        const timestamp = new Date().getTime();
        setImages(prev => ({
          ...prev,
          [imageName]: `${settingsCtrl.baseURL}/settings/image/${imageName}?t=${timestamp}`
        }));
        
        setUploadMessage(Resource.get('common.restoredsuccessfully', imageName));
        setAlertSeverity('success');
        setShowAlert(true);
        
      } catch (apiError) {
        // Fallback to service URL
        Logger.error('API restore failed, using service URL:', apiError.message);
        
        setImages(prev => ({
          ...prev,
          [imageName]: `${settingsCtrl.baseURL}/settings/image/${imageName}`
        }));
        
        setUploadMessage(Resource.get('common.restoreddefault', imageName));
        setAlertSeverity('warning');
        setShowAlert(true);
      }
      
    } catch (error) {
      Logger.error('Error restoring image:', error);
      setUploadMessage(Resource.get('common.failedrestore'));
      setAlertSeverity('error');
      setShowAlert(true);
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageName);
        return newSet;
      });
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const getImageTitle = (imageName) => {
    return settingsCtrl.getImageTitle(imageName);
  };

  const formatFileSize = (bytes) => {
    return settingsCtrl.formatFileSize(bytes);
  };

  const imageNames = Object.keys(images);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {Resource.get('menu.settings')}
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        {Resource.get('common.uploadimages')}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {Resource.get('common.uploadsettingsinfo')}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {imageNames.map((imageName) => {
          const isUploading = uploadingFiles.has(imageName);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={imageName}>
              <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {isUploading && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      backgroundColor: 'rgba(0,0,0,0.5)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                )}
                
                <CardMedia
                  component="img"
                  height="200"
                  image={images[imageName]}
                  alt={imageName}
                  sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                  onError={(e) => {
                    // Create a simple colored rectangle as fallback
                    e.target.style.display = 'none';
                    const parentDiv = e.target.parentElement;
                    if (parentDiv && !parentDiv.querySelector('.fallback-image')) {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'fallback-image';
                      fallbackDiv.style.height = '200px';
                      fallbackDiv.style.backgroundColor = '#e0e0e0';
                      fallbackDiv.style.display = 'flex';
                      fallbackDiv.style.alignItems = 'center';
                      fallbackDiv.style.justifyContent = 'center';
                      fallbackDiv.style.color = '#666';
                      fallbackDiv.style.fontSize = '14px';
                      fallbackDiv.textContent = Resource.get('common.imagenotfound');
                      parentDiv.appendChild(fallbackDiv);
                    }
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {getImageTitle(imageName)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {imageName}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                    <Chip 
                      label={Resource.get('common.active')} 
                      color="success" 
                      size="small" 
                    />
                    <Tooltip title={Resource.get('common.fileinformation')}>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', pb: 2, px: 2 }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    size="small"
                    disabled={isUploading}
                  >
                    {Resource.get('common.upload')}
                    <VisuallyHiddenInput
                      ref={el => fileInputRefs.current[imageName] = el}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(event) => handleFileUpload(imageName, event)}
                    />
                  </Button>
                  
                  <Tooltip title={Resource.get('common.restoretooriginal')}>
                    <IconButton
                      onClick={() => handleRestoreImage(imageName)}
                      disabled={isUploading}
                      size="small"
                    >
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {uploadMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
