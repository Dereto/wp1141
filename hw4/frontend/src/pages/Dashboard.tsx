import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useMap } from '../contexts/MapContext';
import { commuteService } from '../services/commuteService';
import type { CommuteRoute, CreateRouteData } from '../services/commuteService';

const Dashboard: React.FC = () => {
  const { } = useAuth();
  const { map, setMap, isMapLoaded, setIsMapLoaded } = useMap();
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreateRouteData>({
    name: '',
    description: '',
    startAddress: '',
    endAddress: '',
    transportMode: 'driving',
  });
  const mapRef = useRef<HTMLDivElement>(null);

  // Load routes on component mount
  useEffect(() => {
    loadRoutes();
  }, []);

  // Initialize Google Maps using callback approach (like test-map.html)
  useEffect(() => {
    // Prevent multiple initializations
    if (isMapLoaded) {
      return;
    }
    
    // Define global callback function FIRST, before any script loading
    (window as any).initMapCallback = () => {
      // Wait a bit for DOM to be ready
      setTimeout(() => {
        createMap();
      }, 200);
    };
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // If script exists but map not loaded, try to create map directly
      if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map) {
        setTimeout(() => createMap(), 200);
      } else {
        // Script exists but API not ready, wait for it
        const checkInterval = setInterval(() => {
          if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map) {
            clearInterval(checkInterval);
            createMap();
          }
        }, 100);
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
      return;
    }
    
    // Create script with callback parameter (like test-map.html)
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_JS_KEY}&libraries=places&callback=initMapCallback&loading=async`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    googleMapsScript.onerror = (error) => {
      console.error('Error loading Google Maps script:', error);
    };
    
    document.head.appendChild(googleMapsScript);
    
    // Cleanup function
    return () => {
      // Remove global callback
      delete (window as any).initMapCallback;
    };
  }, []); // Run only once on mount
    
  const createMap = () => {
    // Double-check to prevent multiple map instances
    if (isMapLoaded) {
      return;
    }
    
    if (!mapRef.current) {
      setTimeout(createMap, 200);
      return;
    }
    
    try {
      if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map && mapRef.current) {
        const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 25.0330, lng: 121.5654 }, // Taipei coordinates
          zoom: 12,
        });
        
        setMap(mapInstance);
        setIsMapLoaded(true);
      } else {
        // Retry after a delay
        setTimeout(createMap, 500);
      }
    } catch (error) {
      console.error('Error creating Google Maps instance:', error);
      // Retry after a delay
      setTimeout(createMap, 500);
    }
  };

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const routesData = await commuteService.getRoutes();
      setRoutes(routesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async () => {
    try {
      const newRoute = await commuteService.createRoute(formData);
      
      // Update routes state with the new route
      setRoutes(prevRoutes => [newRoute, ...prevRoutes]);
      
      setOpenDialog(false);
      setFormData({
        name: '',
        description: '',
        startAddress: '',
        endAddress: '',
        transportMode: 'driving',
      });
      
      // Center map on new route
      if (map && newRoute.start_lat && newRoute.start_lng) {
        map.setCenter({
          lat: newRoute.start_lat,
          lng: newRoute.start_lng,
        });
        map.setZoom(15);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (window.confirm('確定要刪除此路線嗎？')) {
      try {
        await commuteService.deleteRoute(id);
        setRoutes(routes.filter(route => route.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleToggleFavorite = async (route: CommuteRoute) => {
    try {
      await commuteService.updateRoute(route.id, { isFavorite: !route.is_favorite });
      setRoutes(routes.map(r => 
        r.id === route.id ? { ...r, is_favorite: !r.is_favorite } : r
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRouteClick = (route: CommuteRoute) => {
    if (map) {
      // Clear existing markers and polylines
      clearMapOverlays();
      
      // Center map on route
      const bounds = new (window as any).google.maps.LatLngBounds();
      
      // Add start marker
      const startMarker = new (window as any).google.maps.Marker({
        position: { lat: route.start_lat, lng: route.start_lng },
        map: map,
        title: `起點: ${route.start_address}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });
      
      // Add end marker
      const endMarker = new (window as any).google.maps.Marker({
        position: { lat: route.end_lat, lng: route.end_lng },
        map: map,
        title: `終點: ${route.end_address}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });
      
      // Store markers for cleanup
      (window as any).mapMarkers = [startMarker, endMarker];
      
      // Add route polyline
      const directionsService = new (window as any).google.maps.DirectionsService();
      const directionsRenderer = new (window as any).google.maps.DirectionsRenderer({
        suppressMarkers: true, // We're using custom markers
        polylineOptions: {
          strokeColor: '#1976d2',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      directionsRenderer.setMap(map);
      (window as any).directionsRenderer = directionsRenderer;
      
      // Get directions
      directionsService.route({
        origin: { lat: route.start_lat, lng: route.start_lng },
        destination: { lat: route.end_lat, lng: route.end_lng },
        travelMode: (window as any).google.maps.TravelMode[route.transport_mode.toUpperCase()] || (window as any).google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          
          // Fit map to show entire route
          const routeBounds = result.routes[0].bounds;
          map.fitBounds(routeBounds);
        } else {
          console.error('Directions request failed:', status);
          // Fallback: just center on start point
          map.setCenter({ lat: route.start_lat, lng: route.start_lng });
          map.setZoom(12);
        }
      });
      
      // Extend bounds to include both markers
      bounds.extend({ lat: route.start_lat, lng: route.start_lng });
      bounds.extend({ lat: route.end_lat, lng: route.end_lng });
      
      // Fit map to bounds with some padding
      map.fitBounds(bounds);
    }
  };

  const clearMapOverlays = () => {
    // Clear markers
    if ((window as any).mapMarkers) {
      (window as any).mapMarkers.forEach((marker: any) => marker.setMap(null));
      (window as any).mapMarkers = [];
    }
    
    // Clear directions
    if ((window as any).directionsRenderer) {
      (window as any).directionsRenderer.setMap(null);
      (window as any).directionsRenderer = null;
    }
  };

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds || isNaN(seconds)) return '計算中...';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小時${minutes}分鐘`;
    }
    return `${minutes}分鐘`;
  };

  const formatDistance = (meters: number | undefined | null) => {
    if (!meters || isNaN(meters)) return '計算中...';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}公里`;
    }
    return `${meters}公尺`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        我的通勤路線
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        flexDirection: { xs: 'column', md: 'row' },
        flex: 1,
        minHeight: 0 // Allow flex item to shrink
      }}>
        {/* Routes List */}
        <Box sx={{ 
          flex: { xs: '1 1 auto', md: '0 0 400px' },
          minWidth: { md: '400px' },
          maxWidth: { md: '400px' }
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">路線列表</Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearMapOverlays}
                    disabled={!isMapLoaded}
                  >
                    清除地圖
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                  >
                    新增路線
                  </Button>
                </Box>
              </Box>
              
              <List>
                {routes.map((route) => (
                  <ListItem key={route.id} onClick={() => handleRouteClick(route)}>
                    <ListItemText
                      primary={route.name}
                      secondary={
                        <Box>
                          <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 1 }}>
                            {route.start_address} → {route.end_address}
                          </Box>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip
                              label={formatDuration(route.duration_seconds)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={formatDistance(route.distance_meters)}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                            <Chip
                              label={route.transport_mode}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(route);
                        }}
                      >
                        {route.is_favorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoute(route.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Map */}
        <Box sx={{ 
          flex: '1 1 auto',
          minWidth: 0, // Allow flex item to shrink below content size
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
              <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                地圖
              </Typography>
              <Box
                ref={mapRef}
                sx={{
                  flex: 1,
                  width: '100%',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5',
                  minHeight: '400px',
                }}
              />
              {!isMapLoaded && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: 2,
                    borderRadius: 1,
                    zIndex: 1000,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    載入地圖中...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Create Route Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新增通勤路線</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="路線名稱"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="描述（選填）"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="起點地址"
            fullWidth
            variant="outlined"
            value={formData.startAddress}
            onChange={(e) => setFormData({ ...formData, startAddress: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="終點地址"
            fullWidth
            variant="outlined"
            value={formData.endAddress}
            onChange={(e) => setFormData({ ...formData, endAddress: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="交通方式"
            fullWidth
            variant="outlined"
            select
            SelectProps={{ native: true }}
            value={formData.transportMode}
            onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
          >
            <option value="driving">開車</option>
            <option value="walking">步行</option>
            <option value="bicycling">騎自行車</option>
            <option value="transit">大眾運輸</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button
            onClick={handleCreateRoute}
            variant="contained"
            disabled={!formData.name || !formData.startAddress || !formData.endAddress}
          >
            建立路線
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
