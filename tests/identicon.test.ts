import { describe, expect, test } from '@jest/globals';
import { generateIdenticonSVGHTML } from '../src/client/util/identicon';

describe('identicon', () => {
    test('generates correct identicon', async () => {
        const expectedSVG = `<svg style="width; 25; height: 25;" viewBox='0 0 64 64'><circle cx=32 cy=32 fill="#eee" r=32 /><circle cx=32 cy=8 fill="hsl(196, 62%, 53%)" r=5 /><circle cx=32 cy=20 fill="hsl(191, 62%, 53%)" r=5 /><circle cx=21.607695154586736 cy=14 fill="hsl(219, 62%, 35%)" r=5 /><circle cx=11.215390309173472 cy=20 fill="hsl(33, 62%, 15%)" r=5 /><circle cx=21.607695154586736 cy=26 fill="hsl(118, 62%, 15%)" r=5 /><circle cx=11.215390309173472 cy=32 fill="hsl(157, 62%, 53%)" r=5 /><circle cx=11.215390309173472 cy=44 fill="hsl(202, 62%, 35%)" r=5 /><circle cx=21.607695154586736 cy=38 fill="hsl(191, 62%, 53%)" r=5 /><circle cx=21.607695154586736 cy=50 fill="hsl(67, 62%, 35%)" r=5 /><circle cx=32 cy=56 fill="hsl(50, 62%, 15%)" r=5 /><circle cx=32 cy=44 fill="hsl(129, 62%, 75%)" r=5 /><circle cx=42.392304845413264 cy=50 fill="hsl(67, 62%, 35%)" r=5 /><circle cx=52.78460969082653 cy=44 fill="hsl(202, 62%, 35%)" r=5 /><circle cx=42.392304845413264 cy=38 fill="hsl(191, 62%, 53%)" r=5 /><circle cx=52.78460969082653 cy=32 fill="hsl(157, 62%, 53%)" r=5 /><circle cx=52.78460969082653 cy=20 fill="hsl(33, 62%, 15%)" r=5 /><circle cx=42.392304845413264 cy=26 fill="hsl(118, 62%, 15%)" r=5 /><circle cx=42.392304845413264 cy=14 fill="hsl(219, 62%, 35%)" r=5 /><circle cx=32 cy=32 fill="hsl(95, 62%, 75%)" r=5 /></svg>`;
        const generatedSVG = generateIdenticonSVGHTML(
            '21vLqCuvXweuKw9nw6qfAQnFkmBnxLWA3RU5cMBGuzsdEJ4A',
            25,
        );
        expect(generatedSVG).toBe(expectedSVG);
    });
});
