import React from 'react';
import { Box } from '@mui/material';

interface GridProps {
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  spacing?: number;
  children?: React.ReactNode;
  sx?: any;
  [key: string]: any;
}

const Grid: React.FC<GridProps> = ({
  container,
  item,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  spacing = 0,
  children,
  sx = {},
  ...props
}) => {
  if (container) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing ? `${spacing * 8}px` : 0,
          margin: spacing ? `-${spacing * 4}px` : 0,
          width: `calc(100% + ${spacing * 8}px)`,
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }

  if (item) {
    const getWidth = () => {
      const breakpoints: any = {};
      
      if (xs) breakpoints.xs = `${(xs / 12) * 100}%`;
      if (sm) breakpoints.sm = `${(sm / 12) * 100}%`;
      if (md) breakpoints.md = `${(md / 12) * 100}%`;
      if (lg) breakpoints.lg = `${(lg / 12) * 100}%`;
      if (xl) breakpoints.xl = `${(xl / 12) * 100}%`;

      return {
        width: breakpoints.xs || '100%',
        '@media (min-width: 600px)': sm ? { width: breakpoints.sm } : {},
        '@media (min-width: 900px)': md ? { width: breakpoints.md } : {},
        '@media (min-width: 1200px)': lg ? { width: breakpoints.lg } : {},
        '@media (min-width: 1536px)': xl ? { width: breakpoints.xl } : {},
      };
    };

    return (
      <Box
        sx={{
          ...getWidth(),
          padding: spacing ? `${spacing * 4}px` : 0,
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box sx={sx} {...props}>
      {children}
    </Box>
  );
};

export default Grid;
