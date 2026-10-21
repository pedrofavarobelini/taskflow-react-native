jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
// Metro injeta a URL do bundle no aparelho; ela não existe no ambiente Node do Jest.
jest.mock('@expo/metro-runtime', () => ({}));
beforeEach(() => { jest.spyOn(console, 'info').mockImplementation(() => {}); });
afterEach(() => { jest.restoreAllMocks(); });
