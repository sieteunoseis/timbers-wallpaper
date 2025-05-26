import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { formatDateForWallpaper, formatTime } from '../utils/dateFormatters';

/**
 * Component for displaying upcoming schedule
 * 
 * @param {Object} props - Component props
 * @param {Array} props.nextMatches - Array of upcoming matches
 * @returns {JSX.Element} Schedule preview component
 */
const SchedulePreview = ({ nextMatches }) => {
  return (
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
  );
};

export default SchedulePreview;
