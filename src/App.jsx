import React, { useEffect, useRef, useState } from 'react';
import { Download, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

// Import the schedule data (you would normally fetch this from the API)
const TIMBERS_SCHEDULE = [
	{
		id: 77475720,
		sport_id: 1,
		league_id: 3211,
		season_id: 25191,
		type_id: 223,
		name: 'Group Stage',
		sort_order: 1,
		finished: false,
		is_current: false,
		starting_at: '2025-07-28',
		ending_at: '2025-08-06',
		games_in_current_week: false,
		rounds: [
			{
				id: 367605,
				fixtures: [
					{
						id: 19387584,
						name: 'Portland Timbers vs Querétaro',
						starting_at: '2025-08-01 22:00:00',
						state_id: 1,
						participants: [
							{
								id: 607,
								name: 'Portland Timbers',
								short_code: 'POT',
								image_path:
									'https://cdn.sportmonks.com/images/soccer/teams/31/607.png',
								meta: { location: 'home' },
							},
							{
								id: 538,
								name: 'Querétaro',
								short_code: 'QUE',
								image_path:
									'https://cdn.sportmonks.com/images/soccer/teams/26/538.png',
								meta: { location: 'away' },
							},
						],
					},
				],
			},
		],
	},
	{
		id: 77475053,
		name: 'Regular Season',
		fixtures: [
			{
				id: 19352962,
				name: 'Portland Timbers vs New England',
				starting_at: '2025-07-06 02:30:00',
				state_id: 1,
				participants: [
					{
						id: 607,
						name: 'Portland Timbers',
						short_code: 'POT',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/31/607.png',
						meta: { location: 'home' },
					},
					{
						id: 641,
						name: 'New England',
						short_code: 'NER',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/1/641.png',
						meta: { location: 'away' },
					},
				],
			},
			{
				id: 19352889,
				name: 'Portland Timbers vs Colorado Rapids',
				starting_at: '2025-05-29 02:30:00',
				state_id: 1,
				participants: [
					{
						id: 607,
						name: 'Portland Timbers',
						short_code: 'POT',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/31/607.png',
						meta: { location: 'home' },
					},
					{
						id: 179,
						name: 'Colorado Rapids',
						short_code: 'CLR',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/19/179.png',
						meta: { location: 'away' },
					},
				],
			},
			{
				id: 19352908,
				name: 'Portland Timbers vs St. Louis City',
				starting_at: '2025-06-08 23:00:00',
				state_id: 1,
				participants: [
					{
						id: 607,
						name: 'Portland Timbers',
						short_code: 'POT',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/31/607.png',
						meta: { location: 'home' },
					},
					{
						id: 267299,
						name: 'St. Louis City',
						short_code: 'LOU',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/3/267299.png',
						meta: { location: 'away' },
					},
				],
			},
			{
				id: 19352912,
				name: 'Portland Timbers vs SJ Earthquakes',
				starting_at: '2025-06-14 02:30:00',
				state_id: 1,
				participants: [
					{
						id: 607,
						name: 'Portland Timbers',
						short_code: 'POT',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/31/607.png',
						meta: { location: 'home' },
					},
					{
						id: 287,
						name: 'SJ Earthquakes',
						short_code: 'SJE',
						image_path:
							'https://cdn.sportmonks.com/images/soccer/teams/31/287.png',
						meta: { location: 'away' },
					},
				],
			},
		],
	},
];

const TimbersWallpaperGenerator = () => {
	const canvasRef = useRef(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [selectedBackground, setSelectedBackground] = useState('');
	const [selectedTheme, setSelectedTheme] = useState('classic');
	const [selectediPhoneSize, setSelectediPhoneSize] = useState('iphone15');
	const [availableImages, setAvailableImages] = useState([]);
	const [isLoadingImages, setIsLoadingImages] = useState(true);

	// Portland Timbers brand colors
	const TIMBERS_GREEN = '#004225';
	const TIMBERS_GOLD = '#d69a00';
	const TIMBERS_WHITE = '#FFFFFF';

	// iPhone size options
	const iPhoneSizes = [
		{ value: 'iphone15', label: 'iPhone 12 or newer', width: 1179, height: 2556 },
		{ value: 'iphone15plus', label: 'iPhone 12 Plus or newer', width: 1290, height: 2796 },
		{ value: 'custom', label: 'Custom (1080x2337)', width: 1080, height: 2337 },
	];

	// Get current iPhone dimensions
	const getCurrentDimensions = () => {
		const selected = iPhoneSizes.find(size => size.value === selectediPhoneSize);
		return selected || iPhoneSizes[0];
	};

	// Function to dynamically load images from patches folder using manifest
	const loadAvailableImages = async () => {
		setIsLoadingImages(true);
		const detectedImages = [];

		try {
			console.log('Loading patches from manifest...');

			// Try to load the patches manifest file
			const response = await fetch('/patches/patches-manifest.json');

			if (response.ok) {
				const manifest = await response.json();
				console.log('Manifest loaded successfully:', manifest);

				// Validate and process the manifest
				if (manifest.patches && Array.isArray(manifest.patches)) {
					for (const patch of manifest.patches) {
						if (patch.filename && patch.label) {
							// Verify the image actually exists
							try {
								const imageResponse = await fetch(`/patches/${patch.filename}`, { method: 'HEAD' });
								if (imageResponse.ok) {
									detectedImages.push({
										value: patch.filename,
										label: patch.label,
										description: patch.description || '',
									});
									console.log(`✓ Found: ${patch.filename}`);
								} else {
									console.warn(`✗ Image listed in manifest but not found: ${patch.filename}`);
								}
							} catch (error) {
								console.warn(`✗ Could not verify image: ${patch.filename}`, error);
							}
						} else {
							console.warn('Invalid patch entry (missing filename or label):', patch);
						}
					}
				} else {
					console.error('Invalid manifest format: patches array not found or not an array');
				}

				console.log(`Successfully loaded ${detectedImages.length} images from manifest`);
			} else {
				console.log('No patches-manifest.json found. Please create one in /public/patches/');
			}
		} catch (error) {
			console.error('Error loading patches manifest:', error);
		}

		setAvailableImages(detectedImages);

		// Set first available image as default if none selected
		if (detectedImages.length > 0 && !selectedBackground) {
			setSelectedBackground(detectedImages[0].value);
			console.log(`Set default background to: ${detectedImages[0].value}`);
		}

		setIsLoadingImages(false);
	};

	// Theme options for main background
	const themeOptions = [
		{ value: 'classic', label: 'Classic', description: 'Traditional dark gradient' },
		{ value: 'forest', label: 'Forest', description: 'Deep green forest vibes' },
		{ value: 'night', label: 'Night', description: 'Midnight black with stars' },
		{ value: 'providence', label: 'Providence Park', description: 'Stadium lights and atmosphere' },
		{ value: 'rose', label: 'Rose City', description: 'Rose and thorn inspired' },
		{ value: 'timber', label: 'Timber Joey', description: 'Log slab inspired pattern' }
	];

	// Get theme colors and background
	const getThemeBackground = (ctx, width, height) => {
		switch (selectedTheme) {
			case 'providence': {
				// Providence Park theme - Stadium lights effect
				const grad = ctx.createRadialGradient(width/2, 0, 0, width/2, height/2, width);
				grad.addColorStop(0, '#ffffff');
				grad.addColorStop(0.2, '#004225');
				grad.addColorStop(0.6, '#002815');
				grad.addColorStop(1, '#001a0d');
				return grad;
			}
			case 'rose': {
				// Rose City theme - Deep reds and greens
				const grad = ctx.createLinearGradient(0, 0, 0, height);
				grad.addColorStop(0, '#4a1c1c');
				grad.addColorStop(0.4, '#004225');
				grad.addColorStop(0.7, '#002815');
				grad.addColorStop(1, '#000000');
				return grad;
			}
			case 'timber': {
				// Timber Joey theme - Wood grain inspired
				const grad = ctx.createLinearGradient(0, 0, width, height);
				grad.addColorStop(0, '#4d2600');
				grad.addColorStop(0.3, '#004225');
				grad.addColorStop(0.7, '#002815');
				grad.addColorStop(1, '#000000');
				return grad;
			}
			case 'forest': {
				// Forest theme - Deep greens with nature gradient
				const forestGradient = ctx.createRadialGradient(width / 2, height / 3, 0, width / 2, height, width);
				forestGradient.addColorStop(0, '#1a4c33'); // Dark forest green
				forestGradient.addColorStop(0.4, '#0d3b2a'); // Deeper green
				forestGradient.addColorStop(0.7, '#062820'); // Very dark green
				forestGradient.addColorStop(1, '#041a16'); // Almost black green
				return forestGradient;
			}
			case 'night': {
				// Night theme - Deep blues and blacks with subtle stars
				const nightGradient = ctx.createRadialGradient(width / 2, 0, 0, width / 2, height, width);
				nightGradient.addColorStop(0, '#1a1a2e'); // Dark blue
				nightGradient.addColorStop(0.3, '#16213e'); // Navy blue
				nightGradient.addColorStop(0.6, '#0f1419'); // Very dark blue
				nightGradient.addColorStop(1, '#000000'); // Black
				return nightGradient;
			}
			case 'classic':
			default: {
				// Classic theme - Original Timbers colors
				const classicGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
				classicGradient.addColorStop(0, TIMBERS_GREEN);
				classicGradient.addColorStop(1, '#000000');
				return classicGradient;
			}
		}
	};

	const addThemeEffects = (ctx, width, height) => {
		switch (selectedTheme) {
			case 'providence': {
				// Add stadium light flares
				ctx.globalAlpha = 0.1;
				for (let i = 0; i < 5; i++) {
					const x = (width / 5) * (i + 0.5);
					const gradSize = width * 0.3;
					const flare = ctx.createRadialGradient(x, 0, 0, x, 0, gradSize);
					flare.addColorStop(0, '#ffffff');
					flare.addColorStop(1, 'transparent');
					ctx.fillStyle = flare;
					ctx.fillRect(x - gradSize/2, 0, gradSize, gradSize);
				}
				ctx.globalAlpha = 1;
				break;
			}
			case 'rose': {
				// Add rose pattern effect
				ctx.globalAlpha = 0.15; // Increased from 0.1
				const roseSize = width * 0.15; // Increased from 0.08
				const spacing = roseSize * 1.2; // Adjusted spacing
				const numRows = Math.ceil(height / spacing) + 1;
				const numCols = Math.ceil(width / spacing) + 1;

				// Create rose path once
				const drawRose = (x, y, angle) => {
					ctx.save();
					ctx.translate(x, y);
					ctx.rotate(angle);
					
					// Simplified rose path
					ctx.beginPath();
					// Petals
					for (let i = 0; i < 8; i++) {
						const petalAngle = (i * Math.PI * 2) / 8;
						const innerRadius = roseSize * 0.4; // Increased from 0.2
						const outerRadius = roseSize * 0.5; // Increased from 0.4
						
						ctx.moveTo(0, 0);
						ctx.quadraticCurveTo(
							Math.cos(petalAngle) * innerRadius,
							Math.sin(petalAngle) * innerRadius,
							Math.cos(petalAngle) * outerRadius,
							Math.sin(petalAngle) * outerRadius
						);
					}
					ctx.fillStyle = '#c41e3a'; // Rose red
					ctx.fill();
					
					// Center of rose
					ctx.beginPath();
					ctx.arc(0, 0, roseSize * 0.2, 0, Math.PI * 2); // Increased from 0.15
					ctx.fillStyle = '#8b0000'; // Darker red
					ctx.fill();
					
					ctx.restore();
				};

				// Draw roses in offset grid pattern with more variation
				for (let row = 0; row < numRows; row++) {
					for (let col = 0; col < numCols; col++) {
						const x = col * spacing + (row % 2 ? spacing / 2 : 0);
						const y = row * spacing;
						// Add more random rotation
						const angle = Math.PI / 4 + (Math.sin(x * 0.01 + y * 0.01) * Math.PI / 3);
						drawRose(x, y, angle);
					}
				}

				ctx.globalAlpha = 1;
				break;
			}
			case 'timber': {
				// Add wood grain texture effect
				ctx.globalAlpha = 0.05;
				for (let i = 0; i < 50; i++) {
					const y = Math.random() * height;
					ctx.strokeStyle = '#d69a00';
					ctx.beginPath();
					ctx.moveTo(0, y);
					ctx.bezierCurveTo(
						width/3, y + Math.random() * 50 - 25,
						width*2/3, y + Math.random() * 50 - 25,
						width, y
					);
					ctx.stroke();
				}
				ctx.globalAlpha = 1;
				break;
			}
			case 'night': {
				// Add stars for night theme
				ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
				for (let i = 0; i < 50; i++) {
					const x = Math.random() * width;
					const y = Math.random() * height * 0.6; // Only in upper portion
					const size = Math.random() * 2 + 1;
					ctx.beginPath();
					ctx.arc(x, y, size, 0, 2 * Math.PI);
					ctx.fill();
				}
				break;
			}
			case 'forest': {
				// Add subtle texture for forest theme
				ctx.globalAlpha = 0.1;
				for (let i = 0; i < 30; i++) {
					const x = Math.random() * width;
					const y = Math.random() * height;
					const size = Math.random() * 100 + 50;
					ctx.fillStyle = '#2d5a3d';
					ctx.beginPath();
					ctx.arc(x, y, size, 0, 2 * Math.PI);
					ctx.fill();
				}
				ctx.globalAlpha = 1;
				break;
			}
		}
	};

	// Extract next 4 matches from schedule data
	const getNext4Matches = () => {
		const currentDate = new Date();
		let upcomingFixtures = [];

		// Process each stage in the schedule
		TIMBERS_SCHEDULE.forEach(stage => {
			if (stage.fixtures) {
				// Direct fixtures in stage
				stage.fixtures.forEach(fixture => {
					const matchDate = new Date(fixture.starting_at);
					if (matchDate > currentDate && fixture.state_id === 1) {
						upcomingFixtures.push({
							...fixture,
							competition: stage.name,
						});
					}
				});
			}

			// Process rounds within stages
			if (stage.rounds) {
				stage.rounds.forEach(round => {
					if (round.fixtures) {
						round.fixtures.forEach(fixture => {
							const matchDate = new Date(fixture.starting_at);
							if (matchDate > currentDate && fixture.state_id === 1) {
								upcomingFixtures.push({
									...fixture,
									competition: stage.name,
								});
							}
						});
					}
				});
			}
		});

		// Sort by date and take first 4
		upcomingFixtures.sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at));

		return upcomingFixtures.slice(0, 4).map(fixture => {
			const opponent = fixture.participants.find(p => p.id !== 607);
			const timbers = fixture.participants.find(p => p.id === 607);
			const isHome = timbers.meta.location === 'home';

			return {
				date: fixture.starting_at,
				time: fixture.starting_at,
				opponent: opponent?.name || 'TBD',
				opponentShort: opponent?.short_code || 'TBD',
				isHome: isHome,
				venue: isHome ? 'Providence Park' : 'Away',
				competition: fixture.competition || 'MLS',
				logoUrl: opponent?.image_path || '',
			};
		});
	};

	const nextMatches = getNext4Matches();

	const formatDate = dateTimeString => {
		// The API provides UTC datetime strings like "2025-07-06 02:30:00"
		// We need to treat this as UTC and convert to Pacific
		const utcDate = new Date(dateTimeString + ' UTC'); // Explicitly mark as UTC
		return utcDate.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			timeZone: 'America/Los_Angeles',
		});
	};

	const formatTime = dateTimeString => {
		// Convert UTC datetime to Pacific time
		const utcDate = new Date(dateTimeString + ' UTC'); // Explicitly mark as UTC
		return utcDate.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
			timeZone: 'America/Los_Angeles',
		});
	};

	const formatDateForWallpaper = dateTimeString => {
		// Convert UTC datetime to Pacific time for wallpaper display
		const utcDate = new Date(dateTimeString + ' UTC'); // Explicitly mark as UTC
		return utcDate.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			timeZone: 'America/Los_Angeles',
		});
	};

	// Move date/time drawing into a separate function (add this before generateWallpaper)
	const drawDateAndTime = (ctx, width, logoY, circleRadius) => {
		const currentTime = new Date().toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		}).replace(/\s?(AM|PM)$/i, '');

		const currentDate = new Date().toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'short',
			day: 'numeric',
		});

		// Draw date
		ctx.fillStyle = TIMBERS_WHITE;
		const dateFont = Math.floor(width * 0.045);
		ctx.font = `${dateFont}px -apple-system, system-ui`;
		ctx.textAlign = 'center';
		ctx.fillText(currentDate, width / 2, logoY - circleRadius - 400);

		// Draw time
		const timeFont = Math.floor(width * 0.18);
		ctx.font = `bold ${timeFont}px -apple-system, system-ui`;
		ctx.textAlign = 'center';
		ctx.fillText(currentTime, width / 2, logoY - circleRadius - 200);
	};

	// Modify generateWallpaper to accept a parameter (add parameter and remove existing date/time code)
	const generateWallpaper = async (includeDateTime = true) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const dimensions = getCurrentDimensions();
		const width = dimensions.width;
		const height = dimensions.height;

		canvas.width = width;
		canvas.height = height;

		// Helper function to load images with CORS support
		const tryLoadImage = src => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.crossOrigin = 'anonymous'; // Enable CORS from the start
				img.onload = () => resolve(img);
				img.onerror = () => {
					// If CORS fails, try without crossOrigin (but this will taint the canvas)
					console.log(`CORS failed for ${src}, using fallback`);
					reject(new Error(`Failed to load: ${src}`));
				};
				img.src = src;
			});
		};

		// Helper function to create fallback logo
		const createFallbackLogo = (text, isTimbers = false) => {
			const size = 100;
			const fallbackCanvas = document.createElement('canvas');
			fallbackCanvas.width = size;
			fallbackCanvas.height = size;
			const fallbackCtx = fallbackCanvas.getContext('2d');

			// Draw circle background
			fallbackCtx.fillStyle = isTimbers ? TIMBERS_GREEN : '#555555';
			fallbackCtx.beginPath();
			fallbackCtx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
			fallbackCtx.fill();

			// Draw text
			fallbackCtx.fillStyle = TIMBERS_WHITE;
			fallbackCtx.font = 'bold 24px Arial';
			fallbackCtx.textAlign = 'center';
			fallbackCtx.textBaseline = 'middle';
			fallbackCtx.fillText(text, size / 2, size / 2);

			return fallbackCanvas;
		};

		// Create themed background
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, width, height);

		// Apply theme-specific background
		ctx.fillStyle = getThemeBackground(ctx, width, height);
		ctx.fillRect(0, 0, width, height);

		// Add theme-specific effects
		addThemeEffects(ctx, width, height);

		// Draw central image area - Moved much lower towards bottom
		const logoY = Math.floor(height * 0.4); // 65% down from top (was 19%)
		const circleRadius = Math.floor(Math.min(width, height) * 0.2); // Changed from 0.25 to 0.2

		// Load and draw the selected image in the circular area
		let selectedImg;
		try {
			selectedImg = await tryLoadImage(`/patches/${selectedBackground}`);
			console.log('Selected image loaded successfully');

			// Create circular clipping path for the selected image
			ctx.save();
			ctx.beginPath();
			ctx.arc(width / 2, logoY, circleRadius, 0, 2 * Math.PI);
			ctx.clip();

			// Modify the image scaling section within the generateWallpaper function
			const scaleFactor = 1.0; // Adjust this value between 0 and 1 to scale the image (0.8 = 80% of original size)

			// Calculate dimensions to fit image in circle while maintaining aspect ratio
			const imgAspect = selectedImg.width / selectedImg.height;
			const circleSize = circleRadius * 2;
			const scaledCircleSize = circleSize * scaleFactor;

			let imgWidth, imgHeight, imgX, imgY;

			if (imgAspect > 1) {
				// Image is wider than tall
				imgWidth = scaledCircleSize;
				imgHeight = scaledCircleSize / imgAspect;
				imgX = width / 2 - (scaledCircleSize / 2);
				imgY = logoY - imgHeight / 2;
			} else {
				// Image is taller than wide
				imgHeight = scaledCircleSize;
				imgWidth = scaledCircleSize * imgAspect;
				imgX = width / 2 - imgWidth / 2;
				imgY = logoY - (scaledCircleSize / 2);
			}

			// Draw the image
			ctx.drawImage(selectedImg, imgX, imgY, imgWidth, imgHeight);
			ctx.restore();

			// Add a subtle border around the circular image
			ctx.beginPath();
			ctx.arc(width / 2, logoY, circleRadius, 0, 2 * Math.PI);
			ctx.strokeStyle = TIMBERS_GOLD;
			ctx.lineWidth = 4;
			ctx.stroke();
		} catch (error) {
			console.log('Failed to load selected image:', error);
			// Fallback: Create the original circular logo area
			ctx.beginPath();
			ctx.arc(width / 2, logoY, circleRadius, 0, 2 * Math.PI);
			ctx.fillStyle = TIMBERS_GREEN;
			ctx.fill();

			// Add rose symbol (simplified representation)
			ctx.fillStyle = '#FF0000';
			ctx.beginPath();
			ctx.arc(width / 2, logoY, 25, 0, 2 * Math.PI);
			ctx.fill();

			// Add leaves around (simplified)
			ctx.fillStyle = TIMBERS_GREEN;
			for (let i = 0; i < 8; i++) {
				const angle = (i * Math.PI * 2) / 8;
				const x = width / 2 + Math.cos(angle) * 60;
				const y = logoY + Math.sin(angle) * 60;
				ctx.beginPath();
				ctx.ellipse(x, y, 20, 35, angle + Math.PI / 2, 0, 2 * Math.PI);
				ctx.fill();
			}
		}

		// "TIMBERS" text - Back to portrait layout
		ctx.fillStyle = TIMBERS_WHITE;
		ctx.font = 'bold 48px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('PORTLAND TIMBERS', width / 2, logoY + 400);


		// Replace the date/time drawing section with this conditional call
		if (includeDateTime) {
			drawDateAndTime(ctx, width, logoY, circleRadius);
		}

		// Schedule section - Back to vertical layout below content
		const scheduleStartY = logoY + 540;

		// Load Portland Timbers logo with fallback
		let timbersLogo;
		const timbersLogoUrl = 'https://cdn.sportmonks.com/images/soccer/teams/31/607.png';
		try {
			timbersLogo = await tryLoadImage(timbersLogoUrl);
			console.log('Timbers logo loaded successfully');
		} catch (error) {
			console.log('Failed to load Timbers logo, using fallback:', error);
			timbersLogo = createFallbackLogo('POR', true);
		}

		// Draw each match with team logos - Positioned above patch image
		const matchSpacing = Math.floor(height * 0.085); // Tighter spacing
		const logoSize = Math.floor(width * 0.095); // Slightly smaller logos
		const logoSpacing = Math.floor(width * 0.095); // Tighter spacing between logos

		for (let i = 0; i < Math.min(nextMatches.length, 4); i++) {
			const match = nextMatches[i];
			const matchY = scheduleStartY + i * matchSpacing;
			const centerX = width / 2;

			// Create background rectangle for each match
			const matchBgPadding = Math.floor(width * 0.037);
			const matchBgHeight = Math.floor(matchSpacing * 0.75);
			const matchBgY = matchY - matchBgHeight / 2;
			const cornerRadius = Math.floor(matchBgHeight * 0.25); // Adjust this value to control roundness

			// Fill rounded rectangle background
			ctx.fillStyle = 'rgba(0, 66, 37, 0.3)';
			ctx.beginPath();
			ctx.roundRect(
				matchBgPadding,
				matchBgY,
				width - matchBgPadding * 2,
				matchBgHeight,
				cornerRadius
			);
			ctx.fill();

			// Add subtle border with rounded corners
			ctx.strokeStyle = 'rgba(214, 175, 59, 0.5)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.roundRect(
				matchBgPadding,
				matchBgY,
				width - matchBgPadding * 2,
				matchBgHeight,
				cornerRadius
			);
			ctx.stroke();

			// Draw Portland Timbers logo (left side)
			if (timbersLogo) {
				ctx.fillStyle = TIMBERS_WHITE;
				ctx.beginPath();
				ctx.arc(centerX - logoSpacing, matchY, logoSize / 2 + 8, 0, 2 * Math.PI);
				ctx.fill();

				ctx.save();
				ctx.beginPath();
				ctx.arc(centerX - logoSpacing, matchY, logoSize / 2, 0, 2 * Math.PI);
				ctx.clip();

				if (timbersLogo instanceof HTMLCanvasElement) {
					ctx.drawImage(timbersLogo, centerX - logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
				} else {
					ctx.drawImage(timbersLogo, centerX - logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
				}
				ctx.restore();
			}

			// Load and draw opponent logo
			let opponentLogo;
			if (match.logoUrl) {
				try {
					opponentLogo = await tryLoadImage(match.logoUrl);
				} catch {
					opponentLogo = createFallbackLogo(match.opponentShort);
				}
			} else {
				opponentLogo = createFallbackLogo(match.opponentShort);
			}

			ctx.fillStyle = TIMBERS_WHITE;
			ctx.beginPath();
			ctx.arc(centerX + logoSpacing, matchY, logoSize / 2 + 8, 0, 2 * Math.PI);
			ctx.fill();

			ctx.save();
			ctx.beginPath();
			ctx.arc(centerX + logoSpacing, matchY, logoSize / 2, 0, 2 * Math.PI);
			ctx.clip();

			if (opponentLogo instanceof HTMLCanvasElement) {
				ctx.drawImage(opponentLogo, centerX + logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
			} else {
				ctx.drawImage(opponentLogo, centerX + logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
			}
			ctx.restore();

			// VS or @ text (center) - Dynamic font size
			ctx.fillStyle = TIMBERS_GOLD;
			const vsFont = Math.floor(width * 0.026);
			ctx.font = `bold ${vsFont}px Arial`;
			ctx.textAlign = 'center';
			ctx.fillText(match.isHome ? 'VS' : '@', centerX, matchY + 8);

			// Match date and time on the right side of logos
			const dateTimeX = centerX + logoSpacing + logoSize / 2 + Math.floor(width * 0.046);

			// Match date - Dynamic font size
			ctx.fillStyle = TIMBERS_WHITE;
			const matchDateFont = Math.floor(width * 0.022);
			ctx.font = `bold ${matchDateFont}px Arial`;
			ctx.textAlign = 'left';
			const formattedDate = formatDateForWallpaper(match.date);
			ctx.fillText(formattedDate.replace(',', ''), dateTimeX, matchY - 10);

			// Match time below date - Dynamic font size
			ctx.fillStyle = TIMBERS_GOLD;
			const matchTimeFont = Math.floor(width * 0.019);
			ctx.font = `${matchTimeFont}px Arial`;
			ctx.textAlign = 'left';
			const timeText = formatTime(match.time);
			ctx.fillText(timeText, dateTimeX, matchY + 15);
		}

		// Footer
		ctx.fillStyle = TIMBERS_WHITE;
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Rose City Till I Die! 🌹⚽', width / 2, height - 140);
	};

	// Modify the download function to exclude date/time
	const downloadWallpaper = async () => {
		setIsGenerating(true);

		try {
			// Generate wallpaper without date/time
			await generateWallpaper(false);

			setTimeout(() => {
				const canvas = canvasRef.current;
				if (!canvas) {
					console.error('Canvas not found');
					setIsGenerating(false);
					return;
				}

				try {
					// Create download link
					const link = document.createElement('a');
					link.download = `timbers-schedule-wallpaper-${new Date().getTime()}.png`;
					link.href = canvas.toDataURL('image/png');

					// Trigger download
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					// Regenerate preview with date/time after download
					generateWallpaper(true);
				} catch (error) {
					console.error('Error creating download:', error);
					alert('Unable to download wallpaper. This may be due to external image loading restrictions. Please try again or check your browser settings.');
				}

				setIsGenerating(false);
			}, 1000);
		} catch (error) {
			console.error('Error generating wallpaper:', error);
			alert('Error generating wallpaper. Please try again.');
			setIsGenerating(false);
		}
	};

	useEffect(() => {
		// Load available images on component mount
		loadAvailableImages();
	}, []);

	useEffect(() => {
		// Regenerate wallpaper when background, theme, or iPhone size changes
		if (selectedBackground && !isLoadingImages) {
			console.log('Generating wallpaper with:', { selectedBackground, selectedTheme, selectediPhoneSize });
			generateWallpaper();
		} else {
			console.log('Waiting for:', { selectedBackground, isLoadingImages });
		}
	}, [selectedBackground, selectedTheme, selectediPhoneSize, isLoadingImages]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">
						Portland Timbers Schedule Wallpaper
					</h1>
					<p className="text-green-200 text-lg">
						Generate your personalized Timbers schedule wallpaper
					</p>
				</div>

				<div className="grid lg:grid-cols-2 gap-8 items-start"> {/* Changed from items-center to items-start */}
					{/* iPhone Mockup - Now aligned with iPhone Size selector */}
					<div className="flex justify-center order-2 lg:order-1"> {/* Added order classes for responsive layout */}
						<div className="relative">
							{/* iPhone Frame */}
							<div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
								<div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
									{/* Notch with subtle outline */}
									<div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10 ring-1 ring-white/20"></div>

									{/* Wallpaper Preview - Full screen */}
									<canvas
										ref={canvasRef}
										className="w-full h-full object-cover"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Controls and Info */}
					<div className="space-y-6">
						{/* iPhone Size Selector */}
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
							<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
								<div className="w-5 h-5 rounded bg-gray-400"></div>
								iPhone Size
							</h3>
							<select
								value={selectediPhoneSize}
								onChange={(e) => setSelectediPhoneSize(e.target.value)}
								className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
							>
								{iPhoneSizes.map((size) => (
									<option key={size.value} value={size.value} className="bg-gray-800">
										{size.label}
									</option>
								))}
							</select>
							<p className="text-green-200 text-sm">
								{getCurrentDimensions().width} × {getCurrentDimensions().height} pixels
							</p>
						</div>

						{/* Background Image Selector */}
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
							<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
								<ImageIcon className="w-5 h-5" />
								Patch Image
								{isLoadingImages && (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
								)}
							</h3>

							{isLoadingImages ? (
								<div className="text-green-200 text-sm">Loading available images...</div>
							) : availableImages.length > 0 ? (
								<>
									<select
										value={selectedBackground}
										onChange={(e) => setSelectedBackground(e.target.value)}
										className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
									>
										{availableImages.map((img) => (
											<option key={img.value} value={img.value} className="bg-gray-800">
												{img.label}
											</option>
										))}
									</select>
									<button
										onClick={loadAvailableImages}
										className="mt-2 text-sm text-green-200 hover:text-green-100 underline"
									>
										Refresh image list
									</button>
								</>
							) : (
								<div className="text-yellow-200 text-sm space-y-3">
									<p>No patches-manifest.json found in /public/patches/ folder.</p>

									<div className="bg-black/20 rounded p-3 text-xs">
										<p className="text-white font-semibold mb-2">Create /public/patches/patches-manifest.json:</p>
										<pre className="text-green-200 whitespace-pre-wrap">
{`{
  "patches": [
    {
      "filename": "seattle-bonfire-feat.jpg",
      "label": "Seattle Bonfire",
      "description": "Smokey the Bear with bonfire"
    },
    {
      "filename": "smokey-bear-temp-feat.jpg", 
      "label": "Smokey Bear",
      "description": "Classic Smokey Bear patch"
    }
  ]
}`}
										</pre>
									</div>

									<div className="text-xs text-green-200">
										<p>• Add your image files to /public/patches/</p>
										<p>• Create the manifest.json file with the structure above</p>
										<p>• Supports .jpg, .jpeg, .png, .webp files</p>
									</div>

									<button
										onClick={loadAvailableImages}
										className="mt-2 text-green-200 hover:text-green-100 underline"
									>
										Check for manifest file
									</button>
								</div>
							)}
						</div>

						{/* Theme Selector */}
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
							<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
								<div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-600 to-blue-600"></div>
								Background Theme
							</h3>
							<select
								value={selectedTheme}
								onChange={(e) => setSelectedTheme(e.target.value)}
								className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
							>
								{themeOptions.map((theme) => (
									<option key={theme.value} value={theme.value} className="bg-gray-800">
										{theme.label}
									</option>
								))}
							</select>
							<p className="text-green-200 text-sm">
								{themeOptions.find(t => t.value === selectedTheme)?.description}
							</p>
						</div>

						{/* Schedule Preview */}
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
							<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
								<Calendar className="w-5 h-5" />
								Next {nextMatches.length} Matches
							</h3>
							<div className="space-y-3">
								{nextMatches.map((match, index) => (
									<div key={index} className="flex justify-between items-center text-white">
										<div>
											<div className="font-semibold">
												{match.isHome ? 'vs' : '@'} {match.opponent}
											</div>
											<div className="text-sm text-green-200">
												{formatDateForWallpaper(match.date)} • {formatTime(match.time)} PT
											</div>
										</div>
										<div className="flex items-center gap-1 text-yellow-400">
											{match.isHome ? (
												<>
													<MapPin className="w-4 h-4" />
													<span className="text-sm">HOME</span>
												</>
											) : (
												<>
													<MapPin className="w-4 h-4" />
													<span className="text-sm">AWAY</span>
												</>
											)}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Download Button */}
						<button
							onClick={downloadWallpaper}
							disabled={isGenerating}
							className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
						>
							{isGenerating ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
									Generating...
								</>
							) : (
								<>
									<Download className="w-5 h-5" />
									Download Wallpaper
								</>
							)}
						</button>

						{/* Instructions */}
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
							<h3 className="text-lg font-bold text-white mb-3">How to Use</h3>
							<ul className="text-green-200 space-y-2 text-sm">
								<li>• Add images to /public/patches/ folder</li>
								<li>• Update patches-manifest.json with your image list</li>
								<li>• Click "Refresh image list" after adding new images</li>
								<li>• Select your preferred patch image and theme</li>
								<li>• Download and set as your phone wallpaper</li>
								<li>• Schedule updates automatically with current fixtures</li>
							</ul>
						</div>

						{/* RCTID */}
						<div className="text-center">
							<p className="text-yellow-400 font-bold text-lg">
								RCTID - Rose City Till I Die! 🌹⚽
							</p>
						</div>

						{/* Buy Me a Coffee */}
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
							<h3 className="text-lg font-bold text-white mb-3">Support the Developer</h3>
							<div className="flex flex-col items-center space-y-3">
								<div className="bg-white p-3 rounded-lg">
									<img
										src="/bmc_qr.png"
										alt="Buy Me a Coffee QR Code"
										className="w-24 h-24"
										onError={(e) => {
											e.target.style.display = 'none';
											e.target.nextSibling.style.display = 'block';
										}}
									/>
									<div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs hidden">
										QR Code
									</div>
								</div>
								<a
									href="https://buymeacoffee.com/automatebldrs"
									target="_blank"
									rel="noopener noreferrer"
									className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
								>
									☕ Buy Me a Coffee
								</a>
								<p className="text-green-200 text-sm">
									Enjoy the wallpaper? Support future updates!
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TimbersWallpaperGenerator;