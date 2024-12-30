const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, size, size);

    // Draw play symbol (triangle)
    ctx.fillStyle = 'white';
    const triangleSize = size * 0.6;
    const startX = (size - triangleSize) / 2 + triangleSize * 0.2;
    const startY = (size - triangleSize) / 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + triangleSize);
    ctx.lineTo(startX + triangleSize * 0.8, startY + triangleSize / 2);
    ctx.closePath();
    ctx.fill();

    // Add speed text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('3×', size * 0.75, size * 0.8);

    // Save as PNG
    try {
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`icons/icon${size}.png`, buffer);
        console.log(`Created icon${size}.png`);
    } catch (error) {
        console.error(`Error creating icon${size}.png:`, error);
    }
}

try {
    // Ensure icons directory exists
    if (!fs.existsSync('icons')) {
        fs.mkdirSync('icons');
    }

    // Generate icons
    [16, 48, 128].forEach(size => createIcon(size));
    console.log('Icon generation complete');
} catch (error) {
    console.error('Error during icon generation:', error);
}