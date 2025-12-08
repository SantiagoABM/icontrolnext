'use client';

import { useMantineColorScheme, Switch, Group, Text } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

export function Navbar() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        backgroundColor: dark ? '#1A1B1E' : '#F8F9FA',
        borderBottom: dark ? '1px solid #2C2E33' : '1px solid #DEE2E6',
      }}
    >
      <Text fw={600} size="lg">
        🌿 Control Verde
      </Text>

      <Group gap="xs">
        <IconSun size={18} />
        <Switch
          checked={dark}
          onChange={() => setColorScheme(dark ? 'light' : 'dark')}
          size="md"
          color="brand"
        />
        <IconMoonStars size={18} />
      </Group>
    </nav>
  );
}
