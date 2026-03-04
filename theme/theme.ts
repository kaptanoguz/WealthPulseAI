'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

// WealthPulse brand colors
const brand: MantineColorsTuple = [
    '#e6f7ff',
    '#bae7ff',
    '#91d5ff',
    '#69c0ff',
    '#40a9ff',
    '#1890ff',
    '#096dd9',
    '#0050b3',
    '#003a8c',
    '#002766',
];

const accent: MantineColorsTuple = [
    '#e6fffb',
    '#b5f5ec',
    '#87e8de',
    '#5cdbd3',
    '#36cfc9',
    '#13c2c2',
    '#08979c',
    '#006d75',
    '#00474f',
    '#002329',
];

const profit: MantineColorsTuple = [
    '#f0fff4',
    '#c6f6d5',
    '#9ae6b4',
    '#68d391',
    '#48bb78',
    '#38a169',
    '#2f855a',
    '#276749',
    '#22543d',
    '#1a4731',
];

const loss: MantineColorsTuple = [
    '#fff5f5',
    '#fed7d7',
    '#feb2b2',
    '#fc8181',
    '#f56565',
    '#e53e3e',
    '#c53030',
    '#9b2c2c',
    '#822727',
    '#63171b',
];

export const theme = createTheme({
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    primaryColor: 'brand',
    colors: {
        brand,
        accent,
        profit,
        loss,
    },
    defaultRadius: 'md',
    headings: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '700',
    },
    components: {
        Button: {
            defaultProps: {
                variant: 'filled',
            },
        },
        Paper: {
            defaultProps: {
                shadow: 'sm',
            },
        },
    },
});
