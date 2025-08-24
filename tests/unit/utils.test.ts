import { testAlias } from '@/utils';

describe('Utils', () => {
  describe('testAlias', () => {
    it('should return correct message confirming alias is working', () => {
      const result = testAlias();
      expect(result).toBe('Alias is working correctly!');
    });

    it('should return a string', () => {
      const result = testAlias();
      expect(typeof result).toBe('string');
    });
  });
});