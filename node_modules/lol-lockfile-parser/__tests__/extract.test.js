const path = require('path');
const fs = require('fs-extra');
const Parser = require('../lib');

const fixture = path.join(__dirname, 'fixtures', 'lockfile');

afterAll(async () => {
    await fs.remove(path.join(__dirname, 'fixtures', 'extracted'));
});

test('can extract file using a path', async () => {
    const parser = new Parser();
    const output = path.join(__dirname, 'fixtures', 'extracted', 'extract-path.json');
    await parser.extract(fixture, output);

    const file = await fs.readJson(output);

    expect(file.process).toBe('LeagueClient');
    expect(file.PID).toBe(6608);
    expect(file.port).toBe(18633);
    expect(file.password).toBe('H9y4kOYVkmjWu_5mVIg1qQ');
    expect(file.protocol).toBe('https');
});

test('can extract file using a buffer', async () => {
    const parser = new Parser();
    const fileBuffer = await fs.readFile(fixture);
    const output = path.join(__dirname, 'fixtures', 'extracted', 'extract-buffer.json');
    await parser.extract(fileBuffer, output);

    const file = await fs.readJson(output);

    expect(file.process).toBe('LeagueClient');
    expect(file.PID).toBe(6608);
    expect(file.port).toBe(18633);
    expect(file.password).toBe('H9y4kOYVkmjWu_5mVIg1qQ');
    expect(file.protocol).toBe('https');
});
