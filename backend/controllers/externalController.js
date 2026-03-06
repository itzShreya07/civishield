/**
 * CiviShield – External API Controller
 *
 * Machine-to-machine endpoint protected by API key authentication.
 * Simulates data exchange with external smart city systems.
 */

const { logAudit } = require('../services/logService');

function getExternalData(req, res) {
    const client = req.externalClient;

    // Simulated smart city infrastructure data payload
    const payload = {
        source: 'CiviShield Gateway',
        client: client.name,
        clientType: client.type,
        permissions: client.permissions,
        timestamp: new Date().toISOString(),
        data: {
            trafficStatus: {
                ward5: { congestionLevel: 'moderate', avgSpeed: '32 km/h', incidents: 1 },
                ward9: { congestionLevel: 'low', avgSpeed: '55 km/h', incidents: 0 },
            },
            waterSystemStatus: {
                supplyPressure: '4.2 bar',
                qualityIndex: 98.5,
                activeLeaks: 1,
                maintenanceAlerts: ['Pipe section W9-04 showing pressure drop'],
            },
            iotSensorHealth: {
                totalSensors: 142,
                online: 138,
                offline: 4,
                batteryLow: 7,
            },
            systemStatus: 'operational',
        },
    };

    return res.json({
        success: true,
        message: 'External data retrieved successfully via CiviShield Gateway.',
        ...payload,
    });
}

module.exports = { getExternalData };
