import React from 'react';
import { Box } from '@mui/material';

interface GridWrapperProps {
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  spacing?: number;
  children: React.ReactNode;
  [key: string]: any;
}

const GridWrapper: React.FC<GridWrapperProps> = ({
  container,
  item,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing,
  children,
  ...props
}) => {
  if (container) {
    return (
      <Box
        display="flex"
        flexWrap="wrap"
        gap={spacing ? `${spacing * 8}px` : 0}
        {...props}
      >
        {children}
      </Box>
    );
  }

  if (item) {
    const getWidth = () => {
      if (xs === 12) return '100%';
      if (xs === 6) return '50%';
      if (xs === 4) return '33.333%';
      if (xs === 3) return '25%';
      return 'auto';
    };

    return (
      <Box
        sx={{
          width: getWidth(),
          '@media (min-width: 600px)': sm ? { width: `${(sm / 12) * 100}%` } : {},
          '@media (min-width: 900px)': md ? { width: `${(md / 12) * 100}%` } : {},
          '@media (min-width: 1200px)': lg ? { width: `${(lg / 12) * 100}%` } : {},
          '@media (min-width: 1536px)': xl ? { width: `${(xl / 12) * 100}%` } : {},
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }

  return <Box {...props}>{children}</Box>;
};

export default GridWrapper;
