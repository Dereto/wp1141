import express from 'express';
import { db } from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { GoogleMapsService } from '../services/googleMapsService';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all commute routes for the authenticated user
router.get('/', (req: any, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM commute_routes WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching commute routes:', err);
        return res.status(500).json({ error: 'Failed to fetch commute routes' });
      }
      res.json(rows);
    }
  );
});

// Search places near a location (must be before /:id route)
router.get('/search/places', async (req: any, res) => {
  try {
    const { query, lat, lng, radius = 5000 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
    const places = await GoogleMapsService.searchPlaces(
      query as string,
      location,
      parseInt(radius as string)
    );

    res.json(places);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

// Get directions between two points (must be before /:id route)
router.get('/directions', async (req: any, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Origin and destination parameters are required'
      });
    }

    const directions = await GoogleMapsService.getDirections(
      origin as string,
      destination as string,
      mode as string
    );

    res.json(directions);
  } catch (error) {
    console.error('Error getting directions:', error);
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

// Get a specific commute route
router.get('/:id', (req: any, res) => {
  const userId = req.user.id;
  const routeId = req.params.id;

  db.get(
    'SELECT * FROM commute_routes WHERE id = ? AND user_id = ?',
    [routeId, userId],
    (err, row) => {
      if (err) {
        console.error('Error fetching commute route:', err);
        return res.status(500).json({ error: 'Failed to fetch commute route' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Commute route not found' });
      }
      res.json(row);
    }
  );
});

// Create a new commute route
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      startAddress,
      endAddress,
      transportMode = 'driving'
    } = req.body;

    // Validation
    if (!name || !startAddress || !endAddress) {
      return res.status(400).json({
        error: 'Name, start address, and end address are required'
      });
    }

    // Geocode addresses to get coordinates
    const startGeocode = await GoogleMapsService.geocodeAddress(startAddress);
    const endGeocode = await GoogleMapsService.geocodeAddress(endAddress);

    // Get directions to calculate duration and distance
    const directions = await GoogleMapsService.getDirections(
      startAddress,
      endAddress,
      transportMode
    );

    // Extract duration and distance values safely
    const durationSeconds = directions.duration?.value || 0;
    const distanceMeters = directions.distance?.value || 0;

    // Insert into database
    const routeId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO commute_routes (
          user_id, name, description, start_address, end_address,
          start_lat, start_lng, end_lat, end_lng, transport_mode,
          duration_seconds, distance_meters
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, name, description, startAddress, endAddress,
          startGeocode.lat, startGeocode.lng, endGeocode.lat, endGeocode.lng,
          transportMode, durationSeconds, distanceMeters
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({
      message: 'Commute route created successfully',
      route: {
        id: routeId,
        name,
        description,
        start_address: startAddress,
        end_address: endAddress,
        start_lat: startGeocode.lat,
        start_lng: startGeocode.lng,
        end_lat: endGeocode.lat,
        end_lng: endGeocode.lng,
        transport_mode: transportMode,
        duration_seconds: durationSeconds,
        distance_meters: distanceMeters,
        is_favorite: false
      }
    });
  } catch (error) {
    console.error('Error creating commute route:', error);
    res.status(500).json({ error: 'Failed to create commute route' });
  }
});

// Update a commute route
router.put('/:id', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const routeId = req.params.id;
    const {
      name,
      description,
      startAddress,
      endAddress,
      transportMode,
      isFavorite
    } = req.body;

    // Check if route exists and belongs to user
    const existingRoute = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM commute_routes WHERE id = ? AND user_id = ?',
        [routeId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!existingRoute) {
      return res.status(404).json({ error: 'Commute route not found' });
    }

    // If addresses changed, geocode them
    let startLat: number | undefined, startLng: number | undefined, endLat: number | undefined, endLng: number | undefined, duration: number | undefined, distance: number | undefined;
    
    if (startAddress && endAddress) {
      const startGeocode = await GoogleMapsService.geocodeAddress(startAddress);
      const endGeocode = await GoogleMapsService.geocodeAddress(endAddress);
      const directions = await GoogleMapsService.getDirections(
        startAddress,
        endAddress,
        transportMode || (existingRoute as any).transport_mode
      );
      
      startLat = startGeocode.lat;
      startLng = startGeocode.lng;
      endLat = endGeocode.lat;
      endLng = endGeocode.lng;
      duration = directions.duration.value;
      distance = directions.distance.value;
    }

    // Update route
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE commute_routes SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          start_address = COALESCE(?, start_address),
          end_address = COALESCE(?, end_address),
          start_lat = COALESCE(?, start_lat),
          start_lng = COALESCE(?, start_lng),
          end_lat = COALESCE(?, end_lat),
          end_lng = COALESCE(?, end_lng),
          transport_mode = COALESCE(?, transport_mode),
          duration_seconds = COALESCE(?, duration_seconds),
          distance_meters = COALESCE(?, distance_meters),
          is_favorite = COALESCE(?, is_favorite),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?`,
        [
          name, description, startAddress, endAddress,
          startLat, startLng, endLat, endLng,
          transportMode, duration, distance, isFavorite,
          routeId, userId
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ message: 'Commute route updated successfully' });
  } catch (error) {
    console.error('Error updating commute route:', error);
    res.status(500).json({ error: 'Failed to update commute route' });
  }
});

// Delete a commute route
router.delete('/:id', (req: any, res) => {
  const userId = req.user.id;
  const routeId = req.params.id;

  db.run(
    'DELETE FROM commute_routes WHERE id = ? AND user_id = ?',
    [routeId, userId],
    function(err) {
      if (err) {
        console.error('Error deleting commute route:', err);
        return res.status(500).json({ error: 'Failed to delete commute route' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Commute route not found' });
      }
      res.json({ message: 'Commute route deleted successfully' });
    }
  );
});


export { router as commuteRoutes };
