const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#FF0000');
    gradient.addColorStop(1, '#CC0000');

    // Draw circle background
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#AA0000';
    ctx.lineWidth = size/32;
    ctx.stroke();

    // Draw play triangle
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(size * 0.35, size * 0.3);
    ctx.lineTo(size * 0.35, size * 0.7);
    ctx.lineTo(size * 0.7, size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Add "3×" text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.25}px Arial`;
    ctx.fillText('3×', size * 0.6, size * 0.8);

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icons/icon${size}.png`, buffer);
}

// Generate icons in all required sizes
[16, 48, 128].forEach(size => createIcon(size));
