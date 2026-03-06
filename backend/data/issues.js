// In-memory issue store (mock data for hackathon MVP)

const issues = [
    {
        id: 'i1',
        title: 'Broken Street Light',
        description: 'Street light on Main Road has been off for 3 days.',
        category: 'Infrastructure',
        status: 'open',
        zone: 'Ward 5',
        createdBy: 'u1',
        assignedTo: 'u2',
        createdAt: new Date('2026-03-01T08:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-01T08:00:00Z').toISOString(),
    },
    {
        id: 'i2',
        title: 'Garbage Not Collected',
        description: 'Garbage has not been collected since Monday.',
        category: 'Sanitation',
        status: 'in_progress',
        zone: 'Ward 5',
        createdBy: 'u1',
        assignedTo: 'u2',
        createdAt: new Date('2026-03-02T09:30:00Z').toISOString(),
        updatedAt: new Date('2026-03-02T10:00:00Z').toISOString(),
    },
    {
        id: 'i3',
        title: 'Water Pipe Leak',
        description: 'Major water pipe leak causing road damage.',
        category: 'Water',
        status: 'open',
        zone: 'Ward 9',
        createdBy: 'u1',
        assignedTo: 'u3',
        createdAt: new Date('2026-03-03T11:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-03T11:00:00Z').toISOString(),
    },
    {
        id: 'i4',
        title: 'Pothole on Highway',
        description: 'Large pothole causing traffic issues near junction.',
        category: 'Roads',
        status: 'resolved',
        zone: 'Ward 9',
        createdBy: 'u1',
        assignedTo: 'u3',
        createdAt: new Date('2026-03-04T07:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-05T15:00:00Z').toISOString(),
    },
];

module.exports = { issues };
