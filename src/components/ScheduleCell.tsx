
import React, { useState } from 'react';
import { ReplacementModal } from './ReplacementModal';

interface ScheduleCellProps {
  day: string;
  hour: string;
  cellValue: string;
  editable: boolean;
  teacher: any;
  selectedDate?: string;
  handleCellChange?: (day: string, hour: string, value: string) => void;
}

export const ScheduleCell: React.FC<ScheduleCellProps> = ({
  day,
  hour,
  cellValue,
  editable,
  teacher,
  selectedDate,
  handleCellChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    // Apri le opzioni anche cliccando una cella DISP/DIS o una cella vuota.
    if (!editable) setIsModalOpen(true);
  };

  return (
    <>
      <td
        className={`py-2 px-3 border text-center ${
          cellValue ? (
            cellValue === 'DIS' 
              ? 'bg-green-100' 
              : 'bg-blue-100'
          ) : 'bg-gray-50 cursor-pointer hover:bg-gray-100'
        } ${!editable && cellValue && cellValue !== 'DIS' ? 'cursor-pointer hover:bg-blue-200' : ''}`}
        onClick={handleClick}
      >
        {editable ? (
          <input
            type="text"
            value={cellValue}
            onChange={(e) => handleCellChange && handleCellChange(day, hour, e.target.value)}
            className="w-full bg-transparent text-center focus:outline-none"
            placeholder="-"
          />
        ) : (
          cellValue || '-'
        )}
      </td>

      <ReplacementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        day={day}
        hour={hour}
        className={cellValue}
        teacher={teacher}
        selectedDate={selectedDate}
      />
    </>
  );
};
