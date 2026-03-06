// In-memory API key store for external system clients

const apiKeys = [
    {
        key: 'cs_traffic_sensor_key_7f8e9a',
        clientName: 'Traffic Sensor Network',
        clientType: 'IoT',
        permissions: ['read'],
        active: true,
    },
    {
        key: 'cs_water_mgmt_key_2b3c4d',
        clientName: 'Water Management System',
        clientType: 'Platform',
        permissions: ['read', 'write'],
        active: true,
    },
    {
        key: 'cs_civiflow_int_key_5e6f7a',
        clientName: 'CiviFlow Integration',
        clientType: 'CiviFlow',
        permissions: ['read', 'write', 'admin'],
        active: true,
    },
    {
        key: 'cs_revoked_key_9x0y1z',
        clientName: 'Old IoT System',
        clientType: 'IoT',
        permissions: ['read'],
        active: false,
    },
];

module.exports = { apiKeys };
