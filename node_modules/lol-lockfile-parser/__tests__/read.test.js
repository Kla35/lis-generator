const path = require('path');
const fs = require('fs-extra');
const Parser = require('../lib');

const fixture = path.join(__dirname, 'fixtures', 'lockfile');

test('can read file using a path', async () => {
    const parser = new Parser();
    const file = await parser.read(fixture);

    expect(file.process).toBe('LeagueClient');
    expect(file.PID).toBe(6608);
    expect(file.port).toBe(18633);
    expect(file.password).toBe('H9y4kOYVkmjWu_5mVIg1qQ');
    expect(file.protocol).toBe('https');
});

test('can read file using a buffer', async () => {
    const parser = new Parser();
    const fileBuffer = await fs.readFile(fixture);
    const file = await parser.read(fileBuffer);

    expect(file.process).toBe('LeagueClient');
    expect(file.PID).toBe(6608);
    expect(file.port).toBe(18633);
    expect(file.password).toBe('H9y4kOYVkmjWu_5mVIg1qQ');
    expect(file.protocol).toBe('https');
});
