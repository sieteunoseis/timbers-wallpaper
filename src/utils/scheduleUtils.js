import TIMBERS_SCHEDULE from '../assets/schedule.json';
import { getTeamLogoFromManifest } from './teamLogoHelper';

/**
 * Extract next matches from schedule data
 * @returns {Array} Array of upcoming matches
 */
export const getNext4Matches = () => {
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

  // Helper function to safely parse dates for sorting (iOS compatible)
  const parseDateSafely = dateString => {
    try {
      if (!dateString) return new Date();
      
      const parts = dateString.split(' ');
      const dateParts = parts[0].split('-');
      
      if (parts.length >= 2) {
        // Has time components
        const timeParts = parts[1].split(':');
        return new Date(Date.UTC(
          parseInt(dateParts[0], 10),    // year
          parseInt(dateParts[1], 10) - 1, // month (0-based)
          parseInt(dateParts[2], 10),    // day
          parseInt(timeParts[0], 10),    // hour
          parseInt(timeParts[1], 10),    // minute
          parseInt(timeParts[2] || 0, 10) // second
        ));
      } else {
        // Date only
        return new Date(Date.UTC(
          parseInt(dateParts[0], 10),    // year
          parseInt(dateParts[1], 10) - 1, // month (0-based)
          parseInt(dateParts[2], 10)     // day
        ));
      }
    } catch (e) {
      console.error('Error parsing date for sorting:', e);
      return new Date(); // Return current date as fallback
    }
  };

  // Sort by date using the safe parsing method
  upcomingFixtures.sort((a, b) => 
    parseDateSafely(a.starting_at) - parseDateSafely(b.starting_at)
  );

  return upcomingFixtures.slice(0, 4).map(fixture => {
    const opponent = fixture.participants.find(p => p.id !== 607);
    const timbers = fixture.participants.find(p => p.id === 607);
    const isHome = timbers.meta.location === 'home';
    const opponentName = opponent?.name || 'TBD';

    // Try to get high quality logo from manifest first, fall back to API provided logo
    let highQualityLogo;
    
    try {
      // Get the opponent's short code
      const opponentShortCode = opponent?.short_code || '';
      
      // Try to match by short code first (more reliable), then by name if that fails
      highQualityLogo = opponentShortCode ? 
        getTeamLogoFromManifest(null, opponentShortCode) :
        getTeamLogoFromManifest(opponentName, null);
      
      // If short code match failed, try name match as fallback
      if (!highQualityLogo && opponentShortCode) {
        highQualityLogo = getTeamLogoFromManifest(opponentName, null);
      }
    } catch (error) {
      console.error(`Error finding logo for team ${opponentName}:`, error);
      highQualityLogo = null;
    }
    
    // Use original API logo as fallback
    const originalLogo = opponent?.image_path || '';
    
    // Use the best logo we can find
    const logoUrl = highQualityLogo || originalLogo;

    return {
      date: fixture.starting_at,
      time: fixture.starting_at,
      opponent: opponentName,
      opponentShort: opponent?.short_code || 'TBD',
      isHome: isHome,
      venue: isHome ? 'Providence Park' : 'Away',
      competition: fixture.competition || 'MLS',
      logoUrl: logoUrl,
    };
  });
};
