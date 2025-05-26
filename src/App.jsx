import React, { useEffect, useRef, useState, useCallback } from 'react';

// Import components
import DeviceSelector from './components/DeviceSelector';
import PatchSelector from './components/PatchSelector';
import ThemeSelector from './components/ThemeSelector';
import SchedulePreview from './components/SchedulePreview';
import CanvasPreview from './components/CanvasPreview';
import WallpaperCanvas from './components/WallpaperCanvas';
import { DownloadButton, Instructions, Footer } from './components/UIComponents';
import useScheduleData from './hooks/useScheduleData';

const TimbersWallpaperGenerator = () => {
	const canvasRef = useRef(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [selectedBackground, setSelectedBackground] = useState('');
	const [selectedTheme, setSelectedTheme] = useState('classic');
	const [selectediPhoneSize, setSelectediPhoneSize] = useState('iphone15');
	const [availableImages, setAvailableImages] = useState([]);
	const [isLoadingImages, setIsLoadingImages] = useState(true);
	const [showPatchImage, setShowPatchImage] = useState(true);

	// iPhone size options including iPhone 16 series
	const iPhoneSizes = [
		{ value: 'iphone16promax', label: 'iPhone 16 Pro Max', width: 1290, height: 2796 },
		{ value: 'iphone16pro', label: 'iPhone 16 Pro', width: 1179, height: 2556 },
		{ value: 'iphone15', label: 'iPhone 15/15 Pro', width: 1179, height: 2556 },
		{ value: 'iphone15plus', label: 'iPhone 15 Plus/Pro Max', width: 1290, height: 2796 },
		{ value: 'custom', label: 'Custom (1080x2337)', width: 1080, height: 2337 },
	];

	// Theme options for main background
	const themeOptions = [
		{ value: 'classic', label: 'Classic', description: 'Traditional dark gradient' },
		{ value: 'forest', label: 'Forest', description: 'Deep green forest vibes' },
		{ value: 'night', label: 'Night', description: 'Midnight black with stars' },
		{ value: 'providence', label: 'Providence Park', description: 'Stadium lights and atmosphere' },
		{ value: 'rose', label: 'Rose City', description: 'Rose and thorn inspired' },
		{ value: 'timber', label: 'Timber Joey', description: 'Log slab inspired pattern' },
		{ value: 'timber_jim', label: 'Timber Jim', description: 'Static background with Timber Jim' }
	];

	// Get current iPhone dimensions
	const getCurrentDimensions = () => {
		const selected = iPhoneSizes.find(size => size.value === selectediPhoneSize);
		return selected || iPhoneSizes[0];
	};
	
	// Get schedule data
	const { nextMatches } = useScheduleData();

	// Function to dynamically load images from patches folder using manifest
	const loadAvailableImages = useCallback(async () => {
		setIsLoadingImages(true);
		const detectedImages = [];

		// Skip loading if patch images are disabled
		if (!showPatchImage) {
			setIsLoadingImages(false);
			return;
		}

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
	}, [selectedBackground, showPatchImage]);

	// Download function to exclude date/time
	const downloadWallpaper = async () => {
		setIsGenerating(true);

		try {
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
		// Load available images on component mount or when showPatchImage changes
		if (showPatchImage) {
			loadAvailableImages();
		}
	}, [loadAvailableImages, showPatchImage]);

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

				<div className="grid lg:grid-cols-2 gap-8 items-start">
					{/* iPhone Mockup */}
					<div className="flex justify-center order-2 lg:order-1">
						<CanvasPreview canvasRef={canvasRef} />
						
						{/* Canvas for rendering the wallpaper */}
						<WallpaperCanvas 
							canvasRef={canvasRef}
							selectedBackground={selectedBackground}
							selectedTheme={selectedTheme}
							dimensions={getCurrentDimensions()}
							nextMatches={nextMatches}
							includeDateTime={true}
							showPatchImage={showPatchImage}
						/>
					</div>

					{/* Controls and Info */}
					<div className="space-y-6 order-1 lg:order-2">
						{/* iPhone Size Selector */}
						<DeviceSelector 
							selectediPhoneSize={selectediPhoneSize}
							setSelectediPhoneSize={setSelectediPhoneSize}
							iPhoneSizes={iPhoneSizes}
						/>

						{/* Background Image Selector */}
						<PatchSelector
							selectedBackground={selectedBackground}
							setSelectedBackground={setSelectedBackground}
							availableImages={availableImages}
							isLoadingImages={isLoadingImages}
							loadAvailableImages={loadAvailableImages}
							showPatchImage={showPatchImage}
							setShowPatchImage={setShowPatchImage}
						/>

						{/* Theme Selector */}
						<ThemeSelector
							selectedTheme={selectedTheme}
							setSelectedTheme={setSelectedTheme}
							themeOptions={themeOptions}
						/>

						{/* Schedule Preview */}
						<SchedulePreview nextMatches={nextMatches} />

						{/* Download Button */}
						<DownloadButton
							canvasRef={canvasRef}
							isGenerating={isGenerating}
							setIsGenerating={setIsGenerating}
							onDownload={downloadWallpaper}
						/>

						{/* Instructions */}
						<Instructions />

						{/* Footer */}
						<Footer />
					</div>
				</div>
			</div>
		</div>
	);
};

export default TimbersWallpaperGenerator;
