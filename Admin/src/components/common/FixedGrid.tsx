import React from 'react';
import { Grid as MuiGrid, type GridProps } from '@mui/material';

// Wrapper component to fix Grid issues in Material-UI v5
interface FixedGridProps extends Omit<GridProps, 'item'> {
  item?: boolean;
}

const FixedGrid: React.FC<FixedGridProps> = ({ item, ...props }) => {
  if (item) {
    return <MuiGrid {...props} />;
  }
  return <MuiGrid container {...props} />;
};

export default FixedGrid;
