import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMap } from '../contexts/MapContext';
import { commuteService } from '../services/commuteService';
import type { CommuteRoute } from '../services/commuteService';

const RouteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { map, isMapLoaded } = useMap();
  const [route, setRoute] = useState<CommuteRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadRoute(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (route && map) {
      // Add markers for start and end points
      new (window as any).google.maps.Marker({
        position: { lat: route.start_lat, lng: route.start_lng },
        map: map,
        title: '起點',
        label: 'A',
      });

      new (window as any).google.maps.Marker({
        position: { lat: route.end_lat, lng: route.end_lng },
        map: map,
        title: '終點',
        label: 'B',
      });

      // Fit map to show both markers
      const bounds = new (window as any).google.maps.LatLngBounds();
      bounds.extend({ lat: route.start_lat, lng: route.start_lng });
      bounds.extend({ lat: route.end_lat, lng: route.end_lng });
      map.fitBounds(bounds);

      // Get directions and display route
      if (isMapLoaded) {
        const directionsService = new (window as any).google.maps.DirectionsService();
        const directionsRenderer = new (window as any).google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);

        directionsService.route(
          {
            origin: { lat: route.start_lat, lng: route.start_lng },
            destination: { lat: route.end_lat, lng: route.end_lng },
            travelMode: route.transport_mode === 'driving' ? (window as any).google.maps.TravelMode.DRIVING :
                       route.transport_mode === 'walking' ? (window as any).google.maps.TravelMode.WALKING :
                       route.transport_mode === 'bicycling' ? (window as any).google.maps.TravelMode.BICYCLING :
                       (window as any).google.maps.TravelMode.TRANSIT,
          },
          (result: any, status: any) => {
            if (status === 'OK' && result) {
              directionsRenderer.setDirections(result);
            }
          }
        );
      }
    }
  }, [route, map, isMapLoaded]);

  const loadRoute = async (routeId: number) => {
    try {
      setLoading(true);
      const routeData = await commuteService.getRoute(routeId);
      setRoute(routeData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!route) return;
    
    try {
      await commuteService.updateRoute(route.id, { isFavorite: !route.is_favorite });
      setRoute({ ...route, is_favorite: !route.is_favorite });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoute = async () => {
    if (!route) return;
    
    if (window.confirm('確定要刪除此路線嗎？')) {
      try {
        await commuteService.deleteRoute(route.id);
        navigate('/');
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小時${minutes}分鐘`;
    }
    return `${minutes}分鐘`;
  };

  const formatDistance = (meters: number) => {
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

  if (error || !route) {
    return (
      <Box>
        <Alert severity="error">
          {error || '路線不存在'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          返回首頁
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {route.name}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <IconButton onClick={handleToggleFavorite}>
            {route.is_favorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
          </IconButton>
          <IconButton onClick={handleDeleteRoute}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                路線資訊
              </Typography>
              
              {route.description && (
                <Typography variant="body1" paragraph>
                  {route.description}
                </Typography>
              )}

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  起點
                </Typography>
                <Typography variant="body1">
                  {route.start_address}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  終點
                </Typography>
                <Typography variant="body1">
                  {route.end_address}
                </Typography>
              </Box>

              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={formatDuration(route.duration_seconds)}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={formatDistance(route.distance_meters)}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  label={route.transport_mode}
                  variant="outlined"
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                建立時間: {new Date(route.created_at).toLocaleString('zh-TW')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                路線地圖
              </Typography>
              <Box
                ref={mapRef}
                sx={{
                  height: '400px',
                  width: '100%',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default RouteDetail;
