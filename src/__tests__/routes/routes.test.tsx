import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';
import { Slot } from 'expo-router';
import { Text } from 'react-native';

import * as RootLayout from '../../../app/_layout';
import HistoryScreen from '../../../app/history';
import LogScreen from '../../../app/index';
import SettingsScreen from '../../../app/settings';

const PassThrough = () => <Slot />;

const routes = {
  _layout: RootLayout.default,
  index: LogScreen,
  history: HistoryScreen,
  settings: SettingsScreen,
};

const cases = [
  { name: 'Log', url: '/', heading: 'Nothing logged yet', body: /Your sets will appear here/ },
  {
    name: 'History',
    url: '/history',
    heading: 'No sessions yet',
    body: /Past sessions will show up/,
  },
  {
    name: 'Settings',
    url: '/settings',
    heading: 'Nothing to set up yet',
    body: /Preferences will live here/,
  },
];

describe('route render tests', () => {
  let fetchSpy: jest.Mock;
  beforeEach(() => {
    fetchSpy = jest.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  it.each(cases)('$name route shows its empty state', ({ url, heading, body }) => {
    renderRouter(routes, { initialUrl: url });
    expect(screen.getByRole('header', { name: heading })).toBeTruthy();
    expect(screen.getByText(body)).toBeTruthy();
  });

  it('launches on the Log tab and labels all three tabs', () => {
    renderRouter(routes);
    expect(screen.getByText('Nothing logged yet')).toBeTruthy();
    for (const label of ['Log', 'History', 'Settings']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
  });

  it.each(cases)('$name route makes no fetch calls on mount (AC5, offline)', ({ url }) => {
    renderRouter(routes, { initialUrl: url });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('error boundary (AC6)', () => {
  let shouldThrow: boolean;
  function Boom() {
    if (shouldThrow) throw new Error('secret-value-123');
    return <Text>Recovered</Text>;
  }

  beforeEach(() => {
    shouldThrow = true;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('shows a neutral message with Try again and no exception text', () => {
    renderRouter({
      _layout: { default: PassThrough, ErrorBoundary: RootLayout.ErrorBoundary },
      index: Boom,
    });
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(
      screen.getByText("This screen couldn't load. Your logged data isn't affected."),
    ).toBeTruthy();
    expect(screen.queryByText(/secret-value-123/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
  });

  it('Try again re-renders the failed route', () => {
    renderRouter({
      _layout: { default: PassThrough, ErrorBoundary: RootLayout.ErrorBoundary },
      index: Boom,
    });
    shouldThrow = false;
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Recovered')).toBeTruthy();
  });
});
