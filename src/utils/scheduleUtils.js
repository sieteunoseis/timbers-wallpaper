import TIMBERS_SCHEDULE from '../assets/schedule.json';

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
