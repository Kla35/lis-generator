const path = require('path');
const fs = require('fs-extra');
const Parser = require('../lib');

const fixture = path.join(__dirname, 'fixtures', 'lockfile');

test('can parse file using a path', async () => {
    const parser = new Parser();
    const file = await parser.parse(fixture);

    expect(file.length).toBe(5);
    expect(file[0]).toBe('LeagueClient');
    expect(file[1]).toBe('6608');
    expect(file[2]).toBe('18633');
    expect(file[3]).toBe('H9y4kOYVkmjWu_5mVIg1qQ');
    expect(file[4]).toBe('https');
});

test('can parse file using a buffer', async () => {
    const parser = new Parser();
    const fileBuffer = await fs.readFile(fixture);
    const file = await parser.parse(fileBuffer);

    expect(file.length).toBe(5);
    expect(file[0]).toBe('LeagueClient');
    expect(file[1]).toBe('6608');
    expect(file[2]).toBe('18633');
    expect(file[3]).toBe('H9y4kOYVkmjWu_5mVIg1qQ');
    expect(file[4]).toBe('https');
});
